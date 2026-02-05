import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { orderNumber } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            // 1. Check navigation state (Best)
            if (location.state?.order) {
                setOrder(location.state.order);
                setLoading(false);
                return;
            }

            // 2. Check LocalStorage (Fallback for Guest + External Redirects)
            try {
                const lastOrder = JSON.parse(localStorage.getItem('fiftyone_last_order'));
                if (lastOrder && lastOrder.orderNumber === orderNumber) {
                    setOrder(lastOrder);
                    setLoading(false);
                    // Continue to try fetch update, but don't block
                }
            } catch (e) {
                console.error('Error reading local order:', e);
            }

            if (!orderNumber) {
                setError('Sipariş numarası bulunamadı');
                setLoading(false);
                return;
            }

            // 3. Try API (For Authenticated Users / Admin)
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('order_number', orderNumber)
                .maybeSingle();

            if (fetchError) {
                console.error('Order fetch error:', fetchError);
                // If we already have data from localStorage, ignore API error (likely RLS blocking)
                setOrder(prev => {
                    if (prev) return prev;
                    setError('Sipariş bilgilerine erişilemiyor. Lütfen giriş yaptığınızdan emin olun.');
                    return null;
                });
            } else if (data) {
                // Transform snake_case to camelCase for template compatibility
                const transformedOrder = {
                    id: data.id,
                    orderNumber: data.order_number,
                    status: data.status,
                    paymentMethod: data.payment_method,
                    subtotal: parseFloat(data.subtotal || 0),
                    shippingCost: parseFloat(data.shipping_cost || 0),
                    total: parseFloat(data.total || 0),
                    customer: {
                        firstName: data.customer_first_name,
                        lastName: data.customer_last_name,
                        email: data.customer_email,
                        phone: data.customer_phone,
                        companyName: data.company_name
                    },
                    shippingAddress: {
                        address: data.shipping_address,
                        city: data.shipping_city,
                        district: data.shipping_district,
                        postalCode: data.postal_code
                    },
                    items: data.order_items?.map(item => ({
                        productName: item.product_name,
                        color: item.color_name || item.color,
                        size: item.size,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.unit_price || 0),
                        subtotal: parseFloat(item.subtotal || item.total_price || 0)
                    })) || [],
                    trackingNumber: data.tracking_number,
                    trackingCompany: data.tracking_company,
                    createdAt: data.created_at
                };
                setOrder(transformedOrder);
            } else {
                // No data found and no localStorage fallback
                setOrder(prev => {
                    if (prev) return prev;
                    setError('Sipariş bulunamadı');
                    return null;
                });
            }
            setLoading(false);
        };

        fetchOrder();
    }, [orderNumber, location.state]);

    if (loading) {
        return (
            <main className="order-confirmation">
                <div className="container">
                    <div className="order-confirmation__loading">
                        <div className="spinner"></div>
                        <p>Sipariş bilgileri yükleniyor...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="order-confirmation">
                <div className="container">
                    <div className="order-confirmation__error">
                        <h1>⚠️ Hata</h1>
                        <p>{error}</p>
                        <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
                    </div>
                </div>
            </main>
        );
    }

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Beklemede',
            confirmed: 'Onaylandı',
            processing: 'Hazırlanıyor',
            shipped: 'Kargoda',
            delivered: 'Teslim Edildi',
            cancelled: 'İptal Edildi'
        };
        return statusMap[status] || status;
    };

    return (
        <main className="order-confirmation">
            <div className="container">
                <div className="order-confirmation__success">
                    <div className="order-confirmation__icon">✓</div>
                    <h1>Siparişiniz Alındı!</h1>
                    <p className="order-confirmation__number">
                        Sipariş No: <strong>{order.orderNumber}</strong>
                    </p>
                    <p className="order-confirmation__message">
                        Siparişiniz başarıyla oluşturuldu. Size e-posta ile bilgilendirme yapılacaktır.
                    </p>
                </div>

                <div className="order-confirmation__details">
                    <div className="order-confirmation__section">
                        <h2>Sipariş Özeti</h2>
                        <div className="order-confirmation__info-grid">
                            <div className="order-confirmation__info-item">
                                <span className="label">Durum:</span>
                                <span className="value">{getStatusText(order.status)}</span>
                            </div>
                            <div className="order-confirmation__info-item">
                                <span className="label">Ödeme Yöntemi:</span>
                                <span className="value">
                                    {order.paymentMethod === 'credit-card' ? 'Kredi Kartı' : 'Havale/EFT'}
                                </span>
                            </div>
                            <div className="order-confirmation__info-item">
                                <span className="label">Toplam:</span>
                                <span className="value total">₺{order.total.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="order-confirmation__section">
                        <h2>Teslimat Adresi</h2>
                        <p>
                            {order.customer.firstName} {order.customer.lastName}<br />
                            {order.customer.companyName && <>{order.customer.companyName}<br /></>}
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.district} / {order.shippingAddress.city}
                            {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
                        </p>
                    </div>

                    {order.items && order.items.length > 0 && (
                        <div className="order-confirmation__section">
                            <h2>Ürünler</h2>
                            <div className="order-confirmation__items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-confirmation__item">
                                        <div className="order-confirmation__item-info">
                                            <span className="name">{item.productName}</span>
                                            <span className="details">
                                                {item.color} {item.size && `/ ${item.size}`} × {item.quantity}
                                            </span>
                                        </div>
                                        <span className="price">₺{item.subtotal.toLocaleString('tr-TR')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {order.paymentMethod === 'bank-transfer' && (
                        <div className="order-confirmation__section order-confirmation__bank-info">
                            <h2>Banka Hesap Bilgileri</h2>
                            <p>
                                Havale/EFT ödemelerinizi aşağıdaki hesaba yapabilirsiniz:
                            </p>
                            <div className="bank-account">
                                <p><strong>Banka:</strong> Garanti BBVA</p>
                                <p><strong>Hesap Adı:</strong> FIFTYONE TEKSTİL LTD. ŞTİ.</p>
                                <p><strong>IBAN:</strong> TR12 0006 2000 1234 5678 9012 34</p>
                            </div>
                            <p className="note">
                                ⚠️ Açıklama kısmına sipariş numaranızı ({order.orderNumber}) yazmayı unutmayın.
                            </p>
                        </div>
                    )}
                </div>

                <div className="order-confirmation__actions">
                    <Link to="/" className="btn btn-primary">Alışverişe Devam Et</Link>
                    <Link to="/hesap" className="btn btn-secondary">Siparişlerim</Link>
                </div>
            </div>
        </main>
    );
};

export default OrderConfirmation;
