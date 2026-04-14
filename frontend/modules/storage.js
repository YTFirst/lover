(function(global) {
    'use strict';

    var Store = App.Store;

    var Storage = {
        save: function() {
            var keys = Store.getPersistKeys();
            keys.forEach(function(key) {
                var value = Store.getRef(key);
                if (value !== undefined) {
                    try {
                        var serialized = JSON.stringify(value);
                        if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                            SecurityUtils.saveSecureItem('egf_' + key, serialized);
                        } else {
                            localStorage.setItem('egf_' + key, serialized);
                        }
                    } catch (e) {
                        console.error('[Storage] Save error for key "' + key + '":', e);
                    }
                }
            });
        },

        load: function() {
            var keys = Store.getPersistKeys();
            var loaded = {};
            keys.forEach(function(key) {
                try {
                    var serialized;
                    if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                        serialized = SecurityUtils.getSecureItem('egf_' + key);
                    } else {
                        serialized = localStorage.getItem('egf_' + key);
                    }
                    if (serialized) {
                        loaded[key] = JSON.parse(serialized);
                    }
                } catch (e) {
                    console.error('[Storage] Load error for key "' + key + '":', e);
                }
            });
            return loaded;
        },

        saveKey: function(key, value) {
            try {
                var serialized = JSON.stringify(value);
                if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                    SecurityUtils.saveSecureItem('egf_' + key, serialized);
                } else {
                    localStorage.setItem('egf_' + key, serialized);
                }
            } catch (e) {
                console.error('[Storage] SaveKey error for key "' + key + '":', e);
            }
        },

        loadKey: function(key) {
            try {
                var serialized;
                if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                    serialized = SecurityUtils.getSecureItem('egf_' + key);
                } else {
                    serialized = localStorage.getItem('egf_' + key);
                }
                return serialized ? JSON.parse(serialized) : undefined;
            } catch (e) {
                console.error('[Storage] LoadKey error for key "' + key + '":', e);
                return undefined;
            }
        },

        removeKey: function(key) {
            try {
                if (typeof SecurityUtils !== 'undefined' && (key === 'apiKey' || key === 'settings')) {
                    SecurityUtils.removeSecureItem('egf_' + key);
                } else {
                    localStorage.removeItem('egf_' + key);
                }
            } catch (e) {
                console.error('[Storage] RemoveKey error for key "' + key + '":', e);
            }
        },

        clearAll: function() {
            var keys = Store.getPersistKeys();
            keys.forEach(function(key) {
                try {
                    localStorage.removeItem('egf_' + key);
                    if (typeof SecurityUtils !== 'undefined') {
                        SecurityUtils.removeSecureItem('egf_' + key);
                    }
                } catch (e) {
                    console.error('[Storage] Clear error for key "' + key + '":', e);
                }
            });
            var allKeys = [];
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && k.startsWith('egf_')) {
                    allKeys.push(k);
                }
            }
            allKeys.forEach(function(k) {
                localStorage.removeItem(k);
            });
        }
    };

    global.App = global.App || {};
    global.App.Storage = Storage;

})(window);
