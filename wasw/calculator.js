// WebAssembly module loader
class WasmCalculator {
    constructor() {
        this.instance = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Load WebAssembly module
            const response = await fetch('wasm/calculator.wasm');
            const bytes = await response.arrayBytes();
            const wasmModule = await WebAssembly.compile(bytes);
            
            this.instance = await WebAssembly.instantiate(wasmModule, {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    abort: () => console.error('WASM Aborted')
                }
            });
            
            this.initialized = true;
            console.log('✅ WebAssembly module loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to load WebAssembly:', error);
            return false;
        }
    }

    calculate(a, b, operation) {
        if (!this.initialized || !this.instance) {
            throw new Error('WebAssembly not initialized');
        }

        const startTime = performance.now();
        const result = this.instance.exports.calculate(a, b, operation);
        const endTime = performance.now();
        
        return {
            result: result,
            processingTime: endTime - startTime,
            processor: 'WebAssembly'
        };
    }

    // Hàm mã hóa dữ liệu
    encryptData(data, key) {
        if (!this.initialized) return data;
        
        // Chuyển đổi string sang ArrayBuffer
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const buffer = encoder.encode(data);
        
        // Tạo view để thao tác
        const dataView = new DataView(buffer.buffer);
        
        // Mã hóa từng byte
        for (let i = 0; i < buffer.length; i++) {
            const encrypted = buffer[i] ^ key;
            dataView.setUint8(i, encrypted);
        }
        
        return decoder.decode(buffer);
    }
}

// Tạo global instance
window.WasmCalculator = new WasmCalculator();

// Tự động khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    window.WasmCalculator.initialize().then(success => {
        if (success) {
            document.getElementById('wasmStatus').textContent = '✅ Đã tải';
            document.getElementById('wasmStatus').style.color = '#2e7d32';
        } else {
            document.getElementById('wasmStatus').textContent = '❌ Lỗi tải';
            document.getElementById('wasmStatus').style.color = '#f44336';
        }
    });
});
