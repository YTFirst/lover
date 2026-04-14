// ========================================
// 角色图片配置
// ========================================

const CHARACTER_CONFIG = {
    characters: [
        {
            id: 'female_adventurer',
            name: '小雅',
            folder: 'female_adventurer',
            preview: 'assets/characters/female_adventurer/idle.png'
        },
        {
            id: 'male_adventurer',
            name: '小宇',
            folder: 'male_adventurer',
            preview: 'assets/characters/male_adventurer/idle.png'
        },
        {
            id: 'female_person',
            name: '小琳',
            folder: 'female_person',
            preview: 'assets/characters/female_person/idle.png'
        }
    ],
    emotions: ['idle', 'happy', 'sad', 'think', 'hug', 'wave', 'surprised', 'confused']
};

// 获取角色图片路径
function getCharacterImage(characterId, emotion) {
    const config = CHARACTER_CONFIG.characters.find(c => c.id === characterId);
    if (!config) return null;
    return `assets/characters/${config.folder}/${emotion}.png`;
}

// 获取所有情绪列表
function getEmotionList() {
    return CHARACTER_CONFIG.emotions;
}

// ========================================
// 像素小人自定义配置
// ========================================

const DEFAULT_CHARACTER_CONFIG = {
    id: 'default',
    name: '小雅',
    colors: {
        primary: '#FF6B9D',      // 主色（身体、头部）
        secondary: '#4ECDC4',    // 辅助色
        skin: '#FFB8D0',         // 皮肤色
        eye: '#FFFFFF',          // 眼睛颜色
        mouth: '#FFFFFF'         // 嘴巴颜色
    },
    sizes: {
        head: { width: 32, height: 32 },
        body: { width: 24, height: 30 },
        eye: { width: 4, height: 4 },
        mouth: { width: 8, height: 2 },
        arm: { width: 6, height: 20 },
        leg: { width: 6, height: 20 }
    },
    accessories: {
        hat: null,               // 帽子
        glasses: null,           // 眼镜
        blush: true,             // 腮红
        blushColor: '#FFB8D0'    // 腮红颜色
    }
};

// 预设角色配置
const PRESET_CHARACTERS = [
    {
        id: 'default',
        name: '小雅',
        colors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            skin: '#FFB8D0',
            eye: '#FFFFFF',
            mouth: '#FFFFFF'
        }
    },
    {
        id: 'blue',
        name: '小蓝',
        colors: {
            primary: '#4ECDC4',
            secondary: '#FF6B9D',
            skin: '#7EDDD6',
            eye: '#FFFFFF',
            mouth: '#FFFFFF'
        }
    },
    {
        id: 'purple',
        name: '小紫',
        colors: {
            primary: '#9F7AEA',
            secondary: '#F687B3',
            skin: '#D6BCFA',
            eye: '#FFFFFF',
            mouth: '#FFFFFF'
        }
    },
    {
        id: 'orange',
        name: '小橙',
        colors: {
            primary: '#F6AD55',
            secondary: '#FC8181',
            skin: '#FBD38D',
            eye: '#FFFFFF',
            mouth: '#FFFFFF'
        }
    }
];

// 应用角色配置
function applyCharacterConfig(config) {
    const root = document.documentElement;
    
    // 应用颜色
    if (config.colors) {
        root.style.setProperty('--character-primary', config.colors.primary);
        root.style.setProperty('--character-secondary', config.colors.secondary);
        root.style.setProperty('--character-skin', config.colors.skin);
        root.style.setProperty('--character-eye', config.colors.eye);
        root.style.setProperty('--character-mouth', config.colors.mouth);
    }
    
    // 保存配置
    localStorage.setItem('egfCharacterConfig', JSON.stringify(config));
}

// 加载角色配置
function loadCharacterConfig() {
    const saved = localStorage.getItem('egfCharacterConfig');
    if (saved) {
        return JSON.parse(saved);
    }
    return DEFAULT_CHARACTER_CONFIG;
}

// 获取预设角色列表
function getPresetCharacters() {
    return PRESET_CHARACTERS;
}

// 获取角色列表（用于角色选择界面）
function getCharacterList() {
    return CHARACTER_CONFIG.characters;
}

// 导出角色配置
function exportCharacterConfig(config) {
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `character-${config.name || 'custom'}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 导入角色配置
function importCharacterConfig(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                // 验证配置
                if (!config.colors || !config.colors.primary) {
                    throw new Error('无效的角色配置文件');
                }
                resolve(config);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file);
    });
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.CHARACTER_CONFIG = CHARACTER_CONFIG;
    window.DEFAULT_CHARACTER_CONFIG = DEFAULT_CHARACTER_CONFIG;
    window.PRESET_CHARACTERS = PRESET_CHARACTERS;
    window.getCharacterImage = getCharacterImage;
    window.getEmotionList = getEmotionList;
    window.applyCharacterConfig = applyCharacterConfig;
    window.loadCharacterConfig = loadCharacterConfig;
    window.getPresetCharacters = getPresetCharacters;
    window.getCharacterList = getCharacterList;
    window.exportCharacterConfig = exportCharacterConfig;
    window.importCharacterConfig = importCharacterConfig;
}
