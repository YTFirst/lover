// 角色配置 - 图片版
const CHARACTER_CONFIG = {
    characters: [
        {
            id: 'female_adventurer',
            name: '女性冒险家',
            folder: 'female_adventurer',
            preview: 'assets/characters/female_adventurer/idle.png'
        },
        {
            id: 'male_adventurer',
            name: '男性冒险家',
            folder: 'male_adventurer',
            preview: 'assets/characters/male_adventurer/idle.png'
        },
        {
            id: 'female_person',
            name: '女性角色',
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

// 获取所有角色列表
function getCharacterList() {
    return CHARACTER_CONFIG.characters;
}

// 获取所有情绪列表
function getEmotionList() {
    return CHARACTER_CONFIG.emotions;
}
