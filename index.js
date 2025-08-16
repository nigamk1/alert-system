/**
 * Compatibility layer for existing index.js usage
 * This maintains backward compatibility while using the new architecture
 */

const UpstoxDataClient = require('./src/upstox-data-client');

// Export the main class for backward compatibility
module.exports = UpstoxDataClient;

// If this file is run directly, start the application
if (require.main === module) {
    const Logger = require('./src/utils/logger');
    const logger = new Logger('COMPAT');
    
    logger.warn('⚠️ Running via index.js (compatibility mode)');
    logger.info('💡 Consider using "npm start" or "node server.js" instead');
    
    // Import and run the main function
    const { main } = require('./server');
    main().catch((error) => {
        logger.error('Failed to start via compatibility mode', error);
        process.exit(1);
    });
}
