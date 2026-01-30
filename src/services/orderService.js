import { supabase } from '../lib/supabase';

/**
 * Benzersiz sipariş numarası oluştur
 * @returns {string}
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRF${year}${month}${day}-${random}`;
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

        // Toplam hesapla
        const subtotal = orderData.items.reduce((sum, item) => {
            return sum + (item.totalQty * item.product.price);
        }, 0);
        const shippingCost = subtotal >= 2000 ? 0 : 150;
        const total = subtotal + shippingCost;

        const orderNumber = generateOrderNumber();
        const orderId = crypto.randomUUID(); // Client-side ID generation

        // Sipariş oluştur
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                order_number: orderNumber,
                user_id: orderData.userId, // RLS should validate this matches auth.uid()
                customer_first_name: orderData.customer.firstName,
                customer_last_name: orderData.customer.lastName,
                customer_email: orderData.customer.email,
                customer_phone: orderData.customer.phone,
                company_name: orderData.customer.companyName || null,
                tax_number: orderData.customer.taxNumber || null,
                tax_office: orderData.customer.taxOffice || null,
                shipping_address: orderData.customer.address,
                shipping_city: orderData.customer.city,
                shipping_district: orderData.customer.district,
                shipping_postal_code: orderData.customer.postalCode || null,
                subtotal,
                shipping_cost: shippingCost,
                total,
                payment_method: orderData.paymentMethod,
                status: 'pending'
            });

        if (orderError) throw orderError;

        // Sipariş kalemlerini ekle - Her beden için ayrı satır oluştur
        const orderItems = [];
        for (const item of orderData.items) {
            const colorName = item.product.colors?.[item.colorIndex]?.name || 'Standart';

            // Her beden için ayrı order_item kaydı oluştur
            Object.entries(item.quantities || {})
                .filter(([_, qty]) => qty > 0)
                .forEach(([size, qty]) => {
                    orderItems.push({
                        order_id: orderId,
                        product_id: item.product.id,
                        product_name: item.product.name,
                        color_name: colorName,
                        size: size,  // Tek beden (ör: "S")
                        quantity: qty,  // O bedene ait adet (ör: 5)
                        unit_price: item.product.price,
                        subtotal: qty * item.product.price
                    });
                });
        }

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items insert error:', itemsError);
            // Consider rollback or alert logic here
        }

        return {
            success: true,
            data: {
                id: orderId,
                orderNumber: orderNumber,
                // ... return other data if needed by frontend
            }
        };
    } catch (error) {
        console.error('createOrder error:', error);
        return { success: false, error: error.message };
    }
};

export default {
    createOrder
};
