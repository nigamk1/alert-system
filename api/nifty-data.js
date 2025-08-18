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

// Get current Nifty 50 data from Upstox
async function getNiftyData(accessToken) {
    const options = {
        hostname: 'api.upstox.com',
        port: 443,
        path: '/v2/market-quote/quotes?instrument_key=NSE_INDEX|Nifty%2050',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    };

    try {
        const response = await makeRequest(options);
        return response;
    } catch (error) {
        throw new Error(`Failed to fetch Nifty data: ${error.message}`);
    }
}

// Send Telegram alert
async function sendTelegramAlert(botToken, chatId, message) {
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
        throw new Error(`Failed to send Telegram alert: ${error.message}`);
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

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (!accessToken) {
            res.status(500).json({ error: 'UPSTOX_ACCESS_TOKEN not configured' });
            return;
        }

        // Get current Nifty data
        const niftyData = await getNiftyData(accessToken);
        
        if (niftyData.status === 'success' && niftyData.data) {
            const niftyQuote = niftyData.data['NSE_INDEX:Nifty 50'];
            
            if (niftyQuote) {
                const currentPrice = niftyQuote.last_price;
                const change = niftyQuote.net_change;
                const changePercent = niftyQuote.percent_change;
                
                const response = {
                    success: true,
                    timestamp: new Date().toISOString(),
                    data: {
                        symbol: 'Nifty 50',
                        price: currentPrice,
                        change: change,
                        changePercent: changePercent,
                        ohlc: niftyQuote.ohlc
                    }
                };

                // If this is a POST request, send alert
                if (req.method === 'POST' && telegramBotToken && telegramChatId) {
                    const alertMessage = `
🔔 <b>Nifty 50 Alert</b>

💰 <b>Current Price:</b> ₹${currentPrice.toFixed(2)}
📈 <b>Change:</b> ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)

🕐 <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

📊 <b>OHLC:</b>
• Open: ₹${niftyQuote.ohlc.open}
• High: ₹${niftyQuote.ohlc.high}
• Low: ₹${niftyQuote.ohlc.low}
• Close: ₹${niftyQuote.ohlc.close}
                    `;

                    try {
                        await sendTelegramAlert(telegramBotToken, telegramChatId, alertMessage);
                        response.alertSent = true;
                    } catch (alertError) {
                        response.alertError = alertError.message;
                    }
                }

                res.status(200).json(response);
            } else {
                res.status(404).json({ error: 'Nifty 50 data not found' });
            }
        } else {
            res.status(500).json({ error: 'Failed to fetch market data', details: niftyData });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
