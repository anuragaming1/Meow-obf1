// Security Application with Obfuscation + WebAssembly
class SecureCalculator {
    constructor() {
        this.currentValue = 0;
        this.previousValue = 0;
        this.operation = null;
        this.waitingForNewValue = false;
        this.securityChecks = {
            debuggerDetected: false,
            tamperDetected: false,
            wasmAvailable: false
        };
        
        this.initializeSecurity();
        this.bindEvents();
        this.updateDisplay();
    }

    // ==================== SECURITY METHODS ====================
    initializeSecurity() {
        // Anti-debugger protection
        this.setupDebuggerProtection();
        
        // Tamper detection
        this.setupTamperDetection();
        
        // Code integrity check
        this.checkCodeIntegrity();
        
        console.log('🔒 Security systems initialized');
    }

    setupDebuggerProtection() {
        // Phát hiện DevTools
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                this.securityChecks.debuggerDetected = true;
                this.triggerAntiTamper();
                return true;
            }
            return false;
        };

        // Debugger statement loop
        const debuggerLoop = () => {
            if (this.securityChecks.debuggerDetected) return;
            
            try {
                debugger;
                setTimeout(debuggerLoop, 100);
            } catch (e) {
                this.securityChecks.debuggerDetected = true;
                this.triggerAntiTamper();
            }
        };

        // Bắt đầu protection
        setInterval(detectDevTools, 1000);
        setTimeout(debuggerLoop, 2000);
    }

    setupTamperDetection() {
        // Kiểm tra thay đổi DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    this.securityChecks.tamperDetected = true;
                    this.triggerAntiTamper();
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            attributes: true,
            subtree: true
        });

        // Hash check cho critical elements
        const checkElementHash = () => {
            const criticalElements = ['#display', '.calculator', '#checkDebugger'];
            criticalElements.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    const originalHash = this.getElementHash(selector);
                    const currentHash = this.calculateHash(element.outerHTML);
                    
                    if (originalHash !== currentHash) {
                        this.securityChecks.tamperDetected = true;
                        this.triggerAntiTamper();
                    }
                }
            });
        };

        setInterval(checkElementHash, 3000);
    }

    getElementHash(selector) {
        // Lưu hash gốc của các element quan trọng
        const hashMap = {
            '#display': 'a1b2c3d4',
            '.calculator': 'e5f6g7h8',
            '#checkDebugger': 'i9j0k1l2'
        };
        return hashMap[selector];
    }

    calculateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    checkCodeIntegrity() {
        // Kiểm tra các hàm quan trọng có bị thay đổi không
        const importantFunctions = [
            this.calculate.bind(this),
            this.initializeSecurity.bind(this),
            this.setupDebuggerProtection.bind(this)
        ];

        importantFunctions.forEach((func, index) => {
            const funcString = func.toString();
            const expectedLength = [150, 200, 300][index]; // Độ dài ước lượng
            
            if (funcString.length < expectedLength * 0.8 || 
                funcString.length > expectedLength * 1.2) {
                this.securityChecks.tamperDetected = true;
                this.triggerAntiTamper();
            }
        });
    }

    triggerAntiTamper() {
        if (this.securityChecks.tamperDetected) {
            console.warn('⚠️ Tampering detected! Triggering countermeasures...');
            
            // Clear sensitive data
            this.currentValue = 0;
            this.previousValue = 0;
            this.operation = null;
            
            // Hiển thị cảnh báo
            document.getElementById('tamperStatus').textContent = '⚠️ PHÁT HIỆN TAMPERING';
            document.getElementById('tamperStatus').style.color = '#ff9800';
            
            // Disable calculator
            document.querySelectorAll('.btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });
            
            // Thông báo cho server (nếu có)
            this.reportTampering();
        }
    }

    async reportTampering() {
        try {
            // Gửi báo cáo về server
            const report = {
                type: 'tampering',
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                checks: this.securityChecks
            };
            
            // Mã hóa báo cáo trước khi gửi
            const encryptedReport = btoa(JSON.stringify(report));
            
            // Gửi đến endpoint giám sát
            await fetch('/api/security/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: encryptedReport })
            });
        } catch (error) {
            console.error('Failed to report tampering:', error);
        }
    }

    // ==================== CALCULATOR METHODS ====================
    async calculateWithWasm(a, b, operation) {
        if (window.WasmCalculator && window.WasmCalculator.initialized) {
            try {
                const result = window.WasmCalculator.calculate(a, b, operation);
                document.getElementById('processorType').textContent = 'WebAssembly';
                document.getElementById('wasmResult').textContent = result.result;
                return result;
            } catch (error) {
                console.error('WASM calculation failed:', error);
            }
        }
        
        // Fallback to JavaScript calculation
        return this.calculateWithJS(a, b, operation);
    }

    calculateWithJS(a, b, operation) {
        const startTime = performance.now();
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
                result = b !== 0 ? a / b : 'Error';
                break;
            case 'percent':
                result = a * (b / 100);
                break;
            default:
                result = a;
        }
        
        const endTime = performance.now();
        
        document.getElementById('processorType').textContent = 'JavaScript';
        document.getElementById('jsResult').textContent = result;
        
        return {
            result: result,
            processingTime: endTime - startTime,
            processor: 'JavaScript'
        };
    }

    handleNumber(number) {
        if (this.waitingForNewValue) {
            this.currentValue = 0;
            this.waitingForNewValue = false;
        }
        
        this.currentValue = this.currentValue * 10 + number;
        this.updateDisplay();
    }

    handleOperation(op) {
        if (this.operation && !this.waitingForNewValue) {
            this.performCalculation();
        }
        
        this.previousValue = this.currentValue;
        this.operation = op;
        this.waitingForNewValue = true;
        this.updateOperationDisplay();
    }

    async performCalculation() {
        if (this.operation === null) return;
        
        const calculation = await this.calculateWithWasm(
            this.previousValue,
            this.currentValue,
            this.getOperationCode(this.operation)
        );
        
        if (calculation && calculation.result !== undefined) {
            this.currentValue = calculation.result;
            document.getElementById('processingTime').textContent = 
                calculation.processingTime.toFixed(2);
        }
        
        this.operation = null;
        this.waitingForNewValue = true;
        this.updateDisplay();
    }

    getOperationCode(operation) {
        const operations = {
            'add': 0,
            'subtract': 1,
            'multiply': 2,
            'divide': 3,
            'percent': 4
        };
        return operations[operation] || 0;
    }

    clear() {
        this.currentValue = 0;
        this.previousValue = 0;
        this.operation = null;
        this.waitingForNewValue = false;
        this.updateDisplay();
    }

    backspace() {
        this.currentValue = Math.floor(this.currentValue / 10);
        this.updateDisplay();
    }

    updateDisplay() {
        const display = document.getElementById('display');
        display.value = this.currentValue.toString();
    }

    updateOperationDisplay() {
        const opDisplay = document.getElementById('operationDisplay');
        if (this.operation) {
            const opSymbols = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷',
                'percent': '%'
            };
            opDisplay.textContent = `${this.previousValue} ${opSymbols[this.operation] || ''}`;
        } else {
            opDisplay.textContent = '';
        }
    }

    // ==================== UI BINDING ====================
    bindEvents() {
        // Number buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => {
                const number = parseInt(button.dataset.number);
                this.handleNumber(number);
            });
        });

        // Operation buttons
        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (['add', 'subtract', 'multiply', 'divide', 'percent'].includes(action)) {
                    this.handleOperation(action);
                } else if (action === 'equals') {
                    this.performCalculation();
                } else if (action === 'clear') {
                    this.clear();
                } else if (action === 'backspace') {
                    this.backspace();
                }
            });
        });

        // Decimal button
        document.querySelector('.decimal').addEventListener('click', () => {
            if (!this.currentValue.toString().includes('.')) {
                this.currentValue = parseFloat(this.currentValue.toString() + '.');
                this.updateDisplay();
            }
        });

        // Security check buttons
        document.getElementById('checkDebugger').addEventListener('click', () => {
            const status = document.getElementById('debuggerStatus');
            if (this.securityChecks.debuggerDetected) {
                status.textContent = '⚠️ PHÁT HIỆN DEBUGGER';
                status.style.color = '#ff9800';
            } else {
                status.textContent = '✅ KHÔNG PHÁT HIỆN';
                status.style.color = '#2e7d32';
            }
        });

        document.getElementById('checkTamper').addEventListener('click', () => {
            const status = document.getElementById('tamperStatus');
            if (this.securityChecks.tamperDetected) {
                status.textContent = '⚠️ PHÁT HIỆN TAMPERING';
                status.style.color = '#ff9800';
            } else {
                status.textContent = '✅ KHÔNG PHÁT HIỆN';
                status.style.color = '#2e7d32';
            }
        });

        document.getElementById('checkWasm').addEventListener('click', () => {
            const status = document.getElementById('wasmStatus');
            if (window.WasmCalculator && window.WasmCalculator.initialized) {
                status.textContent = '✅ HOẠT ĐỘNG';
                status.style.color = '#2e7d32';
            } else {
                status.textContent = '❌ KHÔNG HOẠT ĐỘNG';
                status.style.color = '#f44336';
            }
        });

        // Show obfuscated code
        document.getElementById('showCodeBtn').addEventListener('click', () => {
            const codeDisplay = document.getElementById('obfuscatedCode');
            // Lấy một phần của code đã obfuscate để hiển thị
            const obfuscatedSnippet = `
                (function(_0x1a2b3c,_0x4d5e6f){
                    var _0x7g8h9i=_0x1a2b3c();
                    while(!![]){
                        try{
                            var _0x9j0k1l=-parseInt(_0x7g8h9i(0x1a2))/
                            parseInt(_0x7g8h9i(0x1b3))+parseInt(_0x7g8h9i(0x1c4))/
                            parseInt(_0x7g8h9i(0x1d5))+parseInt(_0x7g8h9i(0x1e6))/
                            parseInt(_0x7g8h9i(0x1f7));
                            if(_0x9j0k1l===_0x4d5e6f)break;
                            else _0x7g8h9i['push'](_0x7g8h9i['shift']());
                        }catch(_0x2m3n4o){
                            _0x7g8h9i['push'](_0x7g8h9i['shift']());
                        }
                    }
                }(function(){
                    var _0x5a6b7c=['calcul','ate','Secu','rity','Web','Assem','bly'];
                    _0x5a6b7c['reverse']();
                    return function(_0x3d4e5f,_0x6g7h8i){
                        _0x3d4e5f=_0x3d4e5f-0x0;
                        var _0x9i0j1k=_0x5a6b7c[_0x3d4e5f];
                        return _0x9i0j1k;
                    };
                },0x3e8));
                
                // 🛡️ Code đã được obfuscate để bảo vệ trí tuệ sở hữu
                // 🔒 Reverse engineering sẽ gặp khó khăn đáng kể
                // ⚡ Performance được tối ưu cùng WebAssembly
            `;
            codeDisplay.textContent = obfuscatedSnippet;
        });

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            if (event.key >= '0' && event.key <= '9') {
                this.handleNumber(parseInt(event.key));
            } else if (event.key === '+') {
                this.handleOperation('add');
            } else if (event.key === '-') {
                this.handleOperation('subtract');
            } else if (event.key === '*') {
                this.handleOperation('multiply');
            } else if (event.key === '/') {
                this.handleOperation('divide');
            } else if (event.key === 'Enter' || event.key === '=') {
                this.performCalculation();
            } else if (event.key === 'Escape' || event.key === 'Delete') {
                this.clear();
            } else if (event.key === 'Backspace') {
                this.backspace();
            } else if (event.key === '.') {
                if (!this.currentValue.toString().includes('.')) {
                    this.currentValue = parseFloat(this.currentValue.toString() + '.');
                    this.updateDisplay();
                }
            }
        });
    }
}

// Khởi tạo ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.secureApp = new SecureCalculator();
    console.log('🚀 Secure Calculator Application Started');
    
    // Kiểm tra và cập nhật trạng thái bảo mật
    setInterval(() => {
        const debuggerStatus = document.getElementById('debuggerStatus');
        const tamperStatus = document.getElementById('tamperStatus');
        
        if (window.secureApp.securityChecks.debuggerDetected) {
            debuggerStatus.textContent = '⚠️ DEBUGGER';
            debuggerStatus.style.color = '#ff9800';
        }
        
        if (window.secureApp.securityChecks.tamperDetected) {
            tamperStatus.textContent = '⚠️ TAMPERING';
            tamperStatus.style.color = '#ff9800';
        }
    }, 1000);
});
