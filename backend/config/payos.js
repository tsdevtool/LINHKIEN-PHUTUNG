export const PAYOS_CONFIG = {
    CLIENT_ID: process.env.PAYOS_CLIENT_ID,
    API_KEY: process.env.PAYOS_API_KEY,
    CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
    API_BASE_URL: 'https://api-merchant.payos.vn/v2',
    RETURN_URL: process.env.PAYOS_RETURN_URL || 'http://localhost:5173/payment/success',
    CANCEL_URL: process.env.PAYOS_CANCEL_URL || 'http://localhost:5173/payment/cancel',
}; 