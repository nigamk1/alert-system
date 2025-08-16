/**
 * Backward compatibility wrapper for market-hours.js
 * Redirects to the new datetime utilities
 */

const dateTimeUtils = require('./src/utils/datetime-utils');

class MarketHours {
    constructor() {
        // Keep the same interface for backward compatibility
        this.tradingSessions = dateTimeUtils.tradingSessions;
        this.holidays = dateTimeUtils.holidays;
    }

    /**
     * Get current time in IST
     */
    getCurrentISTTime() {
        return dateTimeUtils.getCurrentISTTime();
    }

    /**
     * Check if current day is a trading day
     */
    isTradingDay(date = new Date()) {
        return dateTimeUtils.isTradingDay(date);
    }

    /**
     * Check if market is currently open
     */
    isMarketOpen(marketType = 'EQUITY', includePrePost = false) {
        return dateTimeUtils.getMarketStatus(marketType, includePrePost);
    }

    /**
     * Get formatted market status message
     */
    getMarketStatusMessage(marketType = 'EQUITY', includePrePost = false) {
        return dateTimeUtils.getMarketStatusMessage(marketType, includePrePost);
    }
}

module.exports = MarketHours;
