// ========================================
// 电子女友 - 关怀技能
// ========================================

// 预设关怀消息模板
const DEFAULT_CARE_TEMPLATES = [
    {
        id: 'morning_1',
        name: '早安问候',
        type: 'morning',
        content: '早安！新的一天开始了，希望你今天充满能量和好心情！记得吃早餐哦～',
        isPreset: true
    },
    {
        id: 'morning_2',
        name: '晨间鼓励',
        type: 'morning',
        content: '早上好！又是美好的一天，相信自己，你一定可以做到的！',
        isPreset: true
    },
    {
        id: 'noon_1',
        name: '午间关怀',
        type: 'noon',
        content: '中午啦！记得休息一下，吃顿美味的午餐，给自己充充电～',
        isPreset: true
    },
    {
        id: 'noon_2',
        name: '午后提醒',
        type: 'noon',
        content: '下午好！工作辛苦了，记得站起来活动活动，喝杯水放松一下。',
        isPreset: true
    },
    {
        id: 'evening_1',
        name: '晚安祝福',
        type: 'evening',
        content: '晚安！今天辛苦了，好好休息，做个美梦～明天又是新的一天！',
        isPreset: true
    },
    {
        id: 'evening_2',
        name: '睡前关怀',
        type: 'evening',
        content: '夜深了，该休息啦！放下手机，闭上眼睛，让身心都放松下来吧～',
        isPreset: true
    }
];

class CareSkill {
    constructor() {
        this.templates = [];
        this.careTimes = {
            morning: { enabled: true, time: '08:00' },
            noon: { enabled: true, time: '12:00' },
            evening: { enabled: true, time: '22:00' },
            custom: { enabled: false, time: '15:00' }
        };
        this.history = [];
        this.schedulers = {};
        this.isDestroyed = false;
    }

    // 初始化关怀技能
    init(config) {
        this.templates = config.templates || DEFAULT_CARE_TEMPLATES;
        this.careTimes = config.careTimes || this.careTimes;
        this.history = config.history || [];
        this.startSchedulers();
    }

    // 启动定时器
    startSchedulers() {
        // 清除现有定时器
        this.stopSchedulers();
        
        if (this.isDestroyed) return;
        
        // 设置早安提醒
        if (this.careTimes.morning.enabled) {
            this.setupScheduler('morning', this.careTimes.morning.time);
        }
        
        // 设置午间提醒
        if (this.careTimes.noon.enabled) {
            this.setupScheduler('noon', this.careTimes.noon.time);
        }
        
        // 设置晚安提醒
        if (this.careTimes.evening.enabled) {
            this.setupScheduler('evening', this.careTimes.evening.time);
        }
        
        // 设置自定义提醒
        if (this.careTimes.custom.enabled) {
            this.setupScheduler('custom', this.careTimes.custom.time);
        }
    }

    // 设置定时器
    setupScheduler(type, time) {
        if (this.isDestroyed) return;
        
        const [hour, minute] = time.split(':').map(Number);
        
        const checkAndSend = () => {
            if (this.isDestroyed) return;
            
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const targetMinutes = hour * 60 + minute;
            
            // 如果当前时间匹配目标时间（±1分钟内）
            if (Math.abs(nowMinutes - targetMinutes) <= 1) {
                this.sendCareMessage(type);
            }
        };
        
        // 每分钟检查一次
        this.schedulers[type] = setInterval(checkAndSend, 60000);
        
        // 立即检查一次
        checkAndSend();
    }

    // 停止定时器
    stopSchedulers() {
        Object.keys(this.schedulers).forEach(key => {
            if (this.schedulers[key]) {
                clearInterval(this.schedulers[key]);
                this.schedulers[key] = null;
            }
        });
    }

    // 销毁实例
    destroy() {
        this.isDestroyed = true;
        this.stopSchedulers();
        this.templates = [];
        this.history = [];
        this.onCareMessageSent = null;
    }

    // 发送关怀消息
    sendCareMessage(type) {
        const templates = this.templates.filter(t => t.type === type);
        
        if (templates.length === 0) {
            return;
        }
        
        // 随机选择一个模板
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // 记录历史
        this.history.unshift({
            type: type,
            templateId: template.id,
            content: template.content,
            sentAt: new Date().toISOString()
        });
        
        // 保留最近100条记录
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        
        // 触发回调
        if (this.onCareMessageSent) {
            this.onCareMessageSent(template);
        }
    }

    // 设置关怀消息发送回调
    setOnCareMessageSent(callback) {
        this.onCareMessageSent = callback;
    }

    // 更新关怀时间
    updateCareTimes(times) {
        this.careTimes = { ...this.careTimes, ...times };
        this.startSchedulers();
    }

    // 添加自定义模板
    addTemplate(template) {
        const newTemplate = {
            id: Date.now(),
            ...template,
            isPreset: false
        };
        this.templates.push(newTemplate);
        return newTemplate;
    }

    // 删除自定义模板
    deleteTemplate(templateId) {
        const index = this.templates.findIndex(t => t.id === templateId);
        if (index !== -1 && !this.templates[index].isPreset) {
            this.templates.splice(index, 1);
            return true;
        }
        return false;
    }

    // 获取历史记录
    getHistory(limit = 20) {
        return this.history.slice(0, limit);
    }

    // 导出配置
    exportConfig() {
        return {
            templates: this.templates,
            careTimes: this.careTimes,
            history: this.history
        };
    }
}

// 导出关怀技能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CareSkill, DEFAULT_CARE_TEMPLATES };
}
