# 🚀 Render Deployment Guide for Upstox Nifty 50 Alert System

This guide will help you deploy your Upstox Nifty 50 real-time alert system to Render cloud platform.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Upstox Account & API Access**
   - Upstox Developer Account
   - API Key and Secret
   - Valid Access Token (you'll need to regenerate this daily)

2. **Telegram Bot Setup**
   - Telegram Bot Token (from @BotFather)
   - Chat ID where alerts will be sent

3. **GitHub Repository**
   - Your code pushed to GitHub (recommended)
   - Or you can deploy directly from local Git

## 🎯 Deployment Options

### Option 1: GitHub Auto-Deploy (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New Web Service"
   - Connect your GitHub repository
   - Select this repository

### Option 2: Manual Deployment

1. **Upload Code**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New Web Service"
   - Choose "Deploy an existing image" or "Upload from Git"

### Option 3: Infrastructure as Code (Using render.yaml)

The `render.yaml` file in your project will automatically configure the deployment.

## ⚙️ Render Configuration

### Basic Settings
- **Name**: `upstox-nifty50-alerts`
- **Environment**: `Node`
- **Region**: `Oregon` (or choose closest to your location)
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables

Set these in Render Dashboard → Service → Environment:

#### Required Variables
```
ACCESS_TOKEN=your_upstox_access_token_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

#### Optional Variables
```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### Advanced Settings
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes`
- **Plan**: `Free` (upgrade to Starter for better performance)

## 🔐 Setting Up Environment Variables

### 1. Upstox Access Token
```bash
# Get your token using the oauth helper
node oauth-helper.js
```
**Important**: Upstox access tokens expire daily. You'll need to update this regularly.

### 2. Telegram Bot Token
1. Message @BotFather on Telegram
2. Create a new bot: `/newbot`
3. Copy the bot token

### 3. Telegram Chat ID
```bash
# Run locally to get your chat ID
node setup-telegram.js
```

## 📊 Deployment Steps

### Step 1: Prepare Your Code
```bash
# Make sure all dependencies are installed
npm install

# Test locally before deploying
npm test
```

### Step 2: Deploy to Render

#### Using GitHub (Recommended):
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New Web Service"
3. Connect GitHub and select your repository
4. Configure settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check**: `/health`

#### Using render.yaml:
1. The render.yaml file will automatically configure your service
2. Just connect your repository and Render will use the YAML config

### Step 3: Configure Environment Variables
In Render Dashboard → Your Service → Environment:
```
ACCESS_TOKEN=your_upstox_access_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
NODE_ENV=production
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (usually 2-5 minutes)
3. Check the service URL for health status

## 🔍 Monitoring & Maintenance

### Health Checks
Your app provides several endpoints:
- `https://your-app.onrender.com/` - Basic status
- `https://your-app.onrender.com/health` - Health check
- `https://your-app.onrender.com/status` - Detailed status

### Logs
Monitor your app in Render Dashboard → Logs section:
- Real-time log streaming
- Error notifications
- Performance metrics

### Daily Token Refresh
**Important**: Upstox access tokens expire daily.

#### Automated Token Refresh (Advanced)
You can set up a scheduled job to refresh tokens:
1. Use GitHub Actions with cron schedule
2. Update environment variables via Render API
3. Restart the service automatically

#### Manual Token Refresh
1. Generate new token: `node oauth-helper.js`
2. Update ACCESS_TOKEN in Render Dashboard
3. Service will automatically restart

## 🛠️ Troubleshooting

### Common Issues

#### 1. Service Won't Start
```bash
# Check logs in Render Dashboard
# Verify environment variables are set
# Ensure all dependencies are in package.json
```

#### 2. WebSocket Connection Fails
```bash
# Check if ACCESS_TOKEN is valid
# Verify Upstox API access
# Check firewall/network restrictions
```

#### 3. Telegram Alerts Not Working
```bash
# Verify TELEGRAM_BOT_TOKEN
# Check TELEGRAM_CHAT_ID
# Ensure bot has permission to send messages
```

### Debug Commands
Use these locally before deploying:
```bash
npm run test          # Test setup
npm run diagnose      # Diagnose issues
npm run setup-check   # Check configuration
```

## 💰 Cost Optimization

### Free Tier Limitations
- 750 hours/month (sufficient for continuous running)
- Service sleeps after 15 minutes of inactivity
- Slower cold starts

### Upgrading Plans
- **Starter ($7/month)**: No sleep, faster performance
- **Standard ($25/month)**: More resources, better reliability

### Tips to Optimize
1. Use health checks to prevent sleeping
2. Implement proper error handling
3. Use efficient WebSocket reconnection logic
4. Monitor resource usage

## 🔄 CI/CD Setup

### Automatic Deployment
With GitHub integration:
1. Push to main branch → Auto-deploy
2. Pull request → Review app (optional)
3. Environment-specific deployments

### Pre-deployment Checks
Add to your workflow:
```bash
# Run tests before deploy
npm test

# Validate environment
node test-setup.js

# Check Upstox connection
node diagnose.js
```

## 📈 Performance Monitoring

### Render Built-in Metrics
- CPU usage
- Memory consumption
- Response times
- Error rates

### Application Metrics
Your app logs important metrics:
- WebSocket connection status
- Market hours tracking
- Alert frequency
- EMA calculations

## 🔧 Production Optimizations

### 1. Graceful Shutdown
The server.js handles:
- SIGTERM signals
- WebSocket cleanup
- Data persistence

### 2. Error Recovery
- Automatic WebSocket reconnection
- Fallback to REST API
- Telegram notification retries

### 3. Resource Management
- Memory-efficient tick processing
- Proper event listener cleanup
- CSV file rotation (optional)

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Upstox API Documentation](https://upstox.com/developer/api)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🎉 Success Checklist

- [ ] Code deployed successfully
- [ ] Environment variables configured
- [ ] Health check endpoint responding
- [ ] WebSocket connection established
- [ ] Telegram alerts working
- [ ] Market hours detection active
- [ ] EMA calculations running
- [ ] CSV data being generated

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test components locally
4. Review Upstox API status

Your Upstox Nifty 50 Alert System is now ready for production! 🚀
