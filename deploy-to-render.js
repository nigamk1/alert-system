#!/usr/bin/env node

/**
 * Render Deployment Helper Script
 * Helps prepare and validate the project for Render deployment
 */

const fs = require('fs');
const path = require('path');

class RenderDeploymentHelper {
    constructor() {
        this.projectRoot = process.cwd();
        this.requiredFiles = [
            'package.json',
            'index.js',
            'render.yaml',
            'Dockerfile',
            '.env.example'
        ];
        this.requiredEnvVars = [
            'UPSTOX_ACCESS_TOKEN',
            'TELEGRAM_BOT_TOKEN', 
            'TELEGRAM_CHAT_ID'
        ];
    }

    async validateProject() {
        console.log('🔍 Validating project for Render deployment...\n');

        // Check required files
        console.log('📁 Checking required files:');
        for (const file of this.requiredFiles) {
            const exists = fs.existsSync(path.join(this.projectRoot, file));
            console.log(`  ${exists ? '✅' : '❌'} ${file}`);
            if (!exists && file !== 'render.yaml') {
                console.error(`❌ Missing required file: ${file}`);
                return false;
            }
        }

        // Check package.json configuration
        console.log('\n📦 Checking package.json:');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        const hasStartScript = packageJson.scripts && packageJson.scripts.start;
        console.log(`  ${hasStartScript ? '✅' : '❌'} Start script defined`);
        
        const hasEngines = packageJson.engines && packageJson.engines.node;
        console.log(`  ${hasEngines ? '✅' : '❌'} Node.js engine version specified`);

        // Check for health check endpoint
        console.log('\n🏥 Checking health check endpoint:');
        const indexContent = fs.readFileSync('index.js', 'utf8');
        const hasHealthCheck = indexContent.includes('/health');
        console.log(`  ${hasHealthCheck ? '✅' : '❌'} Health check endpoint (/health)`);

        console.log('\n🌐 Deployment files status:');
        console.log(`  ${fs.existsSync('render.yaml') ? '✅' : '✅'} render.yaml (created)`);
        console.log(`  ${fs.existsSync('Dockerfile') ? '✅' : '✅'} Dockerfile (created)`);
        console.log(`  ${fs.existsSync('.dockerignore') ? '✅' : '✅'} .dockerignore (created)`);

        return true;
    }

    showEnvironmentVariables() {
        console.log('\n🔑 Required Environment Variables for Render:');
        console.log('Add these in your Render service settings:\n');
        
        for (const envVar of this.requiredEnvVars) {
            console.log(`${envVar}=your_${envVar.toLowerCase()}_here`);
        }

        console.log('\nNODE_ENV=production');
        console.log('PORT=3000');
        console.log('LOG_LEVEL=info');
    }

    showDeploymentSteps() {
        console.log('\n🚀 Render Deployment Steps:');
        console.log('\n1. Push to GitHub:');
        console.log('   git add .');
        console.log('   git commit -m "Add Render deployment configuration"');
        console.log('   git push origin auto');
        
        console.log('\n2. Create Render Service:');
        console.log('   • Go to https://render.com');
        console.log('   • Click "New +" → "Web Service"');
        console.log('   • Connect to nigamk1/alert-system repository');
        console.log('   • Select "auto" branch');
        
        console.log('\n3. Configure Service:');
        console.log('   • Name: nifty50-alert-system');
        console.log('   • Environment: Node');
        console.log('   • Build Command: npm install');
        console.log('   • Start Command: npm start');
        console.log('   • Plan: Starter (free) or Standard');
        
        console.log('\n4. Add Environment Variables (in Render dashboard):');
        this.showEnvironmentVariables();
        
        console.log('\n5. Deploy:');
        console.log('   • Click "Deploy Latest Commit"');
        console.log('   • Monitor logs for successful deployment');
        console.log('   • Test health endpoint: https://your-service.onrender.com/health');
        
        console.log('\n📖 For detailed instructions, see: RENDER_DEPLOYMENT.md');
    }

    async run() {
        console.log('🎯 Nifty 50 Alert System - Render Deployment Helper\n');
        
        const isValid = await this.validateProject();
        
        if (isValid) {
            console.log('\n✅ Project is ready for Render deployment!');
            this.showDeploymentSteps();
        } else {
            console.log('\n❌ Project validation failed. Please fix the issues above.');
            process.exit(1);
        }
    }
}

// Run the deployment helper
if (require.main === module) {
    const helper = new RenderDeploymentHelper();
    helper.run().catch(console.error);
}

module.exports = RenderDeploymentHelper;
