import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService.js';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Kişisel Bilgiler
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        // Şirket Bilgileri
        companyName: '',
        taxNumber: '',
        taxOffice: '',
        // Adres Bilgileri
        address: '',
        city: '',
        district: '',
        postalCode: '',
        // Ödeme
        paymentMethod: 'credit-card',

    });

    const [orderError, setOrderError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paytrIframeToken, setPaytrIframeToken] = useState(null);
    const [currentOrderNumber, setCurrentOrderNumber] = useState(null);

    // Kullanıcı bilgilerini forma doldur
    useEffect(() => {
        if (user) {
            const metadata = user.user_metadata || {};
            const nameParts = (metadata.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                phone: metadata.phone || '',
                companyName: metadata.company || '',
                taxNumber: metadata.tax_number || '',
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOrderError(null);

        if (step < 3) {
            setStep(step + 1);
            return;
        }

        // Son adımda siparişi oluştur
        setIsSubmitting(true);

        try {
            // Transform cart items to backend format (separate item per size)
            const orderItems = cartItems.flatMap(item => {
                const colorName = item.product.colors?.[item.colorIndex]?.name || 'Standart';

                return Object.entries(item.quantities || {})
                    .filter(([_, qty]) => qty > 0)
                    .map(([size, qty]) => ({
                        productId: item.product.id,
                        quantity: qty,
                        size: size,
                        color: colorName
                    }));
            });

            // 1. Siparişi oluştur (Pending durumda)
            const result = await createOrder({
                userId: user.id,
                customer: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    companyName: formData.companyName,
                    taxNumber: formData.taxNumber,
                    taxOffice: formData.taxOffice,
                    address: formData.address,
                    city: formData.city,
                    district: formData.district,
                    postalCode: formData.postalCode
                },
                items: orderItems,  // Use transformed items
                paymentMethod: formData.paymentMethod
            });

            if (!result.success) {
                setOrderError(result.error || 'Sipariş oluşturulamadı');
                setIsSubmitting(false);
                return;
            }

            // Save for guest user persistence (especially for external payment redirects where state is lost)
            localStorage.setItem('fiftyone_last_order', JSON.stringify(result.data));

            // 2. Ödeme Yöntemine Göre İşlem
            if (formData.paymentMethod === 'bank-transfer') {
                // Havale ise direkt onaya git
                clearCart();
                navigate(`/siparis-onay/${result.data.orderNumber}`, { state: { order: result.data } });
            } else if (formData.paymentMethod === 'credit-card') {
                // PayTR Checkout başlat
                const { initiateCheckout } = await import('../services/paytrService.js');

                // Generate unique idempotency key to prevent double payments
                const idempotencyKey = `${result.data.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                const checkoutResult = await initiateCheckout({
                    orderId: result.data.id,
                    orderNumber: result.data.orderNumber,
                    total: grandTotal,
                    shippingCost,
                    customer: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        companyName: formData.companyName,
                        taxNumber: formData.taxNumber,
                    },
                    shippingAddress: {
                        address: formData.address,
                        city: formData.city,
                        district: formData.district,
                        postalCode: formData.postalCode,
                    },
                    items: cartItems.flatMap(item => {
                        const colorName = item.product.colors?.[item.colorIndex]?.name || 'Standart';

                        return Object.entries(item.quantities || {})
                            .filter(([_, qty]) => qty > 0)
                            .map(([size, qty]) => ({
                                productName: `${item.product.name} - ${colorName} (${size})`,
                                unitPrice: item.product.price,
                                quantity: qty
                            }));
                    }),
                    idempotencyKey  // Prevent duplicate payments
                });

                if (!checkoutResult.success) {
                    setOrderError(checkoutResult.error || 'Ödeme başlatılamadı');
                    setIsSubmitting(false);
                    return;
                }

                // PayTR iframe token'ı al ve göster
                setCurrentOrderNumber(result.data.orderNumber);
                setPaytrIframeToken(checkoutResult.iframeToken);
                setStep(4); // Go to payment iframe step
                setIsSubmitting(false);
            }


        } catch (err) {
            setOrderError(err.message || 'Bir hata oluştu');
            setIsSubmitting(false);
        }
    };

    const cartTotal = getCartTotal();
    const shippingCost = cartTotal >= 2000 ? 0 : 150;
    const grandTotal = cartTotal + shippingCost;

    // Auth loading durumunda bekle
    if (authLoading) {
        return (
            <main className="checkout">
                <div className="container">
                    <div className="checkout__empty">
                        <p>Yükleniyor...</p>
                    </div>
                </div>
            </main>
        );
    }

    // Kullanıcı giriş yapmamışsa
    if (!user) {
        return (
            <main className="checkout">
                <div className="container">
                    <div className="checkout__empty checkout__login-required">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <h1>Giriş Yapmanız Gerekiyor</h1>
                        <p>Sipariş vermek için lütfen hesabınıza giriş yapın veya yeni bir hesap oluşturun.</p>
                        <div className="checkout__login-actions">
                            <Link to="/hesap" className="btn btn-primary">
                                Giriş Yap / Kayıt Ol
                            </Link>
                            <Link to="/sepet" className="btn btn-secondary">
                                ← Sepete Dön
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="checkout">
                <div className="container">
                    <div className="checkout__empty">
                        <h1>Sepetiniz Boş</h1>
                        <p>Ödeme yapabilmek için önce sepetinize ürün ekleyin.</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Alışverişe Başla
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout">
            <div className="container">
                <h1 className="checkout__title">Ödeme</h1>

                {/* Progress Steps */}
                <div className="checkout__steps">
                    <div className={`checkout__step ${step >= 1 ? 'active' : ''}`}>
                        <span className="checkout__step-number">1</span>
                        <span className="checkout__step-text">Bilgiler</span>
                    </div>
                    <div className={`checkout__step ${step >= 2 ? 'active' : ''}`}>
                        <span className="checkout__step-number">2</span>
                        <span className="checkout__step-text">Teslimat</span>
                    </div>
                    <div className={`checkout__step ${step >= 3 ? 'active' : ''}`}>
                        <span className="checkout__step-number">3</span>
                        <span className="checkout__step-text">Ödeme</span>
                    </div>
                    {paytrIframeToken && (
                        <div className={`checkout__step ${step >= 4 ? 'active' : ''}`}>
                            <span className="checkout__step-number">4</span>
                            <span className="checkout__step-text">Kart Bilgileri</span>
                        </div>
                    )}
                </div>

                <div className="checkout__content">
                    <div className="checkout__form-section">
                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Kişisel Bilgiler */}
                            {step === 1 && (
                                <div className="checkout__form-step">
                                    <h2>Kişisel & Şirket Bilgileri</h2>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="firstName">Ad *</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">Soyad *</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="email">E-posta *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Telefon *</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="companyName">Firma Adı *</label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="taxNumber">Vergi No *</label>
                                            <input
                                                type="text"
                                                id="taxNumber"
                                                name="taxNumber"
                                                value={formData.taxNumber}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="taxOffice">Vergi Dairesi *</label>
                                            <input
                                                type="text"
                                                id="taxOffice"
                                                name="taxOffice"
                                                value={formData.taxOffice}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Teslimat Adresi */}
                            {step === 2 && (
                                <div className="checkout__form-step">
                                    <h2>Teslimat Adresi</h2>

                                    <div className="form-group">
                                        <label htmlFor="address">Adres *</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="city">İl *</label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="district">İlçe *</label>
                                            <input
                                                type="text"
                                                id="district"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="postalCode">Posta Kodu</label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="checkout__shipping-info">
                                        <h3>Kargo Bilgisi</h3>
                                        <p>
                                            {cartTotal >= 2000
                                                ? '✓ 2.000 TL üzeri siparişlerde ücretsiz kargo!'
                                                : `Kargo ücreti: ${shippingCost} TL (2.000 TL üzeri ücretsiz)`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Ödeme */}
                            {step === 3 && (
                                <div className="checkout__form-step">
                                    <h2>Ödeme Yöntemi</h2>

                                    <div className="checkout__payment-methods">
                                        <label className={`payment-option ${formData.paymentMethod === 'credit-card' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="credit-card"
                                                checked={formData.paymentMethod === 'credit-card'}
                                                onChange={handleInputChange}
                                            />
                                            <span>Kredi Kartı</span>
                                        </label>
                                        <label className={`payment-option ${formData.paymentMethod === 'bank-transfer' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="bank-transfer"
                                                checked={formData.paymentMethod === 'bank-transfer'}
                                                onChange={handleInputChange}
                                            />
                                            <span>Havale / EFT</span>
                                        </label>
                                    </div>

                                    {formData.paymentMethod === 'credit-card' && (
                                        <div className="checkout__card-form">
                                            <div className="info-box" style={{ padding: '15px', background: '#f0f8ff', borderRadius: '8px', marginBottom: '20px' }}>
                                                <p>💳 <strong>Kredi Kartı ile Ödeme</strong></p>
                                                <p>Güvenli ödeme formu yüklenecek. PayTR ile güvenle ödeme yapabilirsiniz.</p>
                                                <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#666' }}>
                                                    ✓ 3D Secure güvenliği<br />
                                                    ✓ Taksit seçenekleri<br />
                                                    ✓ Tüm kredi kartları kabul edilir
                                                </p>
                                            </div>
                                        </div>
                                    )}


                                    {formData.paymentMethod === 'bank-transfer' && (
                                        <div className="checkout__bank-info">
                                            <h3>Banka Hesap Bilgileri</h3>
                                            <div className="bank-account">
                                                <p><strong>Banka:</strong> Garanti BBVA</p>
                                                <p><strong>Hesap Adı:</strong> FIFTYONE TEKSTİL LTD. ŞTİ.</p>
                                                <p><strong>IBAN:</strong> TR12 0006 2000 1234 5678 9012 34</p>
                                            </div>
                                            <p className="note">
                                                * Havale açıklamasına sipariş numaranızı yazmayı unutmayın.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4: PayTR iFrame */}
                            {step === 4 && paytrIframeToken && (
                                <div className="checkout__form-step checkout__payment-iframe">
                                    <h2>Kart Bilgilerinizi Girin</h2>
                                    <p style={{ marginBottom: '20px', color: '#666' }}>
                                        Güvenli ödeme formu aşağıda yüklendi. Lütfen kart bilgilerinizi girin.
                                    </p>
                                    <iframe
                                        src={`https://www.paytr.com/odeme/guvenli/${paytrIframeToken}`}
                                        id="paytriframe"
                                        frameBorder="0"
                                        scrolling="yes"
                                        style={{
                                            width: '100%',
                                            minHeight: '500px',
                                            border: '1px solid #eee',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <script
                                        dangerouslySetInnerHTML={{
                                            __html: `
                                                if (typeof iFrameResize !== 'undefined') {
                                                    iFrameResize({}, '#paytriframe');
                                                }
                                            `
                                        }}
                                    />
                                </div>
                            )}

                            <div className="checkout__form-actions">
                                {orderError && (
                                    <div className="checkout__error-message">
                                        ⚠️ {orderError}
                                    </div>
                                )}
                                {step < 4 && (
                                    <>
                                        {step > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setStep(step - 1)}
                                                disabled={isSubmitting}
                                            >
                                                ← Geri
                                            </button>
                                        )}
                                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                            {isSubmitting
                                                ? 'İşleniyor...'
                                                : (step === 3 ? 'Siparişi Tamamla' : 'Devam Et →')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout__summary">
                        <h2>Sipariş Özeti</h2>
                        <div className="checkout__summary-items">
                            {cartItems.map((item, index) => (
                                <div key={index} className="checkout__summary-item">
                                    <img
                                        src={item.product.images[item.colorIndex]?.[0] || item.product.images[0]?.[0]}
                                        alt={item.product.name}
                                    />
                                    <div className="checkout__summary-item-info">
                                        <h4>{item.product.name}</h4>
                                        <p>
                                            {item.product.colors?.[item.colorIndex]?.name || 'Standart'} /
                                            {Object.keys(item.quantities).filter(s => item.quantities[s] > 0).join(', ')}
                                        </p>
                                        <p>Adet: {item.totalQty}</p>
                                    </div>
                                    <span className="checkout__summary-item-price">
                                        {(item.product.price * item.totalQty).toLocaleString('tr-TR')} TL
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="checkout__summary-totals">
                            <div className="checkout__summary-row">
                                <span>Ara Toplam</span>
                                <span>{cartTotal.toLocaleString('tr-TR')} TL</span>
                            </div>
                            <div className="checkout__summary-row">
                                <span>Kargo</span>
                                <span>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost} TL`}</span>
                            </div>
                            <div className="checkout__summary-row checkout__summary-total">
                                <span>Toplam</span>
                                <span>{grandTotal.toLocaleString('tr-TR')} TL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
