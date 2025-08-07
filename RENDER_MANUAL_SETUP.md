# Render Manual Configuration Guide

Since the render.yaml might not be working, configure your Render service manually:

## 🌐 Manual Render Setup

### **Service Settings:**
```
Service Type: Web Service
Name: nifty50-alert-system
Region: Singapore
Branch: production
Root Directory: (leave empty - use repository root)
```

### **Build & Deploy:**
```
Runtime: Node
Node Version: 20.x (latest)
Build Command: npm install
Start Command: npm start
```

### **Environment Variables:**
```
NODE_ENV=production
LOG_LEVEL=info
UPSTOX_ACCESS_TOKEN=your_token_here
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### **Advanced Settings:**
```
Health Check Path: /health
Auto-Deploy: Yes from production branch
```

## 🔧 If Still Having Issues:

1. **Check Repository Access**: Make sure repository is public or Render has access
2. **Verify Branch**: Ensure you're deploying from 'production' branch
3. **Check Build Logs**: Look for specific error messages in Render dashboard
4. **Try Different Region**: Sometimes Singapore region has issues, try Oregon
5. **Contact Render Support**: If repository access issues persist
