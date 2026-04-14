// ========================================
// 电子女友 - 提醒技能
// ========================================

const REMINDER_PATTERNS = [
    { regex: /记得\s*(\d{1,2})[点时](\d{0,2})?\s*(提醒我|叫我|告诉我)?\s*(.+)/i, type: 'once' },
    { regex: /(\d{1,2})[点时](\d{0,2})?\s*提醒我\s*(.+)/i, type: 'once' },
    { regex: /每天\s*(\d{1,2})[点时](\d{0,2})?\s*(提醒我|叫我)?\s*(.+)/i, type: 'daily' },
    { regex: /每天\s*(早上|上午|中午|下午|晚上|睡前)\s*(提醒我|叫我)?\s*(.+)/i, type: 'daily_period' },
    { regex: /每周[一二三四五六日天]\s*(\d{1,2})[点时]?\s*(提醒我|叫我)?\s*(.+)/i, type: 'weekly' }
];

const TIME_PERIODS = {
    '早上': 8, '上午': 10, '中午': 12, '下午': 15, '晚上': 19, '睡前': 22
};

class ReminderSkill {
    constructor() {
        this.reminders = [];
        this.checkInterval = null;
        this.isDestroyed = false;
    }

    // 初始化提醒技能
    init(reminders) {
        this.reminders = reminders || [];
        this.startChecking();
    }

    // 从消息中解析提醒
    parseFromMessage(message) {
        for (const pattern of REMINDER_PATTERNS) {
            const match = message.match(pattern.regex);
            if (match) {
                const reminder = {
                    id: Date.now(),
                    type: pattern.type,
                    createdAt: new Date().toISOString(),
                    status: 'pending'
                };
                
                if (pattern.type === 'once') {
                    const hour = parseInt(match[1]) || 0;
                    const minute = match[2] ? parseInt(match[2]) : 0;
                    const task = match[4] || match[3] || '';
                    
                    reminder.hour = hour;
                    reminder.minute = minute;
                    reminder.task = task.replace(/^(提醒我|叫我|告诉我)\s*/, '').trim();
                    reminder.nextTrigger = this.getNextTriggerTime(hour, minute);
                } else if (pattern.type === 'daily') {
                    const hour = parseInt(match[1]) || 0;
                    const minute = match[2] ? parseInt(match[2]) : 0;
                    const task = match[4] || match[3] || '';
                    
                    reminder.hour = hour;
                    reminder.minute = minute;
                    reminder.task = task.replace(/^(提醒我|叫我)\s*/, '').trim();
                    reminder.nextTrigger = this.getNextTriggerTime(hour, minute);
                } else if (pattern.type === 'daily_period') {
                    const period = match[1];
                    const task = match[3] || '';
                    
                    reminder.hour = TIME_PERIODS[period] || 12;
                    reminder.minute = 0;
                    reminder.task = task.replace(/^(提醒我|叫我)\s*/, '').trim();
                    reminder.period = period;
                    reminder.nextTrigger = this.getNextTriggerTime(reminder.hour, 0);
                }
                
                if (reminder.task) {
                    return reminder;
                }
            }
        }
        
        return null;
    }

    // 获取下次触发时间
    getNextTriggerTime(hour, minute) {
        const now = new Date();
        const trigger = new Date();
        trigger.setHours(hour, minute, 0, 0);
        
        if (trigger <= now) {
            trigger.setDate(trigger.getDate() + 1);
        }
        
        return trigger.toISOString();
    }

    // 添加提醒
    addReminder(reminder) {
        this.reminders.push(reminder);
        return reminder;
    }

    // 取消提醒
    cancelReminder(reminderId) {
        const index = this.reminders.findIndex(r => r.id === reminderId);
        if (index !== -1) {
            this.reminders[index].status = 'cancelled';
            return true;
        }
        return false;
    }

    // 获取待执行的提醒
    getPendingReminders() {
        return this.reminders.filter(r => r.status === 'pending');
    }

    // 开始检查提醒
    startChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        if (!this.isDestroyed) {
            this.checkInterval = setInterval(() => this.checkReminders(), 60000);
            this.checkReminders();
        }
    }

    // 检查提醒
    checkReminders() {
        if (this.isDestroyed || !this.reminders || this.reminders.length === 0) return;
        
        const now = new Date();
        
        this.reminders.forEach(reminder => {
            if (reminder.status !== 'pending') return;
            
            const triggerTime = new Date(reminder.nextTrigger);
            const diff = triggerTime - now;
            
            if (diff <= 60000 && diff > -60000) {
                this.executeReminder(reminder);
            }
        });
    }

    // 执行提醒
    executeReminder(reminder) {
        // 发送通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('提醒', {
                body: reminder.task,
                icon: '/assets/icon.png'
            });
        }
        
        // 标记为已完成（一次性提醒）
        if (reminder.type === 'once') {
            reminder.status = 'completed';
        } else {
            // 重复提醒，更新下次触发时间
            reminder.nextTrigger = this.getNextTriggerTime(reminder.hour, reminder.minute);
        }
        
        // 触发回调
        if (this.onReminderTriggered) {
            this.onReminderTriggered(reminder);
        }
    }

    // 设置提醒触发回调
    setOnReminderTriggered(callback) {
        this.onReminderTriggered = callback;
    }

    // 停止检查
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // 销毁实例
    destroy() {
        this.isDestroyed = true;
        this.stopChecking();
        this.reminders = [];
        this.onReminderTriggered = null;
    }

    // 导出提醒
    exportReminders() {
        return JSON.stringify(this.reminders, null, 2);
    }
}

// 导出提醒技能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReminderSkill;
}
