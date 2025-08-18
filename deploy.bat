@echo off
rem Vercel Deployment Script for Windows
rem Run this script to deploy your application to Vercel

echo 🚀 Starting Vercel Deployment for Nifty 50 Alert System
echo ==================================================

rem Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

echo ✅ Vercel CLI is available

rem Login to Vercel (if not already logged in)
echo 🔐 Checking Vercel authentication...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 📝 Please login to Vercel:
    vercel login
)

echo ✅ Logged in to Vercel

rem Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo 🎉 Deployment completed!
echo.
echo 📱 Your application is now live!
echo 🌐 Visit your dashboard at the URL shown above
echo 📊 Test your API endpoints:
echo    - Health: /api/health
echo    - Nifty Data: /api/nifty-data
echo    - Send Alert: /api/send-alert (POST)
echo.
echo ⚠️  Remember: Vercel functions have limitations for real-time monitoring
echo 💡 Check VERCEL_DEPLOYMENT.md for alternative solutions

pause
