/**
 * Main Upstox Data Client
 * Orchestrates all components for real-time market data processing and alert generation
 */

const Logger = require('./utils/logger');
const config = require('./config/config');
const WebSocketManager = require('./core/websocket-manager');
const CandleManager = require('./core/candle-manager');
const MarketManager = require('./core/market-manager');
const AlertManagerService = require('./services/alert-manager-service');

class UpstoxDataClient {
    constructor(accessToken = null) {
        this.logger = new Logger('CLIENT');
        
        // Use provided token or get from config
        this.accessToken = accessToken || config.getUpstoxConfig().accessToken;
        this.instrumentKey = config.getUpstoxConfig().instrumentKey;
        
        // Initialize managers
        this.websocketManager = null;
        this.candleManager = null;
        this.marketManager = null;
        this.alertManager = null;
        
        // State tracking
        this.isRunning = false;
        this.isInitialized = false;
        
        this.logger.success('Upstox Data Client created');
        config.displaySummary();
    }

    /**
     * Initialize all components
     */
    async initialize() {
        try {
            this.logger.header('🚀 Initializing Upstox Data Client');
            
            // Initialize Market Manager
            this.logger.info('Initializing Market Manager...');
            this.marketManager = new MarketManager();
            this.marketManager.setEventHandlers({
                onMarketOpen: this.handleMarketOpen.bind(this),
                onMarketClose: this.handleMarketClose.bind(this),
                onStatusChange: this.handleMarketStatusChange.bind(this)
            });
            
            // Initialize Candle Manager
            this.logger.info('Initializing Candle Manager...');
            this.candleManager = new CandleManager();
            this.candleManager.setEventHandlers({
                onCandleComplete: this.handleCandleComplete.bind(this),
                onTickProcessed: this.handleTickProcessed.bind(this)
            });
            
            // Initialize Alert Manager
            this.logger.info('Initializing Alert Manager...');
            const telegramConfig = config.getTelegramConfig();
            this.alertManager = new AlertManagerService(telegramConfig);
            await this.alertManager.initialize();
            
            // Load historical data for EMA calculation
            await this.loadHistoricalData();
            
            // Initialize WebSocket Manager
            this.logger.info('Initializing WebSocket Manager...');
            this.websocketManager = new WebSocketManager(this.accessToken, this.instrumentKey);
            this.websocketManager.setEventHandlers({
                onMessage: this.handleWebSocketMessage.bind(this),
                onConnection: this.handleWebSocketConnection.bind(this),
                onError: this.handleWebSocketError.bind(this),
                onClose: this.handleWebSocketClose.bind(this)
            });
            
            this.isInitialized = true;
            this.logger.success('All components initialized successfully');
            
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize Upstox Data Client', error);
            return false;
        }
    }

    /**
     * Load historical candle data
     */
    async loadHistoricalData() {
        try {
            this.logger.info('Loading historical candle data...');
            const historicalCandles = this.candleManager.loadHistoricalCandles();
            
            if (historicalCandles.length > 0 && this.alertManager) {
                await this.alertManager.loadHistoricalData(historicalCandles);
            }
            
            return true;
        } catch (error) {
            this.logger.error('Error loading historical data', error);
            return false;
        }
    }

