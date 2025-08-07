# 🚀 Render Deployment Guide (Updated)

This guide will help you deploy the Upstox Nifty 50 Alert System on Render without using render.yaml.

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
   git push origin deploy
   ```

## Step 2: Deploy on Render (Manual Setup)

### Create New Web Service

1. In your Render dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository (`nigamk1/alert-system`)
3. Select branch: **"deploy"**
4. Configure the service:

   **Basic Settings:**
   - **Name**: `upstox-nifty50-alert-system`
   - **Runtime**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `deploy`

   **Build & Deploy:**
   - **Root Directory**: *(leave empty)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Plan:**
   - **Instance Type**: `Starter` (Free tier)

## Step 3: Configure Environment Variables

In your Render service dashboard, go to **Environment** tab and add:

| Variable Name | Value | Required |
|---------------|-------|----------|
| `NODE_ENV` | `production` | ✅ |
| `LOG_LEVEL` | `info` | ✅ |
| `UPSTOX_ACCESS_TOKEN` | `your_actual_token_here` | ✅ |
| `TELEGRAM_BOT_TOKEN` | `your_bot_token_here` | ✅ |
| `TELEGRAM_CHAT_ID` | `your_chat_id_here` | ✅ |

> ⚠️ **Important**: Don't include quotes around the values. Paste the actual tokens.

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Check logs for any errors

## Step 5: Verify Deployment

### Health Check
Visit: `https://your-service-name.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-07T10:45:00.000Z",
  "uptime": 120,
  "memory": {...},
  "environment": "production"
}
```

### Main Page
Visit: `https://your-service-name.onrender.com/`

Should show the application status page.

## Expected Build Output

```
==> Cloning from https://github.com/nigamk1/alert-system
==> Checking out commit in branch deploy
==> Using Node.js version 22.16.0
==> Running build command 'npm install'...
npm install
added X packages from Y contributors and audited Z packages in Xs
found 0 vulnerabilities
==> Build succeeded 🎉
==> Starting service with 'npm start'...
🚀 Starting Upstox Nifty 50 Real-time Candle Generator
🌐 Health check server running on port 10000
```

## Troubleshooting

### Build Fails
1. **Check Node.js version**: Should be 20+ (specified in package.json)
2. **Verify dependencies**: All packages should be in dependencies, not devDependencies
3. **Check build logs**: Look for specific error messages

### Service Won't Start
1. **Environment variables**: Ensure all required vars are set
2. **Port configuration**: App should use `process.env.PORT`
3. **Dependencies**: Check if all runtime dependencies are installed

### No Health Response
1. **Check service URL**: Should be `https://your-app.onrender.com`
2. **Wait for deployment**: Initial deployment can take 2-3 minutes
3. **Check logs**: Look for startup errors

## Manual Deployment Alternative

If web interface doesn't work, use Render CLI:

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Create service
render services create

# Deploy
render deploy
```

## Configuration Files

The following files support deployment:

1. **`package.json`** - Build and start scripts
2. **`Dockerfile`** - Container configuration (optional)
3. **`.renderignore`** - Files to exclude
4. **`.env.production`** - Environment template

## Important Notes

### Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- 750 hours per month limit
- Cold start delay when waking up

### Production Optimizations
- Service auto-restarts on crashes
- Health check monitors uptime
- Market hours detection prevents unnecessary usage

### Security
- Never commit tokens to Git
- Use Render's encrypted environment variables
- Rotate tokens regularly

## Support

If deployment fails:
1. Check this troubleshooting guide
2. Review Render build logs
3. Verify all environment variables
4. Test locally with same configuration

---

**Deployment Status**: Ready for manual setup
**Estimated Deploy Time**: 3-5 minutes
**Health Check**: `/health` endpoint

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
