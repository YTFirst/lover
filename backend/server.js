const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const agentLoader = require('../Agent/agent-loader');
const security = require('./security-utils');
const { createLogger } = require('./logger');

const logger = createLogger('server');

const PORT = process.env.PORT || 5050;
const ALLOWED_ORIGINS = [
    'http://localhost:5050',
    'http://127.0.0.1:5050',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const LLM_ENDPOINTS = {
    zhipu: {
        hostname: 'open.bigmodel.cn',
        port: 443,
        path: '/api/paas/v4/chat/completions'
    },
    deepseek: {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/chat/completions'
    },
    qwen: {
        hostname: 'dashscope.aliyuncs.com',
        port: 443,
        path: '/compatible-mode/v1/chat/completions'
    },
    doubao: {
        hostname: 'ark.cn-beijing.volces.com',
        port: 443,
        path: '/api/v3/chat/completions'
    }
};

const COMPRESSIBLE_TYPES = new Set([
    'application/json',
    'text/html',
    'text/css',
    'application/javascript',
    'text/markdown',
    'text/plain',
    'application/xml',
    'text/xml',
    'image/svg+xml'
]);

const MIN_COMPRESS_SIZE = 1024;

function gzipResponse(res, body, contentType) {
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

    if (bodyBuffer.length < MIN_COMPRESS_SIZE) {
        res.writeHead(res.statusCode || 200, { 'Content-Type': contentType });
        res.end(bodyBuffer);
        return;
    }

    if (!COMPRESSIBLE_TYPES.has(contentType)) {
        res.writeHead(res.statusCode || 200, { 'Content-Type': contentType });
        res.end(bodyBuffer);
        return;
    }

    const acceptEncoding = res._acceptEncoding || '';

    if (!acceptEncoding.includes('gzip')) {
        res.writeHead(res.statusCode || 200, { 'Content-Type': contentType });
        res.end(bodyBuffer);
        return;
    }

    zlib.gzip(bodyBuffer, (err, compressed) => {
        if (err) {
            res.writeHead(res.statusCode || 200, { 'Content-Type': contentType });
            res.end(bodyBuffer);
            return;
        }
        res.writeHead(res.statusCode || 200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip',
            'Vary': 'Accept-Encoding'
        });
        res.end(compressed);
    });
}

const server = http.createServer((req, res) => {
    const origin = req.headers.origin;
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    res._acceptEncoding = req.headers['accept-encoding'] || '';

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    if (req.method === 'POST' && pathname === '/api/chat') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            handleChatRequest(req, res, body);
        });
    } else if (req.method === 'GET' && pathname === '/api/agents') {
        handleGetAgents(req, res);
    } else if (req.method === 'GET' && pathname.match(/^\/api\/agents\/[^/]+$/)) {
        const agentId = pathname.replace('/api/agents/', '');
        handleGetAgent(req, res, agentId);
    } else if (req.method === 'GET' && pathname.match(/^\/api\/agents\/[^/]+\/memory$/)) {
        const agentId = pathname.split('/')[3];
        handleGetAgentMemory(req, res, agentId);
    } else if (req.method === 'PUT' && pathname.match(/^\/api\/agents\/[^/]+\/memory$/)) {
        const agentId = pathname.split('/')[3];
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            handleUpdateAgentMemory(req, res, agentId, body);
        });
    } else if (req.method === 'GET' && pathname.match(/^\/api\/agents\/[^/]+\/style$/)) {
        const agentId = pathname.split('/')[3];
        handleGetAgentStyle(req, res, agentId);
    } else if (req.method === 'PUT' && pathname.match(/^\/api\/agents\/[^/]+\/style$/)) {
        const agentId = pathname.split('/')[3];
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            handleUpdateAgentStyle(req, res, agentId, body);
        });
    } else if (req.method === 'POST' && pathname === '/api/agents') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            handleCreateAgent(req, res, body);
        });
    } else if (req.method === 'PUT' && pathname.match(/^\/api\/agents\/[^/]+$/)) {
        const agentId = pathname.replace('/api/agents/', '');
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            handleUpdateAgent(req, res, agentId, body);
        });
    } else if (req.method === 'DELETE' && pathname.match(/^\/api\/agents\/[^/]+$/)) {
        const agentId = pathname.replace('/api/agents/', '');
        handleDeleteAgent(req, res, agentId);
    } else {
        serveStaticFile(req, res);
    }
});

