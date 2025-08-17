// Import required modules for serverless function
const path = require('path');

// Import local modules with proper path resolution
const MarketHours = require('../../market-hours');

// This is a serverless function that handles the Upstox data processing
exports.handler = async (event, context) => {
    // Set up headers for CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Get environment variables
        const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        // Parse the path to determine the endpoint
        const urlPath = event.path.replace('/.netlify/functions/upstox-api', '');
        const endpoint = urlPath.split('/')[1] || 'root';

        console.log(`Processing request for endpoint: ${endpoint}`);

        switch (endpoint) {
            case 'status':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        status: 'operational',
                        environment: 'netlify-serverless',
                        timestamp: new Date().toISOString(),
                        message: 'Upstox Nifty 50 Alert System is running',
                        version: '1.0.0',
                        envCheck: {
                            upstoxToken: !!accessToken,
                            telegramBot: !!telegramBotToken,
                            telegramChat: !!telegramChatId
                        }
                    })
                };

            case 'health':
                const marketHours = new MarketHours();
                const isMarketOpen = marketHours.isMarketOpen();
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        status: 'healthy',
                        marketStatus: isMarketOpen ? 'open' : 'closed',
                        timestamp: new Date().toISOString(),
                        nextMarketOpen: isMarketOpen ? null : marketHours.getNextMarketOpen(),
                        serverless: true,
                        ready: !!(accessToken && telegramBotToken && telegramChatId)
                    })
                };

            case 'start':
                if (event.httpMethod !== 'POST') {
                    return {
                        statusCode: 405,
                        headers,
                        body: JSON.stringify({ error: 'Method not allowed' })
                    };
                }

                if (!accessToken || !telegramBotToken || !telegramChatId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            error: 'Missing required environment variables',
                            required: ['UPSTOX_ACCESS_TOKEN', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
                            present: {
                                upstoxToken: !!accessToken,
                                telegramBot: !!telegramBotToken,
                                telegramChat: !!telegramChatId
                            }
                        })
                    };
                }

                // Check market hours
                const marketCheck = new MarketHours();
                if (!marketCheck.isMarketOpen()) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            message: 'Market is currently closed',
                            status: 'scheduled',
                            timestamp: new Date().toISOString(),
                            nextMarketOpen: marketCheck.getNextMarketOpen(),
                            note: 'Monitoring will activate during market hours'
                        })
                    };
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        message: 'Alert system activation requested',
                        status: 'serverless-mode',
                        timestamp: new Date().toISOString(),
                        note: 'In serverless mode, monitoring runs via scheduled functions',
                        marketStatus: 'open'
                    })
                };

            case 'config':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        platform: 'netlify',
                        runtime: 'serverless',
                        nodeVersion: process.version,
                        environment: process.env.NODE_ENV || 'development',
                        timestamp: new Date().toISOString(),
                        configured: !!(accessToken && telegramBotToken && telegramChatId)
                    })
                };

            default:
                // Default API information
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        name: 'Upstox Nifty 50 Alert System API',
                        version: '1.0.0',
                        platform: 'Netlify Serverless',
                        timestamp: new Date().toISOString(),
                        endpoints: {
                            '/status': 'GET - System operational status',
                            '/health': 'GET - Health check with market status',
                            '/start': 'POST - Request monitoring activation',
                            '/config': 'GET - System configuration info'
                        },
                        documentation: 'https://github.com/yourusername/upstox-nifty50-alerts'
                    })
                };
        }

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                timestamp: new Date().toISOString()
            })
        };
    }
};
