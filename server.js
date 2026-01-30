const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Security middleware
app.use((req, res, next) => {
    // Anti-tampering headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // CORS với hạn chế
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + PORT);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    next();
});

// API endpoint để nhận báo cáo bảo mật
app.post('/api/security/report', (req, res) => {
    try {
        const encryptedData = req.body.data;
        const decodedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
        const report = JSON.parse(decodedData);
        
        console.log('🔐 Security Report Received:', {
            type: report.type,
            timestamp: new Date(report.timestamp).toISOString(),
            userAgent: report.userAgent.substring(0, 50) + '...',
            checks: report.checks
        });
        
        // Log vào file (trong production)
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            ...report
        };
        
        // Ở đây có thể lưu vào database hoặc file log
        console.log('📝 Security Log:', JSON.stringify(logEntry, null, 2));
        
        res.json({ 
            status: 'success', 
            message: 'Report received',
            receivedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing security report:', error);
        res.status(400).json({ 
            status: 'error', 
            message: 'Invalid report data' 
        });
    }
});

// API endpoint cho tính toán server-side (bổ sung)
app.post('/api/calculate/secure', (req, res) => {
    try {
        const { a, b, operation, token } = req.body;
        
        // Xác thực token
        if (!this.validateToken(token)) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Validate input
        if (typeof a !== 'number' || typeof b !== 'number') {
            return res.status(400).json({ error: 'Invalid input' });
        }
        
        let result;
        switch(operation) {
            case 'add':
                result = a + b;
                break;
            case 'subtract':
                result = a - b;
                break;
            case 'multiply':
                result = a * b;
                break;
            case 'divide':
                if (b === 0) {
                    return res.status(400).json({ error: 'Division by zero' });
                }
                result = a / b;
                break;
            default:
                return res.status(400).json({ error: 'Invalid operation' });
        }
        
        // Tạo signature để client verify
        const signature = this.createSignature(result.toString());
        
        res.json({
            result: result,
            signature: signature,
            processedAt: new Date().toISOString(),
            processor: 'Server-Side'
        });
    } catch (error) {
        console.error('Calculation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Hàm xác thực token (đơn giản)
validateToken(token) {
    // Trong thực tế, dùng JWT hoặc session-based authentication
    const expectedToken = crypto.createHash('sha256')
        .update('secure-calc-' + new Date().toISOString().split('T')[0])
        .digest('hex');
    
    return token === expectedToken;
}

// Hàm tạo signature
createSignature(data) {
    const secret = process.env.SECRET_KEY || 'development-secret';
    return crypto.createHmac('sha256', secret)
        .update(data)
        .digest('hex');
}

// Endpoint để serve WebAssembly
app.get('/wasm/calculator.wasm', (req, res) => {
    res.setHeader('Content-Type', 'application/wasm');
    res.sendFile(path.join(__dirname, 'wasm', 'calculator.wasm'));
});

// Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔒 Security features enabled`);
    console.log(`📊 WebAssembly module ready at /wasm/calculator.wasm`);
});
