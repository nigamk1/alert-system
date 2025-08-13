#!/usr/bin/env node

/**
 * Quick setup script for Render deployment
 * Run this before deploying to verify everything is ready
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Render Deployment Setup Check\n');

// Required files for deployment
const requiredFiles = [
    'package.json',
    'server.js',
    'index.js',
    'Dockerfile',
    'render.yaml',
    '.dockerignore',
    'DEPLOYMENT.md'
];

// Required dependencies
const requiredDependencies = [
    'express',
    'ws',
    'uuid',
    'dotenv'
];

// Environment variables needed
const requiredEnvVars = [
    'ACCESS_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID'
];

let allGood = true;

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allGood = false;
    }
});

console.log('\n📦 Checking dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    requiredDependencies.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`✅ ${dep} (${dependencies[dep]})`);
        } else {
            console.log(`❌ ${dep} - MISSING from package.json`);
            allGood = false;
        }
    });
} catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    allGood = false;
}

console.log('\n🔐 Environment Variables Setup:');
console.log('These need to be configured in Render Dashboard:');
requiredEnvVars.forEach(envVar => {
    console.log(`   ${envVar}=your_${envVar.toLowerCase()}_here`);
});

console.log('\n📊 Deployment URLs (after deployment):');
console.log('   Health Check: https://your-app.onrender.com/health');
console.log('   Status: https://your-app.onrender.com/status');
console.log('   Main: https://your-app.onrender.com/');

console.log('\n🎯 Next Steps:');
console.log('1. Push code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Deploy to Render"');
console.log('   git push origin main');
console.log('');
console.log('2. Deploy on Render:');
console.log('   - Go to https://dashboard.render.com/');
console.log('   - Click "New Web Service"');
console.log('   - Connect your GitHub repository');
console.log('   - Configure environment variables');
console.log('');
console.log('3. Set Environment Variables in Render:');
requiredEnvVars.forEach(envVar => {
    console.log(`   ${envVar}=your_actual_value`);
});

if (allGood) {
    console.log('\n🎉 All checks passed! Ready for deployment.');
    console.log('📖 See DEPLOYMENT.md for detailed instructions.');
} else {
    console.log('\n⚠️  Some issues found. Please fix them before deploying.');
}

console.log('\n🔄 Testing locally:');
console.log('   npm test         # Test setup');
console.log('   npm run dev      # Run locally');
console.log('   npm start        # Run production server');

// Check if we can require main modules
console.log('\n🧪 Quick module check...');
try {
    require('./server.js');
    console.log('✅ server.js can be required');
} catch (error) {
    console.log('❌ server.js has issues:', error.message);
}

try {
    const UpstoxDataClient = require('./index.js');
    console.log('✅ index.js (UpstoxDataClient) can be required');
} catch (error) {
    console.log('❌ index.js has issues:', error.message);
}

console.log('\n🚀 Deployment ready! Good luck!');
