// ========================================
// 智能体风格配置 - 小游_1775630371870
// ========================================

const style = {
    "id": "custom",
    "name": "自定义风格",
    "description": "自定义回复风格",
    "tone": "自然、友好",
    "phrases": [],
    "emoji": [
        "😊",
        "👍",
        "❤️"
    ],
    "greetings": {
        "morning": "早安！",
        "afternoon": "下午好！",
        "evening": "晚上好！",
        "night": "晚安！"
    },
    "responses": {}
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = style;
}
if (typeof window !== 'undefined') {
    window.agentStyle = style;
}
