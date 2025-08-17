// This file checks if all required dependencies and environment variables are set up for deployment
const fs = require('fs');
const path = require('path');

function checkDeploymentReadiness() {
    console.log('🚀 Checking Netlify deployment readiness...\n');
    
    let issues = [];
    let warnings = [];
    
    // Check required files
    const requiredFiles = [
        'netlify.toml',
        'package.json',
        'public/index.html',
        'netlify/functions/upstox-api.js',
        'netlify/functions/background-monitor.js'
    ];
    
    console.log('📁 Checking required files:');
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file}`);
            issues.push(`Missing file: ${file}`);
        }
    });
    
    // Check package.json
    console.log('\n📦 Checking package.json:');
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check required dependencies
        const requiredDeps = ['dotenv', 'ws', 'uuid'];
        requiredDeps.forEach(dep => {
            if (pkg.dependencies && pkg.dependencies[dep]) {
                console.log(`✅ ${dep}: ${pkg.dependencies[dep]}`);
            } else {
                console.log(`❌ ${dep}: missing`);
                issues.push(`Missing dependency: ${dep}`);
            }
        });
        
        // Check Node.js version
        if (pkg.engines && pkg.engines.node) {
            console.log(`✅ Node.js version specified: ${pkg.engines.node}`);
        } else {
            console.log(`⚠️  Node.js version not specified`);
            warnings.push('Consider specifying Node.js version in engines field');
        }
        
    } catch (error) {
        console.log(`❌ Error reading package.json: ${error.message}`);
        issues.push('Invalid package.json file');
    }
    
    // Check environment variables
    console.log('\n🔐 Environment variables needed for deployment:');
    const requiredEnvVars = [
        'UPSTOX_ACCESS_TOKEN',
        'TELEGRAM_BOT_TOKEN', 
        'TELEGRAM_CHAT_ID'
    ];
    
    requiredEnvVars.forEach(envVar => {
        console.log(`📝 ${envVar} - Required for Netlify Environment Variables`);
    });
    
    // Check netlify.toml
    console.log('\n⚙️  Checking netlify.toml:');
    try {
        const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
        if (netlifyConfig.includes('[build]')) {
            console.log('✅ Build configuration found');
        }
        if (netlifyConfig.includes('[functions]')) {
            console.log('✅ Functions configuration found');
        }
        if (netlifyConfig.includes('[[redirects]]')) {
            console.log('✅ Redirect rules found');
        }
    } catch (error) {
        console.log(`❌ Error reading netlify.toml: ${error.message}`);
        issues.push('Invalid netlify.toml file');
    }
    
    // Summary
    console.log('\n📊 Deployment Readiness Summary:');
    console.log('=====================================');
    
    if (issues.length === 0) {
        console.log('🎉 Ready for deployment!');
        console.log('\n📋 Next steps:');
        console.log('1. Push code to GitHub repository');
        console.log('2. Connect repository to Netlify');
        console.log('3. Set environment variables in Netlify dashboard:');
        requiredEnvVars.forEach(envVar => {
            console.log(`   - ${envVar}`);
        });
        console.log('4. Deploy!');
    } else {
        console.log('❌ Issues found that need to be resolved:');
        issues.forEach(issue => {
            console.log(`   - ${issue}`);
        });
    }
    
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(warning => {
            console.log(`   - ${warning}`);
        });
    }
    
    console.log('\n🔗 Useful links:');
    console.log('- Netlify Dashboard: https://app.netlify.com/');
    console.log('- Netlify Functions Docs: https://docs.netlify.com/functions/overview/');
    console.log('- Environment Variables: https://docs.netlify.com/environment-variables/overview/');
    
    return issues.length === 0;
}

if (require.main === module) {
    const isReady = checkDeploymentReadiness();
    process.exit(isReady ? 0 : 1);
}

module.exports = { checkDeploymentReadiness };
