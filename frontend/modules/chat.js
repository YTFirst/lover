(function(global) {
    'use strict';
    var Store = App.Store;
    var UI = App.UI;
    var Constants = App.Constants;

    var Api = {
        request: function(method, path, data) {
            var timeout = Constants.API_TIMEOUT || 30000;
            var controller = new AbortController();
            var timeoutId = setTimeout(function() {
                controller.abort();
            }, timeout);

            var options = {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            return fetch(path, options)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    }
                    return response.json();
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new Error('Request timeout');
                    }
                    throw error;
                });
        },

        stream: function(path, data, onChunk, onDone, onError) {
            var timeout = Constants.STREAM_TIMEOUT || 120000;
            var controller = new AbortController();
            var timeoutId = setTimeout(function() {
                controller.abort();
            }, timeout);

            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            };

            fetch(path, options)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    }
                    var reader = response.body.getReader();
                    var decoder = new TextDecoder();
                    var buffer = '';

                    function read() {
                        reader.read().then(function(result) {
                            if (result.done) {
                                if (onDone) onDone();
                                return;
                            }
                            buffer += decoder.decode(result.value, { stream: true });
                            var lines = buffer.split('\n');
                            buffer = lines.pop();
                            lines.forEach(function(line) {
                                if (line.startsWith('data: ')) {
                                    var chunk = line.slice(6);
                                    if (chunk === '[DONE]') {
                                        if (onDone) onDone();
                                        return;
                                    }
                                    try {
                                        var parsed = JSON.parse(chunk);
                                        if (onChunk) onChunk(parsed);
                                    } catch (e) {
                                        if (onChunk) onChunk(chunk);
                                    }
                                }
                            });
                            read();
                        }).catch(function(error) {
                            clearTimeout(timeoutId);
                            if (onError) onError(error);
                        });
                    }

                    read();
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        error = new Error('Stream timeout');
                    }
                    if (onError) onError(error);
                });
        }
    };

    var currentCharacterId = 'female_adventurer';

    function getWelcomeMessage() {
        var agents = Store.getRef('agents');
        var currentAgentId = Store.getState('currentAgentId');
        var agent = agents.find(function(a) { return a.id === currentAgentId; });

        if (!agent) {
            return '\u4F60\u597D\u5440\uFF01\u6211\u662F\u5C0F\u96C5\uFF0C\u4F60\u7684\u5973\u670B\u53CB\uFF5E\u4ECA\u5929\u60F3\u804A\u4E9B\u4EC0\u4E48\u5462\uFF1F[action:wave]';
        }

        var styleGreetings = {
            warm: '\u4F60\u597D\u5440\uFF01\u6211\u662F' + agent.name + '\uFF0C\u4F60\u7684\u5973\u670B\u53CB\uFF5E\u4ECA\u5929\u60F3\u804A\u4E9B\u4EC0\u4E48\u5462\uFF1F',
            professional: '\u4F60\u597D\uFF01\u6211\u662F' + agent.name + '\uFF0C\u5F88\u9AD8\u5174\u4E3A\u4F60\u670D\u52A1\u3002\u6709\u4EC0\u4E48\u6211\u53EF\u4EE5\u5E2E\u52A9\u4F60\u7684\u5417\uFF1F',
            casual: '\u563F\uFF01\u6211\u662F' + agent.name + '\uFF0C\u4ECA\u5929\u60F3\u804A\u70B9\u5565\uFF1F',
            literary: '\u4F60\u597D\uFF0C\u6211\u662F' + agent.name + '\u3002\u613F\u6211\u7684\u966A\u4F34\u5982\u6625\u98CE\u822C\u6E29\u6696\u4F60\u7684\u5FC3\u7530\uFF5E'
        };

        var greeting = styleGreetings[agent.style] || styleGreetings.warm;

        if (agent.habits) {
            var habits = agent.habits.split('\n').filter(function(h) { return h.trim(); });
            if (habits.length > 0) {
                greeting += habits[0];
            }
        }

        greeting += '[action:wave]';

        return greeting;
    }

    function addWelcomeMessage() {
        var welcomeMessage = {
            id: Date.now(),
            type: 'ai',
            content: getWelcomeMessage(),
            timestamp: new Date().toISOString(),
            action: 'wave'
        };

        var messages = Store.getRef('messages');
        messages.push(welcomeMessage);

        Store.setState('messagePage', 1);
        Store.setState('hasMoreMessages', false);
        Store.setState('scrollPosition', 0);

        App.Storage.save();
        renderMessageList();

        setTimeout(function() {
            setCharacterAnimation('wave');
        }, 500);
    }

    function sendMessage() {
        var input = document.getElementById('message-input');
        var message = input.value.trim();

        if (!message) return;

        var now = Date.now();
        var lastSendTime = Store.getState('lastSendTime');
        if (now - lastSendTime < 1000) {
            UI.showToast('\u53D1\u9001\u592A\u9891\u7E41\u4E86\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5');
            return;
        }
        Store.setState('lastSendTime', now);

        if (message === '*#*#debug#*#*') {
            Store.setState('isDebugMode', true);
            input.value = '';
            UI.showToast('\u5DF2\u8FDB\u5165\u5F00\u53D1\u8005\u6A21\u5F0F');
            updateDebugModeUI();
            return;
        }

        if (message === '*#*#exit#*#*' && Store.getState('isDebugMode')) {
            Store.setState('isDebugMode', false);
            input.value = '';
            UI.showToast('\u5DF2\u9000\u51FA\u5F00\u53D1\u8005\u6A21\u5F0F');
            updateDebugModeUI();
            return;
        }

        if (Store.getState('isDebugMode')) {
            handleDebugCommand(message);
            input.value = '';
            return;
        }

        if (detectCrisisKeywords(message)) {
            showCrisisModal();
            input.value = '';
            return;
        }

        if (typeof processMessageForReminder === 'function') {
            processMessageForReminder(message);
        }

        var sessions = Store.getRef('sessions');
        var currentSessionId = Store.getState('currentSessionId');
        var currentSession = sessions.find(function(s) { return s.id === currentSessionId; });
        var agents = Store.getRef('agents');
        var agentId = currentSession ? currentSession.agentId : Store.getState('currentAgentId');
        var currentAgent = agents.find(function(a) { return a.id === agentId; });

        var userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            agentId: agentId,
            agentName: currentAgent ? currentAgent.name : '\u672A\u77E5'
        };

        var messages = Store.getRef('messages');
        messages.push(userMessage);

        Store.setState('messagePage', 1);
        Store.setState('hasMoreMessages', messages.length > Constants.MESSAGES_PER_PAGE);
        Store.setState('scrollPosition', 0);

        App.Storage.save();
        renderMessageList();

        input.value = '';

        var sendButton = document.getElementById('send-button');
        sendButton.disabled = true;

        setCharacterAnimation('think');

        setTimeout(function() {
            generateAIResponse(message);
            sendButton.disabled = false;
        }, 1000 + Math.random() * 2000);
    }

    function handleDebugCommand(command) {
        var validActions = ['idle', 'happy', 'sad', 'think', 'hug', 'wave', 'surprised', 'confused'];

        if (validActions.includes(command.toLowerCase())) {
            setCharacterAnimation(command.toLowerCase());
            UI.showToast('\u6267\u884C\u52A8\u4F5C: ' + command);

            setTimeout(function() {
                setCharacterAnimation('idle');
            }, 3000);
        } else {
            UI.showToast('\u65E0\u6548\u7684\u52A8\u4F5C\u547D\u4EE4: ' + command + '\n\u53EF\u7528\u52A8\u4F5C: ' + validActions.join(', '));
        }
    }

    function updateDebugModeUI() {
        var header = document.querySelector('.header-title');
        if (header) {
            var isDebugMode = Store.getState('isDebugMode');
            if (isDebugMode) {
                header.textContent = '[\u5F00\u53D1\u8005\u6A21\u5F0F] ' + header.textContent.replace('[\u5F00\u53D1\u8005\u6A21\u5F0F] ', '');
                header.style.color = '#FF6B9D';
            } else {
                header.textContent = header.textContent.replace('[\u5F00\u53D1\u8005\u6A21\u5F0F] ', '');
                header.style.color = '';
                if (typeof updateChatTitle === 'function') updateChatTitle();
            }
        }
    }

    function detectCrisisKeywords(message) {
        var keywords = Constants.CRISIS_KEYWORDS;
        return keywords.some(function(keyword) {
            return message.includes(keyword);
        });
    }

    function showCrisisModal() {
        var modal = document.getElementById('crisis-modal');
        if (modal) modal.classList.add('show');
    }

    function closeCrisisModal() {
        var modal = document.getElementById('crisis-modal');
        if (modal) modal.classList.remove('show');
    }

    function buildMessageHistory(userMessage) {
        var sessions = Store.getRef('sessions');
        var currentSessionId = Store.getState('currentSessionId');
        var currentSession = sessions.find(function(s) { return s.id === currentSessionId; });
        if (!currentSession) {
            UI.showToast('\u4F1A\u8BDD\u4E0D\u5B58\u5728');
            return null;
        }

        var agentId = currentSession.agentId || Store.getState('currentAgentId');
        var agents = Store.getRef('agents');
        var currentAgent = agents.find(function(a) { return a.id === agentId; });

        if (!currentAgent) {
            UI.showToast('\u667A\u80FD\u4F53\u4E0D\u5B58\u5728');
            return null;
        }

        var memories = Store.getRef('memories');
        if (typeof llmService === 'undefined') {
            UI.showToast('\u6A21\u578B\u670D\u52A1\u672A\u52A0\u8F7D\uFF0C\u8BF7\u5237\u65B0\u9875\u9762');
            return null;
        }
        var messages = llmService.buildMessages(userMessage, memories, currentAgent);

        return {
            messages: messages,
            agent: currentAgent,
            agentId: agentId
        };
    }

    function callLLMService(messages, useStream) {
        var settings = Store.getState('settings');
        llmService.configure(
            settings.modelProvider,
            settings.modelId,
            settings.apiKey
        );
        return llmService.callAPI(messages, useStream);
    }

    function handleStreamResponse(response, aiMessage, messageElement) {
        var contentElement = messageElement.querySelector('.message-content');
        var messageList = document.getElementById('message-list');
        var fullContent = '';

        return (async function() {
            try {
                for await (var chunk of llmService.handleStreamResponse(response)) {
                    fullContent += chunk;
                    var displayContent = fullContent.replace(/\[action:\w+\]/g, '');
                    contentElement.textContent = displayContent;
                    messageList.scrollTop = messageList.scrollHeight;
                }

                var actionMatch = fullContent.match(/\[action:(\w+)\]/);
                if (actionMatch) {
                    aiMessage.action = actionMatch[1];
                    aiMessage.content = fullContent.replace(/\[action:\w+\]/g, '').trim();
                    contentElement.textContent = aiMessage.content;
                } else {
                    aiMessage.content = fullContent;
                }

                var cursor = messageElement.querySelector('.typing-cursor');
                if (cursor) cursor.remove();

                if (aiMessage.action) {
                    setCharacterAnimation(aiMessage.action);
                }

                App.Storage.save();
            } catch (streamError) {
                console.error('\u6D41\u5F0F\u54CD\u5E94\u5904\u7406\u5931\u8D25:', streamError);
                UI.showToast('\u54CD\u5E94\u5904\u7406\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5');
            }
        })();
    }

    function handleErrorResponse(error) {
        console.error('API\u8C03\u7528\u5931\u8D25:', error);
        UI.showToast('API\u8C03\u7528\u5931\u8D25: ' + error.message);

        var sendButton = document.getElementById('send-button');
        if (sendButton) sendButton.disabled = false;
    }

    async function generateAIResponse(userMessage) {
        try {
            var settings = Store.getState('settings');
            if (!settings.apiKey) {
                UI.showToast('\u8BF7\u5148\u5728\u8BBE\u7F6E\u9875\u9762\u914D\u7F6EAPI Key');
                var sendButton = document.getElementById('send-button');
                if (sendButton) sendButton.disabled = false;
                return;
            }

            var historyResult = buildMessageHistory(userMessage);
            if (!historyResult) return;

            var currentAgent = historyResult.agent;
            var agentId = historyResult.agentId;

            llmService.setAgent(currentAgent);

            var response = await callLLMService(historyResult.messages, true);

            var aiMessage = {
                id: Date.now(),
                type: 'ai',
                content: '',
                timestamp: new Date().toISOString(),
                action: 'idle',
                agentId: agentId,
                agentName: currentAgent.name
            };

            var messages = Store.getRef('messages');
            messages.push(aiMessage);

            var messagePage = Store.getState('messagePage');
            Store.setState('hasMoreMessages', messages.length > (messagePage * Constants.MESSAGES_PER_PAGE));

            App.Storage.save();

            var messageList = document.getElementById('message-list');
            var messageElement = createMessageElement(aiMessage, true);
            messageList.appendChild(messageElement);

            if (_isNearBottom()) {
                messageList.scrollTop = messageList.scrollHeight;
            } else {
                var btn = _ensureNewMsgBtn();
                if (btn) btn.style.display = 'block';
            }

            await handleStreamResponse(response, aiMessage, messageElement);

            sendButton = document.getElementById('send-button');
            if (sendButton) sendButton.disabled = false;

        } catch (error) {
            handleErrorResponse(error);
        }
    }

    function streamMessage(message) {
        var messageList = document.getElementById('message-list');
        var messageElement = createMessageElement(message, true);
        messageList.appendChild(messageElement);

        messageList.scrollTop = messageList.scrollHeight;

        var contentElement = messageElement.querySelector('.message-content');
        var currentIndex = 0;
        var text = message.content;

        var typingInterval = setInterval(function() {
            if (currentIndex < text.length) {
                contentElement.textContent = text.substring(0, currentIndex + 1);
                currentIndex++;
                messageList.scrollTop = messageList.scrollHeight;
            } else {
                clearInterval(typingInterval);
                var cursor = messageElement.querySelector('.typing-cursor');
                if (cursor) cursor.remove();

                if (message.action) {
                    setCharacterAnimation(message.action);
                }
            }
        }, 50);
    }

    var _newMsgBtn = null;

    function _ensureNewMsgBtn() {
        if (_newMsgBtn) return _newMsgBtn;
        var chatMain = document.querySelector('.chat-main');
        if (!chatMain) return null;
        _newMsgBtn = document.createElement('button');
        _newMsgBtn.className = 'new-messages-btn';
        _newMsgBtn.textContent = '\u2193 \u65B0\u6D88\u606F';
        _newMsgBtn.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);z-index:100;background:var(--primary);color:#fff;border:none;border-radius:20px;padding:8px 20px;font-size:14px;cursor:pointer;display:none;box-shadow:0 2px 8px rgba(0,0,0,0.2);max-width:480px;';
        _newMsgBtn.addEventListener('click', function() {
            var messageList = document.getElementById('message-list');
            if (messageList) messageList.scrollTop = messageList.scrollHeight;
            _newMsgBtn.style.display = 'none';
        });
        chatMain.appendChild(_newMsgBtn);
        return _newMsgBtn;
    }

    function _isNearBottom() {
        var messageList = document.getElementById('message-list');
        if (!messageList) return true;
        return messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight < 100;
    }

    function renderMessageList() {
        var messageList = document.getElementById('message-list');
        messageList.innerHTML = '';

        var messages = Store.getRef('messages');
        var totalMessages = messages.length;
        var messagePage = Store.getState('messagePage');
        var startIndex = Math.max(0, totalMessages - (messagePage * Constants.MESSAGES_PER_PAGE));
        var endIndex = totalMessages;
        var messagesToShow = messages.slice(startIndex, endIndex);

        Store.setState('hasMoreMessages', startIndex > 0);

        var hasMoreMessages = Store.getState('hasMoreMessages');
        var fragment = document.createDocumentFragment();

        if (hasMoreMessages) {
            fragment.appendChild(createLoadMoreIndicator());
        }

        messagesToShow.forEach(function(message) {
            fragment.appendChild(createMessageElement(message));
        });

        messageList.appendChild(fragment);

        var scrollPosition = Store.getState('scrollPosition');
        if (scrollPosition > 0) {
            messageList.scrollTop = scrollPosition;
            Store.setState('scrollPosition', 0);
        } else {
            messageList.scrollTop = messageList.scrollHeight;
        }

        setupMessageListScrollListener();
    }

    function createMessageElement(message, isStreaming) {
        if (isStreaming === undefined) isStreaming = false;

        var messageDiv = document.createElement('div');
        messageDiv.className = 'message-bubble ' + message.type;
        messageDiv.dataset.id = message.id;

        var contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        var displayContent = message.content.replace(/\[action:\w+\]/g, '');
        contentDiv.textContent = displayContent;

        if (isStreaming) {
            var cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            contentDiv.appendChild(cursor);
        }

        var timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = UI.formatTime(message.timestamp);

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        if (message.type === 'ai' && !isStreaming) {
            var ratingDiv = document.createElement('div');
            ratingDiv.className = 'message-rating';

            var ratings = Store.getRef('ratings');
            var existingRating = ratings.find(function(r) { return r.messageId === message.id; });

            ratingDiv.innerHTML =
                '<button class="rating-btn ' + (existingRating && existingRating.type === 'positive' ? 'active' : '') + '" ' +
                    'onclick="rateMessage(' + message.id + ', \'positive\')" ' +
                    'title="\u597D\u8BC4" ' +
                    (existingRating ? 'disabled' : '') + '>' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>' +
                    '</svg>' +
                '</button>' +
                '<button class="rating-btn ' + (existingRating && existingRating.type === 'negative' ? 'active' : '') + '" ' +
                    'onclick="rateMessage(' + message.id + ', \'negative\')" ' +
                    'title="\u5DEE\u8BC4" ' +
                    (existingRating ? 'disabled' : '') + '>' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>' +
                    '</svg>' +
                '</button>';

            messageDiv.appendChild(ratingDiv);
        }

        return messageDiv;
    }

    function createLoadMoreIndicator() {
        var indicator = document.createElement('div');
        indicator.className = 'load-more-indicator';
        indicator.id = 'load-more-indicator';

        var isLoadingMore = Store.getState('isLoadingMore');
        if (isLoadingMore) {
            indicator.innerHTML =
                '<div class="load-more-loading">' +
                    '<div class="loading-spinner"></div>' +
                    '<span>\u52A0\u8F7D\u4E2D...</span>' +
                '</div>';
        } else {
            indicator.innerHTML =
                '<div class="load-more-text">' +
                    '<span>\u4E0A\u6ED1\u52A0\u8F7D\u66F4\u591A\u6D88\u606F</span>' +
                '</div>';
        }

        return indicator;
    }

    var _throttledScrollHandler = null;

    function setupMessageListScrollListener() {
        var messageList = document.getElementById('message-list');
        if (!messageList) return;

        if (_throttledScrollHandler) {
            messageList.removeEventListener('scroll', _throttledScrollHandler);
        }
        _throttledScrollHandler = UI.throttle(function(e) {
            handleMessageListScroll(e);
            var btn = _ensureNewMsgBtn();
            if (btn) {
                btn.style.display = _isNearBottom() ? 'none' : 'block';
            }
        }, Constants.SCROLL_THROTTLE || 100);
        messageList.addEventListener('scroll', _throttledScrollHandler);
    }

    function handleMessageListScroll(event) {
        var messageList = event.target;
        var scrollTop = messageList.scrollTop;

        var hasMoreMessages = Store.getState('hasMoreMessages');
        var isLoadingMore = Store.getState('isLoadingMore');
        if (scrollTop <= 50 && hasMoreMessages && !isLoadingMore) {
            loadMoreMessages();
        }
    }

    function loadMoreMessages() {
        var isLoadingMore = Store.getState('isLoadingMore');
        var hasMoreMessages = Store.getState('hasMoreMessages');
        if (isLoadingMore || !hasMoreMessages) return;

        var messageList = document.getElementById('message-list');
        var oldScrollHeight = messageList.scrollHeight;

        Store.setState('isLoadingMore', true);
        var messagePage = Store.getState('messagePage');
        Store.setState('messagePage', messagePage + 1);

        Store.setState('scrollPosition', messageList.scrollTop);

        renderMessageList();

        requestAnimationFrame(function() {
            var newScrollHeight = messageList.scrollHeight;
            var scrollDiff = newScrollHeight - oldScrollHeight;
            var savedScrollPosition = Store.getState('scrollPosition');
            messageList.scrollTop = savedScrollPosition + scrollDiff;
            Store.setState('isLoadingMore', false);
        });
    }

    function setCharacterAnimation(action) {
        var character = document.getElementById('pixel-character');
        var characterImage = document.getElementById('character-image');
        var previewImage = document.getElementById('preview-character-image');

        if (!character) return;

        character.className = 'pixel-character';
        character.classList.add('animate-' + action);

        var imagePath = null;
        if (typeof getCharacterImage === 'function') {
            imagePath = getCharacterImage(currentCharacterId, action);
        }

        if (characterImage && imagePath) {
            characterImage.src = imagePath;
        }
        if (previewImage && imagePath) {
            previewImage.src = imagePath;
        }

        var nonLoopActions = ['happy', 'sad', 'hug', 'wave', 'surprised', 'confused'];
        if (nonLoopActions.indexOf(action) !== -1) {
            setTimeout(function() {
                character.classList.remove('animate-' + action);
                character.classList.add('animate-idle');

                var idlePath = null;
                if (typeof getCharacterImage === 'function') {
                    idlePath = getCharacterImage(currentCharacterId, 'idle');
                }
                if (characterImage && idlePath) characterImage.src = idlePath;
                if (previewImage && idlePath) previewImage.src = idlePath;
            }, 3000);
        }
    }

    var Chat = {
        getWelcomeMessage: getWelcomeMessage,
        addWelcomeMessage: addWelcomeMessage,
        sendMessage: sendMessage,
        generateAIResponse: generateAIResponse,
        streamMessage: streamMessage,
        renderMessageList: renderMessageList,
        createMessageElement: createMessageElement,
        createLoadMoreIndicator: createLoadMoreIndicator,
        setupMessageListScrollListener: setupMessageListScrollListener,
        handleMessageListScroll: handleMessageListScroll,
        loadMoreMessages: loadMoreMessages,
        handleDebugCommand: handleDebugCommand,
        updateDebugModeUI: updateDebugModeUI,
        detectCrisisKeywords: detectCrisisKeywords,
        showCrisisModal: showCrisisModal,
        closeCrisisModal: closeCrisisModal,
        setCharacterAnimation: setCharacterAnimation,
        buildMessageHistory: buildMessageHistory,
        callLLMService: callLLMService,
        handleStreamResponse: handleStreamResponse,
        handleErrorResponse: handleErrorResponse
    };

    global.App = global.App || {};
    global.App.Chat = Chat;
    global.App.Api = Api;

    global.sendMessage = sendMessage;
    global.generateAIResponse = generateAIResponse;
    global.streamMessage = streamMessage;
    global.renderMessageList = renderMessageList;
    global.createMessageElement = createMessageElement;
    global.createLoadMoreIndicator = createLoadMoreIndicator;
    global.setupMessageListScrollListener = setupMessageListScrollListener;
    global.handleMessageListScroll = handleMessageListScroll;
    global.loadMoreMessages = loadMoreMessages;
    global.getWelcomeMessage = getWelcomeMessage;
    global.addWelcomeMessage = addWelcomeMessage;
    global.handleDebugCommand = handleDebugCommand;
    global.updateDebugModeUI = updateDebugModeUI;
    global.detectCrisisKeywords = detectCrisisKeywords;
    global.showCrisisModal = showCrisisModal;
    global.closeCrisisModal = closeCrisisModal;
    global.setCharacterAnimation = setCharacterAnimation;
    global.buildMessageHistory = buildMessageHistory;
    global.callLLMService = callLLMService;
    global.handleStreamResponse = handleStreamResponse;
    global.handleErrorResponse = handleErrorResponse;

})(window);
