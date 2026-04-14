import { describe, it, expect, beforeEach, vi } from 'vitest';

global.App = global.App || {};

const fs = require('fs');
const path = require('path');

const storeCode = fs.readFileSync(
  path.join(__dirname, '../../frontend/modules/state.js'),
  'utf-8'
);

eval(storeCode);

describe('Store Module', () => {
  let Store;

  beforeEach(() => {
    Store = global.App.Store;
    Store.init(
      {
        messages: [],
        sessions: [],
        agents: [],
        currentSessionId: null,
        currentAgentId: null,
        settings: {},
      },
      ['messages', 'sessions', 'agents', 'currentSessionId', 'currentAgentId', 'settings']
    );
  });

  describe('getState', () => {
    it('should return the entire state when no key is provided', () => {
      const state = Store.getState();
      expect(state).toBeDefined();
      expect(state.messages).toEqual([]);
      expect(state.sessions).toEqual([]);
    });

    it('should return a specific state value by key', () => {
      Store.setState('messages', [{ id: 1, content: 'test' }]);
      const messages = Store.getState('messages');
      expect(messages).toEqual([{ id: 1, content: 'test' }]);
    });

    it('should return undefined for non-existent key', () => {
      const value = Store.getState('nonExistentKey');
      expect(value).toBeUndefined();
    });
  });

  describe('setState', () => {
    it('should set state value and notify subscribers', () => {
      const callback = vi.fn();
      Store.subscribe('messages', callback);
      
      Store.setState('messages', [{ id: 1, content: 'new' }]);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should update existing state', () => {
      Store.setState('messages', [{ id: 1 }]);
      Store.setState('messages', [{ id: 1 }, { id: 2 }]);
      
      const messages = Store.getState('messages');
      expect(messages).toHaveLength(2);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to state changes', () => {
      const callback = vi.fn();
      Store.subscribe('testKey', callback);
      
      Store.setState('testKey', 'testValue');
      
      expect(callback).toHaveBeenCalledWith('testValue', undefined, 'testKey');
    });

    it('should support wildcard subscription', () => {
      const callback = vi.fn();
      Store.subscribe('*', callback);
      
      Store.setState('anyKey', 'anyValue');
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from state changes', () => {
      const callback = vi.fn();
      Store.subscribe('messages', callback);
      Store.unsubscribe('messages', callback);
      
      Store.setState('messages', [{ id: 1 }]);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove all subscribers for a key when no callback provided', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      Store.subscribe('messages', callback1);
      Store.subscribe('messages', callback2);
      Store.unsubscribe('messages');
      
      Store.setState('messages', [{ id: 1 }]);
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });
});
