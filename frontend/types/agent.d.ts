/**
 * Type definitions for Agent
 * Virtual companion configuration and metadata
 */

declare namespace App {
    interface Agent {
        /** Unique identifier for the agent */
        id: string;

        /** Display name of the agent */
        name: string;

        /** Personality description */
        personality: string;

        /** Habits and common phrases (newline-separated) */
        habits?: string;

        /** Communication style */
        style?: 'warm' | 'professional' | 'casual' | 'literary';

        /** Custom system prompt for the LLM */
        systemPrompt?: string;

        /** Agent memories about the user */
        memories?: Memory[];

        /** Naming relations with other agents */
        namingRelations?: Record<string, string>;

        /** Avatar configuration */
        avatar?: AgentAvatar;

        /** Metadata flags */
        metadata?: AgentMetadata;

        /** Creation timestamp */
        createdAt?: string;

        /** Last update timestamp */
        updatedAt?: string;
    }

    interface AgentMetadata {
        /** Whether this agent is locked and cannot be deleted */
        isLocked?: boolean;

        /** Whether this agent is the default selection */
        isDefault?: boolean;
    }

    interface AgentAvatar {
        /** Avatar type: preset or custom */
        type: 'preset' | 'custom';

        /** Preset character ID (for type: 'preset') */
        characterId?: 'female_adventurer' | 'male_adventurer' | 'female_person';

        /** Custom avatar color (for type: 'custom') */
        color?: string;
    }

    interface Memory {
        /** Unique identifier for the memory */
        id: number;

        /** Memory content */
        content: string;

        /** Memory type */
        type: 'preference' | 'experience' | 'important_date' | 'custom';

        /** Whether this memory is active */
        isActive: boolean;

        /** Creation timestamp */
        createdAt: string;

        /** Last update timestamp */
        updatedAt?: string;
    }

    interface AgentTemplate {
        name: string;
        personality: string;
        habits: string;
        style: 'warm' | 'professional' | 'casual' | 'literary';
        systemPrompt: string;
    }

    interface AgentShareData {
        name: string;
        personality: string;
        habits?: string;
        style?: 'warm' | 'professional' | 'casual' | 'literary';
        systemPrompt?: string;
    }

    interface AgentModule {
        loadAgentsFromAPI(): Promise<void>;
        initDefaultAgents(): void;
        renderAgentList(): void;
        selectAgent(agentId: string, forceSwitch?: boolean): void;
        showAgentSwitchDialog(agentId: string, agentName: string): void;
        showAddAgentDialog(): void;
        editAgent(agentId: string): void;
        saveAgent(): Promise<void>;
        deleteAgent(agentId: string): Promise<void>;
        closeAgentDialog(): void;
        getCurrentAgentSystemPrompt(): string;
        generateSystemPrompt(name: string, personality: string, habits: string, style: string): string;
        showAgentSelector(): void;
        closeAgentSelector(): void;
        updateChatTitle(): void;
        switchAgentTab(tabName: string): void;
        applyTemplate(templateId: string): void;
        updateCharCounts(): void;
        addMemory(): void;
        updateMemory(id: number, field: string, value: string | boolean): void;
        deleteMemory(id: number): void;
        toggleMemoryActive(id: number): void;
        renderAgentMemoryList(): void;
        addNamingRelation(): void;
        updateNamingRelation(agentId: string, value: string): void;
        removeNamingRelation(agentId: string): void;
        renderNamingRelations(): void;
        updateAvatarConfig(): void;
        selectPresetCharacter(characterId: string): void;
        renderPresetCharacters(): void;
        updateAvatarPreview(): void;
        exportAgentConfig(): void;
        importAgentConfig(event: Event): void;
        shareAgent(agentId: string): void;
        closeShareAgentDialog(): void;
        copyShareCode(): Promise<void>;
        showImportShareCodeDialog(): void;
        closeImportShareCodeDialog(): void;
        importShareCode(): void;
        decodeAndPreviewShareCode(): void;
        init(): void;
    }
}

declare const Agent: App.AgentModule;
