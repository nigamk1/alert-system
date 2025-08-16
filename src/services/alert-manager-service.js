/**
 * Refactored Alert Manager
 * Clean implementation for managing EMA-based alerts and notifications
 */

const Logger = require('../utils/logger');
const EMACalculator = require('./ema-calculator');
const TelegramBotService = require('./telegram-bot-service');
const config = require('../config/config');

class AlertManagerService {
    constructor(telegramConfig) {
        this.logger = new Logger('ALERT');
        this.alertConfig = config.getAlertConfig();
        
        // Initialize services
        this.telegramBot = new TelegramBotService(telegramConfig.botToken, telegramConfig.chatId);
        this.emaCalculator = new EMACalculator(this.alertConfig.emaPeriod);
        
        // Alert state management
        this.alertState = {
            isAboveEMA: false,
            consecutiveAboveEMA: 0,
            consecutiveBelowEMA: 0,
            lastAlertTime: null,
            lastAlertType: null,
            alertCount: 0
        };
        
        // Configuration
        this.cooldownPeriod = this.alertConfig.cooldownMinutes * 60 * 1000; // Convert to milliseconds
        this.minConsecutiveCandles = this.alertConfig.minConsecutiveCandles;
        this.enabled = this.alertConfig.enabled;
        
        this.logger.success('Alert Manager initialized');
        this.displayConfiguration();
    }

    /**
     * Display alert configuration
     */
    displayConfiguration() {
        this.logger.config('Alert Configuration:');
        this.logger.info(`  📊 EMA Period: ${this.alertConfig.emaPeriod}`);
        this.logger.info(`  ⏰ Cooldown: ${this.alertConfig.cooldownMinutes} minutes`);
        this.logger.info(`  📈 Min Consecutive Candles: ${this.minConsecutiveCandles}`);
        this.logger.info(`  🚨 Alerts Enabled: ${this.enabled ? 'Yes' : 'No'}`);
        this.logger.info(`  📱 Telegram: ${this.telegramBot.isReady() ? 'Configured' : 'Not configured'}`);
    }

    /**
     * Initialize alert system
     */
    async initialize() {
        this.logger.info('Initializing Alert System...');
        
        try {
            // Test Telegram connection if configured
            if (this.telegramBot.isReady()) {
                const connected = await this.telegramBot.testConnection();
                if (connected) {
                    await this.sendSystemAlert('ONLINE', 'Nifty 50 EMA Alert System started successfully! 🚀');
                }
            }
            
            this.logger.success('Alert system initialized successfully');
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize alert system', error);
            return false;
        }
    }

    /**
     * Load historical candle data for EMA calculation
     */
    async loadHistoricalData(historicalCandles) {
        if (!Array.isArray(historicalCandles) || historicalCandles.length === 0) {
            this.logger.info('No historical data provided for EMA calculation');
            return false;
        }

        try {
            this.logger.info(`Loading ${historicalCandles.length} historical candles for EMA calculation...`);
            
            // Extract closing prices and add to EMA calculator
            const closingPrices = historicalCandles.map(candle => candle.close);
            this.emaCalculator.addHistoricalValues(closingPrices);
            
            if (this.emaCalculator.isReady()) {
                const currentEMA = this.emaCalculator.getCurrentEMA();
                this.logger.success(`EMA calculation ready. Current EMA(${this.alertConfig.emaPeriod}): ${currentEMA.toFixed(4)}`);
                
                // Initialize alert state based on last candle
                const lastCandle = historicalCandles[historicalCandles.length - 1];
                this.updateAlertState(lastCandle.close, currentEMA, false); // Don't send alerts during initialization
                
                return true;
            } else {
                this.logger.warn('EMA calculator not ready after loading historical data');
                return false;
            }
        } catch (error) {
            this.logger.error('Error loading historical data', error);
            return false;
        }
    }

