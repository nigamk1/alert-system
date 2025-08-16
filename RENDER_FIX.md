# 🚨 **Render Deployment Fix - Package.json Path Issue**

## 🔍 **Problem Identified**
Render is looking for `package.json` in `/opt/render/project/src/package.json` instead of `/opt/render/project/package.json` (root directory).

This happens because:
1. **Manual service creation** doesn't always respect `render.yaml`
2. **Root directory** is incorrectly set in Render dashboard
3. **Build context** is pointing to wrong directory

## ✅ **Solution Options**

### **Option 1: Delete & Recreate Service (Recommended)**

1. **Delete current Render service**:
   - Go to your Render dashboard
   - Delete the `nifty50-alert-system` service

2. **Use Deploy Button** (this will respect render.yaml):
   
   **👉 [Deploy to Render](https://render.com/deploy?repo=https://github.com/nigamk1/alert-system&branch=alert-code)**

3. **This will automatically configure**:
   - ✅ Correct root directory
   - ✅ Branch: alert-code
   - ✅ Build command: npm install
   - ✅ Start command: npm start

### **Option 2: Fix Current Service Settings**

If you want to keep the current service:

1. **Go to your Render service settings**
2. **Update these settings**:
   ```
   Root Directory: (leave blank or set to ".")
   Build Command: npm install
   Start Command: npm start
   Branch: alert-code
   ```

### **Option 3: Create Render Blueprint**

Create this file in your repository root to force correct configuration:

**File: `render.yaml` (already exists, updated)**
```yaml
services:
  - type: web
    name: nifty50-alert-system
    env: node
    plan: starter
    branch: alert-code
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: UPSTOX_ACCESS_TOKEN
        sync: false
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: TELEGRAM_CHAT_ID
        sync: false
      - key: DEBUG
        value: false
      - key: LOG_LEVEL
        value: info
    autoDeploy: true
```

## 🎯 **Recommended Action: Use Deploy Button**

**👉 [Deploy to Render](https://render.com/deploy?repo=https://github.com/nigamk1/alert-system&branch=alert-code)**

This button will:
1. ✅ Read the `render.yaml` correctly
2. ✅ Set the root directory to repository root
3. ✅ Configure all settings automatically
4. ✅ Connect to the correct branch (alert-code)

## 📋 **Environment Variables to Add**

After deployment, add these in Render dashboard:

**Required:**
```
UPSTOX_ACCESS_TOKEN = your_upstox_access_token_here
```

**Optional:**
```
TELEGRAM_BOT_TOKEN = your_telegram_bot_token_here
TELEGRAM_CHAT_ID = your_telegram_chat_id_here
```

## 🔧 **Verification**

After successful deployment, check:
- ✅ Build logs show: "npm install" runs successfully
- ✅ Service starts with: "npm start"
- ✅ Health check responds at: `/health`
- ✅ Application is accessible

## 📞 **If Issue Persists**

If you still get package.json errors:

1. **Check repository structure** in GitHub:
   - Ensure `package.json` is in repository root
   - Verify branch `alert-code` has all files

2. **Manual service configuration**:
   - Root Directory: (blank)
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Alternative deployment**:
   - Try deploying from `main` branch instead
   - Merge alert-code to main first

---

**🎉 The render.yaml has been fixed. Now use the Deploy to Render button for best results!**
