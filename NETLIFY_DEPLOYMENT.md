# 🚀 Netlify Deployment Guide

This guide will help you deploy the Upstox Nifty 50 Alert System to Netlify.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Upstox API Credentials**:
   - Access Token (from Upstox Developer Console)
4. **Telegram Bot**:
   - Bot Token (from @BotFather)
   - Chat ID (your Telegram chat ID)

## 🛠️ Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Verify files are present**:
   - ✅ `netlify.toml` (Netlify configuration)
   - ✅ `public/index.html` (Dashboard)
   - ✅ `netlify/functions/` (Serverless functions)
   - ✅ `package.json` (Dependencies)

## 🌐 Step 2: Deploy to Netlify

### Option A: Netlify Dashboard (Recommended)

1. **Login to Netlify**: Go to [app.netlify.com](https://app.netlify.com)

2. **Import from Git**:
   - Click "New site from Git"
   - Choose GitHub
   - Authorize Netlify to access your repositories
   - Select your project repository

3. **Configure Build Settings**:
   - **Branch to deploy**: `main` (or your default branch)
   - **Build command**: `npm install` (auto-detected)
   - **Publish directory**: `public` (auto-detected)
   - **Functions directory**: `netlify/functions` (auto-detected)

4. **Deploy**: Click "Deploy site"

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=public --functions=netlify/functions
```

## 🔐 Step 3: Configure Environment Variables

In your Netlify dashboard:

1. **Go to Site Settings** → **Environment Variables**

2. **Add the following variables**:

   | Variable Name | Description | Example |
   |---------------|-------------|---------|
   | `UPSTOX_ACCESS_TOKEN` | Your Upstox API access token | `abc123...` |
   | `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | `123456:ABC-DEF...` |
   | `TELEGRAM_CHAT_ID` | Your Telegram chat ID | `123456789` |
   | `NODE_ENV` | Environment (optional) | `production` |

3. **Save and redeploy**: Netlify will automatically redeploy when you save environment variables.

## 🧪 Step 4: Test Your Deployment

Once deployed, your site will be available at a URL like `https://amazing-app-123456.netlify.app`

### Test the API endpoints:

1. **Health Check**:
   ```
   GET https://your-site.netlify.app/.netlify/functions/upstox-api/health
   ```

2. **System Status**:
   ```
   GET https://your-site.netlify.app/.netlify/functions/upstox-api/status
   ```

3. **Dashboard**: Visit your main site URL to see the dashboard

## 📊 Step 5: Monitor Your Application

### Netlify Dashboard Features:

1. **Functions Tab**: Monitor serverless function calls and performance
2. **Deploy Log**: Check build and deployment logs
3. **Analytics**: View site traffic and performance
4. **Environment Variables**: Update configuration without redeploying

### Application Monitoring:

1. **Dashboard**: Use the web dashboard to monitor system status
2. **Logs**: Check Netlify function logs for debugging
3. **Alerts**: Telegram notifications will confirm the system is working

## ⚙️ Advanced Configuration

### Custom Domain (Optional)

1. **Add Domain**: In Site Settings → Domain Management
2. **Configure DNS**: Point your domain to Netlify
3. **SSL Certificate**: Automatically provided by Netlify

### Scheduled Functions (Coming Soon)

For continuous monitoring, you can set up scheduled functions:

```javascript
// netlify/functions/scheduled-monitor.js
exports.handler = async (event, context) => {
    // Run monitoring every 5 minutes during market hours
    // This requires Netlify Pro plan for scheduled functions
};
```

### Build Hooks

Set up webhooks to trigger deployments:

1. **Site Settings** → **Build & Deploy** → **Build Hooks**
2. **Create Build Hook**: Name it "Manual Deploy"
3. **Use the URL**: Trigger builds programmatically

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check dependencies in `package.json`
   - Verify Node.js version compatibility
   - Check build logs in Netlify dashboard

2. **Function Errors**:
   - Verify environment variables are set
   - Check function logs in Netlify dashboard
   - Test locally with `netlify dev`

3. **WebSocket Issues**:
   - Note: Serverless functions have time limits
   - Consider using external services for long-running WebSocket connections
   - Use scheduled functions for periodic checks

### Local Development:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run development server
netlify dev

# Test functions locally
netlify functions:serve
```

## 📝 Environment Variables Guide

### Required Variables:

- **UPSTOX_ACCESS_TOKEN**: Get from Upstox Developer Console
- **TELEGRAM_BOT_TOKEN**: Create bot with @BotFather on Telegram  
- **TELEGRAM_CHAT_ID**: Your Telegram user/group ID

### Optional Variables:

- **NODE_ENV**: Set to `production` for production deployment
- **DEBUG**: Set to `true` for detailed logging

## 🎯 Next Steps

1. **Set up monitoring**: Use Netlify Analytics and logs
2. **Configure alerts**: Set up Netlify notifications
3. **Optimize performance**: Monitor function execution times
4. **Scale if needed**: Consider upgrading Netlify plan for higher limits

## 📞 Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Project Issues**: Create an issue in your GitHub repository

---

🎉 **Congratulations!** Your Upstox Nifty 50 Alert System is now deployed on Netlify!
