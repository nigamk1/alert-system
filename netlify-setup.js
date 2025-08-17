#!/usr/bin/env node

// Quick setup script for Netlify deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Netlify Deployment Setup Script');
console.log('===================================\n');

// Check if this is a git repository
function checkGitRepo() {
    try {
        execSync('git status', { stdio: 'ignore' });
        console.log('✅ Git repository detected');
        return true;
    } catch (error) {
        console.log('❌ Not a git repository');
        console.log('   Run: git init && git add . && git commit -m "Initial commit"');
        return false;
    }
}

// Check if environment variables file exists
function checkEnvFile() {
    if (fs.existsSync('.env')) {
        console.log('✅ .env file found');
        return true;
    } else if (fs.existsSync('.env.example')) {
        console.log('⚠️  .env.example found but .env missing');
        console.log('   Copy .env.example to .env and fill in your values');
        return false;
    } else {
        console.log('❌ No environment file found');
        return false;
    }
}

// Check if required dependencies are installed
function checkDependencies() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredDeps = ['dotenv', 'ws', 'uuid', 'express'];
        
        let allFound = true;
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
            } else {
                console.log(`❌ Missing dependency: ${dep}`);
                allFound = false;
            }
        });
        
        return allFound;
    } catch (error) {
        console.log('❌ Error reading package.json');
        return false;
    }
}

// Main setup process
async function main() {
    let allGood = true;
    
    console.log('📋 Checking prerequisites:\n');
    
    // Check git repository
    if (!checkGitRepo()) {
        allGood = false;
    }
    
    // Check environment file
    if (!checkEnvFile()) {
        allGood = false;
    }
    
    // Check dependencies
    console.log('\n📦 Checking dependencies:');
    if (!checkDependencies()) {
        allGood = false;
        console.log('\n💡 Run: npm install');
    }
    
    // Run deployment check
    console.log('\n🔍 Running deployment readiness check:');
    try {
        execSync('node deploy-check.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('❌ Deployment check failed');
        allGood = false;
    }
    
    // Summary and next steps
    console.log('\n📊 Setup Summary:');
    console.log('==================');
    
    if (allGood) {
        console.log('🎉 Ready for Netlify deployment!');
        console.log('\n🚀 Next steps:');
        console.log('1. Push your code to GitHub:');
        console.log('   git add .');
        console.log('   git commit -m "Ready for Netlify deployment"');
        console.log('   git push origin main');
        console.log('\n2. Deploy on Netlify:');
        console.log('   - Go to https://app.netlify.com');
        console.log('   - Click "New site from Git"');
        console.log('   - Connect your GitHub repository');
        console.log('   - Configure environment variables');
        console.log('   - Deploy!');
        console.log('\n📖 Detailed guide: See NETLIFY_DEPLOYMENT.md');
    } else {
        console.log('❌ Setup incomplete. Please resolve the issues above.');
    }
    
    console.log('\n🔗 Helpful links:');
    console.log('- Netlify Dashboard: https://app.netlify.com');
    console.log('- Upstox API: https://developer.upstox.com');
    console.log('- Telegram BotFather: https://t.me/BotFather');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
