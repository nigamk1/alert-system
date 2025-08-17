const UpstoxDataClient = require('../../index');

// This function runs the actual market monitoring
// It can be triggered by Netlify scheduled functions or webhooks
exports.handler = async (event, context) => {
    // Set timeout for serverless function (Netlify functions have a 10-second timeout for free tier)
    context.callbackWaitsForEmptyEventLoop = false;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        console.log('Starting Upstox market monitoring...');
        
        // Get environment variables
        const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
        
        if (!accessToken) {
            throw new Error('UPSTOX_ACCESS_TOKEN is required');
        }

        // Create client instance
        const client = new UpstoxDataClient(accessToken);
        
        // Initialize the alert system
        await client.initializeAlertSystem();
        
        // Check if market is open
        if (!client.marketHours.isMarketOpen()) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Market is currently closed',
                    status: 'skipped',
                    timestamp: new Date().toISOString(),
                    nextMarketOpen: client.marketHours.getNextMarketOpen()
                })
            };
        }

        // For serverless, we'll run a shorter monitoring session
        const monitoringPromise = new Promise((resolve, reject) => {
            let processed = false;
            
            // Set a timeout for the monitoring session
            const timeout = setTimeout(() => {
                if (!processed) {
                    processed = true;
                    client.disconnect();
                    resolve({
                        message: 'Monitoring session completed (timeout)',
                        duration: '8 seconds'
                    });
                }
            }, 8000); // 8 seconds to stay within Netlify limits

            // Handle successful connection and data processing
            client.on = client.on || function() {}; // Fallback if event emitter not set up
            
            // Start the client
            client.connect().then(() => {
                console.log('Client connected successfully');
            }).catch((error) => {
                if (!processed) {
                    processed = true;
                    clearTimeout(timeout);
                    reject(error);
                }
            });
        });

        const result = await monitoringPromise;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'success',
                result,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Background monitoring error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Monitoring failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
