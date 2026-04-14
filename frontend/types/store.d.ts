/**
 * Type definitions for App.Store
 * State management module for the Electronic Girlfriend application
 */

declare namespace App {
    interface Store {
        /**
         * Initialize the store with initial state and persistence keys
         * @param initialState - Initial state object
         * @param persistKeys - Array of keys to persist to localStorage
         */
        init(initialState: Record<string, unknown>, persistKeys?: string[]): void;

        /**
         * Get a copy of the state value for a given key
         * @param key - State key (optional, returns entire state if omitted)
         * @returns Deep clone of the state value
         */
        getState<T = unknown>(key?: string): T | undefined;

        /**
         * Get a reference to the state value (not a copy)
         * @param key - State key
         * @returns Direct reference to the state value
         */
        getRef<T = unknown>(key: string): T | undefined;

        /**
         * Set a new value for a state key
         * @param key - State key
         * @param value - New value to set
         */
        setState<T>(key: string, value: T): void;

        /**
         * Update state using an updater function
         * @param key - State key
         * @param updater - Function that receives current value and returns new value
         */
        updateState<T>(key: string, updater: (current: T | undefined) => T): void;

        /**
         * Subscribe to state changes for a specific key
         * @param key - State key or '*' for all changes
         * @param callback - Callback function called on state change
         * @returns Unsubscribe function
         */
        subscribe(
            key: string,
            callback: (newValue: unknown, oldValue: unknown, stateKey: string) => void
        ): () => void;

        /**
         * Unsubscribe from state changes
         * @param key - State key
         * @param callback - Optional specific callback to remove (removes all if omitted)
         */
        unsubscribe(key: string, callback?: (newValue: unknown, oldValue: unknown, stateKey: string) => void): void;

        /**
         * Enable or disable debug mode
         * @param enabled - Whether to enable debug mode
         */
        setDebug(enabled: boolean): void;

        /**
         * Get the list of persisted keys
         * @returns Array of persisted key names
         */
        getPersistKeys(): string[];
    }

    interface AppState {
        agents: Agent[];
        sessions: Session[];
        messages: Message[];
        memories: Memory[];
        ratings: Rating[];
        currentAgentId: string;
        currentSessionId: string;
        messagePage: number;
        hasMoreMessages: boolean;
        isLoadingMore: boolean;
        scrollPosition: number;
        lastSendTime: number;
        isDebugMode: boolean;
        editingAgentId: string | null;
        apiKey: string;
        settings: Settings;
    }

    interface Settings {
        modelProvider: 'zhipu' | 'deepseek' | 'qwen' | 'doubao';
        modelId: string;
        apiKey: string;
        theme?: 'light' | 'dark';
        language?: string;
    }

    interface Rating {
        messageId: number;
        type: 'positive' | 'negative';
        timestamp: string;
    }
}

declare const Store: App.Store;
