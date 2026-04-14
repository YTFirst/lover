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
  formatTime: vi.fn((timestamp) => new Date(timestamp).toLocaleTimeString()),
  throttle: vi.fn((fn) => fn),
};

// Mock Storage module
global.App.Storage = {
  save: vi.fn(),
  load: vi.fn(() => ({})),
};

// Mock llmService
global.llmService = {
  configure: vi.fn(),
  callAPI: vi.fn(() => Promise.resolve({})),
  handleStreamResponse: vi.fn(() => []),
  setAgent: vi.fn(),
  buildMessages: vi.fn(() => []),
};

// Mock global functions
global.setCharacterAnimation = vi.fn();
global.getCharacterImage = vi.fn(() => 'test-image.png');

// Mock DOM elements
global.document.getElementById = vi.fn((id) => ({
  value: '',
  textContent: '',
  innerHTML: '',
  classList: { add: vi.fn(), remove: vi.fn() },
  style: {},
  disabled: false,
  appendChild: vi.fn(),
  scrollTop: 0,
  scrollHeight: 100,
  clientHeight: 50,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  querySelector: vi.fn(() => ({
    textContent: '',
    appendChild: vi.fn(),
    remove: vi.fn(),
  })),
}));

global.document.createElement = vi.fn(() => ({
  className: '',
  innerHTML: '',
  textContent: '',
  dataset: {},
  appendChild: vi.fn(),
  classList: { add: vi.fn(), remove: vi.fn() },
}));

global.document.createDocumentFragment = vi.fn(() => ({
  appendChild: vi.fn(),
}));

global.document.querySelector = vi.fn(() => ({
  classList: { add: vi.fn(), remove: vi.fn() },
  textContent: '',
}));

// Load Chat module
const chatCode = fs.readFileSync(
  path.join(__dirname, '../../frontend/modules/chat.js'),
  'utf-8'
);
eval(chatCode);

