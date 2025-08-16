/**
 * Application Constants
 * All configuration constants used throughout the application
 */

const INSTRUMENT_KEYS = {
    NIFTY_50: 'NSE_INDEX|Nifty 50',
    NIFTY_BANK: 'NSE_INDEX|Nifty Bank',
    SENSEX: 'BSE_INDEX|SENSEX'
};

const TIMEFRAMES = {
    ONE_MINUTE: 1 * 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    FIFTEEN_MINUTES: 15 * 60 * 1000,
    THIRTY_MINUTES: 30 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000
};

const WEBSOCKET_CONFIG = {
    URL: 'wss://ws-api.upstox.com/v3/feed/market-data-feed',
    API_VERSION: '3.0',
    MAX_RECONNECT_ATTEMPTS: 3,
    RECONNECT_INTERVAL: 5000,
    CONNECTION_TIMEOUT: 10000
};

const MARKET_CONFIG = {
    CHECK_INTERVAL: 60 * 1000, // 1 minute
    POLL_INTERVAL: 5000, // 5 seconds for REST API fallback
    DATA_RETENTION_DAYS: 30
};

const ALERT_CONFIG = {
    COOLDOWN_MINUTES: 5,
    MIN_CONSECUTIVE_CANDLES: 1,
    EMA_PERIOD: 5
};

const FILE_PATHS = {
    CANDLES_CSV: 'nifty50_candles.csv',
    CANDLES_CSV_HEADER: 'timestamp,open,high,low,close,tick_count\n'
};

const TRADING_SESSIONS = {
    EQUITY: {
        preMarket: { start: '09:00', end: '09:15' },
        regular: { start: '09:15', end: '15:30' },
        postMarket: { start: '15:40', end: '16:00' }
    },
    CURRENCY: {
        regular: { start: '09:00', end: '17:00' }
    },
    COMMODITY: {
        regular: { start: '09:00', end: '23:30' }
    }
};

const NSE_HOLIDAYS_2025 = [
    '2025-01-26', // Republic Day
    '2025-03-14', // Holi
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-08-15', // Independence Day
    '2025-10-02', // Gandhi Jayanti
    '2025-11-01', // Diwali Laxmi Puja
    '2025-11-04', // Diwali Balipratipada
    '2025-12-25'  // Christmas
];

const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

const MESSAGE_TYPES = {
    SUBSCRIPTION: 'sub',
    UNSUBSCRIPTION: 'unsub',
    FULL_MODE: 'full',
    LIGHT_MODE: 'light'
};

module.exports = {
    INSTRUMENT_KEYS,
    TIMEFRAMES,
    WEBSOCKET_CONFIG,
    MARKET_CONFIG,
    ALERT_CONFIG,
    FILE_PATHS,
    TRADING_SESSIONS,
    NSE_HOLIDAYS_2025,
    LOG_LEVELS,
    MESSAGE_TYPES
};
