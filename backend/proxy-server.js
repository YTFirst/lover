const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            console.log('[代理] 收到聊天请求');
            
            try {
                const { provider, model, apiKey, messages, stream } = JSON.parse(body);
                
                const configs = {
                    qwen: {
                        hostname: 'dashscope.aliyuncs.com',
                        path: '/compatible-mode/v1/chat/completions'
                    },
                    zhipu: {
                        hostname: 'open.bigmodel.cn',
                        path: '/api/paas/v4/chat/completions'
                    },
                    deepseek: {
                        hostname: 'api.deepseek.com',
                        path: '/chat/completions'
                    }
                };
                
                const config = configs[provider] || configs.qwen;
                
                const requestData = JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: stream || false,
                    temperature: 0.7,
                    max_tokens: 2000
                });
                
                const options = {
                    hostname: config.hostname,
                    port: 443,
                    path: config.path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Length': Buffer.byteLength(requestData)
                    }
                };
                
                console.log(`[转发] 转发请求到 ${provider}: ${model}`);
                
                const proxyReq = https.request(options, (proxyRes) => {
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
                    console.error('❌ 代理请求失败:', e.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                });
                
                proxyReq.write(requestData);
                proxyReq.end();
                
            } catch (error) {
                console.error('❌ 解析请求失败:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }
    
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json'
    };
    
    fs.readFile(path.join(__dirname, '../frontend', filePath), (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log('[启动] 电子女友代理服务器已启动！');
    console.log(`[地址] 本地地址: http://localhost:${PORT}`);
    console.log('[说明] 使用方法: 在原型中选择"通义千问"，并配置 API Key');
    console.log('[提示] 此代理仅用于开发测试，生产环境请直接调用 API');
});
