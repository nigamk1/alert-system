/**
 * Backward compatibility wrapper for telegram-bot.js
 * Redirects to the new TelegramBotService
 */

const TelegramBotService = require('./src/services/telegram-bot-service');

// Export the new service class with the old name for compatibility
module.exports = TelegramBotService;
