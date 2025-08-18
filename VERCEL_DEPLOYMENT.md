# Deployment Guide for Vercel

## ⚠️ Important Limitations

Your original application is designed for **continuous real-time monitoring** with WebSocket connections, which has limitations on Vercel:

### Vercel Constraints:
- **15-second timeout** for Hobby plans (5 minutes for Pro)
- **No persistent WebSocket connections** in serverless environment
- **No long-running background processes**

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Configure Environment Variables
In your Vercel dashboard or via CLI, set these environment variables:
```bash
vercel env add UPSTOX_ACCESS_TOKEN
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
```

### 4. Deploy to Vercel
```bash
vercel --prod
```

## 📡 Available API Endpoints

After deployment, you'll have these endpoints:

### 1. Health Check
- **URL:** `https://your-domain.vercel.app/api/health`
- **Method:** GET
- **Description:** Check system status and configuration

### 2. Get Nifty Data
- **URL:** `https://your-domain.vercel.app/api/nifty-data`
- **Method:** GET
- **Description:** Fetch current Nifty 50 market data

### 3. Send Alert
- **URL:** `https://your-domain.vercel.app/api/send-alert`
- **Method:** POST
- **Body:**
```json
{
  "message": "Your alert message here"
}
```

### 4. Web Dashboard
- **URL:** `https://your-domain.vercel.app/`
- **Description:** Interactive web interface to test the system

## 🔄 Alternative Solutions for Real-time Monitoring

Since Vercel can't run continuous processes, consider these alternatives:

### Option 1: External Triggers
Use external services to trigger your Vercel functions:
- **GitHub Actions** with cron jobs
- **Zapier** or **IFTTT** webhooks
- **Uptime monitoring** services

### Option 2: Hybrid Architecture
- Keep the **real-time processing** on a VPS/cloud server
- Use **Vercel functions** for alerts and data processing
- Send data from your main server to Vercel endpoints

### Option 3: Other Platforms for Real-time
For continuous WebSocket connections, consider:
- **Railway** (supports long-running processes)
- **Render** (has persistent services)
- **Heroku** (with worker dynos)
- **DigitalOcean App Platform**
- **AWS EC2** or **Google Cloud Compute**

## 📱 Using the Deployed System

### Manual Monitoring
- Visit your web dashboard to manually check Nifty data
- Send test alerts to verify Telegram integration
- Use API endpoints for custom integrations

### Scheduled Checks
Set up external schedulers to call your APIs at regular intervals:

```bash
# Example: Check every 5 minutes during market hours
curl "https://your-domain.vercel.app/api/nifty-data"
```

## 🛠️ Configuration Files Created

The deployment includes these new files:
- `vercel.json` - Vercel configuration
- `api/health.js` - Health check endpoint
- `api/nifty-data.js` - Market data endpoint
- `api/send-alert.js` - Alert sending endpoint
- `index.html` - Web dashboard

## 📊 Next Steps

1. **Deploy to Vercel** using the steps above
2. **Test the web dashboard** to ensure everything works
3. **Set up external monitoring** if you need continuous real-time alerts
4. **Consider hybrid architecture** for the best of both worlds

Your Vercel deployment will provide a solid foundation for market data access and alert sending, even if it can't replace the real-time WebSocket monitoring entirely.
