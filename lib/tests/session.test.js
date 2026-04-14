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

// Mock global functions
global.addWelcomeMessage = vi.fn();
global.updateChatTitle = vi.fn();
global.renderMessageList = vi.fn();
global.renderAgentList = vi.fn();

// Mock DOM
global.document.getElementById = vi.fn(() => ({
  classList: { add: vi.fn(), remove: vi.fn() },
  innerHTML: '',
  appendChild: vi.fn(),
}));
global.document.querySelector = vi.fn(() => ({
  classList: { add: vi.fn(), remove: vi.fn() },
}));
global.document.createElement = vi.fn(() => ({
  className: '',
  innerHTML: '',
  classList: { add: vi.fn(), remove: vi.fn() },
  appendChild: vi.fn(),
  setAttribute: vi.fn(),
  addEventListener: vi.fn(),
}));

// Load Session module
const sessionCode = fs.readFileSync(
  path.join(__dirname, '../../frontend/modules/session.js'),
  'utf-8'
);
eval(sessionCode);

describe('Session Module', () => {
  let Store;
  let Session;

  beforeEach(() => {
    vi.clearAllMocks();

    Store = global.App.Store;
    Session = global.App.Session;

    // Initialize Store with test state
    Store.init(
      {
        messages: [],
        sessions: [],
        agents: [{ id: 'agent_1', name: 'Test Agent', personality: 'Test' }],
        currentSessionId: null,
        currentAgentId: 'agent_1',
        messagePage: 1,
        hasMoreMessages: false,
        isLoadingMore: false,
        scrollPosition: 0,
      },
      ['messages', 'sessions', 'agents', 'currentSessionId', 'currentAgentId']
    );
  });

  describe('createNewSession', () => {
    it('should create a new session with default values', () => {
      const session = Session.createNewSession();

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^session_/);
      expect(session.name).toMatch(/^会话/);
      expect(session.agentId).toBe('agent_1');
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });

    it('should create a session with custom name and agent', () => {
      const session = Session.createNewSession('Custom Session', 'agent_2');

      expect(session.name).toBe('Custom Session');
      expect(session.agentId).toBe('agent_2');
    });

    it('should add the new session to the sessions array', () => {
      Session.createNewSession('Test Session');

      const sessions = Store.getState('sessions');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].name).toBe('Test Session');
    });

    it('should set the new session as current session', () => {
      const session = Session.createNewSession();

      const currentSessionId = Store.getState('currentSessionId');
      expect(currentSessionId).toBe(session.id);
    });
  });

  describe('switchSession', () => {
    it('should switch to a different session', () => {
      // Create two sessions
      const session1 = Session.createNewSession('Session 1');
      const session2 = Session.createNewSession('Session 2');

      // Switch to session 1
      Session.switchSession(session1.id);

      const currentSessionId = Store.getState('currentSessionId');
      expect(currentSessionId).toBe(session1.id);
    });

    it('should save current session before switching', () => {
      const session1 = Session.createNewSession('Session 1');
      const session2 = Session.createNewSession('Session 2');

      // Add a message to current session
      Store.setState('messages', [{ id: 1, content: 'test' }]);

      // Switch session
      Session.switchSession(session1.id);

      expect(global.App.Storage.save).toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const session1 = Session.createNewSession('Session 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const session2 = Session.createNewSession('Session 2');

      expect(session1.id).toBeDefined();
      expect(session2.id).toBeDefined();
      expect(session1.id).not.toBe(session2.id);

      global.confirm = vi.fn(() => true);

      Session.deleteSession(session2.id);

      const sessions = Store.getState('sessions');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(session1.id);
    });

    it('should not delete the last session', () => {
      Session.createNewSession('Only Session');

      global.confirm = vi.fn(() => true);

      const initialLength = Store.getState('sessions').length;
      Session.deleteSession(Store.getState('sessions')[0].id);

      expect(global.App.UI.showToast).toHaveBeenCalledWith('至少保留一个会话');
    });

    it('should switch to another session if deleting current session', async () => {
      const session1 = Session.createNewSession('Session 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const session2 = Session.createNewSession('Session 2');

      expect(session1.id).toBeDefined();
      expect(session2.id).toBeDefined();

      global.confirm = vi.fn(() => true);

      Session.deleteSession(session2.id);

      const currentSessionId = Store.getState('currentSessionId');
      expect(currentSessionId).toBe(session1.id);
    });
  });

  describe('saveCurrentSession', () => {
    it('should save messages to current session', () => {
      const session = Session.createNewSession('Test Session');

      // Add messages
      const messages = [
        { id: 1, content: 'Hello' },
        { id: 2, content: 'World' },
      ];
      Store.setState('messages', messages);

      Session.saveCurrentSession();

      const sessions = Store.getRef('sessions');
      const savedSession = sessions.find((s) => s.id === session.id);

      expect(savedSession.messages).toEqual(messages);
      expect(global.App.Storage.save).toHaveBeenCalled();
    });

    it('should update session timestamp', () => {
      const session = Session.createNewSession('Test Session');
      const originalUpdatedAt = session.updatedAt;

      // Wait a bit to ensure timestamp difference
      Session.saveCurrentSession();

      const sessions = Store.getRef('sessions');
      const savedSession = sessions.find((s) => s.id === session.id);

      expect(savedSession.updatedAt).toBeDefined();
    });
  });

  describe('renameSession', () => {
    it('should rename a session', () => {
      const session = Session.createNewSession('Original Name');

      Session.renameSession(session.id, 'New Name');

      const sessions = Store.getRef('sessions');
      const renamedSession = sessions.find((s) => s.id === session.id);

      expect(renamedSession.name).toBe('New Name');
      expect(global.App.Storage.save).toHaveBeenCalled();
    });
  });
});
