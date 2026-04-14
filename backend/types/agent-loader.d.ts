/**
 * Type definitions for agent-loader module
 * Agent file system operations and management
 */

import { AgentConfig, MemoryItem } from './llm-service';

/**
 * Agent style configuration
 */
interface AgentStyle {
    id: string;
    name: string;
    description: string;
    tone: string;
    phrases: string[];
    emoji: string[];
    greetings: {
        morning: string;
        afternoon: string;
        evening: string;
        night: string;
    };
    responses: Record<string, string>;
}

/**
 * Agent with loaded memory and style
 */
interface LoadedAgent extends AgentConfig {
    memory?: string;
    styleConfig?: AgentStyle | null;
}

/**
 * Delete result
 */
interface DeleteResult {
    success: boolean;
    message?: string;
}

/**
 * Load an agent by ID
 * @param agentId - Agent identifier
 * @returns Loaded agent or null if not found
 */
export function loadAgent(agentId: string): Promise<LoadedAgent | null>;

/**
 * Load all agents from the agents directory
 * @returns Array of loaded agents
 */
export function loadAllAgents(): Promise<LoadedAgent[]>;

/**
 * Load agent memory from file
 * @param agentId - Agent identifier
 * @returns Memory content string or empty string
 */
export function loadAgentMemory(agentId: string): Promise<string>;

/**
 * Load agent style configuration
 * @param agentId - Agent identifier
 * @returns Style configuration or null
 */
export function loadAgentStyle(agentId: string): Promise<AgentStyle | null>;

/**
 * Save agent configuration to file
 * @param agent - Agent configuration to save
 * @returns Whether save was successful
 */
export function saveAgent(agent: AgentConfig): Promise<boolean>;

/**
 * Save agent memory to file
 * @param agentId - Agent identifier
 * @param memory - Memory content to save
 * @returns Whether save was successful
 */
export function saveAgentMemory(agentId: string, memory: string): Promise<boolean>;

/**
 * Save agent style configuration to file
 * @param agentId - Agent identifier
 * @param style - Style configuration to save
 * @returns Whether save was successful
 */
export function saveAgentStyle(agentId: string, style: AgentStyle): Promise<boolean>;

/**
 * Delete an agent and its files
 * @param agentId - Agent identifier
 * @returns Delete result with success status
 */
export function deleteAgent(agentId: string): Promise<DeleteResult>;

/**
 * Check if an agent exists
 * @param agentId - Agent identifier
 * @returns Whether the agent exists
 */
export function agentExists(agentId: string): Promise<boolean>;

/**
 * Generate a unique agent ID from name
 * @param name - Agent name
 * @returns Generated agent ID
 */
export function generateAgentId(name: string): string;

/**
 * Create agent folder with default files
 * @param agentId - Agent identifier
 * @param name - Agent name
 * @returns Whether creation was successful
 */
export function createAgentFolder(agentId: string, name: string): Promise<boolean>;

/**
 * Clear the agent cache
 */
export function clearCache(): void;

/**
 * Path to agents directory
 */
export const AGENTS_DIR: string;

export {
    AgentConfig,
    AgentStyle,
    LoadedAgent,
    DeleteResult
};
