// ========================================
// 前端安全工具
// ========================================

const SecurityUtils = {
    SECRET_KEY: 'egf-client-secret-2026',
    
    encrypt: function(text) {
        if (!text) return '';
        try {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
                result += String.fromCharCode(charCode);
            }
            return btoa(result);
        } catch (error) {
            console.error('加密失败:', error);
            return '';
        }
    },
    
    decrypt: function(ciphertext) {
        if (!ciphertext) return '';
        try {
            const decoded = atob(ciphertext);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch (error) {
            console.error('解密失败:', error);
            return '';
        }
    },
    
    hash: function(text) {
        if (!text) return '';
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    },
    
    generateToken: function(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        const cryptoArray = new Uint8Array(length);
        window.crypto.getRandomValues(cryptoArray);
        for (let i = 0; i < length; i++) {
            token += chars[cryptoArray[i] % chars.length];
        }
        return token;
    },
    
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },
    
    validateInput: function(input, maxLength = 1000) {
        if (!input || typeof input !== 'string') {
            return { valid: false, error: '输入不能为空' };
        }
        
        if (input.length > maxLength) {
            return { valid: false, error: `输入长度不能超过${maxLength}字符` };
        }
        
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(input)) {
                return { valid: false, error: '输入包含危险内容' };
            }
        }
        
        return { valid: true, sanitized: this.sanitizeInput(input) };
    },
    
    saveSecureItem: function(key, value) {
        try {
            const encrypted = this.encrypt(value);
            localStorage.setItem(key, encrypted);
            return true;
        } catch (error) {
            console.error('安全存储失败:', error);
            return false;
        }
    },
    
    getSecureItem: function(key) {
        try {
            const encrypted = localStorage.getItem(key);
            return encrypted ? this.decrypt(encrypted) : '';
        } catch (error) {
            console.error('安全读取失败:', error);
            return '';
        }
    },
    
    removeSecureItem: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除失败:', error);
            return false;
        }
    }
};

if (typeof window !== 'undefined') {
    window.SecurityUtils = SecurityUtils;
}
