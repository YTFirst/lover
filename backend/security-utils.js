// ========================================
// 安全工具模块
// ========================================

const crypto = require('crypto');

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'egf-default-secret-key-2026';

function encrypt(text) {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(16);
        const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('加密失败:', error);
        return '';
    }
}

function decrypt(ciphertext) {
    if (!ciphertext) return '';
    try {
        const parts = ciphertext.split(':');
        if (parts.length !== 2) return '';
        
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('解密失败:', error);
        return '';
    }
}

function hash(text) {
    if (!text) return '';
    return crypto.createHash('sha256').update(text).digest('hex');
}

function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

function validateInput(input, maxLength = 1000) {
    if (!input || typeof input !== 'string') {
        return { valid: false, error: '输入不能为空' };
    }
    
    if (input.length > maxLength) {
        return { valid: false, error: `输入长度不能超过${maxLength}字符` };
    }
    
    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:/gi,
        /vbscript:/gi
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            return { valid: false, error: '输入包含危险内容' };
        }
    }
    
    return { valid: true, sanitized: sanitizeInput(input) };
}

function generateCSRFToken() {
    return generateToken(64);
}

function validateCSRFToken(token, sessionToken) {
    if (!token || !sessionToken) {
        return false;
    }
    return token === sessionToken;
}

function sanitizePath(path) {
    if (!path || typeof path !== 'string') {
        return '';
    }
    
    return path
        .replace(/\.\./g, '')
        .replace(/[<>:"|?*]/g, '')
        .replace(/\/+/g, '/')
        .replace(/\\+/g, '\\')
        .trim();
}

module.exports = {
    encrypt,
    decrypt,
    hash,
    generateToken,
    sanitizeInput,
    validateInput,
    generateCSRFToken,
    validateCSRFToken,
    sanitizePath
};
