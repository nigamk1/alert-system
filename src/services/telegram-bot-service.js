/**
 * Refactored Telegram Bot Service
 * Clean implementation for sending alerts via Telegram
 */

const https = require('https');
const Logger = require('../utils/logger');

class TelegramBotService {
    constructor(botToken, chatId) {
        this.logger = new Logger('TELEGRAM');
        this.botToken = botToken;
        this.chatId = chatId;
        this.isConfigured = !!(botToken && chatId);
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        
        if (this.isConfigured) {
            this.logger.success('Telegram bot configured successfully');
        } else {
            this.logger.warn('Telegram bot not configured - alerts will be logged only');
        }
    }

    /**
     * Test Telegram connection
     */
    async testConnection() {
        if (!this.isConfigured) {
            this.logger.warn('Cannot test connection - Telegram bot not configured');
            return false;
        }

        try {
            this.logger.info('Testing Telegram connection...');
            const response = await this.makeRequest('getMe');
            
            if (response.ok) {
                this.logger.success(`✅ Connected to Telegram bot: @${response.result.username}`);
                return true;
            } else {
                this.logger.error(`❌ Telegram test failed: ${response.description}`);
                return false;
            }
        } catch (error) {
            this.logger.error('❌ Telegram connection test failed', error);
            return false;
        }
    }

    /**
     * Send alert message
     */
    async sendAlert(alertType, alertData) {
        try {
            const message = this.formatAlertMessage(alertType, alertData);
            
            // Always log the alert locally
            this.logger.alert(`${alertType}: ${alertData.message || JSON.stringify(alertData)}`);
            
            // Send to Telegram if configured
            if (this.isConfigured) {
                return await this.sendMessage(message);
            } else {
                this.logger.debug('Telegram not configured - alert logged only');
                return true;
            }
        } catch (error) {
            this.logger.error('Error sending alert', error);
            return false;
        }
    }

    /**
     * Send a simple message
     */
    async sendMessage(text, options = {}) {
        if (!this.isConfigured) {
            this.logger.warn('Cannot send message - Telegram bot not configured');
            return false;
        }

        const params = {
            chat_id: this.chatId,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            ...options
        };

        return await this.sendWithRetry('sendMessage', params);
    }

    /**
     * Format alert message based on type
     */
    formatAlertMessage(alertType, data) {
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        
        switch (alertType) {
            case 'SYSTEM_STATUS':
                return this.formatSystemStatusAlert(data, timestamp);
            
            case 'EMA_ALERT':
                return this.formatEMAAlert(data, timestamp);
            
            case 'PRICE_ALERT':
                return this.formatPriceAlert(data, timestamp);
            
            case 'ERROR_ALERT':
                return this.formatErrorAlert(data, timestamp);
            
            case 'MARKET_STATUS':
                return this.formatMarketStatusAlert(data, timestamp);
            
            case 'CANDLE_COMPLETE':
                return this.formatCandleAlert(data, timestamp);
            
            default:
                return this.formatGenericAlert(alertType, data, timestamp);
        }
    }

