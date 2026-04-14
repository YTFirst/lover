/**
 * Frontend Type Definitions Index
 * Export all type definitions for the Electronic Girlfriend application
 */

export * from './store';
export * from './agent';
export * from './session';
export * from './message';

// Global App namespace declaration
declare global {
    interface Window {
        App: {
            Store: App.Store;
            Agent: App.AgentModule;
            Session: App.SessionModule;
            Chat: App.ChatModule;
            Api: App.ApiModule;
            UI: App.UIModule;
            Storage: App.StorageModule;
            Constants: App.ConstantsModule;
            Storage: App.StorageModule;
        };
        llmService: LLMService;
    }
}

// Additional module declarations
declare namespace App {
    interface UIModule {
        showToast(message: string): void;
        formatTime(timestamp: string): string;
        throttle<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T;
    }

    interface StorageModule {
        save(): void;
        load(): void;
        clear(): void;
    }

    interface ConstantsModule {
        MESSAGES_PER_PAGE: number;
        API_TIMEOUT: number;
        STREAM_TIMEOUT: number;
        SCROLL_THROTTLE: number;
        CRISIS_KEYWORDS: string[];
        STYLE_NAMES: Record<string, string>;
    }
}

// LLMService type for frontend usage
interface LLMService {
    provider: string;
    modelId: string;
    apiKey: string;
    currentAgentId: string;
    currentAgent: App.Agent | null;

    configure(provider: string, modelId: string, apiKey: string): void;
    setAgent(agent: App.Agent | null): void;
    getSystemPrompt(): string;
    buildMessages(userMessage: string, memories?: App.Memory[], agent?: App.Agent | null): App.LLMMessage[];
    callAPI(messages: App.LLMMessage[], stream?: boolean): Promise<Response>;
    handleStreamResponse(response: Response): AsyncGenerator<string>;
    testConnection(): Promise<{ success: boolean; message: string }>;
}

export {};
