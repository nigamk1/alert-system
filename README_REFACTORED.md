# 🚀 Nifty 50 Real-time Alert System - Refactored

A professional-grade, real-time market data processing and alert system for Nifty 50 Index with EMA-based trading signals via Telegram notifications.

## ✨ Recent Refactoring Improvements

This project has been completely refactored to follow modern software engineering best practices:

### 🏗️ **Clean Architecture**
- **Modular Design**: Code organized into logical modules and services
- **Separation of Concerns**: Each component has a single responsibility
- **Dependency Injection**: Services are loosely coupled and easily testable
- **Configuration Management**: Centralized configuration with environment variables

### 📁 **New Project Structure**
```
src/
├── config/
│   ├── constants.js        # Application constants and enums
│   └── config.js          # Configuration management
├── core/
│   ├── websocket-manager.js    # WebSocket connection handling
│   ├── candle-manager.js       # OHLC candle processing
│   └── market-manager.js       # Market hours and session management
├── services/
│   ├── ema-calculator.js       # Exponential Moving Average calculation
│   ├── telegram-bot-service.js # Telegram notifications
│   └── alert-manager-service.js # EMA-based alert management
├── utils/
│   ├── logger.js              # Professional logging utility
│   ├── file-utils.js          # File operations and CSV management
│   └── datetime-utils.js      # Date/time and market hours utilities
└── upstox-data-client.js      # Main orchestrator class
```

### 🔧 **Key Improvements**

#### **Professional Logging System**
- Color-coded log levels (ERROR, WARN, INFO, DEBUG)
- Contextual logging with module identification
- Emoji-enhanced messages for better readability
- Configurable log levels via environment variables

#### **Robust Error Handling**
- Comprehensive error catching and logging
- Graceful degradation when services fail
- Retry mechanisms with exponential backoff
- Proper cleanup on shutdown

#### **Enhanced Configuration Management**
- Environment variable validation
- Default fallback values
- Type conversion and validation
- Configuration summary display

#### **Improved WebSocket Management**
- Connection state tracking
- Automatic reconnection with exponential backoff
- Ping/pong keep-alive mechanism
- Connection timeout handling

#### **Advanced Candle Processing**
- Memory-efficient tick data storage
- Configurable candle intervals
- Historical data loading for EMA initialization
- CSV data persistence with backup options

#### **Smart Market Hours Handling**
- IST timezone support
- Holiday calendar integration
- Pre/post market session support
- Automatic connection management based on market status

## 🚀 **Getting Started**

### **Installation**
```bash
npm install
```

### **Configuration**
1. Copy `.env.example` to `.env`
2. Configure your environment variables:
```env
# Required
UPSTOX_ACCESS_TOKEN=your_upstox_access_token

# Optional - Telegram Alerts
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Optional - Customization
INSTRUMENT_KEY=NSE_INDEX|Nifty 50
CANDLE_INTERVAL=300000
EMA_PERIOD=5
ALERT_COOLDOWN_MINUTES=5
LOG_LEVEL=info
```

### **Running the Application**
```bash
# Primary method (recommended)
npm start

# Alternative methods
node server.js
node index.js  # Compatibility mode
```

## 📊 **Features**

### **Real-time Data Processing**
- WebSocket connection to Upstox API
- Live tick data processing
- 5-minute OHLC candle generation
- Automatic CSV data logging

### **EMA-Based Alert System**
- Configurable EMA period (default: 5)
- Bullish/Bearish crossover alerts
- Strong momentum alerts for consecutive candles
- Alert cooldown to prevent spam

### **Intelligent Market Hours**
- Automatic market status monitoring
- Connect only during trading hours
- Support for pre/post market sessions
- Holiday calendar integration

### **Professional Telegram Integration**
- Rich formatted messages with emojis
- System status notifications
- Error alerting
- Market status updates
- EMA signal alerts

### **Robust Error Handling**
- Automatic reconnection on failures
- REST API fallback for WebSocket issues
- Comprehensive error logging
- Graceful shutdown handling

