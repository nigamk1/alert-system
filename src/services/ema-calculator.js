/**
 * Refactored EMA Calculator
 * Clean and efficient implementation of Exponential Moving Average calculation
 */

const Logger = require('../utils/logger');

class EMACalculator {
    constructor(period = 5) {
        this.logger = new Logger('EMA');
        this.period = period;
        this.multiplier = 2 / (period + 1);
        this.previousEMA = null;
        this.isInitialized = false;
        this.valueCount = 0;
        this.initializationValues = [];
        
        this.logger.debug(`EMA Calculator initialized with period: ${period}`);
    }

    /**
     * Add a new value and calculate EMA
     */
    addValue(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            this.logger.warn(`Invalid EMA input: ${value}`);
            return this.getCurrentEMA();
        }

        this.valueCount++;

        // For the first few values, collect them for SMA calculation
        if (!this.isInitialized) {
            this.initializationValues.push(value);
            
            // Once we have enough values, calculate initial SMA
            if (this.initializationValues.length >= this.period) {
                const sma = this.calculateSMA(this.initializationValues);
                this.previousEMA = sma;
                this.isInitialized = true;
                
                this.logger.debug(`EMA initialized with SMA: ${sma.toFixed(4)} (from ${this.initializationValues.length} values)`);
                
                // Process any extra values with EMA formula
                const extraValues = this.initializationValues.slice(this.period);
                for (const extraValue of extraValues) {
                    this.previousEMA = this.calculateEMA(extraValue, this.previousEMA);
                }
                
                return this.previousEMA;
            }
            
            // Return current average until we have enough values
            return this.calculateSMA(this.initializationValues);
        }

        // Calculate EMA using the standard formula
        this.previousEMA = this.calculateEMA(value, this.previousEMA);
        return this.previousEMA;
    }

    /**
     * Calculate Simple Moving Average for initialization
     */
    calculateSMA(values) {
        if (values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    }

    /**
     * Calculate EMA using the standard formula
     */
    calculateEMA(currentValue, previousEMA) {
        return (currentValue * this.multiplier) + (previousEMA * (1 - this.multiplier));
    }

    /**
     * Get current EMA value
     */
    getCurrentEMA() {
        return this.previousEMA;
    }

    /**
     * Check if EMA is ready (initialized)
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Get EMA statistics
     */
    getStatistics() {
        return {
            period: this.period,
            multiplier: this.multiplier,
            currentEMA: this.previousEMA,
            isInitialized: this.isInitialized,
            valueCount: this.valueCount,
            initializationValuesNeeded: Math.max(0, this.period - this.initializationValues.length)
        };
    }

    /**
     * Bulk add historical values for initialization
     */
    addHistoricalValues(values) {
        if (!Array.isArray(values)) {
            this.logger.warn('Historical values must be an array');
            return this.getCurrentEMA();
        }

        this.logger.info(`Adding ${values.length} historical values for EMA calculation`);
        
        let lastEMA = null;
        for (const value of values) {
            lastEMA = this.addValue(value);
        }
        
        this.logger.success(`EMA calculation updated. Current EMA: ${lastEMA?.toFixed(4) || 'N/A'}`);
        return lastEMA;
    }

    /**
     * Reset EMA calculator
     */
    reset() {
        this.logger.debug('Resetting EMA calculator');
        this.previousEMA = null;
        this.isInitialized = false;
        this.valueCount = 0;
        this.initializationValues = [];
    }

    /**
     * Clone EMA calculator with same settings
     */
    clone() {
        const clone = new EMACalculator(this.period);
        clone.previousEMA = this.previousEMA;
        clone.isInitialized = this.isInitialized;
        clone.valueCount = this.valueCount;
        clone.initializationValues = [...this.initializationValues];
        return clone;
    }

    /**
     * Get formatted EMA string
     */
    toString() {
        const ema = this.getCurrentEMA();
        const status = this.isReady() ? 'Ready' : `Need ${this.period - this.initializationValues.length} more values`;
        return `EMA(${this.period}): ${ema?.toFixed(4) || 'N/A'} [${status}]`;
    }
}

module.exports = EMACalculator;
