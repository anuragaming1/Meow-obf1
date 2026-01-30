#include <stdint.h>
#include <math.h>

// Hàm tính toán được export để JavaScript gọi
double calculate(double a, double b, int operation) {
    switch(operation) {
        case 0: // Addition
            return a + b;
        case 1: // Subtraction
            return a - b;
        case 2: // Multiplication
            return a * b;
        case 3: // Division
            if (b != 0) return a / b;
            return 0;
        case 4: // Modulo
            return fmod(a, b);
        case 5: // Power
            return pow(a, b);
        case 6: // Square root (dùng a là số, b bỏ qua)
            return sqrt(a);
        default:
            return 0;
    }
}

// Hàm mã hóa đơn giản cho dữ liệu
void encrypt_data(char* data, int length, int key) {
    for (int i = 0; i < length; i++) {
        data[i] = data[i] ^ key;
    }
}

// Hàm kiểm tra integrity
int verify_integrity(int value, int expected_hash) {
    // Thuật toán hash đơn giản
    int hash = 0;
    for (int i = 0; i < sizeof(value); i++) {
        hash = ((hash << 5) - hash) + ((value >> (i * 8)) & 0xFF);
    }
    return hash == expected_hash;
}
