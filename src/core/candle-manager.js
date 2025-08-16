/**
 * Candle Data Manager
 * Handles tick data processing, candle generation, and OHLC calculations
 */

const Logger = require('../utils/logger');
const fileUtils = require('../utils/file-utils');
const dateTimeUtils = require('../utils/datetime-utils');
const config = require('../config/config');

class CandleManager {
    constructor() {
        this.logger = new Logger('CANDLE');
        this.config = config.getMarketConfig();
        this.storageConfig = config.getStorageConfig();
        
        // Candle tracking
        this.currentCandle = null;
        this.completedCandles = [];
        this.tickData = [];
        this.candleInterval = this.config.candleInterval;
        this.csvPath = this.storageConfig.csvPath;
        
        // Event handlers
        this.candleCompleteHandler = null;
        this.tickProcessedHandler = null;
        
        // Initialize CSV file
        this.initializeCsvFile();
    }

    /**
     * Set event handlers
     */
    setEventHandlers({ onCandleComplete, onTickProcessed }) {
        this.candleCompleteHandler = onCandleComplete;
        this.tickProcessedHandler = onTickProcessed;
    }

    /**
     * Initialize CSV file with headers
     */
    initializeCsvFile() {
        const headers = ['timestamp', 'open', 'high', 'low', 'close', 'tick_count'];
        const success = fileUtils.initializeCsvFile(this.csvPath, headers);
        
        if (success) {
            this.logger.success(`Candle data storage initialized: ${this.csvPath}`);
        } else {
            this.logger.error(`Failed to initialize candle data storage: ${this.csvPath}`);
        }
    }

    /**
     * Load historical candles from CSV
     */
    loadHistoricalCandles() {
        try {
            const { rows } = fileUtils.readCsvFile(this.csvPath, true);
            
            const historicalCandles = rows
                .map(row => fileUtils.parseCandleFromCsv(row))
                .filter(candle => candle && !isNaN(candle.close))
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            this.completedCandles = historicalCandles;
            
            if (historicalCandles.length > 0) {
                this.logger.success(`Loaded ${historicalCandles.length} historical candles`);
                return historicalCandles;
            } else {
                this.logger.info('No historical candles found. Starting fresh.');
                return [];
            }
        } catch (error) {
            this.logger.error('Error loading historical candles', error);
            return [];
        }
    }

    /**
     * Initialize candle tracking
     */
    initializeCandleTracking() {
        const now = new Date();
        const candleTimestamp = dateTimeUtils.getCandleTimestamp(this.candleInterval, now);
        
        this.currentCandle = {
            startTime: candleTimestamp,
            endTime: this.calculateCandleEndTime(candleTimestamp),
            open: null,
            high: null,
            low: null,
            close: null,
            tickCount: 0,
            ticks: []
        };
        
        this.logger.info(`Initialized candle tracking. Current candle: ${candleTimestamp}`);
    }

