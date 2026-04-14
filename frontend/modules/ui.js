(function(global) {
    'use strict';

    var Store = App.Store;

    var EventBus = {
        _handlers: {},

        on: function(event, handler) {
            if (!this._handlers[event]) this._handlers[event] = [];
            this._handlers[event].push(handler);
            return function() {
                var idx = this._handlers[event].indexOf(handler);
                if (idx > -1) this._handlers[event].splice(idx, 1);
            }.bind(this);
        },

        off: function(event, handler) {
            if (!this._handlers[event]) return;
            if (handler) {
                var idx = this._handlers[event].indexOf(handler);
                if (idx > -1) this._handlers[event].splice(idx, 1);
            } else {
                delete this._handlers[event];
            }
        },

        emit: function(event, data) {
            if (!this._handlers[event]) return;
            this._handlers[event].forEach(function(handler) {
                try {
                    handler(data);
                } catch (e) {
                    console.error('[EventBus] Error in handler for "' + event + '":', e);
                }
            });
        }
    };

    function showToast(message) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    function formatTime(timestamp) {
        var date = new Date(timestamp);
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        return hours + ':' + minutes;
    }

    function formatDate(timestamp) {
        var date = new Date(timestamp);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function formatDateTime(timestamp) {
        var date = new Date(timestamp);
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        return month + '-' + day + ' ' + hours + ':' + minutes;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function navigateTo(pageName) {
        var currentPage = document.querySelector('.page.active');
        var targetPage = document.getElementById(pageName + '-page');
        if (!targetPage || currentPage === targetPage) return;

        document.querySelectorAll('.nav-item').forEach(function(item) {
            item.classList.remove('active');
        });
        var navItem = document.querySelector('.nav-item[onclick="navigateTo(\'' + pageName + '\')"]');
        if (navItem) navItem.classList.add('active');

        currentPage.classList.remove('active');
        setTimeout(function() {
            targetPage.classList.add('active');
        }, 50);

        Store.setState('currentPage', pageName);
        EventBus.emit('pageChanged', pageName);
    }

    function throttle(fn, delay) {
        var timer = null;
        var lastArgs = null;
        return function() {
            var args = arguments;
            var self = this;
            if (timer) {
                lastArgs = args;
                return;
            }
            fn.apply(self, args);
            timer = setTimeout(function() {
                timer = null;
                if (lastArgs) {
                    fn.apply(self, lastArgs);
                    lastArgs = null;
                }
            }, delay);
        };
    }

    function debounce(fn, delay) {
        var timer = null;
        return function() {
            var args = arguments;
            var self = this;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(self, args);
            }, delay);
        };
    }

    var UI = {
        EventBus: EventBus,
        showToast: showToast,
        formatTime: formatTime,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        escapeHtml: escapeHtml,
        navigateTo: navigateTo,
        throttle: throttle,
        debounce: debounce
    };

    global.App = global.App || {};
    global.App.UI = UI;

    global.showToast = showToast;
    global.navigateTo = navigateTo;
    global.formatTime = formatTime;
    global.formatDate = formatDate;
    global.formatDateTime = formatDateTime;
    global.escapeHtml = escapeHtml;

})(window);
