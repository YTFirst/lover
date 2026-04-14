(function(global) {
    'use strict';
    var Store = App.Store;
    var UI = App.UI;

    function initSessions() {
        var sessions = Store.getRef('sessions');
        if (sessions.length === 0) {
            createNewSession();
        } else {
            var currentSessionId = Store.getState('currentSessionId');
            var currentSession = sessions.find(function(s) { return s.id === currentSessionId; });
            if (!currentSession) {
                Store.setState('currentSessionId', sessions[0].id);
            }
            loadCurrentSession();
        }
    }

    function createNewSession(name, agentId) {
        var sessionId = 'session_' + Date.now();
        var selectedAgentId = agentId || Store.getState('currentAgentId');
        var sessions = Store.getRef('sessions');

        var newSession = {
            id: sessionId,
            name: name || '\u4F1A\u8BDD ' + (sessions.length + 1),
            agentId: selectedAgentId,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        sessions.unshift(newSession);
        Store.setState('currentSessionId', sessionId);
        Store.setState('currentAgentId', selectedAgentId);
        Store.setState('messages', []);
        Store.setState('messagePage', 1);
        Store.setState('hasMoreMessages', false);
        Store.setState('isLoadingMore', false);
        Store.setState('scrollPosition', 0);

        App.Storage.save();
        renderSessionList();
        if (typeof addWelcomeMessage === 'function') addWelcomeMessage();
        if (typeof updateChatTitle === 'function') updateChatTitle();

        return newSession;
    }

    function loadCurrentSession() {
        var sessions = Store.getRef('sessions');
        var currentSessionId = Store.getState('currentSessionId');
        var session = sessions.find(function(s) { return s.id === currentSessionId; });
        if (session) {
            Store.setState('messages', session.messages || []);

            if (!session.agentId) {
                var agents = Store.getRef('agents');
                var defaultAgent = agents.find(function(a) { return a.metadata && a.metadata.isDefault; });
                session.agentId = defaultAgent ? defaultAgent.id : (agents[0] ? agents[0].id : 'default');
                console.log('[Session] \u4F1A\u8BDD\u7F3A\u5C11\u667A\u80FD\u4F53ID\uFF0C\u5DF2\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4\u667A\u80FD\u4F53: ' + session.agentId);
                App.Storage.save();
            }

            Store.setState('currentAgentId', session.agentId);

            console.log('[Session] \u52A0\u8F7D\u4F1A\u8BDD: ' + session.name + ', \u667A\u80FD\u4F53: ' + session.agentId);

            var messages = Store.getRef('messages');
            Store.setState('messagePage', 1);
            Store.setState('hasMoreMessages', messages.length > App.Constants.MESSAGES_PER_PAGE);
            Store.setState('isLoadingMore', false);
            Store.setState('scrollPosition', 0);

            if (typeof renderMessageList === 'function') renderMessageList();
            if (typeof renderAgentList === 'function') renderAgentList();
            if (typeof updateChatTitle === 'function') updateChatTitle();
        }
    }

    function switchSession(sessionId) {
        saveCurrentSession();
        Store.setState('currentSessionId', sessionId);
        loadCurrentSession();
        renderSessionList();
    }

    function saveCurrentSession() {
        var sessions = Store.getRef('sessions');
        var currentSessionId = Store.getState('currentSessionId');
        var session = sessions.find(function(s) { return s.id === currentSessionId; });
        if (session) {
            session.messages = Store.getRef('messages');
            session.agentId = Store.getState('currentAgentId');
            session.updatedAt = new Date().toISOString();
            App.Storage.save();
        }
    }

    function deleteSession(sessionId) {
        var sessions = Store.getRef('sessions');
        if (sessions.length <= 1) {
            UI.showToast('\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u4F1A\u8BDD');
            return;
        }

        var session = sessions.find(function(s) { return s.id === sessionId; });
        if (!session) return;

        if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u4F1A\u8BDD\u201C' + session.name + '\u201D\u5417\uFF1F')) return;

        var newSessions = sessions.filter(function(s) { return s.id !== sessionId; });
        Store.setState('sessions', newSessions);

        var currentSessionId = Store.getState('currentSessionId');
        if (currentSessionId === sessionId) {
            Store.setState('currentSessionId', newSessions[0].id);
            loadCurrentSession();
        }

        App.Storage.save();
        renderSessionList();
        UI.showToast('\u4F1A\u8BDD\u5DF2\u5220\u9664');
    }

    function renameSession(sessionId, newName) {
        var sessions = Store.getRef('sessions');
        var session = sessions.find(function(s) { return s.id === sessionId; });
        if (session) {
            session.name = newName;
            session.updatedAt = new Date().toISOString();
            App.Storage.save();
            renderSessionList();
            if (typeof updateChatTitle === 'function') updateChatTitle();
        }
    }

    function renderSessionList() {
        var container = document.getElementById('session-list');
        if (!container) return;

        container.innerHTML = '';

        var sessions = Store.getRef('sessions');
        var currentSessionId = Store.getState('currentSessionId');
        var agents = Store.getRef('agents');

        sessions.forEach(function(session) {
            var item = document.createElement('div');
            item.className = 'session-item ' + (session.id === currentSessionId ? 'active' : '');
            item.onclick = function() { switchSession(session.id); };

            var agent = agents.find(function(a) { return a.id === session.agentId; }) || { name: '\u5C0F\u96C5' };

            item.innerHTML =
                '<div class="session-info">' +
                    '<div class="session-name">' + session.name + '</div>' +
                    '<div class="session-meta">' + agent.name + ' \u00B7 ' + (session.messages ? session.messages.length : 0) + '\u6761\u6D88\u606F</div>' +
                '</div>' +
                '<div class="session-actions">' +
                    '<button class="session-action-btn" onclick="event.stopPropagation(); showRenameSessionDialog(\'' + session.id + '\')" title="\u91CD\u547D\u540D">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
                            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
                        '</svg>' +
                    '</button>' +
                    '<button class="session-action-btn delete" onclick="event.stopPropagation(); deleteSession(\'' + session.id + '\')" title="\u5220\u9664">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                            '<polyline points="3 6 5 6 21 6"/>' +
                            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
                        '</svg>' +
                    '</button>' +
                '</div>';

            container.appendChild(item);
        });
    }

    function showRenameSessionDialog(sessionId) {
        var sessions = Store.getRef('sessions');
        var session = sessions.find(function(s) { return s.id === sessionId; });
        if (!session) return;

        var newName = prompt('\u8BF7\u8F93\u5165\u65B0\u7684\u4F1A\u8BDD\u540D\u79F0:', session.name);
        if (newName && newName.trim()) {
            renameSession(sessionId, newName.trim());
        }
    }

    function toggleSessionSidebar() {
        var sidebar = document.getElementById('session-sidebar');
        var overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.toggle('open');
        }
        if (overlay) {
            overlay.classList.toggle('show');
        }
    }

    function closeSessionSidebar() {
        var sidebar = document.getElementById('session-sidebar');
        var overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    function handleCreateNewSession() {
        console.log('[DEBUG] handleCreateNewSession() called');
        saveCurrentSession();
        showAgentSelectorForNewSession();
    }

    async function showAgentSelectorForNewSession() {
        console.log('[DEBUG] showAgentSelectorForNewSession() called');
        var container = document.getElementById('agent-selector-list');
        if (!container) {
            console.error('[DEBUG] agent-selector-list element NOT found in session!');
            return;
        }
        console.log('[DEBUG] agent-selector-list element found in session');

        container.innerHTML = '';

        var agents = Store.getRef('agents');
        
        if (!agents || agents.length === 0) {
            await App.Agent.loadAgentsFromAPI();
            agents = Store.getRef('agents');
        }
        
        if (!agents || agents.length === 0) {
            UI.showToast('没有可用的智能体');
            return;
        }

        var currentAgentId = Store.getState('currentAgentId');

        agents.forEach(function(agent) {
            var item = document.createElement('div');
            item.className = 'agent-selector-item ' + (agent.id === currentAgentId ? 'active' : '');
            item.onclick = function() {
                createNewSessionWithAgent(agent.id);
                closeAgentSelector();
            };
            item.innerHTML = `
                <div class="agent-selector-avatar">${agent.name.charAt(0)}</div>
                <div class="agent-selector-info">
                    <h4 class="agent-selector-name">
                        ${agent.name}
                        ${agent.metadata && agent.metadata.isLocked ? '<span class="lock-badge-small">[锁定]</span>' : ''}
                    </h4>
                    <p class="agent-selector-personality">${agent.personality}</p>
                </div>
                ${agent.id === currentAgentId ? '<span class="check-icon">[当前]</span>' : ''}
            `;
            container.appendChild(item);
        });

        var modalTitle = document.querySelector('#agent-selector-modal .modal-header h2');
        if (modalTitle) {
            modalTitle.textContent = '选择智能体创建新会话';
        }

        document.getElementById('agent-selector-modal').classList.add('show');
    }

    function createNewSessionWithAgent(agentId) {
        createNewSession(null, agentId);
        closeSessionSidebar();

        var agents = Store.getRef('agents');
        var agent = agents.find(function(a) { return a.id === agentId; });
        UI.showToast('\u5DF2\u521B\u5EFA\u65B0\u4F1A\u8BDD - ' + (agent ? agent.name : '\u672A\u77E5\u667A\u80FD\u4F53'));
    }

    function closeAgentSelector() {
        document.getElementById('agent-selector-modal').classList.remove('show');
    }

    var Session = {
        initSessions: initSessions,
        createNewSession: createNewSession,
        loadCurrentSession: loadCurrentSession,
        switchSession: switchSession,
        saveCurrentSession: saveCurrentSession,
        deleteSession: deleteSession,
        renameSession: renameSession,
        renderSessionList: renderSessionList,
        showRenameSessionDialog: showRenameSessionDialog,
        toggleSessionSidebar: toggleSessionSidebar,
        closeSessionSidebar: closeSessionSidebar,
        handleCreateNewSession: handleCreateNewSession,
        showAgentSelectorForNewSession: showAgentSelectorForNewSession,
        createNewSessionWithAgent: createNewSessionWithAgent,
        closeAgentSelector: closeAgentSelector
    };

    global.App = global.App || {};
    global.App.Session = Session;

    global.initSessions = initSessions;
    global.createNewSession = createNewSession;
    global.loadCurrentSession = loadCurrentSession;
    global.switchSession = switchSession;
    global.saveCurrentSession = saveCurrentSession;
    global.deleteSession = deleteSession;
    global.renameSession = renameSession;
    global.renderSessionList = renderSessionList;
    global.showRenameSessionDialog = showRenameSessionDialog;
    global.toggleSessionSidebar = toggleSessionSidebar;
    global.closeSessionSidebar = closeSessionSidebar;
    global.handleCreateNewSession = handleCreateNewSession;
    global.showAgentSelectorForNewSession = showAgentSelectorForNewSession;
    global.createNewSessionWithAgent = createNewSessionWithAgent;
    global.closeAgentSelector = closeAgentSelector;

})(window);