    /**
     * Calculate candle end time
     */
    calculateCandleEndTime(startTime) {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + this.candleInterval);
        return dateTimeUtils.formatTimestamp(end);
    }

    /**
     * Process incoming tick data
     */
    processTick(tickData) {
        try {
            // Validate tick data
            const price = this.extractPrice(tickData);
            if (!price || price <= 0) {
                this.logger.warn('Invalid tick data - no valid price found');
                return false;
            }

            const timestamp = new Date();
            const tick = {
                price: price,
                timestamp: dateTimeUtils.formatTimestamp(timestamp),
                volume: tickData.volume || 0,
                raw: tickData
            };

            // Check if we need to complete current candle and start new one
            this.checkCandleInterval(timestamp);

            // Initialize current candle if not exists
            if (!this.currentCandle) {
                this.initializeCandleTracking();
            }

            // Update current candle with tick data
            this.updateCurrentCandle(tick);

            // Store tick data
            this.tickData.push(tick);
            
            // Limit tick data array size to prevent memory issues
            if (this.tickData.length > 10000) {
                this.tickData = this.tickData.slice(-5000); // Keep last 5000 ticks
            }

            // Call tick processed handler
            if (this.tickProcessedHandler) {
                try {
                    this.tickProcessedHandler(tick, this.currentCandle);
                } catch (error) {
                    this.logger.error('Error in tick processed handler', error);
                }
            }

            return true;

        } catch (error) {
            this.logger.error('Error processing tick data', error);
            return false;
        }
    }

    /**
     * Extract price from tick data (handle different message formats)
     */
    extractPrice(tickData) {
        // Handle different possible price fields
        if (tickData.ltp) return parseFloat(tickData.ltp); // Last Traded Price
        if (tickData.last_price) return parseFloat(tickData.last_price);
        if (tickData.price) return parseFloat(tickData.price);
        if (tickData.close) return parseFloat(tickData.close);
        if (tickData.lp) return parseFloat(tickData.lp);
        
        // Handle nested data structures
        if (tickData.feeds && tickData.feeds.length > 0) {
            const feed = tickData.feeds[0];
            if (feed.ff && feed.ff.indexFF && feed.ff.indexFF.ltpc) {
                return parseFloat(feed.ff.indexFF.ltpc.ltp);
            }
        }
        
        return null;
    }

    /**
     * Check if current candle should be completed
     */
    checkCandleInterval(currentTime) {
        if (!this.currentCandle) {
            return;
        }

        const candleEndTime = new Date(this.currentCandle.endTime);
        
        if (currentTime >= candleEndTime) {
            this.completeCurrentCandle();
            this.initializeCandleTracking();
        }
    }

    /**
     * Update current candle with new tick
     */
    updateCurrentCandle(tick) {
        const price = tick.price;
        
        // Initialize OHLC if this is the first tick
        if (this.currentCandle.open === null) {
            this.currentCandle.open = price;
            this.currentCandle.high = price;
            this.currentCandle.low = price;
            this.currentCandle.close = price;
        } else {
            // Update high and low
            this.currentCandle.high = Math.max(this.currentCandle.high, price);
            this.currentCandle.low = Math.min(this.currentCandle.low, price);
        }
        
        // Always update close with latest price
        this.currentCandle.close = price;
        this.currentCandle.tickCount++;
        
        // Store tick in candle
        this.currentCandle.ticks.push(tick);
        
        // Limit ticks stored per candle
        if (this.currentCandle.ticks.length > 1000) {
            this.currentCandle.ticks = this.currentCandle.ticks.slice(-500);
        }
    }

    /**
     * Complete current candle and save it
     */
    completeCurrentCandle() {
        if (!this.currentCandle || this.currentCandle.open === null) {
            this.logger.warn('Cannot complete candle - no valid data');
            return null;
        }

        // Create completed candle
        const completedCandle = {
            timestamp: this.currentCandle.startTime,
            endTime: this.currentCandle.endTime,
            open: this.currentCandle.open,
            high: this.currentCandle.high,
            low: this.currentCandle.low,
            close: this.currentCandle.close,
            tickCount: this.currentCandle.tickCount
        };

        // Add to completed candles array
        this.completedCandles.push(completedCandle);
        
        // Limit completed candles array size
        if (this.completedCandles.length > 1000) {
            this.completedCandles = this.completedCandles.slice(-500);
        }

        // Save to CSV
        this.saveCandleToCSV(completedCandle);

        // Log completion
        this.logger.data(`Candle completed: ${completedCandle.timestamp} | O:${completedCandle.open.toFixed(2)} H:${completedCandle.high.toFixed(2)} L:${completedCandle.low.toFixed(2)} C:${completedCandle.close.toFixed(2)} | Ticks:${completedCandle.tickCount}`);

        // Call candle complete handler
        if (this.candleCompleteHandler) {
            try {
                this.candleCompleteHandler(completedCandle);
            } catch (error) {
                this.logger.error('Error in candle complete handler', error);
            }
        }

        return completedCandle;
    }

    /**
     * Save candle to CSV file
     */
    saveCandleToCSV(candle) {
        try {
            const csvRow = fileUtils.formatCandleForCsv(candle);
            const success = fileUtils.appendCsvRow(this.csvPath, csvRow);
            
            if (!success) {
                this.logger.error('Failed to save candle to CSV');
            }
        } catch (error) {
            this.logger.error('Error saving candle to CSV', error);
        }
    }

    /**
     * Get current candle information
     */
    getCurrentCandle() {
        return this.currentCandle ? { ...this.currentCandle } : null;
    }

    /**
     * Get completed candles
     */
    getCompletedCandles(count = null) {
        if (count) {
            return this.completedCandles.slice(-count);
        }
        return [...this.completedCandles];
    }

    /**
     * Get latest completed candle
     */
    getLatestCandle() {
        return this.completedCandles.length > 0 ? 
            this.completedCandles[this.completedCandles.length - 1] : null;
    }

    /**
     * Get candle statistics
     */
    getStatistics() {
        return {
            totalCompletedCandles: this.completedCandles.length,
            totalTicks: this.tickData.length,
            currentCandleTickCount: this.currentCandle ? this.currentCandle.tickCount : 0,
            candleInterval: this.candleInterval / 60000, // in minutes
            csvPath: this.csvPath
        };
    }

    /**
     * Force complete current candle (for shutdown)
     */
    forceCompleteCandle() {
        if (this.currentCandle && this.currentCandle.tickCount > 0) {
            this.logger.info('Force completing current candle...');
            return this.completeCurrentCandle();
        }
        return null;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.logger.info('Cleaning up candle manager...');
        
        // Force complete current candle if it has data
        this.forceCompleteCandle();
        
        // Clear arrays to free memory
        this.tickData = [];
        this.currentCandle = null;
        
        this.logger.success('Candle manager cleanup completed');
    }

    /**
     * Reset candle tracking
     */
    reset() {
        this.logger.info('Resetting candle tracking...');
        this.cleanup();
        this.completedCandles = [];
        this.initializeCandleTracking();
    }
}

module.exports = CandleManager;
