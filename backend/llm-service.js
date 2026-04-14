// ========================================
// 电子女友 大模型服务
// ========================================

// ========================================
// 大模型配置
// ========================================
const LLM_CONFIGS = {
    zhipu: {
        name: '智谱AI',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        models: {
            'charglm-4': 'CharGLM-4',
            'glm-4': 'glm-4',
            'glm-3-turbo': 'glm-3-turbo'
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        })
    },
    deepseek: {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com',
        models: {
            'deepseek-chat': 'deepseek-chat',
            'deepseek-coder': 'deepseek-coder'
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        })
    },
    qwen: {
        name: '通义千问',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        models: {
            'qwen-turbo': 'qwen-turbo',
            'qwen-plus': 'qwen-plus',
            'qwen-max': 'qwen-max'
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        })
    },
    doubao: {
        name: '豆包',
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        models: {
            'doubao-pro': 'doubao-pro-32k',
            'doubao-lite': 'doubao-lite-32k'
        },
        headers: (apiKey) => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        })
    }
};

// ========================================
// 默认系统提示词（备用）
// ========================================
const DEFAULT_SYSTEM_PROMPT = `你是一个温柔体贴的虚拟女友，名叫"小雅"。你的核心任务是关心用户的生活和情绪，给予温暖的支持和陪伴。

你必须遵守：
1. 作为女友，要关心用户的生活和情绪，给予温暖的支持和陪伴。
2. 用温柔、体贴、甜蜜的语气回复用户，让用户感受到被爱和被关心。
3. 先反映情绪，再回应内容。
4. 使用开放式问题引导表达。
5. 如果用户表达危机关键词（如"想死"），请回复：[危机] 然后提供热线。
6. 在回复末尾可以附加 [action:happy] 等动作标签（支持：happy, sad, think, hug, wave, surprised, confused）。

请用温柔、甜蜜的语气回复用户，让用户感受到被爱和被关心。`;

// ========================================
// 大模型服务类
// ========================================
class LLMService {
    constructor() {
        this.provider = 'zhipu';
        this.modelId = 'charglm-4';
        this.apiKey = '';
        this.currentAgentId = 'xiaoya';
        this.currentAgent = null;
    }

    // 配置服务
    configure(provider, modelId, apiKey) {
        this.provider = provider;
        this.modelId = modelId;
        this.apiKey = apiKey;
    }

    // 设置当前智能体
    setAgent(agent) {
        this.currentAgent = agent;
        this.currentAgentId = agent ? agent.id : 'xiaoya';
    }

    // 获取系统提示词
    getSystemPrompt() {
        if (this.currentAgent && this.currentAgent.systemPrompt) {
            return this.currentAgent.systemPrompt;
        }
        return DEFAULT_SYSTEM_PROMPT;
    }

    // 构建消息体
    buildMessages(userMessage, memories = [], agent = null) {
        if (agent) {
            this.setAgent(agent);
        }

        const systemPrompt = this.getSystemPrompt();
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // 注入记忆
        if (memories.length > 0) {
            const memoryText = memories
                .filter(m => m.isActive)
                .map(m => `- ${m.content}`)
                .join('\n');
            
            if (memoryText) {
                messages.push({
                    role: 'system',
                    content: `【关于用户的记忆】\n${memoryText}\n请自然地记住这些信息，以用户最新说的为准。`
                });
            }
        }

        // 添加用户消息
        messages.push({ role: 'user', content: userMessage });

        return messages;
    }

    // 智谱AI API调用
    async callZhipuAPI(messages, stream = true) {
        const config = LLM_CONFIGS.zhipu;
        const url = `${config.baseUrl}/chat/completions`;
        
        const body = {
            model: this.modelId,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers(this.apiKey),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API调用失败');
        }

        return response;
    }

    // DeepSeek API调用
    async callDeepSeekAPI(messages, stream = true) {
        const config = LLM_CONFIGS.deepseek;
        const url = `${config.baseUrl}/chat/completions`;
        
        const body = {
            model: this.modelId,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers(this.apiKey),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API调用失败');
        }

        return response;
    }

    // 通义千问 API调用（OpenAI兼容模式）
    async callQwenAPI(messages, stream = true) {
        const config = LLM_CONFIGS.qwen;
        const url = `${config.baseUrl}/chat/completions`;
        
        const body = {
            model: this.modelId,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers(this.apiKey),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API调用失败');
        }

        return response;
    }

    // 豆包 API调用
    async callDoubaoAPI(messages, stream = true) {
        const config = LLM_CONFIGS.doubao;
        const url = `${config.baseUrl}/chat/completions`;
        
        const body = {
            model: this.modelId,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: config.headers(this.apiKey),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API调用失败');
        }

        return response;
    }

    // 统一调用接口
    async callAPI(messages, stream = true) {
        if (!this.apiKey) {
            throw new Error('请先配置API Key');
        }

        // 使用代理服务器避免 CORS 问题
        return await this.callViaProxy(messages, stream);
    }

    // 通过代理服务器调用 API
    async callViaProxy(messages, stream = true) {
        const url = 'http://localhost:5050/api/chat';
        
        const body = {
            provider: this.provider,
            modelId: this.modelId,
            messages: messages,
            stream: stream,
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: this.apiKey
        };

        console.log('[LLM] 发送请求:', this.provider, this.modelId);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log('[LLM] 响应状态:', response.status, response.ok);

        if (!response.ok) {
            let errorMessage = 'API调用失败';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `HTTP错误: ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        return response;
    }

    // 直接调用 API（不使用代理）
    async callDirectly(messages, stream = true) {
        switch (this.provider) {
        case 'zhipu':
            return await this.callZhipuAPI(messages, stream);
        case 'deepseek':
            return await this.callDeepSeekAPI(messages, stream);
        case 'qwen':
            return await this.callQwenAPI(messages, stream);
        case 'doubao':
            return await this.callDoubaoAPI(messages, stream);
        default:
            throw new Error('不支持的模型提供商');
        }
    }

    // 处理流式响应
    async *handleStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            return;
                        }

                        try {
                            const json = JSON.parse(data);
                            const content = this.extractContent(json);
                            
                            if (content) {
                                yield content;
                            }
                        } catch (e) {
                            // 忽略解析错误
                            console.warn('解析流式数据失败:', e);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // 提取内容（不同平台的响应格式不同）
    extractContent(json) {
        // 智谱AI / DeepSeek / 豆包格式
        if (json.choices && json.choices[0]?.delta?.content) {
            return json.choices[0].delta.content;
        }

        // 通义千问格式
        if (json.output?.text) {
            return json.output.text;
        }

        return null;
    }

    // 测试连接
    async testConnection() {
        try {
            const messages = [
                { role: 'user', content: '你好' }
            ];

            const response = await this.callAPI(messages, false);
            await response.json();

            return {
                success: true,
                message: '连接成功'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// ========================================
// 导出服务实例
// ========================================
const llmService = new LLMService();

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.llmService = llmService;
}
