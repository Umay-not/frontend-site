import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Account.css';

const Account = () => {
    const { signIn, signUp, user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        company: '',
        phone: '',
        taxNumber: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Order history state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Fetch user orders when logged in
    useEffect(() => {
        const fetchOrders = async () => {
            if (user && activeSection === 'orders') {
                setOrdersLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('orders')
                        .select('*, order_items(*)')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    if (data) {
                        // Transform snake_case to camelCase for template
                        const transformedOrders = data.map(order => ({
                            id: order.id,
                            orderNumber: order.order_number,
                            status: order.status,
                            total: parseFloat(order.total || 0),
                            createdAt: order.created_at,
                            trackingNumber: order.tracking_number,
                            shippingCarrier: order.shipping_carrier || order.tracking_company,
                            items: order.order_items?.map(item => ({
                                productName: item.product_name,
                                quantity: item.quantity
                            })) || []
                        }));
                        setOrders(transformedOrders);
                    }
                } catch (err) {
                    console.error('Error fetching orders:', err);
                } finally {
                    setOrdersLoading(false);
                }
            }
        };
        fetchOrders();
    }, [user, activeSection]);

    const getStatusText = (status) => {
        const map = {
            pending: 'Bekliyor',
            confirmed: 'Onaylandı',
            processing: 'Hazırlanıyor',
            shipped: 'Kargoda',
            delivered: 'Teslim Edildi',
            cancelled: 'İptal Edildi'
        };
        return map[status] || status;
    };

    const getStatusClass = (status) => {
        const map = {
            pending: 'status--pending',
            confirmed: 'status--confirmed',
            processing: 'status--processing',
            shipped: 'status--shipped',
            delivered: 'status--delivered',
            cancelled: 'status--cancelled'
        };
        return map[status] || '';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getCarrierTrackUrl = (carrier, trackingNumber) => {
        const carriers = {
            'yurtici': `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingNumber}`,
            'aras': `https://www.araskargo.com.tr/trmain/gonderiTakip.aspx?q=${trackingNumber}`,
            'mng': `https://www.mngkargo.com.tr/gonderi-takip/?q=${trackingNumber}`,
            'ptt': `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${trackingNumber}`,
            'ups': `https://www.ups.com/track?loc=tr_TR&tracknum=${trackingNumber}`
        };
        return carriers[carrier] || '#';
    };

    const translateError = (message) => {
        if (!message) return 'Beklenmedik bir hata oluştu.';

        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('invalid login credentials')) {
            return 'E-posta veya şifre hatalı.';
        }
        if (lowerMsg.includes('user already registered') || lowerMsg.includes('unique constraint')) {
            return 'Bu e-posta adresi ile zaten kayıtlı bir kullanıcı var.';
        }
        if (lowerMsg.includes('password') && lowerMsg.includes('short')) {
            return 'Şifre en az 6 karakter olmalıdır.';
        }
        if (lowerMsg.includes('email not confirmed')) {
            return 'Giriş yapmadan önce lütfen e-posta adresinizi doğrulayın.';
        }
        if (lowerMsg.includes('rate limit')) {
            return 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.';
        }

        return 'Bir hata oluştu: ' + message;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            if (activeTab === 'login') {
                const { error } = await signIn({
                    email: formData.email,
                    password: formData.password
                });
                if (error) throw error;
                // Login successful - usually auto redirects or state updates
            } else {
                const { error, data } = await signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            name: formData.name,
                            company: formData.company,
                            phone: formData.phone,
                            tax_number: formData.taxNumber
                        }
                    }
                });
                if (error) throw error;
                if (data?.user && !data?.session) {
                    setMessage('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
                }
            }
        } catch (err) {
            setError(translateError(err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (user) {
        return (
            <main className="account-page">
                <div className="container">
                    <div className="account-wrapper account-wrapper--wide">
                        <div className="account-header">
                            <h1>Hesabım</h1>
                            <p>Hoşgeldiniz, {user.user_metadata?.name || user.email}</p>
                        </div>

                        {/* Account Navigation Tabs */}
                        <div className="account-nav">
                            <button
                                className={`account-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveSection('profile')}
                            >
                                <span className="nav-icon">👤</span>
                                Profil
                            </button>
                            <button
                                className={`account-nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveSection('orders')}
                            >
                                <span className="nav-icon">📦</span>
                                Siparişlerim
                            </button>
                        </div>

                        <div className="account-content">
                            {/* Profile Section */}
                            {activeSection === 'profile' && (
                                <div className="account-section">
                                    <h2>Profil Bilgileri</h2>
                                    <div className="profile-info">
                                        <div className="profile-row">
                                            <span className="profile-label">E-posta</span>
                                            <span className="profile-value">{user.email}</span>
                                        </div>
                                        {user.user_metadata?.name && (
                                            <div className="profile-row">
                                                <span className="profile-label">Ad Soyad</span>
                                                <span className="profile-value">{user.user_metadata.name}</span>
                                            </div>
                                        )}
                                        {user.user_metadata?.company && (
                                            <div className="profile-row">
                                                <span className="profile-label">Firma</span>
                                                <span className="profile-value">{user.user_metadata.company}</span>
                                            </div>
                                        )}
                                        {user.user_metadata?.phone && (
                                            <div className="profile-row">
                                                <span className="profile-label">Telefon</span>
                                                <span className="profile-value">{user.user_metadata.phone}</span>
                                            </div>
                                        )}
                                        {user.user_metadata?.tax_number && (
                                            <div className="profile-row">
                                                <span className="profile-label">Vergi No</span>
                                                <span className="profile-value">{user.user_metadata.tax_number}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}

                            {/* Orders Section */}
                            {activeSection === 'orders' && (
                                <div className="account-section">
                                    <h2>Siparişlerim</h2>

                                    {ordersLoading ? (
                                        <div className="orders-loading">
                                            <div className="spinner"></div>
                                            <p>Siparişler yükleniyor...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="orders-empty">
                                            <span className="empty-icon">📭</span>
                                            <p>Henüz siparişiniz bulunmuyor.</p>
                                            <Link to="/" className="btn btn-primary">
                                                Alışverişe Başla
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="orders-list">
                                            {orders.map((order) => (
                                                <div key={order.id} className="order-card">
                                                    <div className="order-card-header">
                                                        <div className="order-info">
                                                            <span className="order-number">{order.orderNumber}</span>
                                                            <span className="order-date">{formatDate(order.createdAt)}</span>
                                                        </div>
                                                        <span className={`order-status ${getStatusClass(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </div>
                                                    <div className="order-card-body">
                                                        <div className="order-items-summary">
                                                            {order.items?.slice(0, 2).map((item, idx) => (
                                                                <span key={idx} className="order-item-name">
                                                                    {item.productName} x{item.quantity}
                                                                </span>
                                                            ))}
                                                            {order.items?.length > 2 && (
                                                                <span className="order-items-more">
                                                                    +{order.items.length - 2} ürün daha
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="order-total">
                                                            <span>Toplam:</span>
                                                            <strong>₺{order.total?.toLocaleString('tr-TR')}</strong>
                                                        </div>
                                                    </div>
                                                    <div className="order-card-footer">
                                                        <Link
                                                            to={`/siparis-onay/${order.orderNumber}`}
                                                            className="btn btn-outline btn-sm"
                                                        >
                                                            Detayları Gör
                                                        </Link>
                                                        {order.trackingNumber && order.shippingCarrier && (
                                                            <a
                                                                href={getCarrierTrackUrl(order.shippingCarrier, order.trackingNumber)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-primary btn-sm tracking-btn"
                                                            >
                                                                🚚 Kargo Takip Et
                                                            </a>
                                                        )}
                                                        {order.trackingNumber && !order.shippingCarrier && (
                                                            <span className="tracking-info">
                                                                Kargo: {order.trackingNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="account-page">
            <div className="container">
                <div className="account-wrapper">
                    <div className="account-header">
                        <h1>Hesabım</h1>
                        <p>Toptan alıcı olarak giriş yapın veya kayıt olun</p>
                    </div>

                    <div className="account-tabs">
                        <button
                            className={`account-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Giriş Yap
                        </button>
                        <button
                            className={`account-tab ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                    <form className="account-form" onSubmit={handleSubmit}>
                        {activeTab === 'register' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="name">Ad Soyad</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="company">Firma Adı</label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Telefon</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="taxNumber">Vergi No</label>
                                        <input
                                            type="text"
                                            id="taxNumber"
                                            name="taxNumber"
                                            value={formData.taxNumber}
                                            onChange={handleChange}
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">E-posta</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Şifre</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>

                        {activeTab === 'login' && (
                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span>Beni hatırla</span>
                                </label>
                                <Link to="/sifremi-unuttum" className="forgot-link">
                                    Şifremi unuttum
                                </Link>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary account-submit" disabled={loading}>
                            {loading ? 'İşlem yapılıyor...' : (activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                        </button>

                        {activeTab === 'register' && (
                            <p className="form-note">
                                Kayıt olarak <Link to="/kullanim-kosullari">Kullanım Koşulları</Link> ve{' '}
                                <Link to="/gizlilik">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
                            </p>
                        )}
                    </form>

                    <div className="account-benefits">
                        <h3>Toptan Alıcı Avantajları</h3>
                        <ul>
                            <li>✓ Özel toptan fiyatlandırma</li>
                            <li>✓ Seri satış kolaylığı</li>
                            <li>✓ Hızlı sevkiyat</li>
                            <li>✓ VIP müşteri desteği</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Account;
