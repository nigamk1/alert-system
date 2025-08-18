#!/bin/bash

# Vercel Deployment Script for Nifty 50 Alert System
# Run this script to deploy your application to Vercel

echo "🚀 Starting Vercel Deployment for Nifty 50 Alert System"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is available"

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami 2>/dev/null || {
    echo "📝 Please login to Vercel:"
    vercel login
}

echo "✅ Logged in to Vercel"

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please provide the following environment variables:"

read -p "Enter your Upstox Access Token: " UPSTOX_TOKEN
read -p "Enter your Telegram Bot Token: " TELEGRAM_BOT
read -p "Enter your Telegram Chat ID: " TELEGRAM_CHAT

# Add environment variables to Vercel
vercel env add UPSTOX_ACCESS_TOKEN production <<< "$UPSTOX_TOKEN"
vercel env add TELEGRAM_BOT_TOKEN production <<< "$TELEGRAM_BOT"
vercel env add TELEGRAM_CHAT_ID production <<< "$TELEGRAM_CHAT"
vercel env add NODE_ENV production <<< "production"

echo "✅ Environment variables configured"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment completed!"
echo ""
echo "📱 Your application is now live!"
echo "🌐 Visit your dashboard at the URL shown above"
echo "📊 Test your API endpoints:"
echo "   - Health: /api/health"
echo "   - Nifty Data: /api/nifty-data"
echo "   - Send Alert: /api/send-alert (POST)"
echo ""
echo "⚠️  Remember: Vercel functions have limitations for real-time monitoring"
echo "💡 Check VERCEL_DEPLOYMENT.md for alternative solutions"
