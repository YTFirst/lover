/**
 * Backend Type Definitions Index
 * Export all type definitions for the Electronic Girlfriend backend
 */

export * from './llm-service';
export * from './agent-loader';

// Backend server types
declare namespace Backend {
    interface ServerConfig {
        port: number;
        host: string;
    }

    interface APIResponse<T = unknown> {
        success: boolean;
        data?: T;
        error?: string;
        message?: string;
    }

    interface ChatRequest {
        provider: string;
        modelId: string;
        messages: LLMMessage[];
        stream: boolean;
        temperature?: number;
        maxTokens?: number;
        apiKey: string;
    }

    interface AgentAPIResponse {
        success: boolean;
        agents?: AgentConfig[];
        agent?: AgentConfig;
        error?: string;
    }

    interface ProxyConfig {
        enabled: boolean;
        host?: string;
        port?: number;
    }
}

// Node.js module augmentations
declare module 'fs' {
    interface ObjectEncodingOptions {
        encoding: BufferEncoding | null;
    }
}

declare module 'path' {
    interface ParsedPath {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    }
}

export {};
