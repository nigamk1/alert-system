# 🚀 Production Deployment Guide - Render

This guide will help you deploy the Nifty 50 Alert System to Render.com for 24/7 operation.

## 📋 Prerequisites

- ✅ GitHub repository: `https://github.com/nigamk1/alert-system.git`
- ✅ Production branch created
- ✅ Render.com account (free tier available)
- ✅ Upstox API access token
- ✅ Telegram bot configured

## 🌐 Render Deployment Steps

### **Step 1: Connect GitHub Repository**

1. **Login to Render**: Go to [render.com](https://render.com) and sign in
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect Repository**: 
   - Select "Connect a repository"
   - Choose your GitHub account
   - Select `alert-system` repository
   - **Branch**: `production`

### **Step 2: Configure Service Settings**

```yaml
Name: nifty50-alert-system
Region: Singapore (closest to Indian markets)
Branch: production
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free (sufficient for this application)
```

### **Step 3: Set Environment Variables**

In Render dashboard, add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Enables production mode |
| `UPSTOX_ACCESS_TOKEN` | `your_token_here` | Get from Upstox Developer Console |
| `TELEGRAM_BOT_TOKEN` | `your_bot_token` | Get from @BotFather |
| `TELEGRAM_CHAT_ID` | `your_chat_id` | Get from @userinfobot |
| `LOG_LEVEL` | `info` | Logging level |

### **Step 4: Advanced Settings**

```yaml
Health Check Path: /health
Auto-Deploy: Yes
Persistent Disk: 1GB (optional, for CSV storage)
```

## 📊 Service Endpoints

Once deployed, your service will have these endpoints:

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/` | Dashboard | HTML page with service info |
| `/health` | Health check | JSON status for monitoring |
| `/status` | Detailed status | Complete system information |

### **Sample Health Check Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-07T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "service": "Nifty 50 Alert System",
  "version": "1.0.0",
  "alerts": {
    "enabled": true,
    "lastUpdate": "2025-08-07T12:00:00.000Z"
  },
  "data": {
    "isRunning": true,
    "useRestFallback": true,
    "completedCandles": 45
  }
}
```

## 🔧 Production Features

### **Automatic Scaling**
- Service automatically restarts if it crashes
- Render provides 99.9% uptime SLA
- Health checks ensure service availability

### **Monitoring & Logs**
- Real-time logs in Render dashboard
- Health check monitoring
- Performance metrics tracking

### **Security**
- Environment variables securely stored
- HTTPS automatically enabled
- No sensitive data in code repository

## 🚨 Alert System in Production

### **24/7 Operation**
- ✅ Continuous Nifty 50 monitoring
- ✅ Real-time EMA calculations
- ✅ Instant Telegram alerts
- ✅ Automatic fallback to REST API
- ✅ CSV data persistence

### **Market Hours Optimization**
The system runs 24/7 but is most active during:
- **Indian Market Hours**: 9:15 AM - 3:30 PM IST
- **Pre-market**: 9:00 AM - 9:15 AM IST  
- **After-hours**: Limited activity

### **Alert Examples in Production**
```
🚀 NIFTY 50 EMA BREAKOUT ALERT!

📊 Candle Details:
🕐 Time: 07/08/2025, 1:25:00 pm
💰 OHLC: 24400.50 | 24450.75 | 24420.25 | 24445.00
📈 5-EMA: ₹24415.30

✅ Condition Met:
• Candle completely ABOVE 5-EMA
• Distance: +₹4.95 (0.20%)

🔥 Production Status: LIVE
```

## 📈 Performance Specifications

### **Resource Usage**
- **Memory**: ~100-150MB typical
- **CPU**: Low usage (REST API polling)
- **Storage**: ~1MB per trading day (CSV files)
- **Network**: ~5KB per API call (every 5 seconds)

### **Reliability Features**
- **Auto-restart**: Service restarts on failure
- **Graceful shutdown**: Proper cleanup on restart
- **Error recovery**: Automatic reconnection logic
- **Fallback system**: WebSocket → REST API

## 🛠️ Maintenance & Updates

### **Automatic Deployment**
```bash
# Make changes locally
git add .
git commit -m "Production update"
git push origin production

# Render automatically deploys
```

### **Manual Deployment**
In Render dashboard:
1. Go to your service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

### **Monitoring Commands**
```bash
# Check logs
curl https://your-app.onrender.com/health

# Detailed status
curl https://your-app.onrender.com/status

# Dashboard
open https://your-app.onrender.com/
```

## 🔒 Security Best Practices

### **Environment Variables**
- ✅ Never commit API tokens to git
- ✅ Use Render's secure variable storage
- ✅ Rotate tokens periodically
- ✅ Monitor access logs

### **API Security**
- ✅ Upstox token has limited permissions
- ✅ Telegram bot only sends to your chat
- ✅ Health endpoints don't expose sensitive data
- ✅ HTTPS enforced automatically

## 📞 Troubleshooting

### **Common Issues**

| Issue | Solution |
|-------|----------|
| Service won't start | Check environment variables |
| No alerts received | Verify Telegram bot configuration |
| Health check fails | Check Upstox token validity |
| High memory usage | Normal for continuous operation |

### **Debug Commands**
```bash
# Test locally before deployment
npm run test-telegram
npm run diagnose
NODE_ENV=production npm start

# Check production logs
# (Available in Render dashboard)
```

## 💰 Cost Estimation

### **Free Tier (Render)**
- ✅ 750 hours/month free compute
- ✅ Automatic SSL certificates
- ✅ Custom domains
- ✅ Adequate for this application

### **Paid Tier Benefits** (if needed)
- Persistent storage
- More compute hours
- Advanced monitoring
- Priority support

## 🎯 Next Steps

1. **Deploy**: Follow steps above to deploy
2. **Monitor**: Watch logs for first few hours
3. **Test**: Verify alerts during market hours
4. **Optimize**: Adjust settings based on performance
5. **Scale**: Consider paid tier if needed

---

**🚀 Your Nifty 50 Alert System will be running 24/7 in production!**

For support: Check the GitHub repository issues or Render documentation.
