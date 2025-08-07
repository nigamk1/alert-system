# Render Deployment Configuration

## Build Command
```
npm install
```

## Start Command
```
npm start
```

## Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
UPSTOX_ACCESS_TOKEN=your_production_upstox_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token  
TELEGRAM_CHAT_ID=your_telegram_chat_id
LOG_LEVEL=info
```

## Port Configuration
- Render automatically assigns a port via PORT environment variable
- Application listens on process.env.PORT || 3000

## Health Check Endpoint
- URL: /health
- Method: GET
- Expected Response: 200 OK

## Auto-Deploy
- Enabled from production branch
- Deploys automatically on git push
