/**
 * Type definitions for Message
 * Chat message structure and types
 */

declare namespace App {
    interface Message {
        /** Unique identifier for the message */
        id: number;

        /** Message type/role */
        type: 'user' | 'ai';

        /** Message content (may contain action tags like [action:happy]) */
        content: string;

        /** Timestamp (ISO 8601) */
        timestamp: string;

        /** Action tag extracted from content (e.g., 'happy', 'wave') */
        action?: 'idle' | 'happy' | 'sad' | 'think' | 'hug' | 'wave' | 'surprised' | 'confused';

        /** ID of the agent that generated this message */
        agentId?: string;

        /** Name of the agent that generated this message */
        agentName?: string;
    }

    interface ChatModule {
        /**
         * Get a welcome message for the current agent
         * @returns Welcome message string with action tag
         */
        getWelcomeMessage(): string;

        /**
         * Add a welcome message to the current session
         */
        addWelcomeMessage(): void;

        /**
         * Send a user message
         */
        sendMessage(): void;

        /**
         * Generate an AI response for a user message
         * @param userMessage - The user's message content
         */
        generateAIResponse(userMessage: string): Promise<void>;

        /**
         * Stream a message with typing animation
         * @param message - Message to stream
         */
        streamMessage(message: Message): void;

        /**
         * Render the message list
         */
        renderMessageList(): void;

        /**
         * Create a message DOM element
         * @param message - Message object
         * @param isStreaming - Whether the message is currently streaming
         * @returns Message DOM element
         */
        createMessageElement(message: Message, isStreaming?: boolean): HTMLElement;

        /**
         * Create a load more indicator element
         * @returns Load more indicator DOM element
         */
        createLoadMoreIndicator(): HTMLElement;

        /**
         * Setup scroll listener for message list
         */
        setupMessageListScrollListener(): void;

        /**
         * Handle message list scroll events
         * @param event - Scroll event
         */
        handleMessageListScroll(event: Event): void;

        /**
         * Load more messages (pagination)
         */
        loadMoreMessages(): void;

        /**
         * Handle debug mode commands
         * @param command - Debug command string
         */
        handleDebugCommand(command: string): void;

        /**
         * Update UI for debug mode
         */
        updateDebugModeUI(): void;

        /**
         * Detect crisis keywords in a message
         * @param message - Message to check
         * @returns Whether crisis keywords were detected
         */
        detectCrisisKeywords(message: string): boolean;

        /**
         * Show crisis support modal
         */
        showCrisisModal(): void;

        /**
         * Close crisis support modal
         */
        closeCrisisModal(): void;

        /**
         * Set character animation
         * @param action - Action name
         */
        setCharacterAnimation(action: string): void;

        /**
         * Build message history for LLM API
         * @param userMessage - Current user message
         * @returns Message history object or null
         */
        buildMessageHistory(userMessage: string): { messages: LLMMessage[]; agent: Agent; agentId: string } | null;

        /**
         * Call LLM service
         * @param messages - Message array for LLM
         * @param useStream - Whether to use streaming
         * @returns Response promise
         */
        callLLMService(messages: LLMMessage[], useStream: boolean): Promise<Response>;

        /**
         * Handle streaming response
         * @param response - Fetch response
         * @param aiMessage - AI message object to update
         * @param messageElement - DOM element for the message
         */
        handleStreamResponse(response: Response, aiMessage: Message, messageElement: HTMLElement): Promise<void>;

        /**
         * Handle error responses
         * @param error - Error object
         */
        handleErrorResponse(error: Error): void;
    }

    interface LLMMessage {
        role: 'system' | 'user' | 'assistant';
        content: string;
    }

    interface ApiModule {
        /**
         * Make an API request
         * @param method - HTTP method
         * @param path - API path
         * @param data - Request data
         * @returns Response promise
         */
        request(method: string, path: string, data?: unknown): Promise<unknown>;

        /**
         * Make a streaming API request
         * @param path - API path
         * @param data - Request data
         * @param onChunk - Callback for each chunk
         * @param onDone - Callback when done
         * @param onError - Error callback
         */
        stream(
            path: string,
            data: unknown,
            onChunk: (chunk: unknown) => void,
            onDone: () => void,
            onError: (error: Error) => void
        ): void;
    }
}

declare const Chat: App.ChatModule;
declare const Api: App.ApiModule;
