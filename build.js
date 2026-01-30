const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log('🔨 Building Secure Web Application...');

// 1. Build WebAssembly
console.log('📦 Building WebAssembly module...');
try {
    execSync('emcc wasm/calculator.c -Os -s WASM=1 -s SIDE_MODULE=1 -o wasm/calculator.wasm', {
        stdio: 'inherit'
    });
    console.log('✅ WebAssembly built successfully');
} catch (error) {
    console.error('❌ WebAssembly build failed:', error);
    process.exit(1);
}

// 2. Obfuscate JavaScript
console.log('🔒 Obfuscating JavaScript code...');
try {
    const sourceCode = fs.readFileSync('app.js', 'utf-8');
    
    const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: true,
        shuffleStringArray: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayEncoding: ['base64', 'rc4'],
        stringArrayIndexShift: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: true
    });
    
    const obfuscatedCode = obfuscationResult.getObfuscatedCode();
    
    // Đảm bảo thư mục dist tồn tại
    if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
    }
    
    fs.writeFileSync('dist/app.obfuscated.js', obfuscatedCode);
    console.log('✅ JavaScript obfuscated successfully');
    
    // Tạo file stats
    const stats = {
        originalSize: Buffer.byteLength(sourceCode, 'utf-8'),
        obfuscatedSize: Buffer.byteLength(obfuscatedCode, 'utf-8'),
        reduction: ((1 - (Buffer.byteLength(obfuscatedCode, 'utf-8') / 
                     Buffer.byteLength(sourceCode, 'utf-8'))) * 100).toFixed(2),
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('dist/build-stats.json', JSON.stringify(stats, null, 2));
    console.log('📊 Build statistics:', stats);
    
} catch (error) {
    console.error('❌ JavaScript obfuscation failed:', error);
    process.exit(1);
}

// 3. Tạo deployment package
console.log('📦 Creating deployment package...');
try {
    const package = {
        name: 'secure-web-app',
        version: '1.0.0',
        buildDate: new Date().toISOString(),
        features: [
            'JavaScript Obfuscation',
            'WebAssembly Integration',
            'Runtime Security Protection',
            'Anti-Debug Protection',
            'Tamper Detection'
        ]
    };
    
    fs.writeFileSync('dist/deployment-info.json', JSON.stringify(package, null, 2));
    console.log('✅ Deployment package created');
    
} catch (error) {
    console.error('❌ Package creation failed:', error);
}

console.log('🎉 Build completed successfully!');
console.log('📁 Files created in /dist directory');
console.log('🚀 Run: npm start to launch the application');