    /**
     * Process new candle data and check for alerts
     */
    async processCandle(candle) {
        if (!this.enabled) {
            this.logger.debug('Alert processing disabled');
            return false;
        }

        try {
            const price = candle.close;
            
            // Add price to EMA calculator
            const currentEMA = this.emaCalculator.addValue(price);
            
            if (!this.emaCalculator.isReady()) {
                this.logger.debug(`EMA not ready yet. Need ${this.emaCalculator.getStatistics().initializationValuesNeeded} more values.`);
                return false;
            }

            // Update alert state and check for alerts
            await this.updateAlertState(price, currentEMA, true);
            
            // Log current status
            this.logCurrentStatus(price, currentEMA, candle);
            
            return true;
        } catch (error) {
            this.logger.error('Error processing candle for alerts', error);
            return false;
        }
    }

    /**
     * Update alert state and trigger alerts if conditions are met
     */
    async updateAlertState(price, ema, sendAlerts = true) {
        const wasAboveEMA = this.alertState.isAboveEMA;
        const isNowAboveEMA = price > ema;
        
        // Update position relative to EMA
        this.alertState.isAboveEMA = isNowAboveEMA;
        
        // Update consecutive counters
        if (isNowAboveEMA) {
            this.alertState.consecutiveAboveEMA++;
            this.alertState.consecutiveBelowEMA = 0;
        } else {
            this.alertState.consecutiveBelowEMA++;
            this.alertState.consecutiveAboveEMA = 0;
        }
        
        // Check for alert conditions
        if (sendAlerts) {
            await this.checkAlertConditions(price, ema, wasAboveEMA, isNowAboveEMA);
        }
    }

    /**
     * Check alert conditions and send alerts if necessary
     */
    async checkAlertConditions(price, ema, wasAboveEMA, isNowAboveEMA) {
        const now = Date.now();
        
        // Check if we're in cooldown period
        if (this.isInCooldown(now)) {
            this.logger.debug('Alert suppressed due to cooldown period');
            return;
        }
        
        // Bullish alert: Price crosses above EMA
        if (!wasAboveEMA && isNowAboveEMA && this.alertState.consecutiveAboveEMA >= this.minConsecutiveCandles) {
            await this.sendEMAAlert('BULLISH', price, ema, 'Price crossed above EMA - Potential bullish signal');
            this.updateLastAlert(now, 'BULLISH');
        }
        
        // Bearish alert: Price crosses below EMA
        if (wasAboveEMA && !isNowAboveEMA && this.alertState.consecutiveBelowEMA >= this.minConsecutiveCandles) {
            await this.sendEMAAlert('BEARISH', price, ema, 'Price crossed below EMA - Potential bearish signal');
            this.updateLastAlert(now, 'BEARISH');
        }
        
        // Strong bullish alert: Multiple consecutive candles above EMA
        if (isNowAboveEMA && this.alertState.consecutiveAboveEMA > 0 && 
            this.alertState.consecutiveAboveEMA % 3 === 0 && // Every 3 consecutive candles
            this.alertState.consecutiveAboveEMA <= 9) { // Up to 9 candles to avoid spam
            await this.sendEMAAlert('STRONG_BULLISH', price, ema, 
                `${this.alertState.consecutiveAboveEMA} consecutive candles above EMA - Strong bullish momentum`);
            this.updateLastAlert(now, 'STRONG_BULLISH');
        }
        
        // Strong bearish alert: Multiple consecutive candles below EMA
        if (!isNowAboveEMA && this.alertState.consecutiveBelowEMA > 0 && 
            this.alertState.consecutiveBelowEMA % 3 === 0 && // Every 3 consecutive candles
            this.alertState.consecutiveBelowEMA <= 9) { // Up to 9 candles to avoid spam
            await this.sendEMAAlert('STRONG_BEARISH', price, ema, 
                `${this.alertState.consecutiveBelowEMA} consecutive candles below EMA - Strong bearish momentum`);
            this.updateLastAlert(now, 'STRONG_BEARISH');
        }
    }

