/**
 * PayTR Payment Service
 * Frontend service for PayTR iFrame integration
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://fiftyone-backend.onrender.com/api';

/**
 * Get auth token from local storage
 */
const getAuthToken = () => {
    try {
        const session = localStorage.getItem('supabase.auth.token');
        if (session) {
            const parsed = JSON.parse(session);
            return parsed.currentSession?.access_token;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Initiate PayTR checkout
 * Returns iframe token for displaying payment form
 */
export const initiateCheckout = async (checkoutParams) => {
    try {
        const { idempotencyKey, ...orderData } = checkoutParams;

        if (!idempotencyKey) {
            throw new Error('Idempotency key is missing');
        }

        const token = getAuthToken();
        if (!token) {
            throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        }

        const response = await fetch(`${API_URL}/payment/paytr/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderData,
                idempotencyKey
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ödeme başlatılamadı');
        }

        if (data.cached) {
            return {
                success: true,
                cached: true,
                message: 'Ödeme zaten başlatılmış'
            };
        }

        return {
            success: true,
            iframeToken: data.iframeToken
        };

    } catch (error) {
        console.error('PayTR checkout error:', error);

        let errorMessage = 'Ödeme başlatılamadı. Lütfen tekrar deneyin.';
        if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Check payment result from database
 * Called after user returns from PayTR
 */
export const checkPaymentResult = async (orderNumber) => {
    try {
        if (!orderNumber) {
            throw new Error('Sipariş numarası eksik');
        }

        const token = getAuthToken();

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/payment/status/${orderNumber}`, {
            method: 'GET',
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ödeme durumu sorgulanamadı');
        }

        return {
            success: data.paymentStatus === 'success',
            status: data.status,
            paymentStatus: data.paymentStatus,
            orderNumber: data.orderNumber,
            paidAt: data.paidAt
        };

    } catch (error) {
        console.error('Payment result check error:', error);

        return {
            success: false,
            error: error.message || 'Ödeme durumu sorgulanamadı'
        };
    }
};

/**
 * Generate PayTR iframe URL from token
 */
export const getPayTRIframeUrl = (token) => {
    return `https://www.paytr.com/odeme/guvenli/${token}`;
};
