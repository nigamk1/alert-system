## 🚀 **Quick Deployment to Render**

### **Step 1: Make Repository Public**
Your repository is currently private, which is why Render can't access it. 

**Go to this link and make your repository public:**
👉 **[Make Repository Public](https://github.com/nigamk1/alert-system/settings)**

1. Scroll down to "Danger Zone"
2. Click "Change repository visibility" 
3. Select "Make public"
4. Type `alert-system` to confirm
5. Click "I understand, change repository visibility"

### **Step 2: Deploy to Render**
Once the repository is public, use this button to deploy:

**👉 [Deploy to Render](https://render.com/deploy?repo=https://github.com/nigamk1/alert-system&branch=alert-code)**

### **Step 3: Add Environment Variables**
After deployment starts, add these in the Render dashboard:

**Required:**
```
UPSTOX_ACCESS_TOKEN = your_upstox_access_token_here
```

**Optional (for Telegram alerts):**
```
TELEGRAM_BOT_TOKEN = your_telegram_bot_token_here
TELEGRAM_CHAT_ID = your_telegram_chat_id_here
```

### **Alternative: Manual Deployment**
If the deploy button doesn't work:

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service" 
3. Connect GitHub and select `nigamk1/alert-system`
4. Choose `alert-code` branch
5. Render will auto-configure from `render.yaml`
6. Add environment variables
7. Click "Create Web Service"

---

## ✅ **What I Fixed**

1. **Added `branch: alert-code`** to render.yaml
2. **Added `rootDir: .`** to ensure package.json is found in root
3. **Enabled `autoDeploy: true`** for automatic updates
4. **Created deployment instructions** with direct links

The build error was because:
- Render couldn't access your private repository
- It was looking for package.json in the wrong directory

Now everything should work once you make the repository public! 🎉
