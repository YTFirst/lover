// 角色配置 - 图片版
const CHARACTER_CONFIG = {
    characters: [
        {
            id: 'female_adventurer',
            name: '女性冒险家',
            folder: 'female_adventurer',
            preview: 'assets/characters/female_adventurer/idle.png',
            previewWebP: 'assets/characters/female_adventurer/idle.webp'
        },
        {
            id: 'male_adventurer',
            name: '男性冒险家',
            folder: 'male_adventurer',
            preview: 'assets/characters/male_adventurer/idle.png',
            previewWebP: 'assets/characters/male_adventurer/idle.webp'
        },
        {
            id: 'female_person',
            name: '女性角色',
            folder: 'female_person',
            preview: 'assets/characters/female_person/idle.png',
            previewWebP: 'assets/characters/female_person/idle.webp'
        }
    ],
    emotions: ['idle', 'happy', 'sad', 'think', 'hug', 'wave', 'surprised', 'confused']
};

// WebP support detection cache
let webpSupported = null;

/**
 * Check if the browser supports WebP format
 * @returns {Promise<boolean>} True if WebP is supported
 */
async function checkWebPSupport() {
    if (webpSupported !== null) {
        return webpSupported;
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            webpSupported = (img.width > 0 && img.height > 0);
            resolve(webpSupported);
        };
        img.onerror = function() {
            webpSupported = false;
            resolve(false);
        };
        // Use a small WebP image data URL for testing
        img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
}

/**
 * Synchronous WebP support check (uses cached result)
 * @returns {boolean} True if WebP is supported (or unknown)
 */
function isWebPSupported() {
    // If not checked yet, assume supported (optimistic approach)
    // The async check will update this later
    if (webpSupported === null) {
        checkWebPSupport(); // Start async check
        return true; // Optimistic default
    }
    return webpSupported;
}

// Initialize WebP support check
checkWebPSupport();

/**
 * Get character image path with WebP support
 * @param {string} characterId - Character identifier
 * @param {string} emotion - Emotion type
 * @returns {string} Image path (WebP if supported, PNG otherwise)
 */
// eslint-disable-next-line no-unused-vars
function getCharacterImage(characterId, emotion) {
    const config = CHARACTER_CONFIG.characters.find(c => c.id === characterId);
    if (!config) return null;

    const basePath = `assets/characters/${config.folder}/${emotion}`;

    // Return WebP if supported, PNG as fallback
    return isWebPSupported() ? `${basePath}.webp` : `${basePath}.png`;
}

/**
 * Get character preview image path with WebP support
 * @param {string} characterId - Character identifier
 * @returns {string} Preview image path (WebP if supported, PNG otherwise)
 */
// eslint-disable-next-line no-unused-vars
function getCharacterPreview(characterId) {
    const config = CHARACTER_CONFIG.characters.find(c => c.id === characterId);
    if (!config) return null;

    return isWebPSupported() ? config.previewWebP : config.preview;
}

// 获取所有角色列表
// eslint-disable-next-line no-unused-vars
function getCharacterList() {
    return CHARACTER_CONFIG.characters;
}

// 获取所有情绪列表
// eslint-disable-next-line no-unused-vars
function getEmotionList() {
    return CHARACTER_CONFIG.emotions;
}
