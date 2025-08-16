/**
 * Deployment verification script for Render
 * Checks all dependencies, configuration, and system requirements
 */

const fs = require('fs');
const path = require('path');

class DeploymentChecker {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.checks = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '✅',
            'warn': '⚠️',
            'error': '❌',
            'success': '🎉'
        }[type] || 'ℹ️';
        
        console.log(`${timestamp} ${prefix} ${message}`);
        
        if (type === 'error') this.errors.push(message);
        if (type === 'warn') this.warnings.push(message);
        this.checks.push({ type, message, timestamp });
    }

    checkNodeVersion() {
        this.log('Checking Node.js version...');
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion >= 18) {
            this.log(`Node.js version ${nodeVersion} is compatible`, 'success');
        } else {
            this.log(`Node.js version ${nodeVersion} is too old. Minimum required: 18.0.0`, 'error');
        }
    }

    checkPackageJson() {
        this.log('Checking package.json...');
        
        try {
            const packagePath = path.join(__dirname, 'package.json');
            if (!fs.existsSync(packagePath)) {
                this.log('package.json not found', 'error');
                return;
            }
            
            const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Check main entry point
            if (packageContent.main === 'render-server.js') {
                this.log('Main entry point is correctly set to render-server.js for Render deployment', 'success');
            } else if (packageContent.main === 'server.js') {
                this.log('Main entry point is server.js (good for local development)', 'info');
            } else {
                this.log(`Main entry point is ${packageContent.main}, should be render-server.js for deployment`, 'warn');
            }
            
            // Check engines
            if (packageContent.engines && packageContent.engines.node) {
                this.log(`Node.js engine constraint: ${packageContent.engines.node}`, 'info');
            } else {
                this.log('No Node.js engine constraint specified', 'warn');
            }
            
            // Check scripts
            const requiredScripts = ['start', 'build'];
            requiredScripts.forEach(script => {
                if (packageContent.scripts && packageContent.scripts[script]) {
                    this.log(`Script '${script}' is defined: ${packageContent.scripts[script]}`, 'success');
                } else {
                    this.log(`Required script '${script}' is missing`, 'error');
                }
            });
            
            // Check dependencies
            const requiredDeps = ['dotenv', 'ws', 'uuid', 'express'];
            requiredDeps.forEach(dep => {
                if (packageContent.dependencies && packageContent.dependencies[dep]) {
                    this.log(`Dependency '${dep}' is present: ${packageContent.dependencies[dep]}`, 'success');
                } else {
                    this.log(`Required dependency '${dep}' is missing`, 'error');
                }
            });
            
        } catch (error) {
            this.log(`Error reading package.json: ${error.message}`, 'error');
        }
    }

    checkMainFiles() {
        this.log('Checking main application files...');
        
        const requiredFiles = [
            'server.js',
            'render-server.js',
            'src/upstox-data-client.js',
            'src/config/config.js',
            'src/utils/logger.js'
        ];
        
        requiredFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                this.log(`File '${file}' exists`, 'success');
            } else {
                this.log(`Required file '${file}' is missing`, 'error');
            }
        });
    }

    checkEnvironmentTemplate() {
        this.log('Checking environment configuration...');
        
        const envExamplePath = path.join(__dirname, '.env.example');
        const envPath = path.join(__dirname, '.env');
        
        if (fs.existsSync(envExamplePath)) {
            this.log('.env.example file exists', 'success');
        } else {
            this.log('.env.example file is missing', 'warn');
        }
        
        if (fs.existsSync(envPath)) {
            this.log('.env file exists (for local development)', 'info');
        } else {
            this.log('.env file not found (normal for production)', 'info');
        }
    }

    checkRenderConfiguration() {
        this.log('Checking Render deployment configuration...');
        
        const renderYamlPath = path.join(__dirname, 'render.yaml');
        if (fs.existsSync(renderYamlPath)) {
            this.log('render.yaml configuration file exists', 'success');
        } else {
            this.log('render.yaml configuration file is missing', 'error');
        }
        
        // Check if render-server.js exists
        const renderServerPath = path.join(__dirname, 'render-server.js');
        if (fs.existsSync(renderServerPath)) {
            this.log('render-server.js exists for health checks', 'success');
        } else {
            this.log('render-server.js is missing', 'error');
        }
    }

    checkDirectoryStructure() {
        this.log('Checking directory structure...');
        
        const requiredDirs = [
            'src',
            'src/config',
            'src/core',
            'src/services',
            'src/utils'
        ];
        
        requiredDirs.forEach(dir => {
            const dirPath = path.join(__dirname, dir);
            if (fs.existsSync(dirPath)) {
                this.log(`Directory '${dir}' exists`, 'success');
            } else {
                this.log(`Required directory '${dir}' is missing`, 'error');
            }
        });
    }

    checkGitIgnore() {
        this.log('Checking .gitignore...');
        
        const gitignorePath = path.join(__dirname, '.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const content = fs.readFileSync(gitignorePath, 'utf8');
            
            const requiredEntries = ['.env', 'node_modules', '*.log'];
            const missingEntries = requiredEntries.filter(entry => !content.includes(entry));
            
            if (missingEntries.length === 0) {
                this.log('.gitignore contains all required entries', 'success');
            } else {
                this.log(`Missing entries in .gitignore: ${missingEntries.join(', ')}`, 'warn');
            }
        } else {
            this.log('.gitignore file is missing', 'warn');
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 DEPLOYMENT READINESS REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Successful checks: ${this.checks.filter(c => c.type === 'success').length}`);
        console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
        console.log(`   ❌ Errors: ${this.errors.length}`);
        
        if (this.errors.length > 0) {
            console.log(`\n❌ ERRORS THAT MUST BE FIXED:`);
            this.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (recommended to fix):`);
            this.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }
        
        console.log('\n🚀 DEPLOYMENT INSTRUCTIONS:');
        console.log('1. Push this code to your Git repository');
        console.log('2. Connect your repository to Render');
        console.log('3. Configure environment variables in Render dashboard:');
        console.log('   - UPSTOX_ACCESS_TOKEN (required)');
        console.log('   - TELEGRAM_BOT_TOKEN (optional)');
        console.log('   - TELEGRAM_CHAT_ID (optional)');
        console.log('4. Deploy using render.yaml configuration');
        
        if (this.errors.length === 0) {
            console.log('\n🎉 READY FOR DEPLOYMENT!');
            return true;
        } else {
            console.log('\n❌ FIX ERRORS BEFORE DEPLOYMENT');
            return false;
        }
    }

    async run() {
        console.log('🔍 Starting deployment readiness check...\n');
        
        this.checkNodeVersion();
        this.checkPackageJson();
        this.checkMainFiles();
        this.checkDirectoryStructure();
        this.checkEnvironmentTemplate();
        this.checkRenderConfiguration();
        this.checkGitIgnore();
        
        return this.generateReport();
    }
}

// Run the deployment check
if (require.main === module) {
    const checker = new DeploymentChecker();
    checker.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = DeploymentChecker;
