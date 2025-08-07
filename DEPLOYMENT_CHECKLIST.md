# 📋 Render Deployment Checklist

Use this checklist to ensure smooth deployment of your Upstox Nifty 50 Alert System on Render.

## Pre-Deployment Checklist

### ✅ 1. Code Preparation
- [ ] All code committed to GitHub repository
- [ ] No sensitive data (tokens, keys) in code
- [ ] `render.yaml` configuration file present
- [ ] `Dockerfile` present (optional, for containerized deployment)
- [ ] `.renderignore` file configured
- [ ] Health check endpoint implemented (`/health`)

### ✅ 2. Dependencies
- [ ] `package.json` has correct Node.js version specified
- [ ] All required dependencies listed in `package.json`
- [ ] Build and start scripts defined
- [ ] No dev dependencies required in production

### ✅ 3. Environment Variables
- [ ] `UPSTOX_ACCESS_TOKEN` obtained from Upstox Developer Console
- [ ] `TELEGRAM_BOT_TOKEN` obtained from @BotFather
- [ ] `TELEGRAM_CHAT_ID` obtained from @userinfobot
- [ ] All variables documented in deployment guide

### ✅ 4. API Tokens
- [ ] Upstox token is valid and has required permissions
- [ ] Telegram bot is created and token works
- [ ] Chat ID is correct for receiving alerts
- [ ] Tokens tested locally before deployment

## Deployment Steps

### ✅ 1. Render Account Setup
- [ ] Render account created at [render.com](https://render.com)
- [ ] GitHub account connected to Render
- [ ] Repository access granted to Render

### ✅ 2. Service Creation
- [ ] New Web Service created in Render
- [ ] GitHub repository connected
- [ ] Service name: `upstox-nifty50-alert-system`
- [ ] Runtime set to `Node`

### ✅ 3. Configuration
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Auto-Deploy enabled
- [ ] Instance Type selected (Starter for free tier)

### ✅ 4. Environment Variables Setup
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info`
- [ ] `UPSTOX_ACCESS_TOKEN` (your actual token)
- [ ] `TELEGRAM_BOT_TOKEN` (your bot token)
- [ ] `TELEGRAM_CHAT_ID` (your chat ID)

### ✅ 5. Deployment
- [ ] Manual deploy triggered or auto-deploy on push
- [ ] Build logs reviewed for errors
- [ ] Service shows "Live" status
- [ ] Public URL accessible

## Post-Deployment Verification

### ✅ 1. Health Checks
- [ ] Health endpoint responds: `https://your-app.onrender.com/health`
- [ ] Main page loads: `https://your-app.onrender.com/`
- [ ] HTTP status codes are 200
- [ ] JSON response format correct

### ✅ 2. Application Functionality
- [ ] Service starts without errors in logs
- [ ] Market hours monitoring active
- [ ] WebSocket connection attempts logged
- [ ] Fallback to REST API if WebSocket fails

### ✅ 3. Alert System
- [ ] Telegram bot responds to test messages
- [ ] Alert system initializes successfully
- [ ] EMA calculations working
- [ ] Candle generation logged

### ✅ 4. Market Hours Integration
- [ ] Market status detection working
- [ ] Automatic start/stop based on market hours
- [ ] Timezone handling correct for Indian markets
- [ ] Holiday detection active

## Monitoring and Maintenance

### ✅ 1. Regular Checks
- [ ] Service uptime monitoring
- [ ] Log review for errors
- [ ] Memory and CPU usage monitoring
- [ ] Alert frequency verification

### ✅ 2. Token Management
- [ ] Upstox token expiration tracking
- [ ] Automated token refresh setup (if available)
- [ ] Backup token generation procedure
- [ ] Token rotation schedule

### ✅ 3. Performance Optimization
- [ ] Response time monitoring
- [ ] Memory leak detection
- [ ] Connection stability tracking
- [ ] Alert delivery time measurement

## Troubleshooting

### Common Issues and Solutions

#### 🔧 Service Won't Start
- [ ] Check environment variables are set correctly
- [ ] Verify Upstox token format and validity
- [ ] Review build logs for dependency issues
- [ ] Confirm Node.js version compatibility

#### 🔧 No Market Data
- [ ] Verify Upstox token permissions
- [ ] Check market hours and holidays
- [ ] Confirm instrument key format
- [ ] Test API endpoints manually

#### 🔧 No Telegram Alerts
- [ ] Test bot token with Telegram API
- [ ] Verify chat ID format and validity
- [ ] Check alert conditions are met
- [ ] Review cooldown periods

#### 🔧 WebSocket Issues
- [ ] Check Upstox WebSocket endpoint availability
- [ ] Verify authorization headers
- [ ] Confirm subscription message format
- [ ] Monitor connection stability

## Emergency Procedures

### ✅ Service Outage
- [ ] Check Render status page
- [ ] Review recent deployments
- [ ] Restart service manually
- [ ] Escalate to Render support if needed

### ✅ API Limits Exceeded
- [ ] Monitor API usage patterns
- [ ] Implement rate limiting
- [ ] Upgrade Upstox plan if needed
- [ ] Optimize API call frequency

### ✅ Token Expiration
- [ ] Generate new Upstox token
- [ ] Update environment variables
- [ ] Restart service
- [ ] Verify functionality

## Success Metrics

### ✅ Deployment Success
- [ ] Service deployed within 5 minutes
- [ ] Zero deployment errors
- [ ] All health checks passing
- [ ] Public URL responding

### ✅ Operational Success
- [ ] 99%+ uptime during market hours
- [ ] Alert delivery within 30 seconds
- [ ] No missed candle generation
- [ ] Stable WebSocket connections

### ✅ Business Success
- [ ] Accurate EMA calculations
- [ ] Timely breakout alerts
- [ ] No false positives
- [ ] Complete market coverage

---

## Quick Deploy Commands

```bash
# Verify local setup
npm run test

# Check health endpoint locally
npm start
# Visit http://localhost:3000/health

# Deploy to Render (if using CLI)
render deploy

# Check deployment status
render services list
```

## Support Resources

- 📖 [Render Documentation](https://render.com/docs)
- 🤖 [Upstox API Docs](https://upstox.com/developer/api)
- 📱 [Telegram Bot API](https://core.telegram.org/bots/api)
- 🆘 [Project Issues](https://github.com/your-repo/issues)

**Deployment Date**: ___________
**Deployed By**: ___________
**Version**: ___________
**Status**: ⏳ Pending | ✅ Success | ❌ Failed
