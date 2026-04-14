(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;
    var Constants = App.Constants;

    var CareNotificationState = {
        templates: [],
        careTimes: {
            morning: { enabled: false, time: '08:00' },
            noon: { enabled: false, time: '12:00' },
            evening: { enabled: false, time: '22:00' },
            custom: { enabled: false, time: '15:00' }
        },
        history: [],
        timers: {},
        editingTemplateId: null
    };

    function initCareNotifications() {
        loadCareSettings();
        checkNotificationPermission();
        renderCareTemplates();
        renderCareHistory();
        updateCareTimeInputs();
        startCareSchedulers();

        var templateContent = document.getElementById('template-content');
        if (templateContent) {
            templateContent.addEventListener('input', function() {
                var charCount = document.getElementById('template-char-count');
                if (charCount) {
                    charCount.textContent = templateContent.value.length;
                }
            });
        }
    }

    function loadCareSettings() {
        try {
            var savedTemplates = localStorage.getItem('egfCareTemplates');
            var savedCareTimes = localStorage.getItem('egfCareTimes');
            var savedHistory = localStorage.getItem('egfCareHistory');

            if (savedTemplates) {
                CareNotificationState.templates = JSON.parse(savedTemplates);
            } else {
                CareNotificationState.templates = JSON.parse(JSON.stringify(Constants.DEFAULT_CARE_TEMPLATES));
                saveCareTemplates();
            }

            if (savedCareTimes) {
                CareNotificationState.careTimes = JSON.parse(savedCareTimes);
            }

            if (savedHistory) {
                CareNotificationState.history = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('加载关怀设置失败:', error);
        }
    }

    function saveCareTemplates() {
        try {
            localStorage.setItem('egfCareTemplates', JSON.stringify(CareNotificationState.templates));
        } catch (error) {
            console.error('保存关怀模板失败:', error);
        }
    }

    function saveCareSettings() {
        try {
            var morningEnabledEl = document.getElementById('morning-care-enabled');
            var morningTimeEl = document.getElementById('morning-care-time');
            var morningEnabled = morningEnabledEl ? morningEnabledEl.checked : false;
            var morningTime = morningTimeEl ? morningTimeEl.value : '08:00';

            var noonEnabledEl = document.getElementById('noon-care-enabled');
            var noonTimeEl = document.getElementById('noon-care-time');
            var noonEnabled = noonEnabledEl ? noonEnabledEl.checked : false;
            var noonTime = noonTimeEl ? noonTimeEl.value : '12:00';

            var eveningEnabledEl = document.getElementById('evening-care-enabled');
            var eveningTimeEl = document.getElementById('evening-care-time');
            var eveningEnabled = eveningEnabledEl ? eveningEnabledEl.checked : false;
            var eveningTime = eveningTimeEl ? eveningTimeEl.value : '22:00';

            var customEnabledEl = document.getElementById('custom-care-enabled');
            var customTimeEl = document.getElementById('custom-care-time');
            var customEnabled = customEnabledEl ? customEnabledEl.checked : false;
            var customTime = customTimeEl ? customTimeEl.value : '15:00';

            CareNotificationState.careTimes = {
                morning: { enabled: morningEnabled, time: morningTime },
                noon: { enabled: noonEnabled, time: noonTime },
                evening: { enabled: eveningEnabled, time: eveningTime },
                custom: { enabled: customEnabled, time: customTime }
            };

            localStorage.setItem('egfCareTimes', JSON.stringify(CareNotificationState.careTimes));

            restartCareSchedulers();

            UI.showToast('设置已保存');
        } catch (error) {
            console.error('保存关怀设置失败:', error);
            UI.showToast('保存失败');
        }
    }

    function updateCareTimeInputs() {
        var times = CareNotificationState.careTimes;

        var morningEnabled = document.getElementById('morning-care-enabled');
        var morningTime = document.getElementById('morning-care-time');
        if (morningEnabled) morningEnabled.checked = times.morning.enabled;
        if (morningTime) morningTime.value = times.morning.time;

        var noonEnabled = document.getElementById('noon-care-enabled');
        var noonTime = document.getElementById('noon-care-time');
        if (noonEnabled) noonEnabled.checked = times.noon.enabled;
        if (noonTime) noonTime.value = times.noon.time;

        var eveningEnabled = document.getElementById('evening-care-enabled');
        var eveningTime = document.getElementById('evening-care-time');
        if (eveningEnabled) eveningEnabled.checked = times.evening.enabled;
        if (eveningTime) eveningTime.value = times.evening.time;

        var customEnabled = document.getElementById('custom-care-enabled');
        var customTime = document.getElementById('custom-care-time');
        if (customEnabled) customEnabled.checked = times.custom.enabled;
        if (customTime) customTime.value = times.custom.time;
    }

    function toggleCareTime() {
        saveCareSettings();
    }

    function checkNotificationPermission() {
        if (!('Notification' in window)) {
            updatePermissionStatus('unsupported');
            return;
        }

        var permission = Notification.permission;
        updatePermissionStatus(permission);
    }

    function updatePermissionStatus(status) {
        var permissionText = document.getElementById('permission-text');
        var requestBtn = document.getElementById('request-permission-btn');

        if (!permissionText || !requestBtn) return;

        switch (status) {
        case 'granted':
            permissionText.textContent = '通知权限已启用';
            permissionText.style.color = 'var(--success)';
            requestBtn.style.display = 'none';
            break;
        case 'denied':
            permissionText.textContent = '通知权限被拒绝，请在浏览器设置中允许通知';
            permissionText.style.color = 'var(--error)';
            requestBtn.textContent = '权限被拒绝';
            requestBtn.disabled = true;
            break;
        case 'default':
            permissionText.textContent = '通知权限未启用，点击按钮启用';
            permissionText.style.color = 'var(--warning)';
            requestBtn.style.display = 'block';
            requestBtn.textContent = '启用通知';
            requestBtn.disabled = false;
            break;
        case 'unsupported':
            permissionText.textContent = '您的浏览器不支持通知功能';
            permissionText.style.color = 'var(--gray-medium)';
            requestBtn.style.display = 'none';
            break;
        }
    }

    function requestNotificationPermission() {
        if (!('Notification' in window)) {
            UI.showToast('您的浏览器不支持通知功能');
            return;
        }

        Notification.requestPermission().then(function(permission) {
            updatePermissionStatus(permission);

            if (permission === 'granted') {
                UI.showToast('通知权限已启用');
                sendCareNotification('关怀通知已启用', '你将按时收到温暖的关怀消息～');
            } else if (permission === 'denied') {
                UI.showToast('通知权限被拒绝');
            }
        }).catch(function(error) {
            console.error('请求通知权限失败:', error);
            UI.showToast('请求权限失败');
        });
    }

    function sendCareNotification(title, body, type) {
        type = type || 'custom';

        if (!('Notification' in window)) {
            UI.showToast('浏览器不支持通知');
            return;
        }

        if (Notification.permission !== 'granted') {
            UI.showToast('请先启用通知权限');
            return;
        }

        try {
            var notification = new Notification(title, {
                body: body,
                icon: 'assets/characters/female_adventurer/happy.png',
                tag: 'care-' + type + '-' + Date.now(),
                requireInteraction: false,
                silent: false
            });

            addToCareHistory(title, body, type);

            notification.onclick = function() {
                window.focus();
                notification.close();
            };

            setTimeout(function() {
                notification.close();
            }, 10000);

        } catch (error) {
            console.error('发送通知失败:', error);
        }
    }

    function startCareSchedulers() {
        Object.values(CareNotificationState.timers).forEach(function(timer) {
            if (timer) clearInterval(timer);
        });
        CareNotificationState.timers = {};

        Object.keys(CareNotificationState.careTimes).forEach(function(type) {
            var config = CareNotificationState.careTimes[type];
            if (config.enabled) {
                startCareScheduler(type, config.time);
            }
        });
    }

    function startCareScheduler(type, time) {
        var timer = setInterval(function() {
            checkAndSendCareNotification(type, time);
        }, 60000);

        CareNotificationState.timers[type] = timer;

        checkAndSendCareNotification(type, time);
    }

    function checkAndSendCareNotification(type, scheduledTime) {
        var now = new Date();
        var currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        if (currentTime === scheduledTime) {
            var today = now.toDateString();
            var lastSentKey = 'careLastSent_' + type;
            var lastSent = localStorage.getItem(lastSentKey);

            if (lastSent !== today) {
                var template = getRandomTemplateByType(type);
                if (template) {
                    var agent = Store.getRef('agents').find(function(a) { return a.id === Store.getState('currentAgentId'); }) || { name: '小雅' };
                    sendCareNotification(agent.name + '的关怀', template.content, type);

                    localStorage.setItem(lastSentKey, today);
                }
            }
        }
    }

    function getRandomTemplateByType(type) {
        var templates = CareNotificationState.templates.filter(function(t) { return t.type === type; });
        if (templates.length === 0) {
            var customTemplates = CareNotificationState.templates.filter(function(t) { return t.type === 'custom'; });
            if (customTemplates.length > 0) {
                return customTemplates[Math.floor(Math.random() * customTemplates.length)];
            }
            return null;
        }
        return templates[Math.floor(Math.random() * templates.length)];
    }

    function restartCareSchedulers() {
        startCareSchedulers();
    }

    function renderCareTemplates() {
        var container = document.getElementById('care-templates-grid');
        if (!container) return;

        container.innerHTML = '';

        CareNotificationState.templates.forEach(function(template) {
            var card = document.createElement('div');
            card.className = 'care-template-card';
            card.dataset.id = template.id;

            var typeNames = {
                morning: '早安',
                noon: '午安',
                evening: '晚安',
                custom: '自定义'
            };

            var actionsHtml = '';
            if (!template.isPreset) {
                actionsHtml =
                    '<div class="care-template-actions">' +
                        '<button class="button button-small button-secondary" onclick="editCareTemplate(\'' + template.id + '\')">编辑</button>' +
                        '<button class="button button-small button-danger" onclick="deleteCareTemplate(\'' + template.id + '\')">删除</button>' +
                    '</div>';
            }

            var presetBadge = template.isPreset ? '<span class="preset-badge">预设</span>' : '';

            card.innerHTML =
                '<div class="care-template-header">' +
                    '<div class="care-template-type">' + (typeNames[template.type] || '') + '</div>' +
                    presetBadge +
                '</div>' +
                '<div class="care-template-name">' + UI.escapeHtml(template.name) + '</div>' +
                '<div class="care-template-content">' + UI.escapeHtml(template.content) + '</div>' +
                actionsHtml;

            container.appendChild(card);
        });
    }

    function showAddTemplateDialog() {
        CareNotificationState.editingTemplateId = null;
        document.getElementById('care-template-dialog-title').textContent = '添加关怀模板';
        document.getElementById('template-name').value = '';
        document.getElementById('template-type').value = 'custom';
        document.getElementById('template-content').value = '';
        document.getElementById('template-char-count').textContent = '0';

        document.getElementById('care-template-dialog').classList.add('show');
    }

    function editCareTemplate(templateId) {
        var template = CareNotificationState.templates.find(function(t) { return t.id === templateId; });
        if (!template || template.isPreset) return;

        CareNotificationState.editingTemplateId = templateId;
        document.getElementById('care-template-dialog-title').textContent = '编辑关怀模板';
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-type').value = template.type;
        document.getElementById('template-content').value = template.content;
        document.getElementById('template-char-count').textContent = template.content.length;

        document.getElementById('care-template-dialog').classList.add('show');
    }

    function saveCareTemplate() {
        var name = document.getElementById('template-name').value.trim();
        var type = document.getElementById('template-type').value;
        var content = document.getElementById('template-content').value.trim();

        if (!name) {
            UI.showToast('请输入模板名称');
            return;
        }

        if (!content) {
            UI.showToast('请输入消息内容');
            return;
        }

        if (content.length > 200) {
            UI.showToast('消息内容不能超过200字符');
            return;
        }

        if (CareNotificationState.editingTemplateId) {
            var index = CareNotificationState.templates.findIndex(function(t) { return t.id === CareNotificationState.editingTemplateId; });
            if (index !== -1) {
                CareNotificationState.templates[index] = {
                    id: CareNotificationState.templates[index].id,
                    name: name,
                    type: type,
                    content: content,
                    isPreset: CareNotificationState.templates[index].isPreset
                };
            }
            UI.showToast('模板已更新');
        } else {
            var newTemplate = {
                id: 'template_' + Date.now(),
                name: name,
                type: type,
                content: content,
                isPreset: false
            };
            CareNotificationState.templates.push(newTemplate);
            UI.showToast('模板已添加');
        }

        saveCareTemplates();
        renderCareTemplates();
        closeCareTemplateDialog();
    }

    function deleteCareTemplate(templateId) {
        var template = CareNotificationState.templates.find(function(t) { return t.id === templateId; });
        if (!template || template.isPreset) return;

        if (!confirm('确定要删除模板"' + template.name + '"吗？')) return;

        CareNotificationState.templates = CareNotificationState.templates.filter(function(t) { return t.id !== templateId; });
        saveCareTemplates();
        renderCareTemplates();
        UI.showToast('模板已删除');
    }

    function closeCareTemplateDialog() {
        document.getElementById('care-template-dialog').classList.remove('show');
        CareNotificationState.editingTemplateId = null;
    }

    function addToCareHistory(title, body, type) {
        var historyItem = {
            id: Date.now(),
            title: title,
            body: body,
            type: type,
            timestamp: new Date().toISOString()
        };

        CareNotificationState.history.unshift(historyItem);

        if (CareNotificationState.history.length > 50) {
            CareNotificationState.history = CareNotificationState.history.slice(0, 50);
        }

        saveCareHistory();
        renderCareHistory();
    }

    function saveCareHistory() {
        try {
            localStorage.setItem('egfCareHistory', JSON.stringify(CareNotificationState.history));
        } catch (error) {
            console.error('保存关怀历史失败:', error);
        }
    }

    function renderCareHistory() {
        var container = document.getElementById('care-history-list');
        if (!container) return;

        if (CareNotificationState.history.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 20px; color: var(--gray-medium);">暂无历史记录</div>';
            return;
        }

        container.innerHTML = '';

        CareNotificationState.history.slice(0, 20).forEach(function(item) {
            var historyElement = document.createElement('div');
            historyElement.className = 'care-history-item';

            var typeNames = {
                morning: '早安',
                noon: '午安',
                evening: '晚安',
                custom: '自定义'
            };

            historyElement.innerHTML =
                '<div class="care-history-header">' +
                    '<span class="care-history-type">' + (typeNames[item.type] || '通知') + '</span>' +
                    '<span class="care-history-time">' + UI.formatDateTime(item.timestamp) + '</span>' +
                '</div>' +
                '<div class="care-history-title">' + UI.escapeHtml(item.title) + '</div>' +
                '<div class="care-history-body">' + UI.escapeHtml(item.body) + '</div>';

            container.appendChild(historyElement);
        });
    }

    function clearCareHistory() {
        if (!confirm('确定要清除所有历史记录吗？')) return;

        CareNotificationState.history = [];
        saveCareHistory();
        renderCareHistory();
        UI.showToast('历史记录已清除');
    }

    function testCareNotification() {
        if (Notification.permission !== 'granted') {
            UI.showToast('请先启用通知权限');
            return;
        }

        var agent = Store.getRef('agents').find(function(a) { return a.id === Store.getState('currentAgentId'); }) || { name: '小雅' };
        sendCareNotification(
            agent.name + '的测试关怀',
            '这是一条测试通知，如果你看到了这条消息，说明通知功能工作正常！',
            'custom'
        );

        UI.showToast('测试通知已发送');
    }

    var originalDOMContentLoaded = document.addEventListener;
    document.addEventListener = function(event, callback) {
        if (event === 'DOMContentLoaded') {
            var wrappedCallback = function() {
                callback.apply(this, arguments);
                setTimeout(function() {
                    initCareNotifications();
                    if (App.Emotion && App.Emotion.initEmotionAnalysis) {
                        App.Emotion.initEmotionAnalysis();
                    }
                }, 150);
            };
            return originalDOMContentLoaded.call(this, event, wrappedCallback);
        }
        return originalDOMContentLoaded.apply(this, arguments);
    };

    var Care = {
        initCareNotifications: initCareNotifications,
        loadCareSettings: loadCareSettings,
        saveCareTemplates: saveCareTemplates,
        saveCareSettings: saveCareSettings,
        updateCareTimeInputs: updateCareTimeInputs,
        toggleCareTime: toggleCareTime,
        checkNotificationPermission: checkNotificationPermission,
        updatePermissionStatus: updatePermissionStatus,
        requestNotificationPermission: requestNotificationPermission,
        sendCareNotification: sendCareNotification,
        startCareSchedulers: startCareSchedulers,
        startCareScheduler: startCareScheduler,
        checkAndSendCareNotification: checkAndSendCareNotification,
        getRandomTemplateByType: getRandomTemplateByType,
        restartCareSchedulers: restartCareSchedulers,
        renderCareTemplates: renderCareTemplates,
        showAddTemplateDialog: showAddTemplateDialog,
        editCareTemplate: editCareTemplate,
        saveCareTemplate: saveCareTemplate,
        deleteCareTemplate: deleteCareTemplate,
        closeCareTemplateDialog: closeCareTemplateDialog,
        addToCareHistory: addToCareHistory,
        saveCareHistory: saveCareHistory,
        renderCareHistory: renderCareHistory,
        clearCareHistory: clearCareHistory,
        testCareNotification: testCareNotification
    };

    global.App = global.App || {};
    global.App.Care = Care;

    global.requestNotificationPermission = requestNotificationPermission;
    global.toggleCareTime = toggleCareTime;
    global.saveCareSettings = saveCareSettings;
    global.showAddTemplateDialog = showAddTemplateDialog;
    global.editCareTemplate = editCareTemplate;
    global.deleteCareTemplate = deleteCareTemplate;
    global.saveCareTemplate = saveCareTemplate;
    global.closeCareTemplateDialog = closeCareTemplateDialog;
    global.clearCareHistory = clearCareHistory;
    global.testCareNotification = testCareNotification;

})(window);
