// Debug script for Render deployment
console.log('=== RENDER DEPLOYMENT DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);

const fs = require('fs');
const path = require('path');

console.log('\nContents of current directory:');
try {
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => {
        const stats = fs.statSync(file);
        console.log(`${stats.isDirectory() ? 'DIR ' : 'FILE'} ${file}`);
    });
} catch (error) {
    console.error('Error reading directory:', error.message);
}

console.log('\nLooking for package.json:');
const packageJsonPath = path.join(process.cwd(), 'package.json');
console.log('Expected package.json path:', packageJsonPath);
console.log('package.json exists:', fs.existsSync(packageJsonPath));

if (fs.existsSync(packageJsonPath)) {
    console.log('\npackage.json content:');
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log('Name:', packageJson.name);
        console.log('Version:', packageJson.version);
        console.log('Main:', packageJson.main);
        console.log('Scripts:', packageJson.scripts);
    } catch (error) {
        console.error('Error reading package.json:', error.message);
    }
} else {
    console.log('package.json NOT FOUND!');
    console.log('Searching in parent directories...');
    let currentDir = process.cwd();
    for (let i = 0; i < 5; i++) {
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break;
        currentDir = parentDir;
        const pkgPath = path.join(currentDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            console.log(`Found package.json at: ${pkgPath}`);
            break;
        }
    }
}

console.log('\nEnvironment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('PWD:', process.env.PWD);
console.log('=== END DEBUG ===');
