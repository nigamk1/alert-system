# 🚀 Render Deployment Guide for Nifty 50 Alert System

This guide will help you deploy your Nifty 50 Real-time Alert System to Render.com.

## 📋 Prerequisites

- [x] GitHub account
- [x] Render account (free tier available)
- [x] Upstox API access token
- [x] Telegram bot token (optional, for alerts)

## 🔧 Pre-Deployment Setup

### 1. Verify Deployment Readiness
Run the deployment check script to ensure everything is configured correctly:

```bash
npm run deploy-check
```

This will verify:
- ✅ Node.js version compatibility
- ✅ Package.json configuration
- ✅ Required files and directories
- ✅ Environment configuration template

### 2. Push Code to GitHub

1. **Initialize git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nifty 50 Alert System"
   ```

2. **Create GitHub repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `nifty50-alert-system`
   - Don't initialize with README, .gitignore, or license (we already have these)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nifty50-alert-system.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Render Deployment

### Step 1: Create New Web Service

1. **Login to Render**:
   - Go to [render.com](https://render.com)
   - Sign up or login with your GitHub account

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `nifty50-alert-system` repository

### Step 2: Configure Service

1. **Basic Configuration**:
   ```
   Name: nifty50-alert-system
   Environment: Node
   Region: Choose closest to India (Singapore recommended)
   Branch: main
   Root Directory: (leave empty)
   ```

2. **Build & Deploy Settings**:
   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Advanced Settings**:
   ```
   Auto-Deploy: Yes
   Health Check Path: /health
   ```

### Step 3: Environment Variables

Add the following environment variables in Render dashboard:

#### Required Variables:
```
UPSTOX_ACCESS_TOKEN = your_upstox_access_token_here
```

#### Optional Variables (for Telegram alerts):
```
TELEGRAM_BOT_TOKEN = your_telegram_bot_token_here
TELEGRAM_CHAT_ID = your_telegram_chat_id_here
```

#### System Variables (recommended):
```
NODE_ENV = production
LOG_LEVEL = info
DEBUG = false
PORT = 10000
```

#### Trading Configuration (optional):
```
INSTRUMENT_KEY = NSE_INDEX|Nifty 50
CANDLE_INTERVAL = 300000
EMA_PERIOD = 5
ALERT_COOLDOWN_MINUTES = 5
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start the application (`npm start`)

## 📊 Monitoring & Health Checks

### Health Check Endpoints

Your deployed service will have the following endpoints:

- **Health Check**: `https://your-app.onrender.com/health`
  - Returns detailed system status, uptime, and component health
  
- **Status**: `https://your-app.onrender.com/status`
  - Returns basic service information
  
- **Root**: `https://your-app.onrender.com/`
  - Returns API information and available endpoints

### Example Health Check Response:
```json
{
  "service": "Nifty 50 Alert System",
  "status": "running",
  "uptime": 3600,
  "timestamp": "2025-08-16T12:00:00.000Z",
  "components": {
    "upstoxClient": "running",
    "websocket": "connected",
    "telegram": "configured",
    "marketMonitor": "active"
  },
  "stats": {
    "totalCandles": 48,
    "alertsSent": 3,
    "lastCandleTime": "2025-08-16T11:55:00.000Z"
  },
  "environment": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "memory": {
      "used": 45,
      "total": 512
    }
  }
}
```

## 📱 Getting Your Tokens

### Upstox API Token

1. **Login to Upstox Developer Console**:
   - Go to [developer.upstox.com](https://developer.upstox.com)
   - Login with your Upstox credentials

2. **Create API App**:
   - Create a new app
   - Note down your API Key and Secret

3. **Generate Access Token**:
   - Use the OAuth flow to generate access token
   - Or use our helper script: `node oauth-helper.js`

### Telegram Bot Token (Optional)

1. **Create Bot**:
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` and follow instructions
   - Save the bot token

2. **Get Chat ID**:
   - Message [@userinfobot](https://t.me/userinfobot) to get your chat ID
   - Or message your bot and check the logs

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```
   Solution: Check that package.json has correct dependencies
   Run: npm run deploy-check
   ```

2. **Service Won't Start**:
   ```
   Solution: Check environment variables are set correctly
   Verify: UPSTOX_ACCESS_TOKEN is valid
   ```

3. **WebSocket Connection Issues**:
   ```
   Solution: Check Upstox API token permissions
   Verify: Token has market data access
   ```

4. **Health Check Fails**:
   ```
   Solution: Ensure /health endpoint is accessible
   Check: PORT environment variable (should be 10000)
   ```

### Logs and Debugging

1. **View Logs in Render**:
   - Go to your service dashboard
   - Click on "Logs" tab
   - Monitor real-time logs

2. **Debug Mode**:
   - Set `DEBUG=true` in environment variables
   - Set `LOG_LEVEL=debug` for verbose logging

## 📈 Scaling and Performance

### Free Tier Limitations
- ✅ 512 MB RAM
- ✅ 0.1 CPU units
- ✅ 750 hours/month (sufficient for 24/7 operation)
- ⚠️ Service sleeps after 15 minutes of inactivity

### Keeping Service Active
The health check endpoint (`/health`) helps prevent the service from sleeping.
You can set up external monitoring tools to ping the endpoint every 10 minutes.

### Upgrading Plans
For production use, consider upgrading to a paid plan for:
- ✅ No sleep behavior
- ✅ More RAM and CPU
- ✅ Custom domains
- ✅ Better support

## 🔐 Security Best Practices

1. **Environment Variables**:
   - Never commit tokens to git
   - Use Render's environment variable management
   - Rotate tokens regularly

2. **Access Control**:
   - Keep your repository private if possible
   - Limit API token permissions
   - Monitor usage and logs

3. **Updates**:
   - Keep dependencies updated
   - Monitor security advisories
   - Test deployments in staging first

## 📞 Support

### Resources
- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)

### Getting Help
1. Check the logs in Render dashboard
2. Run `npm run deploy-check` locally
3. Test the health check endpoint
4. Review the troubleshooting section above

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created and configured
- [ ] Environment variables set (at minimum UPSTOX_ACCESS_TOKEN)
- [ ] Service deployed successfully
- [ ] Health check endpoint responding
- [ ] WebSocket connection established
- [ ] Market monitoring active
- [ ] Telegram alerts working (if configured)

---

**🎉 Congratulations! Your Nifty 50 Alert System is now running on Render!**

Your application will automatically:
- ✅ Connect to Upstox WebSocket during market hours
- ✅ Process real-time tick data
- ✅ Generate 5-minute OHLC candles
- ✅ Calculate EMA and send alerts
- ✅ Provide health monitoring endpoints
- ✅ Handle graceful shutdowns and restarts
