const express = require('express');
const UpstoxDataClient = require('./index');
require('dotenv').config();

// Create Express app for health checks
const app = express();
const PORT = process.env.PORT || 10000;

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Upstox Nifty50 Alert System is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start the HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP server listening on port ${PORT}`);
    console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
});

// Initialize and start the main application
async function startApplication() {
    console.log('🚀 Starting Upstox Nifty 50 Real-time Candle Generator');
    console.log('='.repeat(60));

    // Check for access token
    const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
    
    if (!accessToken) {
        console.error('❌ UPSTOX_ACCESS_TOKEN not found in environment variables');
        console.log('💡 Please set your Upstox access token in the environment variables');
        
        // Don't exit in production, just keep the health server running
        if (process.env.NODE_ENV === 'production') {
            console.log('🔄 Running in production mode - keeping health server active');
            return;
        } else {
            process.exit(1);
        }
    }

    // Create CSV header if file doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('nifty50_candles.csv')) {
        fs.writeFileSync('nifty50_candles.csv', 'timestamp,open,high,low,close,tick_count\n');
        console.log('📄 Created candle data file: nifty50_candles.csv');
    }

    // Initialize client
    const client = new UpstoxDataClient(accessToken);
    
    // Handle graceful shutdown
    const gracefulShutdown = (signal) => {
        console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
        
        // Close HTTP server
        server.close(() => {
            console.log('🌐 HTTP server closed');
        });
        
        // Stop the data client
        if (client) {
            client.disconnect();
        }
        
        // Force exit after 10 seconds
        setTimeout(() => {
            console.log('🔄 Force exit after timeout');
            process.exit(0);
        }, 10000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    try {
        // Initialize alert system first, then start market monitoring
        console.log('🔄 Initializing alert system...');
        await client.initializeAlertSystem();
        
        // Start market monitoring (will connect automatically when market opens)
        console.log('⏰ Starting market hours monitoring...');
        client.startMarketMonitoring();
        
        console.log('✅ Application started successfully');
    } catch (error) {
        console.error('❌ Failed to start application:', error.message);
        
        // In production, keep the health server running even if main app fails
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

// Start the application
startApplication().catch(error => {
    console.error('❌ Unhandled error during startup:', error);
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Export for testing
module.exports = { app, server };