describe('Chat Module', () => {
  let Store;
  let Chat;

  beforeEach(() => {
    vi.clearAllMocks();

    Store = global.App.Store;
    Chat = global.App.Chat;

    // Initialize Store with test state
    Store.init(
      {
        messages: [],
        sessions: [
          {
            id: 'session_1',
            name: 'Test Session',
            agentId: 'agent_1',
            messages: [],
          },
        ],
        agents: [
          {
            id: 'agent_1',
            name: 'Test Agent',
            personality: 'A test agent',
            style: 'warm',
            habits: 'Hello',
          },
        ],
        currentSessionId: 'session_1',
        currentAgentId: 'agent_1',
        settings: {
          apiKey: 'test-api-key',
          modelProvider: 'zhipu',
          modelId: 'charglm-4',
        },
        memories: [],
        messagePage: 1,
        hasMoreMessages: false,
        isLoadingMore: false,
        scrollPosition: 0,
        lastSendTime: 0,
        isDebugMode: false,
        ratings: [],
      },
      [
        'messages',
        'sessions',
        'agents',
        'currentSessionId',
        'currentAgentId',
        'settings',
        'memories',
        'messagePage',
        'hasMoreMessages',
        'isLoadingMore',
        'scrollPosition',
        'lastSendTime',
        'isDebugMode',
        'ratings',
      ]
    );
  });

  describe('getWelcomeMessage', () => {
    it('should return a welcome message for the current agent', () => {
      const welcome = Chat.getWelcomeMessage();

      expect(welcome).toContain('Test Agent');
      expect(welcome).toContain('[action:wave]');
    });

    it('should include agent habits in welcome message', () => {
      const welcome = Chat.getWelcomeMessage();

      expect(welcome).toContain('Hello');
    });

    it('should return default message if no agent found', () => {
      Store.setState('currentAgentId', 'non_existent_agent');

      const welcome = Chat.getWelcomeMessage();

      expect(welcome).toContain('小雅');
    });
  });

  describe('addWelcomeMessage', () => {
    it('should add a welcome message to messages array', () => {
      Chat.addWelcomeMessage();

      const messages = Store.getState('messages');
      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('ai');
      expect(messages[0].action).toBe('wave');
    });

    it('should save state after adding welcome message', () => {
      Chat.addWelcomeMessage();

      expect(global.App.Storage.save).toHaveBeenCalled();
    });
  });

  describe('detectCrisisKeywords', () => {
    it('should detect crisis keywords in message', () => {
      const hasKeyword = Chat.detectCrisisKeywords('我想死');

      expect(hasKeyword).toBe(true);
    });

    it('should not detect crisis keywords in normal message', () => {
      const hasKeyword = Chat.detectCrisisKeywords('今天天气真好');

      expect(hasKeyword).toBe(false);
    });

    it('should detect multiple crisis keywords', () => {
      const keywords = ['想死', '自杀', '不想活了'];

      keywords.forEach((keyword) => {
        const hasKeyword = Chat.detectCrisisKeywords(keyword);
        expect(hasKeyword).toBe(true);
      });
    });
  });

  describe('handleDebugCommand', () => {
    it('should execute valid action commands', () => {
      expect(() => Chat.handleDebugCommand('happy')).not.toThrow();
    });

    it('should show toast for invalid commands', () => {
      Chat.handleDebugCommand('invalid_action');

      expect(global.App.UI.showToast).toHaveBeenCalled();
    });

    it('should reset animation after delay', () => {
      vi.useFakeTimers();

      expect(() => Chat.handleDebugCommand('wave')).not.toThrow();

      vi.advanceTimersByTime(3000);

      vi.useRealTimers();
    });
  });

  describe('createMessageElement', () => {
    it('should create a message element with correct structure', () => {
      const message = {
        id: 1,
        type: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString(),
      };

      const element = Chat.createMessageElement(message);

      expect(element).toBeDefined();
      expect(element.className).toContain('message-bubble');
      expect(element.className).toContain('user');
    });

    it('should create AI message with rating buttons', () => {
      const message = {
        id: 2,
        type: 'ai',
        content: 'AI response',
        timestamp: new Date().toISOString(),
      };

      const element = Chat.createMessageElement(message);

      expect(element.className).toContain('ai');
    });

    it('should handle streaming messages', () => {
      const message = {
        id: 3,
        type: 'ai',
        content: '',
        timestamp: new Date().toISOString(),
      };

      const element = Chat.createMessageElement(message, true);

      expect(element).toBeDefined();
    });
  });

  describe('renderMessageList', () => {
    it('should render messages without errors', () => {
      const messages = [
        { id: 1, type: 'user', content: 'Hello', timestamp: new Date().toISOString() },
        { id: 2, type: 'ai', content: 'Hi there!', timestamp: new Date().toISOString() },
      ];

      Store.setState('messages', messages);

      expect(() => Chat.renderMessageList()).not.toThrow();
    });

    it('should handle empty message list', () => {
      Store.setState('messages', []);

      expect(() => Chat.renderMessageList()).not.toThrow();
    });
  });

  describe('setCharacterAnimation', () => {
    it('should set character animation without errors', () => {
      expect(() => Chat.setCharacterAnimation('happy')).not.toThrow();
    });

    it('should handle different animation types', () => {
      const animations = ['idle', 'happy', 'sad', 'think', 'hug', 'wave', 'surprised', 'confused'];

      animations.forEach((action) => {
        expect(() => Chat.setCharacterAnimation(action)).not.toThrow();
      });
    });
  });

  describe('buildMessageHistory', () => {
    it('should build message history for API call', () => {
      const result = Chat.buildMessageHistory('Test message');

      expect(result).toBeDefined();
      expect(result.agent).toBeDefined();
      expect(result.agentId).toBe('agent_1');
    });

    it('should return null if session not found', () => {
      Store.setState('currentSessionId', 'non_existent_session');

      const result = Chat.buildMessageHistory('Test message');

      expect(result).toBeNull();
    });
  });
});
