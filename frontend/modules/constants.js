(function(global) {
    'use strict';

    var Constants = {
        MESSAGES_PER_PAGE: 20,
        APP_VERSION: '1.0.0',
        VERSION_CHECK_URL: 'https://api.listenclaw.com/version',

        CRISIS_KEYWORDS: [
            '想死', '不想活了', '自杀', '割腕',
            '跳楼', '结束自己', '活着没意思',
            '不想存在', '想结束生命', '杀了我', '去死'
        ],

        AI_RESPONSES: {
            greeting: [
                { text: '你好呀！今天感觉怎么样？[action:wave]', action: 'wave' },
                { text: '嗨！很高兴见到你～[action:happy]', action: 'happy' }
            ],
            mood_bad: [
                { text: '听起来你今天过得不太容易呢。想跟我说说发生了什么吗？[action:sad]', action: 'sad' },
                { text: '我能感受到你的心情不太好。记住，无论发生什么，我都会在这里陪着你。[action:hug]', action: 'hug' }
            ],
            mood_good: [
                { text: '太好了！看到你开心我也很开心！[action:happy]', action: 'happy' },
                { text: '真棒！继续保持这种好心情哦～[action:wave]', action: 'wave' }
            ],
            tired: [
                { text: '辛苦了！记得要好好休息，照顾好自己。[action:sad]', action: 'sad' },
                { text: '听起来你需要放松一下。要不要聊聊让你放松的事情？[action:think]', action: 'think' }
            ],
            confused: [
                { text: '嗯...这个问题有点复杂呢。让我想想...[action:think]', action: 'think' },
                { text: '我也有些困惑呢...[action:confused]', action: 'confused' }
            ],
            default: [
                { text: '我明白了。谢谢你愿意跟我分享这些。[action:wave]', action: 'wave' },
                { text: '嗯嗯，我在听呢。继续说吧～[action:idle]', action: 'idle' },
                { text: '原来是这样啊。[action:think]', action: 'think' }
            ]
        },

        PLATFORMS: [
            {
                id: 'zhipu',
                name: '智谱AI (CharGLM-4)',
                logo: '[AI]',
                quota: '免费额度: 100万tokens/月',
                tags: ['推荐', '中文优化', '快速响应'],
                registerUrl: 'https://open.bigmodel.cn/',
                steps: [
                    { title: '步骤1: 注册账号', content: ['访问智谱AI官网: https://open.bigmodel.cn/', '点击右上角"注册"按钮', '使用手机号或邮箱完成注册', '验证手机号/邮箱'] },
                    { title: '步骤2: 创建API Key', content: ['登录后进入"API管理"页面', '点击"创建新的API Key"按钮', '为API Key命名（如: ListenClaw）', '点击确认创建'] },
                    { title: '步骤3: 复制API Key', content: ['创建成功后会显示API Key', '点击复制按钮复制Key', '注意: Key只显示一次，请妥善保存', '将Key粘贴到电子女友的设置页面'] }
                ]
            },
            {
                id: 'deepseek',
                name: 'DeepSeek',
                logo: '[搜索]',
                quota: '免费额度: 50万tokens/月',
                tags: ['中文优化', '性价比高'],
                registerUrl: 'https://platform.deepseek.com/',
                steps: [
                    { title: '步骤1: 注册账号', content: ['访问DeepSeek官网: https://platform.deepseek.com/', '点击"注册"按钮', '使用手机号完成注册', '验证手机号'] },
                    { title: '步骤2: 创建API Key', content: ['登录后进入"API Keys"页面', '点击"创建新密钥"按钮', '为密钥命名', '点击确认创建'] },
                    { title: '步骤3: 复制API Key', content: ['创建成功后复制显示的API Key', '将Key粘贴到电子女友的设置页面', '开始使用吧！'] }
                ]
            },
            {
                id: 'qwen',
                name: '通义千问',
                logo: '[对话]',
                quota: '免费额度: 100万tokens/月',
                tags: ['阿里云', '稳定可靠'],
                registerUrl: 'https://dashscope.console.aliyun.com/',
                steps: [
                    { title: '步骤1: 开通服务', content: ['访问阿里云控制台: https://dashscope.console.aliyun.com/', '使用阿里云账号登录', '开通"模型服务灵积"服务', '完成实名认证'] },
                    { title: '步骤2: 创建API Key', content: ['进入"API-KEY管理"页面', '点击"创建新的API-KEY"', '填写相关信息', '确认创建'] },
                    { title: '步骤3: 复制API Key', content: ['复制生成的API-KEY', '将Key粘贴到电子女友的设置页面', '选择对应的模型即可使用'] }
                ]
            },
            {
                id: 'doubao',
                name: '豆包',
                logo: '🫛',
                quota: '免费额度: 80万tokens/月',
                tags: ['字节跳动', '年轻化'],
                registerUrl: 'https://www.volcengine.com/',
                steps: [
                    { title: '步骤1: 注册账号', content: ['访问火山引擎官网: https://www.volcengine.com/', '点击"注册"按钮', '使用手机号完成注册', '完成实名认证'] },
                    { title: '步骤2: 开通服务', content: ['进入"豆包大模型"产品页', '点击"立即使用"', '开通相关服务', '创建接入点'] },
                    { title: '步骤3: 获取API Key', content: ['在"API访问凭证"页面', '复制API Key', '将Key粘贴到电子女友的设置页面', '开始体验吧！'] }
                ]
            }
        ],

        MODEL_CONFIGS: {
            zhipu: [
                { id: 'charglm-4', name: 'CharGLM-4 (推荐)' },
                { id: 'glm-4', name: 'GLM-4' },
                { id: 'glm-3-turbo', name: 'GLM-3-Turbo' }
            ],
            deepseek: [
                { id: 'deepseek-chat', name: 'DeepSeek Chat' },
                { id: 'deepseek-coder', name: 'DeepSeek Coder' }
            ],
            qwen: [
                { id: 'qwen-turbo', name: '通义千问-Turbo' },
                { id: 'qwen-plus', name: '通义千问-Plus' },
                { id: 'qwen-max', name: '通义千问-Max' }
            ],
            doubao: [
                { id: 'doubao-pro', name: '豆包-Pro' },
                { id: 'doubao-lite', name: '豆包-Lite' }
            ]
        },

        GUIDE_STEPS: [
            {
                title: '开始对话',
                icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
                description: '在聊天框中输入消息，开始与你的专属伙伴对话',
                target: '.chat-input-area'
            },
            {
                title: '切换智能体',
                icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
                description: '点击顶部的智能体名称，可以切换不同的对话伙伴',
                target: '.agent-name'
            },
            {
                title: '管理记忆',
                icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>',
                description: '在记忆页面添加重要信息，让伙伴记住你的喜好',
                target: '.nav-item[data-page="memory"]'
            },
            {
                title: '个性设置',
                icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
                description: '在设置页面配置API密钥和个性化选项',
                target: '.nav-item[data-page="settings"]'
            }
        ],

        DEFAULT_THEME_CONFIG: {
            primaryColor: '#FF6B9D',
            fontSize: 16,
            darkMode: false,
            backgroundImage: '',
            customCSS: ''
        },

        PRESET_THEMES: [
            { id: 'pink', name: '粉色甜心', primaryColor: '#FF6B9D', icon: '💗' },
            { id: 'blue', name: '蓝色梦幻', primaryColor: '#4A90D9', icon: '💙' },
            { id: 'green', name: '绿色清新', primaryColor: '#48BB78', icon: '💚' },
            { id: 'purple', name: '紫色浪漫', primaryColor: '#9F7AEA', icon: '💜' },
            { id: 'orange', name: '橙色活力', primaryColor: '#ED8936', icon: '🧡' },
            { id: 'red', name: '红色热情', primaryColor: '#F56565', icon: '❤️' },
            { id: 'dark', name: '暗夜模式', primaryColor: '#A0AEC0', icon: '🌙', darkMode: true }
        ],

        DEFAULT_CARE_TEMPLATES: [
            { id: 1, name: '早安问候', message: '早上好呀！新的一天开始了，记得吃早餐哦～', time: '08:00', type: 'daily', enabled: true },
            { id: 2, name: '午间关怀', message: '中午啦！记得按时吃饭，不要饿着自己哦～', time: '12:00', type: 'daily', enabled: true },
            { id: 3, name: '晚间提醒', message: '晚上好！今天辛苦了，早点休息哦～', time: '21:00', type: 'daily', enabled: true },
            { id: 4, name: '睡前晚安', message: '该睡觉啦！晚安，做个好梦～', time: '23:00', type: 'daily', enabled: false }
        ],

        EMOTION_KEYWORDS: {
            positive: [
                '开心', '高兴', '快乐', '幸福', '愉快', '欣喜', '兴奋', '满足',
                '喜欢', '爱', '感谢', '感激', '温暖', '甜蜜', '美好', '精彩',
                '棒', '好', '赞', '优秀', '成功', '胜利', '希望', '期待',
                '轻松', '舒适', '安心', '放心', '踏实', '自信', '骄傲', '自豪',
                '哈哈', '嘻嘻', '呵呵', '耶', '太好了', '真好', '不错', '挺好'
            ],
            negative: [
                '难过', '伤心', '痛苦', '悲伤', '郁闷', '沮丧', '失落', '绝望',
                '焦虑', '担心', '害怕', '恐惧', '紧张', '不安', '烦躁', '愤怒',
                '生气', '讨厌', '厌恶', '失望', '无奈', '疲惫', '累', '困',
                '孤独', '寂寞', '空虚', '迷茫', '困惑', '纠结', '矛盾', '挣扎',
                '糟糕', '差劲', '失败', '挫折', '打击', '压力', '负担', '沉重',
                '想哭', '哭', '泪', '唉', '烦', '郁闷', '崩溃', '受不了'
            ],
            neutral: [
                '今天', '昨天', '明天', '工作', '学习', '生活', '时间', '事情',
                '觉得', '认为', '知道', '了解', '明白', '清楚', '想', '要',
                '需要', '应该', '可以', '可能', '也许', '大概', '或者', '但是'
            ]
        },

        REMINDER_PATTERNS: [
            { regex: /记得\s*(\d{1,2})[点时](\d{0,2})?\s*(提醒我|叫我|告诉我)?\s*(.+)/i, type: 'once' },
            { regex: /(\d{1,2})[点时](\d{0,2})?\s*提醒我\s*(.+)/i, type: 'once' },
            { regex: /每天\s*(\d{1,2})[点时](\d{0,2})?\s*(提醒我|叫我)?\s*(.+)/i, type: 'daily' },
            { regex: /每天\s*(早上|上午|中午|下午|晚上|睡前)\s*(提醒我|叫我)?\s*(.+)/i, type: 'daily_period' },
            { regex: /每周[一二三四五六日天]\s*(\d{1,2})[点时]?\s*(提醒我|叫我)?\s*(.+)/i, type: 'weekly' }
        ],

        TIME_PERIODS: {
            '早上': 8, '上午': 10, '中午': 12, '下午': 15, '晚上': 19, '睡前': 22
        },

        STYLE_NAMES: {
            warm: '温暖关怀',
            professional: '专业理性',
            casual: '轻松随意',
            literary: '文艺诗意'
        },

        API_TIMEOUT: 30000,
        STREAM_TIMEOUT: 120000,
        MAX_RETRY: 2,
        RETRY_DELAY: 1000,
        SCROLL_THROTTLE: 100,
        VISIBLE_BUFFER: 10,
        MAX_VISIBLE_MESSAGES: 30
    };

    global.App = global.App || {};
    global.App.Constants = Constants;

})(window);
