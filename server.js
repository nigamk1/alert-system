const express = require('express');
const UpstoxDataClient = require('./index');
require('dotenv').config();

// Create Express app for health checks
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Upstox Nifty50 Candle Generator',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Upstox Nifty 50 Alert System is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/status', (req, res) => {
    res.json({
        status: upstoxClient ? (upstoxClient.isConnected ? 'connected' : 'disconnected') : 'not_started',
        market_open: upstoxClient ? upstoxClient.isMarketOpen : false,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start Express server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Initialize Upstox client
let upstoxClient = null;

async function startUpstoxClient() {
    try {
        const accessToken = process.env.ACCESS_TOKEN;
        
        if (!accessToken) {
            console.error('❌ ACCESS_TOKEN not found in environment variables');
            console.log('📝 Please set up your environment variables on Render');
            return;
        }

        console.log('🔄 Starting Upstox Nifty 50 Alert System...');
        upstoxClient = new UpstoxDataClient(accessToken);
        await upstoxClient.start();
        
        console.log('✅ Upstox client started successfully');
        
    } catch (error) {
        console.error('❌ Failed to start Upstox client:', error.message);
        // Don't exit the process, keep the health check server running
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📡 Received SIGTERM, shutting down gracefully...');
    
    if (upstoxClient) {
        upstoxClient.stop();
    }
    
    server.close(() => {
        console.log('💀 Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📡 Received SIGINT, shutting down gracefully...');
    
    if (upstoxClient) {
        upstoxClient.stop();
    }
    
    server.close(() => {
        console.log('💀 Process terminated');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    // Keep the server running for health checks
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep the server running for health checks
});

// Start the Upstox client
startUpstoxClient();

console.log('🎯 Upstox Nifty 50 Alert System - Production Server Started');
console.log('📊 Service: Real-time candle generation and EMA alerts');
console.log('⚡ Environment: Production');
