#!/bin/bash

# Build verification script for Render deployment
echo "🔍 Verifying deployment setup..."
echo "📁 Current directory: $(pwd)"
echo "📋 Contents:"
ls -la

echo ""
echo "📦 Checking package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "📝 Package name: $(node -p "require('./package.json').name")"
    echo "📝 Package version: $(node -p "require('./package.json').version")"
else
    echo "❌ package.json NOT found"
    exit 1
fi

echo ""
echo "📦 Checking Node.js version..."
echo "🚀 Node.js: $(node --version)"
echo "📦 NPM: $(npm --version)"

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "✅ Build verification complete!"
echo "🚀 Ready to start application..."
