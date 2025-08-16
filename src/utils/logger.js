/**
 * Logging Utility
 * Provides consistent logging throughout the application
 */

const { LOG_LEVELS } = require('../config/constants');

class Logger {
    constructor(module = 'APP') {
        this.module = module;
        this.logLevel = process.env.LOG_LEVEL || LOG_LEVELS.INFO;
        this.enableColors = process.env.NO_COLOR !== 'true';
        this.enableTimestamps = process.env.NO_TIMESTAMPS !== 'true';
        
        // Define log level priorities
        this.levelPriorities = {
            [LOG_LEVELS.ERROR]: 0,
            [LOG_LEVELS.WARN]: 1,
            [LOG_LEVELS.INFO]: 2,
            [LOG_LEVELS.DEBUG]: 3
        };

        // Color codes for different log levels
        this.colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            debug: '\x1b[90m', // Gray
            reset: '\x1b[0m'   // Reset
        };

        // Emoji mappings for better visual distinction
        this.emojis = {
            error: '❌',
            warn: '⚠️',
            info: 'ℹ️',
            debug: '🐛',
            success: '✅',
            start: '🚀',
            stop: '🛑',
            connect: '🔗',
            disconnect: '🔌',
            data: '📊',
            alert: '🚨',
            market: '📈',
            time: '⏰',
            config: '⚙️'
        };
    }

    /**
     * Check if log level should be output
     */
    shouldLog(level) {
        return this.levelPriorities[level] <= this.levelPriorities[this.logLevel];
    }

    /**
     * Format log message
     */
    formatMessage(level, message, emoji = null) {
        const timestamp = this.enableTimestamps ? new Date().toISOString() : '';
        const colorStart = this.enableColors ? this.colors[level] : '';
        const colorEnd = this.enableColors ? this.colors.reset : '';
        const moduleTag = `[${this.module}]`;
        const levelTag = level.toUpperCase();
        const emojiPrefix = emoji ? `${emoji} ` : '';
        
        const parts = [
            timestamp,
            `${colorStart}${levelTag}${colorEnd}`,
            moduleTag,
            `${emojiPrefix}${message}`
        ].filter(Boolean);
        
        return parts.join(' ');
    }

    /**
     * Core logging method
     */
    log(level, message, emoji = null) {
        if (this.shouldLog(level)) {
            const formattedMessage = this.formatMessage(level, message, emoji);
            
            if (level === LOG_LEVELS.ERROR) {
                console.error(formattedMessage);
            } else if (level === LOG_LEVELS.WARN) {
                console.warn(formattedMessage);
            } else {
                console.log(formattedMessage);
            }
        }
    }

    /**
     * Error logging
     */
    error(message, error = null) {
        this.log(LOG_LEVELS.ERROR, message, this.emojis.error);
        if (error && this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.error('Stack trace:', error.stack);
        }
    }

    /**
     * Warning logging
     */
    warn(message) {
        this.log(LOG_LEVELS.WARN, message, this.emojis.warn);
    }

    /**
     * Info logging
     */
    info(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.info);
    }

    /**
     * Debug logging
     */
    debug(message) {
        this.log(LOG_LEVELS.DEBUG, message, this.emojis.debug);
    }

    /**
     * Success logging
     */
    success(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.success);
    }

    /**
     * Market-related logging
     */
    market(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.market);
    }

    /**
     * Connection-related logging
     */
    connect(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.connect);
    }

    disconnect(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.disconnect);
    }

    /**
     * Data-related logging
     */
    data(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.data);
    }

    /**
     * Alert-related logging
     */
    alert(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.alert);
    }

    /**
     * Time-related logging
     */
    time(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.time);
    }

    /**
     * Configuration-related logging
     */
    config(message) {
        this.log(LOG_LEVELS.INFO, message, this.emojis.config);
    }

    /**
     * Create a child logger with a specific module name
     */
    child(moduleName) {
        return new Logger(`${this.module}:${moduleName}`);
    }

    /**
     * Log with custom emoji
     */
    withEmoji(emoji, message, level = LOG_LEVELS.INFO) {
        this.log(level, message, emoji);
    }

    /**
     * Create a divider line
     */
    divider(char = '=', length = 60) {
        this.info(char.repeat(length));
    }

    /**
     * Log a header with dividers
     */
    header(title, char = '=', length = 60) {
        this.divider(char, length);
        this.info(title);
        this.divider(char, length);
    }
}

// Create default logger instance
const defaultLogger = new Logger();

// Export both the class and default instance
module.exports = Logger;
module.exports.logger = defaultLogger;
