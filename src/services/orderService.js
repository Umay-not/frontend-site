/**
 * Order Service - API calls for orders
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://fiftyone-backend.onrender.com/api';

/**
 * Get auth token from Supabase session
 */
const getAuthToken = () => {
    try {
        // Try to get token from Supabase session storage
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
        if (keys.length > 0) {
            const stored = localStorage.getItem(keys[0]);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.access_token;
            }
        }
    } catch (e) {
        console.error('Token parse error:', e);
    }
    return null;
};

/**
 * Yeni sipariş oluştur
 * @param {Object} orderData - Sipariş verileri
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const createOrder = async (orderData) => {
    try {
        // Validasyon
        if (!orderData.customer || !orderData.items?.length) {
            return { success: false, error: 'Eksik sipariş bilgisi' };
        }

        const token = getAuthToken();

        // Build order items for backend
        const orderItems = [];
        for (const item of orderData.items) {
            const colorName = item.product.colors?.[item.colorIndex]?.name || 'Standart';

            // Her beden için ayrı order_item
            Object.entries(item.quantities || {})
                .filter(([_, qty]) => qty > 0)
                .forEach(([size, qty]) => {
                    orderItems.push({
                        productId: item.product.id,
                        productName: item.product.name,
                        colorName: colorName,
                        size: size,
                        quantity: qty,
                        unitPrice: item.product.price
                    });
                });
        }

        const requestBody = {
            customer: {
                firstName: orderData.customer.firstName,
                lastName: orderData.customer.lastName,
                email: orderData.customer.email,
                phone: orderData.customer.phone,
                companyName: orderData.customer.companyName || null,
                taxNumber: orderData.customer.taxNumber || null,
                taxOffice: orderData.customer.taxOffice || null,
                address: orderData.customer.address,
                city: orderData.customer.city,
                district: orderData.customer.district,
                postalCode: orderData.customer.postalCode || null
            },
            items: orderItems,
            paymentMethod: orderData.paymentMethod
        };

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || 'Sipariş oluşturulamadı'
            };
        }

        return {
            success: true,
            data: {
                id: data.data?.id,
                orderNumber: data.data?.orderNumber,
                total: data.data?.total
            }
        };
    } catch (error) {
        console.error('createOrder error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user orders
 */
export const getUserOrders = async () => {
    try {
        const token = getAuthToken();

        if (!token) {
            return { success: false, error: 'Oturum açmanız gerekiyor' };
        }

        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Siparişler getirilemedi'
            };
        }

        return {
            success: true,
            data: data.data || []
        };
    } catch (error) {
        console.error('getUserOrders error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
    try {
        const token = getAuthToken();

        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Sipariş bulunamadı'
            };
        }

        return {
            success: true,
            data: data.data
        };
    } catch (error) {
        console.error('getOrderById error:', error);
        return { success: false, error: error.message };
    }
};

export default {
    createOrder,
    getUserOrders,
    getOrderById
};