async function handleChatRequest(req, res, body) {
    try {
        const data = JSON.parse(body);
        const { provider, modelId, messages, stream, temperature, maxTokens, apiKey } = data;

        if (!apiKey) {
            res.statusCode = 400;
            gzipResponse(res, JSON.stringify({ error: 'API Key is required' }), 'application/json');
            return;
        }

        const validProviders = ['zhipu', 'deepseek', 'qwen', 'doubao'];
        const targetProvider = validProviders.includes(provider) ? provider : 'qwen';

        if (!modelId || typeof modelId !== 'string') {
            res.statusCode = 400;
            gzipResponse(res, JSON.stringify({ error: 'Invalid model ID' }), 'application/json');
            return;
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            res.statusCode = 400;
            gzipResponse(res, JSON.stringify({ error: 'Messages must be a non-empty array' }), 'application/json');
            return;
        }

        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                res.statusCode = 400;
                gzipResponse(res, JSON.stringify({ error: 'Each message must have role and content' }), 'application/json');
                return;
            }

            const validation = security.validateInput(msg.content, 10000);
            if (!validation.valid) {
                res.statusCode = 400;
                gzipResponse(res, JSON.stringify({ error: `Invalid message content: ${validation.error}` }), 'application/json');
                return;
            }
        }

        const targetModelId = modelId;
        const targetApiKey = apiKey;

        const endpoint = LLM_ENDPOINTS[targetProvider] || LLM_ENDPOINTS.qwen;

        logger.info(`代理请求: ${targetProvider} ${targetModelId}`);

        const requestData = JSON.stringify({
            model: targetModelId,
            messages: messages,
            stream: stream !== false,
            temperature: Math.min(Math.max(temperature || 0.7, 0), 2),
            max_tokens: Math.min(maxTokens || 2000, 4000)
        });

        const options = {
            hostname: endpoint.hostname,
            port: endpoint.port,
            path: endpoint.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${targetApiKey}`
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            logger.info(`响应状态码: ${proxyRes.statusCode}`);

            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'application/json'
            });

            proxyRes.on('data', chunk => {
                res.write(chunk);
            });

            proxyRes.on('end', () => {
                res.end();
            });
        });

        proxyReq.on('error', (e) => {
            logger.error(`请求失败: ${e.message}`);
            res.statusCode = 500;
            gzipResponse(res, JSON.stringify({ error: e.message }), 'application/json');
        });

        proxyReq.write(requestData);
        proxyReq.end();

    } catch (error) {
        logger.error(`处理请求失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ error: error.message }), 'application/json');
    }
}

