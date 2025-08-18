// enhanced-index.js - Main application with automatic token refresh
const UpstoxDataClient = require('./index');
const AutoTokenRefresh = require('./auto-token-refresh');
require('dotenv').config();

class EnhancedUpstoxClient extends UpstoxDataClient {
    constructor(accessToken) {
        super(accessToken);
        this.tokenRefresher = new AutoTokenRefresh();
        this.tokenCheckInterval = null;
    }

    async initialize() {
        console.log('🚀 Starting Enhanced Upstox Client with Auto Token Refresh...');
        
        // Check token validity before starting
        const tokenValid = await this.tokenRefresher.checkAndRefreshIfNeeded();
        if (!tokenValid) {
            console.log('❌ Failed to obtain valid token. Please run manual setup.');
            process.exit(1);
        }

        // Reload environment after potential token refresh
        delete require.cache[require.resolve('dotenv')];
        require('dotenv').config();
        this.accessToken = process.env.UPSTOX_ACCESS_TOKEN;

        // Set up automatic token checking (every 22 hours)
        this.startTokenMonitoring();

        // Initialize alert system
        await this.initializeAlertSystem();
        
        // Start market monitoring
        this.startMarketMonitoring();
    }

    startTokenMonitoring() {
        console.log('⏰ Starting automatic token monitoring...');
        
        // Check token every 22 hours
        this.tokenCheckInterval = setInterval(async () => {
            console.log('\n🔍 Scheduled token validity check...');
            const refreshed = await this.tokenRefresher.checkAndRefreshIfNeeded();
            
            if (refreshed) {
                // Reload environment and update token
                delete require.cache[require.resolve('dotenv')];
                require('dotenv').config();
                this.accessToken = process.env.UPSTOX_ACCESS_TOKEN;
                
                console.log('🔄 Token updated in client - reconnecting...');
                
                // Reconnect with new token if currently connected
                if (this.isConnected) {
                    this.disconnect();
                    setTimeout(() => this.connect(), 2000);
                }
            }
        }, 22 * 60 * 60 * 1000); // 22 hours
    }

    async handleTokenExpiry() {
        console.log('🔄 Detected token expiry - attempting automatic refresh...');
        
        const refreshed = await this.tokenRefresher.checkAndRefreshIfNeeded();
        
        if (refreshed) {
            // Reload environment and update token
            delete require.cache[require.resolve('dotenv')];
            require('dotenv').config();
            this.accessToken = process.env.UPSTOX_ACCESS_TOKEN;
            
            console.log('✅ Token refreshed successfully - reconnecting...');
            
            // Reset reconnection attempts since we have a new token
            this.reconnectAttempts = 0;
            this.useRestFallback = false;
            
            // Reconnect
            setTimeout(() => this.connect(), 2000);
            return true;
        } else {
            console.log('❌ Failed to refresh token automatically');
            return false;
        }
    }

    // Override the error handler to detect token expiry
    onError(error) {
        console.log('❌ WebSocket error:', error.message);
        
        // Check if it's a 401 Unauthorized error (token expired)
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            this.handleTokenExpiry();
        } else {
            // Call original error handler
            super.onError(error);
        }
    }

    // Override close handler to check for auth errors
    onClose(code, reason) {
        console.log(`🔌 WebSocket connection closed. Code: ${code}, Reason: ${reason || 'Unknown'}`);
        this.isConnected = false;
        
        // Check if it's an auth-related closure
        if (code === 1008 || reason?.includes('Unauthorized')) {
            console.log('🔑 Detected authentication error - attempting token refresh...');
            this.handleTokenExpiry();
        } else if (code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
        }
    }

    stop() {
        console.log('🛑 Stopping Enhanced Upstox Client...');
        
        // Clear token monitoring
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
            this.tokenCheckInterval = null;
        }
        
        // Call parent stop method
        this.disconnect();
        
        // Clear market monitoring
        if (this.marketCheckInterval) {
            clearInterval(this.marketCheckInterval);
            this.marketCheckInterval = null;
        }
    }
}

// Main application
async function main() {
    const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
    
    if (!accessToken) {
        console.error('❌ UPSTOX_ACCESS_TOKEN not found in environment variables');
        console.log('💡 Run: npm run get-token');
        process.exit(1);
    }

    const client = new EnhancedUpstoxClient(accessToken);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n⚠️ Received SIGINT. Shutting down gracefully...');
        client.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n⚠️ Received SIGTERM. Shutting down gracefully...');
        client.stop();
        process.exit(0);
    });

    // Initialize and start
    await client.initialize();
}

// Run the application
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Application error:', error);
        process.exit(1);
    });
}

module.exports = EnhancedUpstoxClient;
