(function(global) {
    'use strict';

    var Store = App.Store;
    var UI = App.UI;
    var Constants = App.Constants;

    var reminderSkillInterval = null;

    function initReminderSkill() {
        loadReminders();

        if (reminderSkillInterval) {
            clearInterval(reminderSkillInterval);
        }

        reminderSkillInterval = setInterval(checkReminders, 60000);

        checkReminders();
    }

    function parseReminderFromMessage(message) {
        var patterns = Constants.REMINDER_PATTERNS;
        for (var i = 0; i < patterns.length; i++) {
            var pattern = patterns[i];
            var match = message.match(pattern.regex);
            if (match) {
                var reminder = {
                    id: Date.now(),
                    type: pattern.type,
                    createdAt: new Date().toISOString(),
                    status: 'pending'
                };

                if (pattern.type === 'once') {
                    var hour = parseInt(match[1]) || 0;
                    var minute = match[2] ? parseInt(match[2]) : 0;
                    var task = match[4] || match[3] || '';

                    reminder.hour = hour;
                    reminder.minute = minute;
                    reminder.task = task.replace(/^(提醒我|叫我|告诉我)\s*/, '').trim();
                    reminder.nextTrigger = getNextTriggerTime(hour, minute);
                } else if (pattern.type === 'daily') {
                    hour = parseInt(match[1]) || 0;
                    minute = match[2] ? parseInt(match[2]) : 0;
                    task = match[4] || match[3] || '';

                    reminder.hour = hour;
                    reminder.minute = minute;
                    reminder.task = task.replace(/^(提醒我|叫我)\s*/, '').trim();
                    reminder.nextTrigger = getNextTriggerTime(hour, minute);
                } else if (pattern.type === 'daily_period') {
                    var period = match[1];
                    task = match[3] || '';

                    reminder.hour = Constants.TIME_PERIODS[period] || 12;
                    reminder.minute = 0;
                    reminder.task = task.replace(/^(提醒我|叫我)\s*/, '').trim();
                    reminder.period = period;
                    reminder.nextTrigger = getNextTriggerTime(reminder.hour, 0);
                }

                if (reminder.task) {
                    return reminder;
                }
            }
        }

        return null;
    }

    function getNextTriggerTime(hour, minute) {
        var now = new Date();
        var trigger = new Date();
        trigger.setHours(hour, minute, 0, 0);

        if (trigger <= now) {
            trigger.setDate(trigger.getDate() + 1);
        }

        return trigger.toISOString();
    }

    function addReminder(reminder) {
        if (!Store.getRef('reminders')) {
            Store.setState('reminders', []);
        }

        Store.getRef('reminders').push(reminder);
        saveReminders();

        saveReminderToMD(reminder);

        UI.showToast('已创建提醒: ' + reminder.task);

        return reminder;
    }

    function saveReminderToMD(reminder) {
        var reminderMD = generateReminderMD(reminder);

        var reminders = localStorage.getItem('egfRemindersMD') || '';
        reminders += '\n---\n' + reminderMD;
        localStorage.setItem('egfRemindersMD', reminders);
    }

    function generateReminderMD(reminder) {
        var date = new Date(reminder.createdAt);
        var triggerDate = new Date(reminder.nextTrigger);

        var typeLabel = '一次性提醒';
        if (reminder.type === 'daily') {
            typeLabel = '每日提醒';
        } else if (reminder.type === 'daily_period') {
            typeLabel = '每日' + reminder.period + '提醒';
        }

        return '## 提醒事项\n\n' +
            '**任务**: ' + reminder.task + '\n' +
            '**类型**: ' + typeLabel + '\n' +
            '**提醒时间**: ' + triggerDate.toLocaleString('zh-CN') + '\n' +
            '**创建时间**: ' + date.toLocaleString('zh-CN') + '\n' +
            '**状态**: 待执行\n\n' +
            '### 详细信息\n' +
            '- ID: ' + reminder.id + '\n' +
            '- 小时: ' + reminder.hour + '\n' +
            '- 分钟: ' + reminder.minute + '\n';
    }

    function loadReminders() {
        try {
            var saved = localStorage.getItem('egfReminders');
            if (saved) {
                Store.setState('reminders', JSON.parse(saved));
            } else {
                Store.setState('reminders', []);
            }
        } catch (e) {
            Store.setState('reminders', []);
        }
    }

    function saveReminders() {
        localStorage.setItem('egfReminders', JSON.stringify(Store.getRef('reminders')));
    }

    function checkReminders() {
        var reminders = Store.getRef('reminders');
        if (!reminders || reminders.length === 0) return;

        var now = new Date();

        reminders.forEach(function(reminder) {
            if (reminder.status !== 'pending') return;

            var triggerTime = new Date(reminder.nextTrigger);
            var diff = triggerTime - now;

            if (diff <= 60000 && diff > -60000) {
                executeReminder(reminder);
            }
        });
    }

    function executeReminder(reminder) {
        var agents = Store.getRef('agents');
        var currentAgentId = Store.getState('currentAgentId');
        var agent = agents.find(function(a) { return a.id === reminder.agentId || a.id === currentAgentId; });
        var agentName = agent ? agent.name : '小雅';

        if ('Notification' in window && Notification.permission === 'granted') {
            var notification = new Notification(agentName + '的提醒', {
                body: reminder.task,
                icon: 'assets/characters/female_adventurer/idle.png',
                tag: reminder.id.toString()
            });

            notification.onclick = function() {
                window.focus();
                notification.close();
            };
        }

        var reminderMessage = {
            id: Date.now(),
            type: 'assistant',
            content: '[提醒] ' + reminder.task,
            timestamp: new Date().toISOString()
        };

        Store.getRef('messages').push(reminderMessage);
        saveCurrentSession();
        renderMessageList();

        setCharacterAnimation('wave');

        if (reminder.type === 'once') {
            reminder.status = 'completed';
        } else {
            reminder.nextTrigger = getNextTriggerTime(reminder.hour, reminder.minute);
        }

        saveReminders();

        UI.showToast('提醒: ' + reminder.task);
    }

    function processMessageForReminder(message) {
        var reminder = parseReminderFromMessage(message);

        if (reminder) {
            reminder.agentId = Store.getState('currentAgentId');
            addReminder(reminder);
            return true;
        }

        return false;
    }

    function getPendingReminders() {
        var reminders = Store.getRef('reminders') || [];
        return reminders.filter(function(r) { return r.status === 'pending'; });
    }

    function cancelReminder(reminderId) {
        var reminders = Store.getRef('reminders');
        var reminder = reminders.find(function(r) { return r.id === reminderId; });
        if (reminder) {
            reminder.status = 'cancelled';
            saveReminders();
            UI.showToast('提醒已取消');
        }
    }

    function exportRemindersMD() {
        var content = localStorage.getItem('egfRemindersMD') || '# 提醒事项记录\n\n暂无提醒记录';

        var blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'reminders_' + new Date().toISOString().split('T')[0] + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UI.showToast('提醒记录已导出');
    }

    var Reminder = {
        initReminderSkill: initReminderSkill,
        parseReminderFromMessage: parseReminderFromMessage,
        getNextTriggerTime: getNextTriggerTime,
        addReminder: addReminder,
        saveReminderToMD: saveReminderToMD,
        generateReminderMD: generateReminderMD,
        loadReminders: loadReminders,
        saveReminders: saveReminders,
        checkReminders: checkReminders,
        executeReminder: executeReminder,
        processMessageForReminder: processMessageForReminder,
        getPendingReminders: getPendingReminders,
        cancelReminder: cancelReminder,
        exportRemindersMD: exportRemindersMD
    };

    global.App = global.App || {};
    global.App.Reminder = Reminder;

    global.initReminderSkill = initReminderSkill;
    global.processMessageForReminder = processMessageForReminder;
    global.getPendingReminders = getPendingReminders;
    global.cancelReminder = cancelReminder;
    global.exportRemindersMD = exportRemindersMD;

})(window);