async function handleGetAgents(req, res) {
    try {
        const agents = await agentLoader.loadAllAgents();
        res.statusCode = 200;
        gzipResponse(res, JSON.stringify({ success: true, agents }), 'application/json');
    } catch (error) {
        logger.error(`获取智能体列表失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleGetAgent(req, res, agentId) {
    try {
        const agent = await agentLoader.loadAgent(agentId);
        if (!agent) {
            res.statusCode = 404;
            gzipResponse(res, JSON.stringify({ success: false, error: '智能体不存在' }), 'application/json');
            return;
        }
        res.statusCode = 200;
        gzipResponse(res, JSON.stringify({ success: true, agent }), 'application/json');
    } catch (error) {
        logger.error(`获取智能体失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleGetAgentMemory(req, res, agentId) {
    try {
        const memory = await agentLoader.loadAgentMemory(agentId);
        res.statusCode = 200;
        gzipResponse(res, JSON.stringify({ success: true, memory }), 'application/json');
    } catch (error) {
        logger.error(`获取记忆失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleUpdateAgentMemory(req, res, agentId, body) {
    try {
        const { memory } = JSON.parse(body);
        await agentLoader.saveAgentMemory(agentId, memory);
        logger.info(`记忆更新: ${agentId}`);
        res.statusCode = 200;
        gzipResponse(res, JSON.stringify({ success: true }), 'application/json');
    } catch (error) {
        logger.error(`更新记忆失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleGetAgentStyle(req, res, agentId) {
    try {
        const style = await agentLoader.loadAgentStyle(agentId);
        res.statusCode = 200;
        gzipResponse(res, JSON.stringify({ success: true, style }), 'application/json');
    } catch (error) {
        logger.error(`获取风格失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleUpdateAgentStyle(req, res, agentId, body) {
    try {
        const { style } = JSON.parse(body);
        await agentLoader.saveAgentStyle(agentId, style);
        logger.info(`风格更新: ${agentId}`);
        res.statusCode = 200;
        gzipResponse(res, JSON.stringify({ success: true }), 'application/json');
    } catch (error) {
        logger.error(`更新风格失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleCreateAgent(req, res, body) {
    try {
        const agentData = JSON.parse(body);

        if (!agentData.name) {
            res.statusCode = 400;
            gzipResponse(res, JSON.stringify({ success: false, error: '智能体名称不能为空' }), 'application/json');
            return;
        }

        agentData.id = agentLoader.generateAgentId(agentData.name);
        agentData.metadata = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: false,
            isLocked: false,
            version: '1.0.0',
            author: 'user'
        };

        await agentLoader.createAgentFolder(agentData.id, agentData.name);
        const success = await agentLoader.saveAgent(agentData);

        if (success) {
            logger.info(`创建成功: ${agentData.name}`);
            res.statusCode = 200;
            gzipResponse(res, JSON.stringify({ success: true, agent: agentData }), 'application/json');
        } else {
            res.statusCode = 500;
            gzipResponse(res, JSON.stringify({ success: false, error: '保存失败' }), 'application/json');
        }
    } catch (error) {
        logger.error(`创建智能体失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleUpdateAgent(req, res, agentId, body) {
    try {
        const existingAgent = await agentLoader.loadAgent(agentId);

        if (!existingAgent) {
            res.statusCode = 404;
            gzipResponse(res, JSON.stringify({ success: false, error: '智能体不存在' }), 'application/json');
            return;
        }

        const agentData = JSON.parse(body);
        agentData.id = agentId;
        agentData.metadata = {
            ...existingAgent.metadata,
            updatedAt: new Date().toISOString()
        };

        const success = await agentLoader.saveAgent(agentData);

        if (success) {
            logger.info(`更新成功: ${agentData.name}`);
            res.statusCode = 200;
            gzipResponse(res, JSON.stringify({ success: true, agent: agentData }), 'application/json');
        } else {
            res.statusCode = 500;
            gzipResponse(res, JSON.stringify({ success: false, error: '保存失败' }), 'application/json');
        }
    } catch (error) {
        logger.error(`更新智能体失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

async function handleDeleteAgent(req, res, agentId) {
    try {
        const result = await agentLoader.deleteAgent(agentId);

        if (result.success) {
            logger.info(`删除成功: ${agentId}`);
            res.statusCode = 200;
            gzipResponse(res, JSON.stringify({ success: true }), 'application/json');
        } else {
            res.statusCode = 400;
            gzipResponse(res, JSON.stringify({ success: false, error: result.message }), 'application/json');
        }
    } catch (error) {
        logger.error(`删除智能体失败: ${error.message}`);
        res.statusCode = 500;
        gzipResponse(res, JSON.stringify({ success: false, error: error.message }), 'application/json');
    }
}

function serveStaticFile(req, res) {
    const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    let filePath;

    if (urlPath.startsWith('/config/')) {
        filePath = path.join(__dirname, '../config', urlPath.replace('/config/', ''));
    } else if (urlPath.startsWith('/backend/')) {
        filePath = path.join(__dirname, urlPath.replace('/backend/', ''));
    } else if (urlPath.startsWith('/Agent/')) {
        filePath = path.join(__dirname, '../Agent', urlPath.replace('/Agent/', ''));
    } else {
        filePath = path.join(__dirname, '../frontend', urlPath);
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.md': 'text/markdown',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.statusCode = 404;
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            res.statusCode = 200;
            gzipResponse(res, content, contentType);
        }
    });
}

server.listen(PORT, () => {
    logger.info('电子女友代理服务器已启动！');
    logger.info(`本地地址: http://localhost:${PORT}`);
    logger.info('默认智能体: 小雅 (Agent/agents/xiaoya/)');
    logger.info('请确保 proxy-config.json 文件中的 API Key 正确');
});
