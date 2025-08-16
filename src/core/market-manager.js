/**
 * Market Manager
 * Handles market hours monitoring, trading session validation, and market status tracking
 */

const Logger = require('../utils/logger');
const dateTimeUtils = require('../utils/datetime-utils');
const config = require('../config/config');

class MarketManager {
    constructor() {
        this.logger = new Logger('MARKET');
        this.marketConfig = config.getMarketConfig();
        
        // Market status tracking
        this.isMarketOpen = false;
        this.currentSession = null;
        this.lastStatusCheck = null;
        this.marketCheckInterval = null;
        
        // Event handlers
        this.marketOpenHandler = null;
        this.marketCloseHandler = null;
        this.statusChangeHandler = null;
        
        // Market type (default to EQUITY)
        this.marketType = 'EQUITY';
        this.includePrePost = false;
    }

    /**
     * Set event handlers
     */
    setEventHandlers({ onMarketOpen, onMarketClose, onStatusChange }) {
        this.marketOpenHandler = onMarketOpen;
        this.marketCloseHandler = onMarketClose;
        this.statusChangeHandler = onStatusChange;
    }

    /**
     * Configure market settings
     */
    configure(marketType = 'EQUITY', includePrePost = false) {
        this.marketType = marketType;
        this.includePrePost = includePrePost;
        this.logger.config(`Market configured: ${marketType}, Pre/Post market: ${includePrePost ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Start market monitoring
     */
    startMonitoring() {
        this.logger.time('Starting market hours monitoring...');
        
        // Check market status immediately
        this.checkMarketStatus();
        
        // Set up periodic checking
        if (this.marketCheckInterval) {
            clearInterval(this.marketCheckInterval);
        }
        
        this.marketCheckInterval = setInterval(() => {
            this.checkMarketStatus();
        }, this.marketConfig.checkInterval);
        
        this.logger.success(`Market monitoring started (checking every ${this.marketConfig.checkInterval / 1000} seconds)`);
    }

    /**
     * Stop market monitoring
     */
    stopMonitoring() {
        if (this.marketCheckInterval) {
            clearInterval(this.marketCheckInterval);
            this.marketCheckInterval = null;
            this.logger.time('Market hours monitoring stopped');
        }
    }

    /**
     * Check current market status
     */
    checkMarketStatus() {
        try {
            const previousStatus = this.isMarketOpen;
            const previousSession = this.currentSession;
            
            const status = dateTimeUtils.getMarketStatus(this.marketType, this.includePrePost);
            
            this.isMarketOpen = status.isOpen;
            this.currentSession = status.session;
            this.lastStatusCheck = new Date();
            
            // Log status change or periodic update
            if (previousStatus !== this.isMarketOpen || previousSession !== this.currentSession) {
                this.handleStatusChange(status, previousStatus);
            } else {
                // Periodic status log (less verbose)
                this.logger.debug(status.message);
            }
            
            return status;
            
        } catch (error) {
            this.logger.error('Error checking market status', error);
            return {
                isOpen: false,
                session: 'ERROR',
                reason: 'STATUS_CHECK_FAILED',
                message: 'Failed to check market status'
            };
        }
    }

    /**
     * Handle market status change
     */
    handleStatusChange(status, previousStatus) {
        // Log detailed status change
        this.logger.divider('=', 60);
        this.logger.market(status.message);
        this.logger.divider('=', 60);
        
        // Handle market open event
        if (status.isOpen && !previousStatus) {
            this.logger.success(`🟢 Market opened - ${status.session} session`);
            
            if (this.marketOpenHandler) {
                try {
                    this.marketOpenHandler(status);
                } catch (error) {
                    this.logger.error('Error in market open handler', error);
                }
            }
        }
        
        // Handle market close event
        if (!status.isOpen && previousStatus) {
            this.logger.warn(`🔴 Market closed - Ending ${this.currentSession} session`);
            
            if (this.marketCloseHandler) {
                try {
                    this.marketCloseHandler(status);
                } catch (error) {
                    this.logger.error('Error in market close handler', error);
                }
            }
        }
        
        // Handle session change within market hours
        if (status.isOpen && previousStatus && status.session !== this.currentSession) {
            this.logger.info(`📊 Session changed: ${this.currentSession} → ${status.session}`);
        }
        
        // Call general status change handler
        if (this.statusChangeHandler) {
            try {
                this.statusChangeHandler(status, previousStatus);
            } catch (error) {
                this.logger.error('Error in status change handler', error);
            }
        }
    }

    /**
     * Get current market status
     */
    getCurrentStatus() {
        return {
            isOpen: this.isMarketOpen,
            session: this.currentSession,
            lastCheck: this.lastStatusCheck,
            marketType: this.marketType,
            includePrePost: this.includePrePost,
            detailedStatus: this.lastStatusCheck ? dateTimeUtils.getMarketStatus(this.marketType, this.includePrePost) : null
        };
    }

    /**
     * Get formatted status message
     */
    getStatusMessage() {
        return dateTimeUtils.getMarketStatusMessage(this.marketType, this.includePrePost);
    }

    /**
     * Check if market is currently open
     */
    isCurrentlyOpen() {
        return this.isMarketOpen;
    }

    /**
     * Check if today is a trading day
     */
    isTradingDay(date = new Date()) {
        return dateTimeUtils.isTradingDay(date);
    }

    /**
     * Get next market open time
     */
    getNextMarketOpen() {
        return dateTimeUtils.getTimeUntilMarketOpen(this.marketType);
    }

    /**
     * Get market hours for current market type
     */
    getMarketHours() {
        const status = dateTimeUtils.getMarketStatus(this.marketType, this.includePrePost);
        return {
            marketType: this.marketType,
            sessions: dateTimeUtils.tradingSessions[this.marketType],
            currentStatus: status,
            isTradingDay: this.isTradingDay(),
            nextOpen: this.getNextMarketOpen()
        };
    }

    /**
     * Force refresh market status
     */
    forceRefresh() {
        this.logger.time('Force refreshing market status...');
        return this.checkMarketStatus();
    }

    /**
     * Wait for market to open
     */
    async waitForMarketOpen(checkInterval = 30000) { // 30 seconds default
        return new Promise((resolve) => {
            const checkAndWait = () => {
                const status = this.checkMarketStatus();
                
                if (status.isOpen) {
                    this.logger.success('Market is now open!');
                    resolve(status);
                    return;
                }
                
                const nextOpen = this.getNextMarketOpen();
                this.logger.time(`Market closed. ${nextOpen.message}`);
                
                setTimeout(checkAndWait, checkInterval);
            };
            
            checkAndWait();
        });
    }

    /**
     * Get market statistics
     */
    getStatistics() {
        const status = this.getCurrentStatus();
        const nextOpen = this.getNextMarketOpen();
        
        return {
            currentStatus: status,
            nextMarketOpen: nextOpen,
            marketType: this.marketType,
            includePrePost: this.includePrePost,
            monitoringActive: !!this.marketCheckInterval,
            lastStatusCheck: this.lastStatusCheck,
            checkInterval: this.marketConfig.checkInterval
        };
    }

    /**
     * Display current market information
     */
    displayMarketInfo() {
        const status = this.getCurrentStatus();
        const hours = this.getMarketHours();
        
        this.logger.header('📊 Market Information');
        this.logger.info(`Market Type: ${this.marketType}`);
        this.logger.info(`Current Status: ${status.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}`);
        this.logger.info(`Current Session: ${status.session || 'N/A'}`);
        this.logger.info(`Is Trading Day: ${hours.isTradingDay ? '✅ Yes' : '❌ No'}`);
        
        if (hours.sessions) {
            this.logger.info('Trading Sessions:');
            Object.entries(hours.sessions).forEach(([sessionName, session]) => {
                this.logger.info(`  ${sessionName}: ${session.start} - ${session.end}`);
            });
        }
        
        if (!status.isOpen) {
            this.logger.info(`Next Open: ${hours.nextOpen.message}`);
        }
        
        this.logger.divider();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.logger.info('Cleaning up market manager...');
        this.stopMonitoring();
        this.logger.success('Market manager cleanup completed');
    }
}

module.exports = MarketManager;