## 🔧 **Configuration Options**

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `UPSTOX_ACCESS_TOKEN` | Upstox API access token | - | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - | ❌ |
| `TELEGRAM_CHAT_ID` | Telegram chat ID | - | ❌ |
| `INSTRUMENT_KEY` | Trading instrument | `NSE_INDEX\|Nifty 50` | ❌ |
| `CANDLE_INTERVAL` | Candle interval (ms) | `300000` (5 min) | ❌ |
| `EMA_PERIOD` | EMA calculation period | `5` | ❌ |
| `ALERT_COOLDOWN_MINUTES` | Alert cooldown period | `5` | ❌ |
| `LOG_LEVEL` | Logging level | `info` | ❌ |
| `MAX_RECONNECT_ATTEMPTS` | WebSocket reconnect attempts | `3` | ❌ |

### **Advanced Configuration**
- **Market Type**: Configure for EQUITY, CURRENCY, or COMMODITY markets
- **Multiple Instruments**: Extend to track multiple instruments simultaneously
- **Custom Alert Logic**: Easily modify alert conditions in the alert manager
- **Data Retention**: Configure historical data retention periods

## 🧪 **Testing & Utilities**

All existing test files remain functional with the new architecture:

```bash
# Test setup
npm run test

# Test individual components
node test-websocket.js
node test-telegram.js
node test-market-hours.js

# Diagnostic tools
npm run diagnose
node diagnose.js
```

## 🔄 **Backward Compatibility**

The refactored code maintains full backward compatibility:
- All existing test files work without modification
- Original class interfaces are preserved
- Legacy entry points (`index.js`) continue to function
- Existing configuration files remain valid

## 🚀 **Performance Improvements**

### **Memory Management**
- Efficient tick data storage with automatic cleanup
- Limited array sizes to prevent memory leaks
- Optimized candle data structures

### **Network Optimization**
- Connection pooling and reuse
- Intelligent reconnection strategies
- Bandwidth-efficient data processing

### **CPU Optimization**
- Efficient EMA calculations
- Optimized JSON parsing
- Minimal string operations in hot paths

## 📝 **Development Guidelines**

### **Adding New Features**
1. Create service modules in `src/services/`
2. Add configuration options in `src/config/`
3. Use the logging utility for consistent output
4. Follow the established error handling patterns

### **Code Style**
- Use descriptive variable and function names
- Add JSDoc comments for public methods
- Follow the established module structure
- Use the Logger class for all output

### **Testing**
- Test individual components in isolation
- Use the existing test files as examples
- Add comprehensive error scenario testing

## 🛠️ **Troubleshooting**

### **Common Issues**
1. **WebSocket Connection Fails**: Check network connectivity and access token validity
2. **No Market Data**: Verify market hours and trading holidays
3. **Telegram Alerts Not Working**: Validate bot token and chat ID
4. **EMA Not Calculating**: Ensure sufficient historical data is available

### **Debug Mode**
Enable debug logging for detailed troubleshooting:
```env
LOG_LEVEL=debug
DEBUG=true
```

### **Log Analysis**
The application provides comprehensive logging:
- 🚀 System startup and initialization
- 🔗 Connection status and events
- 📊 Market data processing
- 🚨 Alert generation and delivery
- ❌ Error conditions and recovery

## 📈 **Monitoring & Maintenance**

### **System Health**
- Monitor log output for error patterns
- Check CSV file growth for data continuity
- Verify Telegram alert delivery
- Monitor memory usage during extended runs

### **Data Management**
- Regular CSV file backups
- Log file rotation
- Historical data cleanup
- Performance metrics collection

## 🔮 **Future Enhancements**

The new architecture makes it easy to add:
- Multiple EMA periods and crossover strategies
- Support for additional technical indicators
- Database storage for historical data
- REST API for external integrations
- Web dashboard for monitoring
- Mobile app notifications
- Advanced portfolio management features

## 📞 **Support**

For issues or questions:
1. Check the logs for error details
2. Review the configuration settings
3. Test individual components using the utility scripts
4. Refer to the troubleshooting section

---

**Note**: This refactored version maintains all original functionality while providing a much cleaner, more maintainable, and extensible codebase. The new architecture follows industry best practices and makes the system more reliable and easier to understand.
