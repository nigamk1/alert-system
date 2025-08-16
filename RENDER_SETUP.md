# Render Deployment Instructions

## 🚨 **Important: Repository Access Required**

Render needs access to your GitHub repository. Please follow one of these options:

### **Option 1: Make Repository Public (Easiest)**
1. Go to [https://github.com/nigamk1/alert-system/settings](https://github.com/nigamk1/alert-system/settings)
2. Scroll down to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Make public"
5. Confirm by typing the repository name

### **Option 2: Connect Render to GitHub**
1. Go to [Render Dashboard](https://dashboard.render.com/register)
2. Sign up/Login with GitHub
3. Authorize Render to access your repositories
4. Grant access to specific repositories

## 🚀 **Deploy to Render**

### **Automatic Deployment (Recommended)**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/nigamk1/alert-system&branch=alert-code)

### **Manual Deployment**
1. **Create New Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select `nigamk1/alert-system` repository
   - Choose `alert-code` branch

2. **Configuration** (auto-filled from render.yaml):
   ```
   Name: nifty50-alert-system
   Environment: Node
   Branch: alert-code
   Build Command: npm install
   Start Command: npm start
   ```

3. **Add Environment Variables**:
   ```
   UPSTOX_ACCESS_TOKEN = your_upstox_access_token_here
   TELEGRAM_BOT_TOKEN = your_telegram_bot_token_here (optional)
   TELEGRAM_CHAT_ID = your_telegram_chat_id_here (optional)
   ```

4. **Deploy**: Click "Create Web Service"

## 📋 **Environment Variables Required**

### **Mandatory**
- `UPSTOX_ACCESS_TOKEN` - Your Upstox API access token

### **Optional** 
- `TELEGRAM_BOT_TOKEN` - For Telegram alerts
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID

### **Auto-configured**
- `NODE_ENV=production`
- `PORT=10000`
- `DEBUG=false`
- `LOG_LEVEL=info`

## 🔧 **Troubleshooting**

### **"We don't have access to your repo"**
- Make repository public OR connect Render to GitHub

### **"Could not read package.json"**
- Ensure `rootDir: .` is set in render.yaml (already fixed)
- Verify package.json exists in repository root

### **Build fails**
- Check that all dependencies are in package.json
- Verify Node.js version compatibility (>=18.0.0)

## 📊 **Post-Deployment**

Once deployed, your service will be available at:
- **Application**: `https://nifty50-alert-system.onrender.com`
- **Health Check**: `https://nifty50-alert-system.onrender.com/health`
- **Status**: `https://nifty50-alert-system.onrender.com/status`

## 🎯 **Next Steps**

1. **Fix Repository Access** (choose Option 1 or 2 above)
2. **Deploy to Render** using the Deploy button or manual steps
3. **Add Environment Variables** in Render dashboard
4. **Monitor Deployment** in Render logs
5. **Test Health Endpoints** once deployed
