const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, 'agents');

const agentCache = new Map();

function sanitizeAgentId(agentId) {
    if (!agentId || typeof agentId !== 'string') {
        return null;
    }

    const sanitized = agentId
        .replace(/\.\./g, '')
        .replace(/[<>:"|?*]/g, '')
        .replace(/\/+/g, '')
        .replace(/\\+/g, '')
        .trim();

    if (sanitized.length === 0 || sanitized.length > 100) {
        return null;
    }

    return sanitized;
}

async function pathExists(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function ensureDir(dirPath) {
    if (!(await pathExists(dirPath))) {
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
}

async function loadAgent(agentId) {
    const safeAgentId = sanitizeAgentId(agentId);
    if (!safeAgentId) {
        console.error(`无效的智能体ID: ${agentId}`);
        return null;
    }

    if (agentCache.has(safeAgentId)) {
        return agentCache.get(safeAgentId);
    }

    const agentDir = path.join(AGENTS_DIR, safeAgentId);
    const agentPath = path.join(agentDir, `${safeAgentId}.js`);

    const resolvedPath = path.resolve(agentPath);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agentId}`);
        return null;
    }

    if (!(await pathExists(agentPath))) {
        return null;
    }

    try {
        delete require.cache[require.resolve(agentPath)];
        const agent = require(agentPath);

        agent.memory = await loadAgentMemory(safeAgentId);
        agent.styleConfig = await loadAgentStyle(safeAgentId);

        agentCache.set(safeAgentId, agent);
        return agent;
    } catch (error) {
        console.error(`加载智能体失败 [${safeAgentId}]:`, error.message);
        return null;
    }
}

async function loadAgentMemory(agentId) {
    const safeAgentId = sanitizeAgentId(agentId);
    if (!safeAgentId) {
        return '';
    }

    const memoryPath = path.join(AGENTS_DIR, safeAgentId, 'memory.md');

    const resolvedPath = path.resolve(memoryPath);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agentId}`);
        return '';
    }

    if (!(await pathExists(memoryPath))) {
        return '';
    }

    try {
        return await fs.promises.readFile(memoryPath, 'utf8');
    } catch (error) {
        console.error(`加载记忆失败 [${safeAgentId}]:`, error.message);
        return '';
    }
}

async function loadAgentStyle(agentId) {
    const safeAgentId = sanitizeAgentId(agentId);
    if (!safeAgentId) {
        return null;
    }

    const stylePath = path.join(AGENTS_DIR, safeAgentId, 'style.js');

    const resolvedPath = path.resolve(stylePath);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agentId}`);
        return null;
    }

    if (!(await pathExists(stylePath))) {
        return null;
    }

    try {
        delete require.cache[require.resolve(stylePath)];
        return require(stylePath);
    } catch (error) {
        console.error(`加载风格失败 [${safeAgentId}]:`, error.message);
        return null;
    }
}

async function loadAllAgents() {
    const agents = [];

    if (!(await pathExists(AGENTS_DIR))) {
        await fs.promises.mkdir(AGENTS_DIR, { recursive: true });
        return agents;
    }

    const entries = await fs.promises.readdir(AGENTS_DIR, { withFileTypes: true });
    const dirs = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    for (const dir of dirs) {
        const agent = await loadAgent(dir);
        if (agent) {
            agents.push(agent);
        }
    }

    return agents;
}

async function saveAgent(agent) {
    if (!agent || !agent.id) {
        return false;
    }

    const safeAgentId = sanitizeAgentId(agent.id);
    if (!safeAgentId) {
        console.error(`无效的智能体ID: ${agent.id}`);
        return false;
    }

    const agentDir = path.join(AGENTS_DIR, safeAgentId);

    await ensureDir(agentDir);

    const agentPath = path.join(agentDir, `${safeAgentId}.js`);

    const resolvedPath = path.resolve(agentPath);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agent.id}`);
        return false;
    }

    const agentData = { ...agent };
    delete agentData.memory;
    delete agentData.styleConfig;

    const content = `// ========================================
// 智能体配置 - ${agent.name}
// ========================================

const agent = ${JSON.stringify(agentData, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = agent;
}
if (typeof window !== 'undefined') {
    window.agent = agent;
}
`;

    try {
        await fs.promises.writeFile(agentPath, content, 'utf8');
        agentCache.delete(safeAgentId);
        return true;
    } catch (error) {
        console.error(`保存智能体失败 [${safeAgentId}]:`, error.message);
        return false;
    }
}

