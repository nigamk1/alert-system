# 🔧 Render Build Error Fix

## Error: npm error path /opt/render/project/src/package.json

### Problem
Render can't find `package.json` because it's looking in the wrong directory structure.

### Root Cause
This error typically occurs when:
1. Repository structure is unexpected
2. Build commands are incorrect
3. `render.yaml` configuration conflicts with auto-detection

### Solution 1: Manual Web Service (Recommended)

**DELETE** the `render.yaml` file and create a manual web service:

1. **Go to Render Dashboard** → **"New"** → **"Web Service"**

2. **Connect Repository**: `nigamk1/alert-system`

3. **Configure Settings**:
   ```
   Name: upstox-nifty50-alert-system
   Runtime: Node
   Branch: deploy
   Root Directory: (leave empty)
   Build Command: npm install
   Start Command: npm start
   Plan: Starter (Free)
   ```

4. **Environment Variables**:
   ```
   NODE_ENV=production
   LOG_LEVEL=info
   UPSTOX_ACCESS_TOKEN=your_token_here
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```

5. **Deploy** → Click "Create Web Service"

### Solution 2: Fix package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "build": "npm install"
  }
}
```

### Solution 3: Repository Root Check

Verify your repository structure:
```
alert-system/
├── package.json          ← Must be in root
├── index.js              ← Main application
├── node_modules/         ← Will be created
└── other files...
```

### Expected Successful Build Log

```
==> Cloning from https://github.com/nigamk1/alert-system
==> Checking out commit in branch deploy
==> Using Node.js version 22.16.0
==> Running build command 'npm install'...
npm install
added 3 packages in 2s
==> Build succeeded 🎉
==> Starting service with 'npm start'...
🚀 Starting Upstox Nifty 50 Real-time Candle Generator
🌐 Health check server running on port 10000
```

### Verification Steps

1. **Build Success**: No npm errors in logs
2. **Service Start**: App starts with health server
3. **Health Check**: `https://your-app.onrender.com/health` returns JSON
4. **Main Page**: `https://your-app.onrender.com/` shows status page

### If Still Failing

1. **Check Node.js Version**: Should be 20+ (auto-detected)
2. **Verify Branch**: Using `deploy` branch
3. **Clean Deploy**: Delete service and recreate
4. **Contact Support**: Provide build logs to Render support

### Quick Deploy Checklist

- [ ] `render.yaml` file removed
- [ ] Manual web service created
- [ ] Correct repository and branch selected
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] All environment variables set
- [ ] Service deployed successfully

---

**This fix should resolve the package.json path error!**