    /**
     * Start the data client
     */
    async start() {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize data client');
            }
        }

        this.logger.header('🎯 Starting Upstox Data Client');
        this.isRunning = true;
        
        // Start market monitoring
        this.marketManager.startMonitoring();
        
        this.logger.success('Upstox Data Client started successfully');
        this.logger.info('Market monitoring active. Will connect when market opens.');
        
        return true;
    }

    /**
     * Stop the data client
     */
    async stop() {
        this.logger.info('🛑 Stopping Upstox Data Client...');
        this.isRunning = false;
        
        // Stop all components
        if (this.websocketManager) {
            this.websocketManager.disconnect();
        }
        
        if (this.marketManager) {
            this.marketManager.cleanup();
        }
        
        if (this.candleManager) {
            this.candleManager.cleanup();
        }
        
        if (this.alertManager) {
            await this.alertManager.shutdown();
        }
        
        this.logger.success('Upstox Data Client stopped successfully');
    }

    /**
     * Handle market open event
     */
    async handleMarketOpen(marketStatus) {
        this.logger.success('🟢 Market opened - Starting data collection...');
        
        try {
            // Connect to WebSocket when market opens
            await this.websocketManager.connect();
            
            // Send market open alert
            if (this.alertManager && this.alertManager.telegramBot.isReady()) {
                await this.alertManager.telegramBot.sendAlert('MARKET_STATUS', {
                    isOpen: true,
                    session: marketStatus.session,
                    message: marketStatus.message
                });
            }
        } catch (error) {
            this.logger.error('Error handling market open', error);
            if (this.alertManager) {
                await this.alertManager.sendErrorAlert('Market Open Handler Error', error.message);
            }
        }
    }

    /**
     * Handle market close event
     */
    async handleMarketClose(marketStatus) {
        this.logger.warn('🔴 Market closed - Stopping data collection...');
        
        try {
            // Disconnect WebSocket when market closes
            this.websocketManager.disconnect();
            
            // Send market close alert
            if (this.alertManager && this.alertManager.telegramBot.isReady()) {
                await this.alertManager.telegramBot.sendAlert('MARKET_STATUS', {
                    isOpen: false,
                    session: marketStatus.session,
                    message: marketStatus.message
                });
            }
        } catch (error) {
            this.logger.error('Error handling market close', error);
        }
    }

    /**
     * Handle market status change
     */
    handleMarketStatusChange(newStatus, previousStatus) {
        this.logger.debug(`Market status changed: ${previousStatus} → ${newStatus.session}`);
    }

    /**
     * Handle WebSocket connection event
     */
    handleWebSocketConnection(connected) {
        if (connected) {
            this.logger.success('🔗 WebSocket connected successfully');
        } else {
            this.logger.warn('🔌 WebSocket disconnected');
        }
    }

    /**
     * Handle WebSocket message
     */
    handleWebSocketMessage(message) {
        try {
            // Log message type for debugging
            this.logger.debug(`WebSocket message: ${message.type || 'unknown'}`);
            
            // Process tick data through candle manager
            const processed = this.candleManager.processTick(message);
            
            if (!processed) {
                this.logger.debug('Tick data not processed (may be invalid or non-tick message)');
            }
        } catch (error) {
            this.logger.error('Error handling WebSocket message', error);
        }
    }

    /**
     * Handle WebSocket error
     */
    async handleWebSocketError(error) {
        this.logger.error('WebSocket error occurred', error);
        
        if (this.alertManager) {
            await this.alertManager.sendErrorAlert('WebSocket Error', error.message);
        }
    }

    /**
     * Handle WebSocket close
     */
    handleWebSocketClose(code, reason) {
        this.logger.warn(`WebSocket closed: ${code} - ${reason}`);
    }

    /**
     * Handle completed candle
     */
    async handleCandleComplete(candle) {
        try {
            this.logger.data(`📊 New candle: ${candle.timestamp} | OHLC: ${candle.open.toFixed(2)}/${candle.high.toFixed(2)}/${candle.low.toFixed(2)}/${candle.close.toFixed(2)} | Ticks: ${candle.tickCount}`);
            
            // Process candle through alert manager
            if (this.alertManager) {
                await this.alertManager.processCandle(candle);
            }
        } catch (error) {
            this.logger.error('Error handling completed candle', error);
        }
    }

    /**
     * Handle processed tick
     */
    handleTickProcessed(tick, currentCandle) {
        // Optional: Log tick processing for debugging
        // this.logger.debug(`Tick processed: ${tick.price} @ ${tick.timestamp}`);
    }

    /**
     * Get current status of all components
     */
    getStatus() {
        return {
            client: {
                isRunning: this.isRunning,
                isInitialized: this.isInitialized,
                instrumentKey: this.instrumentKey
            },
            websocket: this.websocketManager ? this.websocketManager.getStatus() : null,
            market: this.marketManager ? this.marketManager.getCurrentStatus() : null,
            candles: this.candleManager ? this.candleManager.getStatistics() : null,
            alerts: this.alertManager ? this.alertManager.getStatistics() : null
        };
    }

    /**
     * Display comprehensive status
     */
    displayStatus() {
        const status = this.getStatus();
        
        this.logger.header('📊 System Status');
        
        // Client status
        this.logger.info(`🎯 Client Status: ${status.client.isRunning ? '🟢 Running' : '🔴 Stopped'}`);
        this.logger.info(`📊 Instrument: ${status.client.instrumentKey}`);
        
        // Market status
        if (status.market) {
            this.logger.info(`📈 Market: ${status.market.isOpen ? '🟢 Open' : '🔴 Closed'} (${status.market.session})`);
        }
        
        // WebSocket status
        if (status.websocket) {
            this.logger.info(`🔗 WebSocket: ${status.websocket.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
        }
        
        // Candle statistics
        if (status.candles) {
            this.logger.info(`📊 Candles: ${status.candles.totalCompletedCandles} completed, ${status.candles.currentCandleTickCount} current ticks`);
        }
        
        // Alert statistics
        if (status.alerts) {
            const emaReady = status.alerts.emaStats.isInitialized;
            this.logger.info(`🚨 Alerts: ${emaReady ? '🟢 Ready' : '🟡 Initializing'} (${status.alerts.alertState.alertCount} sent)`);
        }
        
        this.logger.divider();
    }

    /**
     * Handle graceful shutdown
     */
    async gracefulShutdown() {
        this.logger.warn('⚠️ Received shutdown signal...');
        await this.stop();
        process.exit(0);
    }

    /**
     * Setup process signal handlers
     */
    setupSignalHandlers() {
        process.on('SIGINT', this.gracefulShutdown.bind(this));
        process.on('SIGTERM', this.gracefulShutdown.bind(this));
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled promise rejection', reason);
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught exception', error);
            this.gracefulShutdown();
        });
    }
}

module.exports = UpstoxDataClient;