async function saveAgentMemory(agentId, memory) {
    const safeAgentId = sanitizeAgentId(agentId);
    if (!safeAgentId) {
        console.error(`无效的智能体ID: ${agentId}`);
        return false;
    }

    const agentDir = path.join(AGENTS_DIR, safeAgentId);

    await ensureDir(agentDir);

    const memoryPath = path.join(agentDir, 'memory.md');

    const resolvedPath = path.resolve(memoryPath);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agentId}`);
        return false;
    }

    try {
        await fs.promises.writeFile(memoryPath, memory, 'utf8');
        agentCache.delete(safeAgentId);
        return true;
    } catch (error) {
        console.error(`保存记忆失败 [${safeAgentId}]:`, error.message);
        return false;
    }
}

async function saveAgentStyle(agentId, style) {
    const safeAgentId = sanitizeAgentId(agentId);
    if (!safeAgentId) {
        console.error(`无效的智能体ID: ${agentId}`);
        return false;
    }

    const agentDir = path.join(AGENTS_DIR, safeAgentId);

    await ensureDir(agentDir);

    const stylePath = path.join(agentDir, 'style.js');

    const resolvedPath = path.resolve(stylePath);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agentId}`);
        return false;
    }

    const content = `// ========================================
// 智能体风格配置 - ${safeAgentId}
// ========================================

const style = ${JSON.stringify(style, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = style;
}
if (typeof window !== 'undefined') {
    window.agentStyle = style;
}
`;

    try {
        await fs.promises.writeFile(stylePath, content, 'utf8');
        agentCache.delete(safeAgentId);
        return true;
    } catch (error) {
        console.error(`保存风格失败 [${safeAgentId}]:`, error.message);
        return false;
    }
}

async function deleteAgent(agentId) {
    const safeAgentId = sanitizeAgentId(agentId);
    if (!safeAgentId) {
        return { success: false, message: '无效的智能体ID' };
    }

    const agent = await loadAgent(safeAgentId);

    if (!agent) {
        return { success: false, message: '智能体不存在' };
    }

    if (agent.metadata && agent.metadata.isDefault) {
        return { success: false, message: '无法删除默认智能体' };
    }

    const agentDir = path.join(AGENTS_DIR, safeAgentId);

    const resolvedPath = path.resolve(agentDir);
    if (!resolvedPath.startsWith(path.resolve(AGENTS_DIR))) {
        console.error(`路径遍历攻击检测: ${agentId}`);
        return { success: false, message: '路径验证失败' };
    }

    if (await pathExists(agentDir)) {
        try {
            await fs.promises.rm(agentDir, { recursive: true, force: true });
            agentCache.delete(safeAgentId);
            return { success: true };
        } catch (error) {
            console.error(`删除智能体失败 [${safeAgentId}]:`, error.message);
            return { success: false, message: '删除失败' };
        }
    }

    return { success: false, message: '智能体文件夹不存在' };
}

async function agentExists(agentId) {
    const agentDir = path.join(AGENTS_DIR, agentId);
    return (await pathExists(agentDir)) && (await pathExists(path.join(agentDir, `${agentId}.js`)));
}

function generateAgentId(name) {
    const timestamp = Date.now();
    const safeName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').toLowerCase();
    return `${safeName}_${timestamp}`;
}

async function createAgentFolder(agentId, name) {
    const agentDir = path.join(AGENTS_DIR, agentId);

    await ensureDir(agentDir);

    const defaultMemory = `# ${name}的记忆

## 用户信息

- 用户名：
- 生日：
- 职业：
- 兴趣爱好：

## 用户偏好

- 喜欢的食物：
- 喜欢的颜色：
- 喜欢的活动：
- 不喜欢的事物：

## 重要事件

- 

## 对话摘要

- 

## 备注

- 
`;

    const defaultStyle = {
        id: 'custom',
        name: '自定义风格',
        description: '自定义回复风格',
        tone: '自然、友好',
        phrases: [],
        emoji: ['😊', '👍', '❤️'],
        greetings: {
            morning: '早安！',
            afternoon: '下午好！',
            evening: '晚上好！',
            night: '晚安！'
        },
        responses: {}
    };

    await fs.promises.writeFile(path.join(agentDir, 'memory.md'), defaultMemory, 'utf8');
    await saveAgentStyle(agentId, defaultStyle);

    return true;
}

function clearCache() {
    agentCache.clear();
}

module.exports = {
    loadAgent,
    loadAllAgents,
    loadAgentMemory,
    loadAgentStyle,
    saveAgent,
    saveAgentMemory,
    saveAgentStyle,
    deleteAgent,
    agentExists,
    generateAgentId,
    createAgentFolder,
    clearCache,
    AGENTS_DIR
};
