/**
 * Type definitions for Session
 * Conversation session management
 */

declare namespace App {
    interface Session {
        /** Unique identifier for the session */
        id: string;

        /** Display name of the session */
        name: string;

        /** ID of the agent associated with this session */
        agentId: string;

        /** Messages in this session */
        messages: Message[];

        /** Creation timestamp (ISO 8601) */
        createdAt: string;

        /** Last update timestamp (ISO 8601) */
        updatedAt: string;
    }

    interface SessionModule {
        /**
         * Initialize sessions, create default if none exist
         */
        initSessions(): void;

        /**
         * Create a new session
         * @param name - Optional session name
         * @param agentId - Optional agent ID to associate
         * @returns The newly created session
         */
        createNewSession(name?: string | null, agentId?: string): Session;

        /**
         * Load the current session into state
         */
        loadCurrentSession(): void;

        /**
         * Switch to a different session
         * @param sessionId - ID of the session to switch to
         */
        switchSession(sessionId: string): void;

        /**
         * Save the current session state
         */
        saveCurrentSession(): void;

        /**
         * Delete a session
         * @param sessionId - ID of the session to delete
         */
        deleteSession(sessionId: string): void;

        /**
         * Rename a session
         * @param sessionId - ID of the session to rename
         * @param newName - New name for the session
         */
        renameSession(sessionId: string, newName: string): void;

        /**
         * Render the session list in the sidebar
         */
        renderSessionList(): void;

        /**
         * Show dialog to rename a session
         * @param sessionId - ID of the session to rename
         */
        showRenameSessionDialog(sessionId: string): void;

        /**
         * Toggle the session sidebar visibility
         */
        toggleSessionSidebar(): void;

        /**
         * Close the session sidebar
         */
        closeSessionSidebar(): void;

        /**
         * Handle create new session button click
         */
        handleCreateNewSession(): void;

        /**
         * Show agent selector for creating a new session
         */
        showAgentSelectorForNewSession(): void;

        /**
         * Create a new session with a specific agent
         * @param agentId - ID of the agent for the new session
         */
        createNewSessionWithAgent(agentId: string): void;

        /**
         * Close the agent selector modal
         */
        closeAgentSelector(): void;
    }
}

declare const Session: App.SessionModule;