    /**
     * Send EMA-based alert
     */
    async sendEMAAlert(alertType, price, ema, message) {
        const alertData = {
            alertType: alertType,
            instrument: 'Nifty 50',
            currentPrice: price.toFixed(2),
            emaValue: ema.toFixed(2),
            emaPeriod: this.alertConfig.emaPeriod,
            direction: price > ema ? 'ABOVE' : 'BELOW',
            consecutiveCandles: price > ema ? this.alertState.consecutiveAboveEMA : this.alertState.consecutiveBelowEMA,
            message: message
        };
        
        this.logger.alert(`${alertType}: ${message} (Price: ${price.toFixed(2)}, EMA: ${ema.toFixed(2)})`);
        
        const success = await this.telegramBot.sendAlert('EMA_ALERT', alertData);
        
        if (success) {
            this.alertState.alertCount++;
            this.logger.success(`Alert sent successfully (Total alerts: ${this.alertState.alertCount})`);
        } else {
            this.logger.warn('Failed to send alert via Telegram');
        }
        
        return success;
    }

    /**
     * Send system status alert
     */
    async sendSystemAlert(status, message) {
        const alertData = {
            status: status,
            message: message
        };
        
        return await this.telegramBot.sendAlert('SYSTEM_STATUS', alertData);
    }

    /**
     * Send error alert
     */
    async sendErrorAlert(error, details = null) {
        const alertData = {
            error: error,
            details: details
        };
        
        return await this.telegramBot.sendAlert('ERROR_ALERT', alertData);
    }

    /**
     * Check if currently in cooldown period
     */
    isInCooldown(currentTime) {
        if (!this.alertState.lastAlertTime) {
            return false;
        }
        
        return (currentTime - this.alertState.lastAlertTime) < this.cooldownPeriod;
    }

    /**
     * Update last alert information
     */
    updateLastAlert(timestamp, alertType) {
        this.alertState.lastAlertTime = timestamp;
        this.alertState.lastAlertType = alertType;
    }

    /**
     * Log current status for debugging
     */
    logCurrentStatus(price, ema, candle) {
        const direction = price > ema ? '⬆️' : '⬇️';
        const consecutive = price > ema ? this.alertState.consecutiveAboveEMA : this.alertState.consecutiveBelowEMA;
        const emaStatus = this.emaCalculator.toString();
        
        this.logger.debug(
            `${direction} Price: ${price.toFixed(2)} | ${emaStatus} | ` +
            `Consecutive: ${consecutive} | Ticks: ${candle.tickCount}`
        );
    }

    /**
     * Get current alert statistics
     */
    getStatistics() {
        return {
            alertState: { ...this.alertState },
            emaStats: this.emaCalculator.getStatistics(),
            configuration: {
                enabled: this.enabled,
                emaPeriod: this.alertConfig.emaPeriod,
                cooldownMinutes: this.alertConfig.cooldownMinutes,
                minConsecutiveCandles: this.minConsecutiveCandles
            },
            telegramStatus: this.telegramBot.getStatus()
        };
    }

    /**
     * Get current EMA value
     */
    getCurrentEMA() {
        return this.emaCalculator.getCurrentEMA();
    }

    /**
     * Check if EMA is ready for alerts
     */
    isEMAReady() {
        return this.emaCalculator.isReady();
    }

    /**
     * Enable/disable alerts
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.logger.info(`Alerts ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Reset alert state
     */
    reset() {
        this.logger.info('Resetting alert state...');
        
        this.alertState = {
            isAboveEMA: false,
            consecutiveAboveEMA: 0,
            consecutiveBelowEMA: 0,
            lastAlertTime: null,
            lastAlertType: null,
            alertCount: 0
        };
        
        this.emaCalculator.reset();
        this.logger.success('Alert state reset completed');
    }

    /**
     * Shutdown alert system
     */
    async shutdown() {
        this.logger.info('Shutting down alert system...');
        
        try {
            if (this.telegramBot.isReady()) {
                await this.sendSystemAlert('OFFLINE', 'Nifty 50 EMA Alert System is shutting down. 👋');
            }
            
            this.setEnabled(false);
            this.logger.success('Alert system shutdown completed');
        } catch (error) {
            this.logger.error('Error during alert system shutdown', error);
        }
    }
}

module.exports = AlertManagerService;
