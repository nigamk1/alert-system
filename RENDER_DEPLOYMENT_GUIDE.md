# Render Deployment Guide for Upstox Nifty 50 Alert System

## Quick Deployment Steps

### Step 1: Connect GitHub Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select the repository: `nigamk1/alert-system`
5. Select the branch: `render`

### Step 2: Configure Web Service Settings

**Basic Settings:**
- **Name:** `upstox-nifty50-alerts`
- **Environment:** `Node`
- **Region:** Choose closest to you (Oregon, Singapore, Frankfurt, etc.)
- **Branch:** `render`
- **Root Directory:** Leave empty (uses repository root)

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Plan:**
- **Free Plan** (sufficient for testing)
- Can upgrade to **Starter ($7/month)** for production

### Step 3: Set Environment Variables

In the Render dashboard, go to Environment tab and add these variables:

**Required Variables:**
```
NODE_ENV=production
ACCESS_TOKEN=your_upstox_access_token_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

**Optional Variables:**
```
PORT=10000
```
(Note: Render automatically sets PORT, but you can override if needed)

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start the application with `npm start`

## Environment Variables Setup Guide

### 1. Upstox Access Token (`ACCESS_TOKEN`)

1. Log in to [Upstox Developer Console](https://developer.upstox.com/)
2. Create a new app or use existing app
3. Generate access token
4. Copy the token and paste in Render environment variables

### 2. Telegram Bot Token (`TELEGRAM_BOT_TOKEN`)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create a new bot
4. Copy the bot token provided by BotFather
5. Paste in Render environment variables

### 3. Telegram Chat ID (`TELEGRAM_CHAT_ID`)

**Method 1: Using your bot**
1. Send a message to your bot
2. Open: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":CHAT_ID}`
4. Use that chat ID

**Method 2: Using @userinfobot**
1. Search for `@userinfobot` in Telegram
2. Send `/start` command
3. It will reply with your chat ID

## Troubleshooting Common Issues

### Build Failures

**Error: "Cannot find package.json"**
- Solution: Make sure Root Directory is empty in Render settings
- The package.json should be in the repository root

**Error: "npm install failed"**
- Check if all dependencies in package.json are correct
- Try running `npm install` locally first

### Runtime Errors

**Error: "Access token invalid"**
- Regenerate Upstox access token
- Update ACCESS_TOKEN environment variable in Render

**Error: "WebSocket connection failed"**
- Check if Upstox API is accessible from Render servers
- Verify access token permissions

### Application Not Starting

**Check Logs:**
1. Go to Render dashboard
2. Select your service
3. Click on "Logs" tab
4. Look for error messages

**Common fixes:**
- Ensure `npm start` command is correct in package.json
- Check if all environment variables are set
- Verify server.js exports the app correctly

## Monitoring and Maintenance

### Health Checks
- Your app includes a `/health` endpoint
- Render will automatically monitor this endpoint

### Logs
- Access logs from Render dashboard
- Logs include console.log output from your application

### Auto-Deploy
- Render automatically deploys when you push to the `render` branch
- You can disable auto-deploy in settings if needed

### Scaling
- Free plan: Limited resources
- Starter plan ($7/month): Better performance and always-on
- Standard plan ($25/month): High performance

## Post-Deployment Steps

1. **Test the deployment:**
   - Check if the service starts without errors
   - Verify WebSocket connection to Upstox
   - Test Telegram notifications

2. **Monitor the application:**
   - Check logs for any runtime errors
   - Monitor memory and CPU usage
   - Set up alerts for service downtime

3. **Security:**
   - Never commit sensitive tokens to Git
   - Use Render environment variables for all secrets
   - Regularly rotate access tokens

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Review application logs in Render dashboard
3. Test locally first with the same environment variables
4. Check Upstox API status and rate limits

## Useful Commands for Development

```bash
# Test locally with production environment
npm run test:production

# Check deployment readiness
npm run deploy:check

# Test without starting the full application
npm run test:setup
```

---

**Note:** This deployment uses Node.js 22.16.0 (Render default). If you need a specific Node.js version, add a `.nvmrc` file with the version number.
