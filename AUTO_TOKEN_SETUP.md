# 🔄 Automatic Token Refresh Setup Guide

## Overview
This guide helps you set up automatic token refresh so you never have to manually update your Upstox access token again!

## 🚀 Quick Setup (Recommended)

### Step 1: Complete Initial Setup
1. Update your Upstox app credentials in `.env`:
   ```env
   UPSTOX_CLIENT_ID=your_actual_client_id_here
   UPSTOX_CLIENT_SECRET=your_actual_client_secret_here
   ```

2. Update `oauth-helper.js` with the same credentials:
   ```javascript
   const CLIENT_ID = 'your_actual_client_id_here';
   const CLIENT_SECRET = 'your_actual_client_secret_here';
   ```

### Step 2: Generate Initial Tokens
Run the enhanced OAuth flow to get both access and refresh tokens:
```bash
npm run get-token
```

This will:
- Open browser for Upstox authorization
- Generate access token AND refresh token
- Save both tokens to your `.env` file automatically

### Step 3: Choose Your Automation Method

#### Option A: Enhanced Application (Best for Development)
Use the enhanced version that automatically refreshes tokens:
```bash
node enhanced-index.js
```

#### Option B: Manual Refresh When Needed
Check and refresh tokens manually:
```bash
npm run refresh-token
```

#### Option C: Windows Task Scheduler (Best for Production)
1. Open Windows Task Scheduler
2. Create a new Basic Task:
   - **Name**: "Upstox Token Refresh"
   - **Trigger**: Daily at 6:00 AM
   - **Action**: Start a program
   - **Program**: `C:\Users\nigkumar\Desktop\Project\Personal\Alert\refresh-token-daily.bat`

## 📋 Available NPM Scripts

```bash
# Start application with auto-refresh
npm run auto-start

# Manual token refresh
npm run refresh-token

# Get initial tokens (interactive)
npm run get-token

# Start normal application
npm start

# Test token validity
npm run diagnose

# Test setup
npm run test-setup
```

## 🔧 How It Works

### Refresh Token Flow
1. **Initial Authorization**: You authorize once and get both access + refresh tokens
2. **Automatic Refresh**: System uses refresh token to get new access tokens
3. **Background Monitoring**: Checks token validity every 22 hours
4. **Seamless Updates**: Updates `.env` file automatically
5. **No Interruption**: Application continues running with new tokens

### Token Expiry Detection
The system detects token expiry through:
- HTTP 401 responses from API calls
- WebSocket connection failures with auth errors
- Scheduled validity checks every 22 hours

## 🛠️ Troubleshooting

### Issue: "Refresh token not found"
**Solution**: Run `npm run get-token` to get both tokens initially

### Issue: "Invalid refresh token"
**Solution**: Refresh tokens also expire (usually after 1 year). Re-authorize with `npm run get-token`

### Issue: "Client authentication failed"
**Solution**: Check your `UPSTOX_CLIENT_ID` and `UPSTOX_CLIENT_SECRET` in `.env`

### Issue: Automatic refresh not working
**Solution**: 
1. Check that refresh token is saved in `.env`
2. Verify client credentials are correct
3. Try manual refresh: `npm run refresh-token`

## 🔒 Security Notes

- Keep your `.env` file secure (already in `.gitignore`)
- Refresh tokens are long-lived but still expire eventually
- Client secret should never be shared
- Regular monitoring ensures tokens stay fresh

## 🎯 Best Practices

1. **For Development**: Use `enhanced-index.js` for automatic handling
2. **For Production**: Set up Windows Task Scheduler for daily refresh
3. **For Monitoring**: Check logs regularly for refresh status
4. **For Backup**: Keep client credentials secure for re-authorization

## 📊 Token Lifecycle

```
Initial Auth → Access Token (24h) + Refresh Token (1 year)
     ↓
Auto Refresh → New Access Token (24h) + New Refresh Token (1 year)
     ↓
Repeat daily automatically
```

## 🆘 Emergency Procedure

If everything fails:
1. Go to [Upstox Developer Console](https://developer.upstox.com/)
2. Run `npm run get-token` for fresh authorization
3. System will be back to automatic mode

---

💡 **Pro Tip**: Once set up correctly, you should never need to manually handle tokens again!
