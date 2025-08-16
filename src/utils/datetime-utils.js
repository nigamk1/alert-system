/**
 * Date and Time Utilities
 * Handles date/time operations, market hours, and timezone conversions
 */

const { TRADING_SESSIONS, NSE_HOLIDAYS_2025 } = require('../config/constants');
const Logger = require('./logger');

class DateTimeUtils {
    constructor() {
        this.logger = new Logger('TIME');
        this.istOffset = 5.5 * 60 * 60 * 1000; // IST offset (UTC+5:30)
        this.holidays = NSE_HOLIDAYS_2025;
        this.tradingSessions = TRADING_SESSIONS;
    }

    /**
     * Get current time in IST
     */
    getCurrentISTTime() {
        const now = new Date();
        return new Date(now.getTime() + this.istOffset);
    }

    /**
     * Convert any date to IST
     */
    toIST(date = new Date()) {
        return new Date(date.getTime() + this.istOffset);
    }

    /**
     * Format date to YYYY-MM-DD string
     */
    formatDate(date = new Date()) {
        const istDate = this.toIST(date);
        return istDate.toISOString().split('T')[0];
    }

    /**
     * Format time to HH:MM string
     */
    formatTime(date = new Date()) {
        const istDate = this.toIST(date);
        return istDate.toTimeString().split(' ')[0].substring(0, 5);
    }

    /**
     * Format full timestamp
     */
    formatTimestamp(date = new Date()) {
        const istDate = this.toIST(date);
        return istDate.toISOString().replace('T', ' ').substring(0, 19);
    }

    /**
     * Parse time string to minutes since midnight
     */
    parseTimeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Check if current day is a weekday (Monday-Friday)
     */
    isWeekday(date = new Date()) {
        const istDate = this.toIST(date);
        const dayOfWeek = istDate.getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
    }

    /**
     * Check if date is a trading holiday
     */
    isHoliday(date = new Date()) {
        const dateString = this.formatDate(date);
        return this.holidays.includes(dateString);
    }

    /**
     * Check if it's a trading day (weekday and not holiday)
     */
    isTradingDay(date = new Date()) {
        return this.isWeekday(date) && !this.isHoliday(date);
    }

