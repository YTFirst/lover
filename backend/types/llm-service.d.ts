/**
 * Type definitions for LLMService
 * Large Language Model service for AI responses
 */

/**
 * LLM Provider configuration
 */
interface LLMProviderConfig {
    name: string;
    baseUrl: string;
    models: Record<string, string>;
    headers: (apiKey: string) => Record<string, string>;
}

/**
 * LLM Configuration map
 */
interface LLMConfigs {
    zhipu: LLMProviderConfig;
    deepseek: LLMProviderConfig;
    qwen: LLMProviderConfig;
    doubao: LLMProviderConfig;
}

/**
 * LLM Message format
 */
interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * LLM API Response format
 */
interface LLMResponse {
    id?: string;
    choices?: Array<{
        delta?: {
            content?: string;
        };
        message?: {
            content?: string;
        };
    }>;
    output?: {
        text?: string;
    };
}

/**
 * LLM API Call options
 */
interface LLMCallOptions {
    model: string;
    messages: LLMMessage[];
    stream?: boolean;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
}

/**
 * Connection test result
 */
interface ConnectionTestResult {
    success: boolean;
    message: string;
}

/**
 * LLM Service class
 */
declare class LLMService {
    /** Current provider name */
    provider: 'zhipu' | 'deepseek' | 'qwen' | 'doubao';

    /** Current model ID */
    modelId: string;

    /** API key for authentication */
    apiKey: string;

    /** Current agent ID */
    currentAgentId: string;

    /** Current agent object */
    currentAgent: AgentConfig | null;

    /**
     * Configure the LLM service
     * @param provider - Provider name
     * @param modelId - Model identifier
     * @param apiKey - API key
     */
    configure(provider: string, modelId: string, apiKey: string): void;

    /**
     * Set the current agent
     * @param agent - Agent configuration
     */
    setAgent(agent: AgentConfig | null): void;

    /**
     * Get the system prompt for the current agent
     * @returns System prompt string
     */
    getSystemPrompt(): string;

    /**
     * Build messages array for LLM API
     * @param userMessage - User's message
     * @param memories - Agent memories
     * @param agent - Agent configuration (optional)
     * @returns Array of LLM messages
     */
    buildMessages(
        userMessage: string,
        memories?: MemoryItem[],
        agent?: AgentConfig | null
    ): LLMMessage[];

    /**
     * Call Zhipu AI API
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callZhipuAPI(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Call DeepSeek API
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callDeepSeekAPI(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Call Qwen (Tongyi Qianwen) API
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callQwenAPI(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Call Doubao API
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callDoubaoAPI(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Unified API call interface
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callAPI(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Call API via proxy server
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callViaProxy(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Call API directly (without proxy)
     * @param messages - Message array
     * @param stream - Whether to use streaming
     * @returns Fetch response
     */
    callDirectly(messages: LLMMessage[], stream?: boolean): Promise<Response>;

    /**
     * Handle streaming response
     * @param response - Fetch response
     * @returns Async generator of content chunks
     */
    handleStreamResponse(response: Response): AsyncGenerator<string>;

    /**
     * Extract content from LLM response JSON
     * @param json - Response JSON object
     * @returns Content string or null
     */
    extractContent(json: LLMResponse): string | null;

    /**
     * Test API connection
     * @returns Connection test result
     */
    testConnection(): Promise<ConnectionTestResult>;
}

/**
 * Agent configuration for LLM service
 */
interface AgentConfig {
    id: string;
    name: string;
    personality: string;
    habits?: string;
    style?: string;
    systemPrompt?: string;
    memories?: MemoryItem[];
    [key: string]: unknown;
}

/**
 * Memory item for LLM context
 */
interface MemoryItem {
    id: number;
    content: string;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export {
    LLMService,
    LLMProviderConfig,
    LLMConfigs,
    LLMMessage,
    LLMResponse,
    LLMCallOptions,
    ConnectionTestResult,
    AgentConfig,
    MemoryItem
};
