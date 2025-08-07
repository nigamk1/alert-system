# 🚀 Render Deployment Guide

This guide will help you deploy the Upstox Nifty 50 Alert System on Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Upstox Access Token**: Follow [TOKEN_SETUP.md](TOKEN_SETUP.md) to get your token
4. **Telegram Bot**: Set up your Telegram bot for alerts

## Step 1: Prepare Your Repository

1. Ensure all files are committed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. In your Render dashboard, click **"New"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file
4. Click **"Apply"** to create the service

### Option B: Manual Setup

1. In your Render dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `upstox-nifty50-alert-system`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Starter` (Free tier)

## Step 3: Configure Environment Variables

In your Render service dashboard, go to **Environment** tab and add:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Logging level | `info` |
| `UPSTOX_ACCESS_TOKEN` | Your Upstox token | `your_token_here` |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | `123456:ABC...` |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID | `123456789` |

> ⚠️ **Important**: Keep these values secure. Don't commit them to your repository.

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your application
   - Install dependencies
   - Start the service
   - Provide a public URL

## Step 5: Verify Deployment

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **Main Page**: Visit `https://your-app-name.onrender.com/`
3. **Logs**: Check the logs in Render dashboard for any errors

## Expected Behavior

✅ **Successful Deployment**:
```
🚀 Starting Upstox Nifty 50 Real-time Candle Generator
🌐 Health check server running on port 10000
📊 Health check endpoint: http://localhost:10000/health
🔄 Initializing alert system...
⏰ Starting market hours monitoring...
🔍 Checking market status...
📅 Market Status: CLOSED (Next: Mon 09:15)
```

❌ **Common Issues**:
- Missing environment variables
- Invalid Upstox token
- Telegram bot configuration errors

## Features in Production

🔧 **Health Monitoring**:
- Health check endpoint at `/health`
- System status page at `/`
- Automatic restarts on failures

📊 **Market Monitoring**:
- Automatic start/stop based on market hours
- Real-time WebSocket connection to Upstox
- REST API fallback if WebSocket fails

🚨 **Alert System**:
- 5-EMA breakout detection
- Instant Telegram notifications
- Smart alert cooldown (5 minutes)

## Logs and Monitoring

View real-time logs in Render dashboard:
- Application startup
- Market status changes
- WebSocket connections
- Alert notifications
- Error messages

## Scaling Options

**Free Tier Limitations**:
- Service sleeps after 15 minutes of inactivity
- 750 hours per month

**Paid Tiers**:
- Always-on service
- Better performance
- More memory/CPU

## Troubleshooting

### Service Won't Start
1. Check environment variables are set
2. Verify Upstox token is valid
3. Review build logs for errors

### No Alerts Received
1. Verify Telegram bot token
2. Check chat ID is correct
3. Ensure market is open during testing

### WebSocket Connection Failed
1. Check Upstox token permissions
2. Service will fallback to REST API automatically
3. Monitor logs for connection status

## Manual Deployment Commands

If you prefer command-line deployment:

```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Deploy from current directory
render deploy
```

## Environment Variables Security

🔒 **Best Practices**:
- Never commit tokens to Git
- Use Render's environment variable encryption
- Rotate tokens regularly
- Monitor access logs

## Support

For deployment issues:
- Check Render documentation
- Review application logs
- Verify all environment variables
- Test locally first with same configuration

---

**Next Steps**: Once deployed, your Nifty 50 alert system will automatically monitor market hours and send Telegram alerts when breakout conditions are met!
