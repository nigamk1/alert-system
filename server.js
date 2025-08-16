/**
 * Application Entry Point
 * Main server file that starts the Upstox Data Client
 */

require('dotenv').config();
const UpstoxDataClient = require('./src/upstox-data-client');
const Logger = require('./src/utils/logger');

// Create main logger
const logger = new Logger('MAIN');

/**
 * Main application function
 */
async function main() {
    try {
        // Display startup banner
        logger.header('🚀 Nifty 50 Real-time Alert System');
        logger.info('Starting Upstox WebSocket client with EMA-based alerts...');
        
        // Create and initialize the client
        const client = new UpstoxDataClient();
        
        // Setup signal handlers for graceful shutdown
        client.setupSignalHandlers();
        
        // Start the client
        await client.start();
        
        // Display status every 5 minutes
        setInterval(() => {
            client.displayStatus();
        }, 5 * 60 * 1000);
        
        logger.success('🎉 Application started successfully!');
        logger.info('📊 Monitoring market hours and will connect automatically when market opens.');
        logger.info('🛑 Press Ctrl+C to stop the application gracefully.');
        
    } catch (error) {
        logger.error('❌ Failed to start application', error);
        process.exit(1);
    }
}

/**
 * Handle uncaught errors at the top level
 */
process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

// Start the application
if (require.main === module) {
    main().catch((error) => {
        logger.error('💥 Critical error during startup', error);
        process.exit(1);
    });
}

module.exports = { main };
