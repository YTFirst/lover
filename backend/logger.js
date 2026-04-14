const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

class Logger {
    constructor(moduleName) {
        this.moduleName = moduleName || 'app';
        this.minLevel = process.env.NODE_ENV === 'production' ? LEVELS.info : LEVELS.debug;
    }

    _format(level, message) {
        const now = new Date();
        const timestamp = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');
        return `[${timestamp}] [${level.toUpperCase()}] [${this.moduleName}] ${message}`;
    }

    _log(level, message) {
        if (LEVELS[level] > this.minLevel) return;
        const formatted = this._format(level, message);
        if (level === 'error') {
            console.error(formatted);
        } else if (level === 'warn') {
            console.warn(formatted);
        } else {
            console.log(formatted);
        }
    }

    error(message) { this._log('error', message); }
    warn(message) { this._log('warn', message); }
    info(message) { this._log('info', message); }
    debug(message) { this._log('debug', message); }
}

function createLogger(moduleName) {
    return new Logger(moduleName);
}

module.exports = { Logger, createLogger };
