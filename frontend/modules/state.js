(function(global) {
    'use strict';

    var _state = {};
    var _subscribers = {};
    var _persistKeys = [];
    var _debug = false;

    function _deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return obj;
        }
    }

    function _notifySubscribers(key, newValue, oldValue) {
        if (_subscribers[key]) {
            _subscribers[key].forEach(function(cb) {
                try {
                    cb(newValue, oldValue, key);
                } catch (e) {
                    console.error('[Store] Subscriber error for key "' + key + '":', e);
                }
            });
        }
        if (_subscribers['*']) {
            _subscribers['*'].forEach(function(cb) {
                try {
                    cb(key, newValue, oldValue);
                } catch (e) {
                    console.error('[Store] Wildcard subscriber error:', e);
                }
            });
        }
    }

    function _persistToStorage(key, value) {
        if (_persistKeys.indexOf(key) === -1) return;
        try {
            var serialized = JSON.stringify(value);
            if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                SecurityUtils.saveSecureItem('egf_' + key, serialized);
            } else {
                localStorage.setItem('egf_' + key, serialized);
            }
        } catch (e) {
            console.error('[Store] Persist error for key "' + key + '":', e);
        }
    }

    function _loadFromStorage(key) {
        if (_persistKeys.indexOf(key) === -1) return undefined;
        try {
            var serialized;
            if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                serialized = SecurityUtils.getSecureItem('egf_' + key);
            } else {
                serialized = localStorage.getItem('egf_' + key);
            }
            return serialized ? JSON.parse(serialized) : undefined;
        } catch (e) {
            console.error('[Store] Load error for key "' + key + '":', e);
            return undefined;
        }
    }

    var Store = {
        init: function(initialState, persistKeys) {
            _persistKeys = persistKeys || [];
            _state = {};
            for (var key in initialState) {
                if (Object.prototype.hasOwnProperty.call(initialState, key)) {
                    var persisted = _loadFromStorage(key);
                    _state[key] = persisted !== undefined ? persisted : _deepClone(initialState[key]);
                }
            }
            if (_debug) console.log('[Store] Initialized with keys:', Object.keys(_state));
        },

        getState: function(key) {
            if (key === undefined) return _deepClone(_state);
            if (!Object.prototype.hasOwnProperty.call(_state, key)) return undefined;
            return _deepClone(_state[key]);
        },

        getRef: function(key) {
            return _state[key];
        },

        setState: function(key, value) {
            var oldValue = Object.prototype.hasOwnProperty.call(_state, key) ? _deepClone(_state[key]) : undefined;
            _state[key] = value;
            _persistToStorage(key, value);
            _notifySubscribers(key, value, oldValue);
            if (_debug) {
                console.log('[Store] State changed:', key, {
                    old: oldValue,
                    new: value
                });
            }
        },

        updateState: function(key, updater) {
            var current = Object.prototype.hasOwnProperty.call(_state, key) ? _deepClone(_state[key]) : undefined;
            var newValue = updater(current);
            Store.setState(key, newValue);
        },

        subscribe: function(key, callback) {
            if (!_subscribers[key]) _subscribers[key] = [];
            _subscribers[key].push(callback);
            return function() {
                var idx = _subscribers[key].indexOf(callback);
                if (idx > -1) _subscribers[key].splice(idx, 1);
            };
        },

        unsubscribe: function(key, callback) {
            if (!_subscribers[key]) return;
            if (callback) {
                var idx = _subscribers[key].indexOf(callback);
                if (idx > -1) _subscribers[key].splice(idx, 1);
            } else {
                delete _subscribers[key];
            }
        },

        setDebug: function(enabled) {
            _debug = !!enabled;
        },

        getPersistKeys: function() {
            return _persistKeys.slice();
        }
    };

    global.App = global.App || {};
    global.App.Store = Store;

})(window);