    /**
     * Format system status alert
     */
    formatSystemStatusAlert(data, timestamp) {
        const statusIcon = data.status === 'ONLINE' ? '🟢' : data.status === 'OFFLINE' ? '🔴' : '🟡';
        
        return `${statusIcon} <b>System Status: ${data.status}</b>\n\n` +
               `📝 Message: ${data.message}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Format EMA alert
     */
    formatEMAAlert(data, timestamp) {
        const direction = data.direction === 'ABOVE' ? '⬆️' : '⬇️';
        const alertIcon = data.alertType === 'BULLISH' ? '🟢' : '🔴';
        
        return `${alertIcon} <b>EMA Alert - ${data.alertType}</b>\n\n` +
               `📊 Instrument: ${data.instrument}\n` +
               `💰 Current Price: ₹${data.currentPrice}\n` +
               `📈 EMA(${data.emaPeriod}): ₹${data.emaValue}\n` +
               `${direction} Direction: Price ${data.direction} EMA\n` +
               `🕐 Consecutive Candles: ${data.consecutiveCandles}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Format price alert
     */
    formatPriceAlert(data, timestamp) {
        return `💰 <b>Price Alert</b>\n\n` +
               `📊 Instrument: ${data.instrument}\n` +
               `💵 Price: ₹${data.price}\n` +
               `📝 Message: ${data.message}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Format error alert
     */
    formatErrorAlert(data, timestamp) {
        return `❌ <b>Error Alert</b>\n\n` +
               `🚨 Error: ${data.error}\n` +
               `📝 Details: ${data.details || 'No additional details'}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Format market status alert
     */
    formatMarketStatusAlert(data, timestamp) {
        const statusIcon = data.isOpen ? '🟢' : '🔴';
        
        return `${statusIcon} <b>Market Status: ${data.isOpen ? 'OPEN' : 'CLOSED'}</b>\n\n` +
               `📊 Session: ${data.session}\n` +
               `📝 Message: ${data.message}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Format candle completion alert
     */
    formatCandleAlert(data, timestamp) {
        const priceChange = data.close - data.open;
        const changeIcon = priceChange >= 0 ? '🟢' : '🔴';
        const changePercent = ((priceChange / data.open) * 100).toFixed(2);
        
        return `📊 <b>Candle Completed</b>\n\n` +
               `📈 Instrument: ${data.instrument}\n` +
               `🔵 Open: ₹${data.open}\n` +
               `🔴 Close: ₹${data.close}\n` +
               `⬆️ High: ₹${data.high}\n` +
               `⬇️ Low: ₹${data.low}\n` +
               `${changeIcon} Change: ₹${priceChange.toFixed(2)} (${changePercent}%)\n` +
               `📊 Ticks: ${data.tickCount}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Format generic alert
     */
    formatGenericAlert(alertType, data, timestamp) {
        return `🔔 <b>${alertType}</b>\n\n` +
               `📝 ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n` +
               `⏰ Time: ${timestamp}`;
    }

    /**
     * Make HTTP request to Telegram API with retry logic
     */
    async sendWithRetry(method, params, attempt = 1) {
        try {
            const response = await this.makeRequest(method, params);
            
            if (response.ok) {
                this.logger.debug(`Telegram message sent successfully (attempt ${attempt})`);
                return true;
            } else {
                throw new Error(`Telegram API error: ${response.description}`);
            }
        } catch (error) {
            this.logger.warn(`Telegram send attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < this.retryAttempts) {
                this.logger.info(`Retrying in ${this.retryDelay}ms... (${attempt + 1}/${this.retryAttempts})`);
                await this.sleep(this.retryDelay * attempt); // Exponential backoff
                return await this.sendWithRetry(method, params, attempt + 1);
            } else {
                this.logger.error(`Failed to send Telegram message after ${this.retryAttempts} attempts`);
                return false;
            }
        }
    }

    /**
     * Make HTTP request to Telegram Bot API
     */
    makeRequest(method, params = {}) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(params);
            
            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${this.botToken}/${method}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        resolve(response);
                    } catch (parseError) {
                        reject(new Error(`Invalid JSON response: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get bot information
     */
    async getBotInfo() {
        if (!this.isConfigured) {
            return null;
        }

        try {
            const response = await this.makeRequest('getMe');
            return response.ok ? response.result : null;
        } catch (error) {
            this.logger.error('Error getting bot info', error);
            return null;
        }
    }

    /**
     * Get configuration status
     */
    isReady() {
        return this.isConfigured;
    }

    /**
     * Get configuration summary
     */
    getStatus() {
        return {
            configured: this.isConfigured,
            botToken: this.botToken ? 'Set' : 'Not set',
            chatId: this.chatId ? 'Set' : 'Not set',
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay
        };
    }
}

module.exports = TelegramBotService;
