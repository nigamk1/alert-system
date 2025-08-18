const https = require('https');

// Utility function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve(jsonData);
                } catch (error) {
                    resolve(responseData);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

// Send Telegram message
async function sendTelegramMessage(botToken, chatId, message) {
    const data = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${botToken}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    try {
        const response = await makeRequest(options, data);
        return response;
    } catch (error) {
        throw new Error(`Failed to send Telegram message: ${error.message}`);
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }

    try {
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (!telegramBotToken || !telegramChatId) {
            res.status(500).json({ 
                error: 'Telegram configuration missing',
                details: 'TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured'
            });
            return;
        }

        const { message, customChatId } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required in request body' });
            return;
        }

        const chatId = customChatId || telegramChatId;
        
        const response = await sendTelegramMessage(telegramBotToken, chatId, message);
        
        if (response.ok) {
            res.status(200).json({
                success: true,
                message: 'Alert sent successfully',
                messageId: response.result.message_id,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Failed to send alert',
                details: response
            });
        }
    } catch (error) {
        console.error('Telegram Alert Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