    /**
     * Check if time is within a trading session
     */
    isTimeInSession(timeString, sessionConfig) {
        const currentMinutes = this.parseTimeToMinutes(timeString);
        const startMinutes = this.parseTimeToMinutes(sessionConfig.start);
        const endMinutes = this.parseTimeToMinutes(sessionConfig.end);
        
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    /**
     * Get current trading session status
     */
    getMarketStatus(marketType = 'EQUITY', includePrePost = false) {
        const now = this.getCurrentISTTime();
        const currentTime = this.formatTime(now);
        const sessions = this.tradingSessions[marketType];
        
        if (!this.isTradingDay(now)) {
            return {
                isOpen: false,
                session: 'CLOSED',
                reason: this.isWeekday(now) ? 'HOLIDAY' : 'WEEKEND',
                nextOpen: this.getNextTradingDay(),
                message: this.isWeekday(now) ? 'Market closed - Holiday' : 'Market closed - Weekend'
            };
        }

        // Check main trading session
        if (this.isTimeInSession(currentTime, sessions.regular)) {
            return {
                isOpen: true,
                session: 'REGULAR',
                reason: 'TRADING_HOURS',
                nextClose: this.formatSessionTime(sessions.regular.end),
                message: 'Market open - Regular trading hours'
            };
        }

        if (includePrePost) {
            // Check pre-market session
            if (sessions.preMarket && this.isTimeInSession(currentTime, sessions.preMarket)) {
                return {
                    isOpen: true,
                    session: 'PRE_MARKET',
                    reason: 'PRE_MARKET_HOURS',
                    nextSession: 'REGULAR',
                    nextOpen: this.formatSessionTime(sessions.regular.start),
                    message: 'Pre-market session active'
                };
            }

            // Check post-market session
            if (sessions.postMarket && this.isTimeInSession(currentTime, sessions.postMarket)) {
                return {
                    isOpen: true,
                    session: 'POST_MARKET',
                    reason: 'POST_MARKET_HOURS',
                    nextClose: this.formatSessionTime(sessions.postMarket.end),
                    message: 'Post-market session active'
                };
            }
        }

        // Market is closed
        const nextSessionInfo = this.getNextSessionInfo(currentTime, sessions, includePrePost);
        
        return {
            isOpen: false,
            session: 'CLOSED',
            reason: 'OUTSIDE_TRADING_HOURS',
            nextOpen: nextSessionInfo.nextOpen,
            nextSession: nextSessionInfo.nextSession,
            message: nextSessionInfo.message
        };
    }

    /**
     * Get next session information
     */
    getNextSessionInfo(currentTime, sessions, includePrePost) {
        const currentMinutes = this.parseTimeToMinutes(currentTime);
        
        // If before pre-market (and pre-market is enabled)
        if (includePrePost && sessions.preMarket) {
            const preMarketStart = this.parseTimeToMinutes(sessions.preMarket.start);
            if (currentMinutes < preMarketStart) {
                return {
                    nextOpen: this.formatSessionTime(sessions.preMarket.start),
                    nextSession: 'PRE_MARKET',
                    message: `Market closed - Opens at ${sessions.preMarket.start} (Pre-market)`
                };
            }
        }

        // If before regular market
        const regularStart = this.parseTimeToMinutes(sessions.regular.start);
        if (currentMinutes < regularStart) {
            return {
                nextOpen: this.formatSessionTime(sessions.regular.start),
                nextSession: 'REGULAR',
                message: `Market closed - Opens at ${sessions.regular.start}`
            };
        }

        // If after regular market but before post-market (and post-market is enabled)
        const regularEnd = this.parseTimeToMinutes(sessions.regular.end);
        if (includePrePost && sessions.postMarket && currentMinutes < this.parseTimeToMinutes(sessions.postMarket.start)) {
            return {
                nextOpen: this.formatSessionTime(sessions.postMarket.start),
                nextSession: 'POST_MARKET',
                message: `Market closed - Post-market starts at ${sessions.postMarket.start}`
            };
        }

        // After all sessions - next trading day
        const nextTradingDay = this.getNextTradingDay();
        return {
            nextOpen: nextTradingDay,
            nextSession: 'REGULAR',
            message: `Market closed - Next trading day: ${nextTradingDay}`
        };
    }

    /**
     * Format session time for display
     */
    formatSessionTime(timeString) {
        return timeString;
    }

    /**
     * Get next trading day
     */
    getNextTradingDay() {
        let nextDay = new Date(this.getCurrentISTTime());
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Keep incrementing until we find a trading day
        while (!this.isTradingDay(nextDay)) {
            nextDay.setDate(nextDay.getDate() + 1);
            
            // Safety check to prevent infinite loop
            if (nextDay.getTime() - this.getCurrentISTTime().getTime() > 30 * 24 * 60 * 60 * 1000) {
                this.logger.warn('Could not find next trading day within 30 days');
                break;
            }
        }
        
        return this.formatDate(nextDay);
    }

    /**
     * Calculate time until next market open
     */
    getTimeUntilMarketOpen(marketType = 'EQUITY') {
        const status = this.getMarketStatus(marketType, true);
        
        if (status.isOpen) {
            return { minutes: 0, message: 'Market is currently open' };
        }

        const now = this.getCurrentISTTime();
        const currentTime = this.formatTime(now);
        const sessions = this.tradingSessions[marketType];
        
        let targetTime;
        let targetDate = now;

        // Determine target time based on current status
        if (!this.isTradingDay(now)) {
            // Next trading day
            targetDate = new Date(this.getNextTradingDay());
            targetTime = sessions.regular.start;
        } else {
            // Today - find next session
            const nextSession = this.getNextSessionInfo(currentTime, sessions, true);
            if (nextSession.nextOpen.includes('-')) {
                // Next day
                targetDate = new Date(nextSession.nextOpen);
                targetTime = sessions.regular.start;
            } else {
                // Today
                targetTime = nextSession.nextOpen;
            }
        }

        // Calculate time difference
        const targetDateTime = new Date(targetDate);
        const [hours, minutes] = targetTime.split(':').map(Number);
        targetDateTime.setHours(hours, minutes, 0, 0);
        
        const diffMs = targetDateTime.getTime() - now.getTime();
        const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        
        const hours24 = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        
        let message;
        if (hours24 > 0) {
            message = `Market opens in ${hours24}h ${remainingMinutes}m`;
        } else {
            message = `Market opens in ${remainingMinutes} minutes`;
        }
        
        return { minutes: diffMinutes, hours: hours24, message };
    }

    /**
     * Get formatted market status message
     */
    getMarketStatusMessage(marketType = 'EQUITY', includePrePost = false) {
        const status = this.getMarketStatus(marketType, includePrePost);
        const currentTime = this.formatTime(this.getCurrentISTTime());
        
        let statusIcon = status.isOpen ? '🟢' : '🔴';
        let message = `${statusIcon} ${status.message} (${currentTime} IST)`;
        
        if (!status.isOpen && status.nextOpen) {
            const timeUntil = this.getTimeUntilMarketOpen(marketType);
            message += ` - ${timeUntil.message}`;
        }
        
        return message;
    }

    /**
     * Generate candle timestamp for given interval
     */
    getCandleTimestamp(interval, date = new Date()) {
        const istDate = this.toIST(date);
        const minutes = istDate.getMinutes();
        const intervalMinutes = interval / (1000 * 60); // Convert ms to minutes
        
        // Round down to nearest interval
        const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
        
        istDate.setMinutes(roundedMinutes, 0, 0); // Set seconds and milliseconds to 0
        
        return this.formatTimestamp(istDate);
    }
}

// Export singleton instance
const dateTimeUtils = new DateTimeUtils();
module.exports = dateTimeUtils;
