/**
 * Health check endpoint for Render deployment
 * Provides system status and health monitoring
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const UpstoxDataClient = require('./src/upstox-data-client');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// In-memory storage for health status
let healthStatus = {
    status: 'starting',
    uptime: 0,
    startTime: new Date(),
    lastUpdate: new Date(),
    components: {
        upstoxClient: 'initializing',
        websocket: 'disconnected',
        telegram: 'unknown',
        marketMonitor: 'unknown'
    },
    stats: {
        totalCandles: 0,
        alertsSent: 0,
        lastCandleTime: null
    }
};

// Health check endpoint
app.get('/health', (req, res) => {
    const currentTime = new Date();
    healthStatus.uptime = Math.floor((currentTime - healthStatus.startTime) / 1000);
    healthStatus.lastUpdate = currentTime;
    
    res.json({
        service: 'Nifty 50 Alert System',
        status: healthStatus.status,
        uptime: healthStatus.uptime,
        timestamp: currentTime.toISOString(),
        components: healthStatus.components,
        stats: healthStatus.stats,
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            }
        }
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        service: 'Nifty 50 Alert System',
        version: '1.0.0',
        status: healthStatus.status,
        description: 'Real-time Nifty 50 WebSocket client with 5-EMA alert system'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Nifty 50 Alert System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            status: '/status'
        },
        documentation: 'Real-time Nifty 50 Index monitoring with EMA-based alerts'
    });
});

// Start the HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
    healthStatus.status = 'healthy';
    healthStatus.components.upstoxClient = 'ready';
});

// Initialize the Upstox client
let upstoxClient = null;

async function initializeUpstoxClient() {
    try {
        console.log('🚀 Initializing Upstox Data Client...');
        upstoxClient = new UpstoxDataClient();
        
        // Update health status when client starts
        healthStatus.components.upstoxClient = 'running';
        healthStatus.status = 'running';
        
        await upstoxClient.start();
        
        // Monitor the client status
        setInterval(() => {
            if (upstoxClient) {
                // Update health status based on client state
                healthStatus.components.websocket = upstoxClient.isConnected ? 'connected' : 'disconnected';
                healthStatus.components.marketMonitor = 'active';
                healthStatus.components.telegram = 'configured';
            }
        }, 30000); // Check every 30 seconds
        
    } catch (error) {
        console.error('❌ Failed to initialize Upstox client:', error);
        healthStatus.status = 'error';
        healthStatus.components.upstoxClient = 'error';
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    healthStatus.status = 'shutting_down';
    
    server.close(() => {
        console.log('📄 HTTP server closed');
    });
    
    if (upstoxClient) {
        await upstoxClient.stop();
    }
    
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    healthStatus.status = 'shutting_down';
    
    server.close(() => {
        console.log('📄 HTTP server closed');
    });
    
    if (upstoxClient) {
        await upstoxClient.stop();
    }
    
    process.exit(0);
});

// Initialize the client after server starts
setTimeout(initializeUpstoxClient, 1000);

module.exports = app;
