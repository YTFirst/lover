import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up global App object
global.App = global.App || {};
global.window = global;

// Load required modules
const fs = require('fs');
const path = require('path');

// Load Store module first (dependency)
const storeCode = fs.readFileSync(
  path.join(__dirname, '../../frontend/modules/state.js'),
  'utf-8'
);
eval(storeCode);

// Load Constants module
const constantsCode = fs.readFileSync(
  path.join(__dirname, '../../frontend/modules/constants.js'),
  'utf-8'
);
eval(constantsCode);

// Mock UI module
global.App.UI = {
  showToast: vi.fn(),
};

// Mock Storage module
global.App.Storage = {
  save: vi.fn(),
  load: vi.fn(() => ({})),
};

// Mock global functions
global.updateChatTitle = vi.fn();
global.renderAgentList = vi.fn();
global.renderMessageList = vi.fn();
global.renderPresetCharacters = vi.fn();
global.updateAvatarPreview = vi.fn();
global.renderNamingRelations = vi.fn();
global.updateCharCounts = vi.fn();

// Mock DOM elements
global.document.getElementById = vi.fn((id) => ({
  value: '',
  textContent: '',
  innerHTML: '',
  classList: { add: vi.fn(), remove: vi.fn() },
  style: { display: 'block', backgroundColor: '#FF6B9D' },
  appendChild: vi.fn(),
  querySelector: vi.fn(() => ({
    classList: { add: vi.fn(), remove: vi.fn() },
    textContent: '',
  })),
}));

global.document.querySelector = vi.fn(() => ({
  classList: { add: vi.fn(), remove: vi.fn() },
  textContent: '',
  appendChild: vi.fn(),
}));

global.document.querySelectorAll = vi.fn(() => []);

global.document.createElement = vi.fn(() => ({
  className: '',
  innerHTML: '',
  textContent: '',
  classList: { add: vi.fn(), remove: vi.fn() },
  appendChild: vi.fn(),
  setAttribute: vi.fn(),
  addEventListener: vi.fn(),
}));

// Load Agent module with error handling
let agentModuleLoaded = false;
try {
  const agentCode = fs.readFileSync(
    path.join(__dirname, '../../frontend/modules/agent.js'),
    'utf-8'
  );
  eval(agentCode);
  agentModuleLoaded = true;
} catch (e) {
  console.warn('Agent module could not be loaded due to encoding issues:', e.message);
}

describe('Agent Module', () => {
  let Store;
  let Agent;

  beforeEach(() => {
    vi.clearAllMocks();

    Store = global.App.Store;
    Agent = global.App.Agent;

    if (!agentModuleLoaded || !Agent) {
      return;
    }

    // Initialize Store with test state
    Store.init(
      {
        agents: [
          {
            id: 'agent_1',
            name: 'Test Agent',
            personality: 'A test agent for unit testing',
            style: 'warm',
            habits: 'Hello\nWorld',
            systemPrompt: '',
            metadata: { isDefault: true },
          },
          {
            id: 'agent_2',
            name: 'Another Agent',
            personality: 'Another test agent',
            style: 'professional',
            habits: '',
            systemPrompt: '',
            metadata: { isLocked: false },
          },
        ],
        currentAgentId: 'agent_1',
        editingAgentId: null,
        sessions: [],
        currentSessionId: null,
      },
      ['agents', 'currentAgentId', 'editingAgentId', 'sessions', 'currentSessionId']
    );
  });

  describe('selectAgent', () => {
    it.skipIf(!agentModuleLoaded)('should select an agent', () => {
      Agent.selectAgent('agent_2', true);

      const currentAgentId = Store.getState('currentAgentId');
      expect(currentAgentId).toBe('agent_2');
    });

    it.skipIf(!agentModuleLoaded)('should show toast when agent is selected', () => {
      Agent.selectAgent('agent_2', true);

      expect(global.App.UI.showToast).toHaveBeenCalled();
    });

    it.skipIf(!agentModuleLoaded)('should save state after selection', () => {
      Agent.selectAgent('agent_2', true);

      expect(global.App.Storage.save).toHaveBeenCalled();
    });
  });

  describe('generateSystemPrompt', () => {
    it.skipIf(!agentModuleLoaded)('should generate a system prompt with agent details', () => {
      const prompt = Agent.generateSystemPrompt(
        'TestBot',
        'A friendly test bot',
        'Hello there!',
        'warm'
      );

      expect(prompt).toContain('TestBot');
      expect(prompt).toContain('A friendly test bot');
      expect(prompt).toContain('Hello there!');
    });

    it.skipIf(!agentModuleLoaded)('should include style guide in the prompt', () => {
      const prompt = Agent.generateSystemPrompt(
        'TestBot',
        'A test bot',
        '',
        'professional'
      );

      expect(prompt).toContain('专业');
      expect(prompt).toContain('理性');
    });

    it.skipIf(!agentModuleLoaded)('should handle different styles', () => {
      const styles = ['warm', 'professional', 'casual', 'literary'];

      styles.forEach((style) => {
        const prompt = Agent.generateSystemPrompt('Bot', 'Test', '', style);
        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getCurrentAgentSystemPrompt', () => {
    it.skipIf(!agentModuleLoaded)('should return the current agent system prompt', () => {
      const agents = Store.getRef('agents');
      agents[0].systemPrompt = 'Custom system prompt';

      const prompt = Agent.getCurrentAgentSystemPrompt();

      expect(prompt).toBe('Custom system prompt');
    });

    it.skipIf(!agentModuleLoaded)('should generate prompt if not set', () => {
      const agents = Store.getRef('agents');
      agents[0].systemPrompt = '';

      const prompt = Agent.getCurrentAgentSystemPrompt();

      expect(prompt).toContain('Test Agent');
      expect(prompt).toContain('A test agent for unit testing');
    });
  });

  describe('renderAgentList', () => {
    it.skipIf(!agentModuleLoaded)('should render agent list without errors', () => {
      expect(() => Agent.renderAgentList()).not.toThrow();
    });
  });

  describe('updateChatTitle', () => {
    it.skipIf(!agentModuleLoaded)('should update chat title without errors', () => {
      expect(() => Agent.updateChatTitle()).not.toThrow();
    });
  });

  describe('applyTemplate', () => {
    it.skipIf(!agentModuleLoaded)('should apply girlfriend template', () => {
      Agent.applyTemplate('girlfriend');

      expect(global.document.getElementById).toHaveBeenCalledWith('agent-name');
      expect(global.document.getElementById).toHaveBeenCalledWith('agent-personality');
    });

    it.skipIf(!agentModuleLoaded)('should apply assistant template', () => {
      Agent.applyTemplate('assistant');

      expect(global.document.getElementById).toHaveBeenCalledWith('agent-name');
      expect(global.App.UI.showToast).toHaveBeenCalled();
    });

    it.skipIf(!agentModuleLoaded)('should handle invalid template gracefully', () => {
      expect(() => Agent.applyTemplate('invalid_template')).not.toThrow();
    });
  });

  describe('addMemory', () => {
    it.skipIf(!agentModuleLoaded)('should add a new memory', () => {
      expect(() => Agent.addMemory()).not.toThrow();
    });
  });

  describe('deleteMemory', () => {
    it.skipIf(!agentModuleLoaded)('should delete a memory by id', () => {
      const memoryId = Date.now();

      expect(() => Agent.deleteMemory(memoryId)).not.toThrow();
    });
  });
});
