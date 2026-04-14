(function() {
    'use strict';

    var Store = App.Store;
    var Storage = App.Storage;

    var INITIAL_STATE = {
        currentPage: 'chat',
        sessions: [],
        currentSessionId: null,
        messages: [],
        memories: [],
        agents: [],
        currentAgentId: null,
        settings: {
            apiKey: '',
            modelProvider: 'zhipu',
            modelId: 'charglm-4'
        },
        editingMemoryId: null,
        editingAgentId: null,
        lastSendTime: 0,
        isDebugMode: false,
        messagePage: 1,
        hasMoreMessages: false,
        isLoadingMore: false,
        scrollPosition: 0,
        ratings: [],
        reminders: []
    };

    var PERSIST_KEYS = [
        'sessions', 'currentSessionId', 'memories', 'agents',
        'currentAgentId', 'settings', 'ratings', 'reminders'
    ];

    Store.init(INITIAL_STATE, PERSIST_KEYS);
    Store.setDebug(false);

    var loadedData = Storage.load();
    for (var key in loadedData) {
        if (Object.prototype.hasOwnProperty.call(loadedData, key)) {
            Store.setState(key, loadedData[key]);
        }
    }

    function initEventListeners() {
        var messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (typeof sendMessage === 'function') sendMessage();
                }
            });
        }

        var memoryContent = document.getElementById('memory-content');
        if (memoryContent) {
            memoryContent.addEventListener('input', function() {
                var charCount = document.getElementById('char-count');
                if (charCount) charCount.textContent = memoryContent.value.length;
            });
        }

        var crisisModal = document.getElementById('crisis-modal');
        if (crisisModal) {
            crisisModal.addEventListener('click', function(e) {
                if (e.target.id === 'crisis-modal') {
                    // crisis modal cannot be closed by clicking outside
                }
            });
        }

        var memoryDialog = document.getElementById('memory-dialog');
        if (memoryDialog) {
            memoryDialog.addEventListener('click', function(e) {
                if (e.target.id === 'memory-dialog') {
                    if (typeof closeMemoryDialog === 'function') closeMemoryDialog();
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof App.Agent !== 'undefined' && App.Agent.initDefaultAgents) App.Agent.initDefaultAgents();
        if (typeof initSessions === 'function') initSessions();

        if (typeof checkFirstLaunch === 'function') checkFirstLaunch();
        if (typeof checkForUpdates === 'function') checkForUpdates();
        initEventListeners();

        if (typeof renderSessionList === 'function') renderSessionList();
        if (typeof renderMemoryList === 'function') renderMemoryList();
        if (typeof App.Tutorial !== 'undefined' && App.Tutorial.renderPlatformList) App.Tutorial.renderPlatformList();
        if (typeof renderAgentList === 'function') renderAgentList();
        if (typeof updateModelList === 'function') updateModelList();
        if (typeof updateChatTitle === 'function') updateChatTitle();

        var messages = Store.getRef('messages');
        if (!messages || messages.length === 0) {
            if (typeof addWelcomeMessage === 'function') addWelcomeMessage();
        }

        setTimeout(function() {
            if (typeof checkAndShowGuide === 'function') checkAndShowGuide();
        }, 1000);

        setTimeout(function() {
            if (typeof App.Care !== 'undefined' && App.Care.initCareNotifications) App.Care.initCareNotifications();
            if (typeof App.Emotion !== 'undefined' && App.Emotion.initEmotionAnalysis) App.Emotion.initEmotionAnalysis();
        }, 150);

        if (typeof App.Reminder !== 'undefined' && App.Reminder.initReminderSkill) App.Reminder.initReminderSkill();
    });

})();
