// auto-token-refresh.js - Automated Upstox Token Refresh System
const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

class AutoTokenRefresh {
    constructor() {
        // Load credentials from environment or config file
        this.clientId = process.env.UPSTOX_CLIENT_ID || '';
        this.clientSecret = process.env.UPSTOX_CLIENT_SECRET || '';
        this.refreshToken = process.env.UPSTOX_REFRESH_TOKEN || '';
        
        if (!this.clientId || !this.clientSecret) {
            console.log('❌ Missing Upstox credentials. Please set UPSTOX_CLIENT_ID and UPSTOX_CLIENT_SECRET in .env');
            process.exit(1);
        }
    }

    async refreshAccessToken() {
        console.log('🔄 Attempting to refresh Upstox access token...');
        
        try {
            const newToken = await this.exchangeRefreshTokenForAccess();
            if (newToken) {
                this.updateEnvFile(newToken.access_token, newToken.refresh_token);
                console.log('✅ Access token refreshed successfully!');
                return newToken.access_token;
            }
        } catch (error) {
            console.log('❌ Token refresh failed:', error.message);
            console.log('💡 You may need to re-authorize the application manually.');
            return null;
        }
    }

    exchangeRefreshTokenForAccess() {
        return new Promise((resolve, reject) => {
            const postData = querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret
            });

            const options = {
                hostname: 'api.upstox.com',
                port: 443,
                path: '/v2/login/authorization/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200 && response.access_token) {
                            console.log('🎉 New token received');
                            console.log('⏰ Expires in:', response.expires_in, 'seconds');
                            resolve(response);
                        } else {
                            reject(new Error(`Token refresh failed: ${response.message || 'Unknown error'}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Network error: ${error.message}`));
            });

            req.write(postData);
            req.end();
        });
    }

    updateEnvFile(accessToken, refreshToken = null) {
        try {
            const envPath = path.join(__dirname, '.env');
            let envContent = '';
            
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
                
                // Update access token
                if (envContent.includes('UPSTOX_ACCESS_TOKEN=')) {
                    envContent = envContent.replace(
                        /UPSTOX_ACCESS_TOKEN=.*/,
                        `UPSTOX_ACCESS_TOKEN=${accessToken}`
                    );
                } else {
                    envContent += `\nUPSTOX_ACCESS_TOKEN=${accessToken}\n`;
                }

                // Update refresh token if provided
                if (refreshToken) {
                    if (envContent.includes('UPSTOX_REFRESH_TOKEN=')) {
                        envContent = envContent.replace(
                            /UPSTOX_REFRESH_TOKEN=.*/,
                            `UPSTOX_REFRESH_TOKEN=${refreshToken}`
                        );
                    } else {
                        envContent += `UPSTOX_REFRESH_TOKEN=${refreshToken}\n`;
                    }
                }
            } else {
                envContent = `UPSTOX_ACCESS_TOKEN=${accessToken}\n`;
                if (refreshToken) {
                    envContent += `UPSTOX_REFRESH_TOKEN=${refreshToken}\n`;
                }
            }
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Updated .env file with new tokens');
            
        } catch (error) {
            console.log('⚠️ Could not update .env file:', error.message);
            console.log('💡 Please manually update your .env file:');
            console.log(`UPSTOX_ACCESS_TOKEN=${accessToken}`);
            if (refreshToken) {
                console.log(`UPSTOX_REFRESH_TOKEN=${refreshToken}`);
            }
        }
    }

    async testTokenValidity(token) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'api.upstox.com',
                port: 443,
                path: '/v2/user/profile',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Api-Version': '2.0',
                    'Accept': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                resolve(res.statusCode === 200);
            });

            req.on('error', () => {
                resolve(false);
            });

            req.setTimeout(5000, () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    async checkAndRefreshIfNeeded() {
        const currentToken = process.env.UPSTOX_ACCESS_TOKEN;
        
        if (!currentToken) {
            console.log('❌ No access token found. Please run initial setup.');
            return false;
        }

        console.log('🔍 Checking current token validity...');
        const isValid = await this.testTokenValidity(currentToken);
        
        if (isValid) {
            console.log('✅ Current token is still valid');
            return true;
        } else {
            console.log('⚠️ Current token is invalid/expired. Refreshing...');
            const newToken = await this.refreshAccessToken();
            return newToken !== null;
        }
    }

    startAutoRefresh() {
        console.log('🚀 Starting automatic token refresh service...');
        console.log('⏰ Will check token validity every 22 hours');
        
        // Check immediately on start
        this.checkAndRefreshIfNeeded();
        
        // Set up automatic refresh every 22 hours (before 24-hour expiry)
        setInterval(async () => {
            console.log('\n⏰ Scheduled token refresh check...');
            await this.checkAndRefreshIfNeeded();
        }, 22 * 60 * 60 * 1000); // 22 hours in milliseconds
    }
}

// Export for use in other modules
module.exports = AutoTokenRefresh;

// Run as standalone script
if (require.main === module) {
    const refresher = new AutoTokenRefresh();
    refresher.checkAndRefreshIfNeeded().then((success) => {
        if (success) {
            console.log('🎉 Token refresh completed successfully!');
        } else {
            console.log('❌ Token refresh failed. Manual intervention required.');
        }
        process.exit(success ? 0 : 1);
    });
}
