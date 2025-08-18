module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const status = {
        service: 'Nifty 50 Alert System',
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            niftyData: '/api/nifty-data',
            sendAlert: '/api/send-alert (POST)'
        },
        configuration: {
            upstoxToken: process.env.UPSTOX_ACCESS_TOKEN ? 'configured' : 'missing',
            telegramBot: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'missing',
            telegramChat: process.env.TELEGRAM_CHAT_ID ? 'configured' : 'missing'
        }
    };

    res.status(200).json(status);
};
