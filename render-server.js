// Render-compatible server for the Upstox Nifty 50 Alert System
// This file serves as the main entry point for both local development and Netlify deployment

const express = require('express');
const path = require('path');
const UpstoxDataClient = require('./index');
const MarketHours = require('./market-hours');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Global variables for tracking the client
let upstoxClient = null;
let isMonitoring = false;
let startTime = null;
let metrics = {
    alertsSent: 0,
    candlesProcessed: 0,
    lastAlert: null,
    errors: 0
};

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        status: isMonitoring ? 'monitoring' : 'stopped',
        uptime: startTime ? Date.now() - startTime : 0,
        metrics,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const marketHours = new MarketHours();
    const isMarketOpen = marketHours.isMarketOpen();
    
    res.json({
        status: 'healthy',
        marketStatus: isMarketOpen ? 'open' : 'closed',
        timestamp: new Date().toISOString(),
        nextMarketOpen: isMarketOpen ? null : marketHours.getNextMarketOpen(),
        systemStatus: {
            monitoring: isMonitoring,
            client: upstoxClient ? 'connected' : 'disconnected'
        }
    });
});

app.post('/api/start', async (req, res) => {
    try {
        if (isMonitoring) {
            return res.json({
                message: 'Already monitoring',
                status: 'running'
            });
        }

        const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
        if (!accessToken) {
            return res.status(400).json({
                error: 'UPSTOX_ACCESS_TOKEN not configured'
            });
        }

        // Check if market is open
        const marketHours = new MarketHours();
        if (!marketHours.isMarketOpen()) {
            return res.json({
                message: 'Market is currently closed',
                status: 'scheduled',
                nextMarketOpen: marketHours.getNextMarketOpen()
            });
        }

        // Start monitoring
        upstoxClient = new UpstoxDataClient(accessToken);
        
        // Set up event listeners for metrics
        upstoxClient.on = upstoxClient.on || function() {}; // Fallback
        
        await upstoxClient.initializeAlertSystem();
        await upstoxClient.connect();
        
        isMonitoring = true;
        startTime = Date.now();
        
        res.json({
            message: 'Monitoring started successfully',
            status: 'monitoring',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        metrics.errors++;
        console.error('Error starting monitoring:', error);
        res.status(500).json({
            error: 'Failed to start monitoring',
            message: error.message
        });
    }
});

app.post('/api/stop', (req, res) => {
    try {
        if (upstoxClient) {
            upstoxClient.disconnect();
            upstoxClient = null;
        }
        
        isMonitoring = false;
        startTime = null;
        
        res.json({
            message: 'Monitoring stopped',
            status: 'stopped',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error stopping monitoring:', error);
        res.status(500).json({
            error: 'Failed to stop monitoring',
            message: error.message
        });
    }
});

app.get('/api/metrics', (req, res) => {
    res.json({
        ...metrics,
        uptime: startTime ? Date.now() - startTime : 0,
        isMonitoring,
        timestamp: new Date().toISOString()
    });
});

// Serve the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (upstoxClient) {
        upstoxClient.disconnect();
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    if (upstoxClient) {
        upstoxClient.disconnect();
    }
    process.exit(0);
});

// Start server only if not in Netlify Functions environment
if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
    app.listen(PORT, () => {
        console.log(`🚀 Upstox Nifty 50 Alert System running on port ${PORT}`);
        console.log(`📊 Dashboard: http://localhost:${PORT}`);
        console.log(`🔗 API Status: http://localhost:${PORT}/api/status`);
        
        // Auto-start monitoring if market is open and token is available
        if (process.env.UPSTOX_ACCESS_TOKEN) {
            const marketHours = new MarketHours();
            if (marketHours.isMarketOpen()) {
                console.log('🔄 Market is open, you can start monitoring via the dashboard or API');
            } else {
                console.log('🕐 Market is closed, monitoring will be available during market hours');
            }
        } else {
            console.log('⚠️  UPSTOX_ACCESS_TOKEN not set - please configure before starting monitoring');
        }
    });
}

// Export for Netlify Functions
module.exports = app;
