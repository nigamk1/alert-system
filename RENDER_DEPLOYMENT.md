# 🚀 Render Deployment Guide

This guide will help you deploy the Nifty 50 Alert System to Render.com.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository**: Your code pushed to GitHub (already done: `nigamk1/alert-system`)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Required API Tokens**:
   - Upstox Access Token
   - Telegram Bot Token
   - Telegram Chat ID

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

Your repository is already configured with:
- ✅ `render.yaml` - Render service configuration
- ✅ `Dockerfile` - Container configuration
- ✅ Health check endpoint at `/health`
- ✅ Production-ready `package.json`

### 2. Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Login to Render**: Go to [render.com](https://render.com) and sign in
2. **Create New Service**: Click "New +" → "Web Service"
3. **Connect Repository**: 
   - Connect your GitHub account
   - Select `nigamk1/alert-system` repository
   - Choose branch: `auto` (your current branch)
4. **Configure Service**:
   - **Name**: `nifty50-alert-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose `Starter` (free) or `Standard` for better performance

#### Option B: Using render.yaml (Infrastructure as Code)

1. Push the `render.yaml` file to your repository (already done)
2. In Render Dashboard, use "New +" → "Blueprint"
3. Connect to your repository and Render will automatically detect the configuration

### 3. Configure Environment Variables

In your Render service settings, add these environment variables:

```bash
# Required Environment Variables
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Upstox Configuration
UPSTOX_ACCESS_TOKEN=your_actual_upstox_token_here

# Telegram Configuration  
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_actual_telegram_chat_id_here
```

### 4. Set Up Environment Variables

1. In Render Dashboard → Your Service → "Environment"
2. Add each variable:
   - Click "Add Environment Variable"
   - Enter key and value
   - **Important**: Mark sensitive values (tokens) as "Secret"

### 5. Deploy and Monitor

1. **Deploy**: Click "Deploy Latest Commit" or push to your repository
2. **Monitor Logs**: Check the "Logs" tab for deployment progress
3. **Health Check**: Your service will be available at `https://your-service-name.onrender.com/health`

## 🔍 Verification Steps

After deployment, verify everything is working:

### 1. Check Health Endpoint
```bash
curl https://your-service-name.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Nifty 50 Alert System",
  "timestamp": "2025-08-18T10:30:00.000Z",
  "isConnected": false,
  "isMarketOpen": false,
  "alertSystemReady": true,
  "uptime": 123.45
}
```

### 2. Check Service Logs
- Go to Render Dashboard → Your Service → "Logs"
- Look for these startup messages:
  ```
  🌐 Health check server running on port 3000
  🚨 Alert Manager initialized
  ⏰ Starting market hours monitoring...
  📱 Telegram Bot: Configured
  ```

### 3. Test Telegram Alerts
The system will automatically send a startup message to your Telegram when it initializes successfully.

## 📊 Service Configuration Details

### Health Check
- **Endpoint**: `/health`
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds

### Auto-Deploy
- **Trigger**: Push to `auto` branch
- **Build Time**: ~2-3 minutes
- **Zero Downtime**: Render handles rolling deployments

### Resource Requirements
- **Memory**: 512MB (Starter plan sufficient)
- **CPU**: Shared (adequate for WebSocket connections)
- **Storage**: Ephemeral (CSV files stored temporarily)

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility (>=18.0.0)
   - Verify all dependencies in package.json

2. **Service Won't Start**
   - Check environment variables are set correctly
   - Verify Upstox token is valid and not expired

3. **WebSocket Connection Issues**
   - Render supports WebSocket connections
   - Check if Upstox API is accessible from Render's servers

4. **Telegram Alerts Not Working**
   - Verify bot token and chat ID
   - Ensure bot has permission to send messages

### Log Analysis
Common log messages:
- `✅ Connected to Upstox WebSocket` - WebSocket working
- `🚨 Alert Manager initialized` - Telegram configured
- `⏰ Market is currently CLOSED` - Normal outside market hours
- `📊 Generated 5-min candle` - Data processing working

## 🌐 Service URLs

After deployment, your service will be available at:
- **Health Check**: `https://your-service-name.onrender.com/health`
- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Render Dashboard → Your Service → Metrics

## 📈 Production Considerations

### Performance Optimization
- Service runs 24/7 but only processes data during market hours
- Automatic fallback to REST API if WebSocket fails
- 5-minute alert cooldown prevents spam

### Monitoring
- Health endpoint provides real-time status
- Telegram alerts for system status changes
- CSV data export for historical analysis

### Security
- All sensitive tokens stored as environment variables
- No hardcoded credentials in source code
- HTTPS endpoints only

## 🔄 Continuous Deployment

Your repository is configured for automatic deployment:
1. Push changes to `auto` branch
2. Render automatically builds and deploys
3. Zero-downtime rolling deployment
4. Health checks ensure service stability

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API tokens separately
4. Review this documentation

Your Nifty 50 Alert System is now ready for production deployment on Render! 🚀
