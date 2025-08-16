/**
 * Application Configuration Manager
 * Handles environment variables and application settings
 */

require('dotenv').config();
const { ALERT_CONFIG, MARKET_CONFIG, WEBSOCKET_CONFIG, INSTRUMENT_KEYS, TIMEFRAMES } = require('./constants');

class Config {
    constructor() {
        this.validateEnvironment();
        this.loadConfiguration();
    }

    /**
     * Validate required environment variables
     */
    validateEnvironment() {
        const required = ['UPSTOX_ACCESS_TOKEN'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    /**
     * Load application configuration
     */
    loadConfiguration() {
        this.upstox = {
            accessToken: process.env.UPSTOX_ACCESS_TOKEN,
            instrumentKey: process.env.INSTRUMENT_KEY || INSTRUMENT_KEYS.NIFTY_50,
            apiVersion: WEBSOCKET_CONFIG.API_VERSION
        };

        this.telegram = {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            chatId: process.env.TELEGRAM_CHAT_ID,
            enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
        };

        this.market = {
            checkInterval: parseInt(process.env.MARKET_CHECK_INTERVAL) || MARKET_CONFIG.CHECK_INTERVAL,
            pollInterval: parseInt(process.env.POLL_INTERVAL) || MARKET_CONFIG.POLL_INTERVAL,
            candleInterval: parseInt(process.env.CANDLE_INTERVAL) || TIMEFRAMES.FIVE_MINUTES
        };

        this.websocket = {
            url: process.env.WEBSOCKET_URL || WEBSOCKET_CONFIG.URL,
            maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS) || WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
            reconnectInterval: parseInt(process.env.RECONNECT_INTERVAL) || WEBSOCKET_CONFIG.RECONNECT_INTERVAL,
            connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT) || WEBSOCKET_CONFIG.CONNECTION_TIMEOUT
        };

        this.alerts = {
            enabled: process.env.ALERTS_ENABLED !== 'false',
            cooldownMinutes: parseInt(process.env.ALERT_COOLDOWN_MINUTES) || ALERT_CONFIG.COOLDOWN_MINUTES,
            minConsecutiveCandles: parseInt(process.env.MIN_CONSECUTIVE_CANDLES) || ALERT_CONFIG.MIN_CONSECUTIVE_CANDLES,
            emaPeriod: parseInt(process.env.EMA_PERIOD) || ALERT_CONFIG.EMA_PERIOD
        };

        this.logging = {
            level: process.env.LOG_LEVEL || 'info',
            enableDebug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'
        };

        this.storage = {
            csvPath: process.env.CSV_PATH || 'nifty50_candles.csv',
            enableBackup: process.env.ENABLE_BACKUP === 'true',
            retentionDays: parseInt(process.env.DATA_RETENTION_DAYS) || MARKET_CONFIG.DATA_RETENTION_DAYS
        };
    }

    /**
     * Get configuration for a specific module
     */
    getUpstoxConfig() {
        return this.upstox;
    }

    getTelegramConfig() {
        return this.telegram;
    }

    getMarketConfig() {
        return this.market;
    }

    getWebSocketConfig() {
        return this.websocket;
    }

    getAlertConfig() {
        return this.alerts;
    }

    getLoggingConfig() {
        return this.logging;
    }

    getStorageConfig() {
        return this.storage;
    }

    /**
     * Get all configuration
     */
    getAll() {
        return {
            upstox: this.upstox,
            telegram: this.telegram,
            market: this.market,
            websocket: this.websocket,
            alerts: this.alerts,
            logging: this.logging,
            storage: this.storage
        };
    }

    /**
     * Display configuration summary (without sensitive data)
     */
    displaySummary() {
        console.log('📋 Configuration Summary:');
        console.log('='.repeat(50));
        console.log(`🔑 Upstox Token: ${this.upstox.accessToken ? 'Configured' : 'Missing'}`);
        console.log(`📊 Instrument: ${this.upstox.instrumentKey}`);
        console.log(`🕐 Candle Interval: ${this.market.candleInterval / 60000} minutes`);
        console.log(`📱 Telegram Alerts: ${this.telegram.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`🚨 Alert System: ${this.alerts.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`📝 Debug Mode: ${this.logging.enableDebug ? 'Enabled' : 'Disabled'}`);
        console.log(`💾 CSV Storage: ${this.storage.csvPath}`);
        console.log('='.repeat(50));
    }
}

// Export singleton instance
const config = new Config();
module.exports = config;
