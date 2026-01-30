import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();

    const totalAmount = getCartTotal();
    // Minimum sipariş tutarı kaldırıldı - herkes istediği kadar sipariş verebilir
    const shippingThreshold = 2000; // 2000 TL ve üzeri ücretsiz kargo
    const shippingCost = totalAmount >= shippingThreshold ? 0 : 150;

    if (cartItems.length === 0) {
        return (
            <main className="cart-page">
                <div className="container">
                    <div className="cart-empty">
                        <div className="cart-empty__icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                        </div>
                        <h1>Sepetiniz Boş</h1>
                        <p>Henüz sepetinize ürün eklemediniz.</p>
                        <Link to="/" className="btn btn-primary">
                            Alışverişe Başla
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="container">
                <h1 className="cart-page__title">Sepetim</h1>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item__image">
                                    <img
                                        src={item.product.images[item.colorIndex]?.[0] || item.product.images[0]?.[0]}
                                        alt={item.product.name}
                                    />
                                </div>
                                <div className="cart-item__details">
                                    <Link to={`/urun/${item.product.id}`} className="cart-item__name">
                                        {item.product.name}
                                    </Link>
                                    <p className="cart-item__color">
                                        Renk: {item.product.colors?.[item.colorIndex]?.name || 'Standart'}
                                    </p>
                                    <div className="cart-item__sizes">
                                        {Object.entries(item.quantities)
                                            .filter(([_, qty]) => qty > 0)
                                            .map(([size, qty]) => (
                                                <span key={size} className="cart-item__size-badge">
                                                    {size}: {qty}
                                                </span>
                                            ))}
                                    </div>
                                    <div className="cart-item__pricing">
                                        <p className="cart-item__qty">{item.totalQty} adet</p>
                                        <p className="cart-item__price">{item.totalQty * item.product.price} TL</p>
                                        <p className="cart-item__unit">Birim: {item.product.price} TL</p>
                                    </div>
                                </div>
                                <button
                                    className="cart-item__remove"
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label="Ürünü kaldır"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        <button className="cart-clear" onClick={clearCart}>
                            Sepeti Temizle
                        </button>
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h2 className="cart-summary__title">Sipariş Özeti</h2>

                        <div className="cart-summary__row">
                            <span>Ara Toplam</span>
                            <span>{totalAmount} TL</span>
                        </div>

                        <div className="cart-summary__row">
                            <span>Kargo</span>
                            <span>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost} TL`}</span>
                        </div>

                        <div className="cart-summary__total">
                            <span>Toplam</span>
                            <span>{totalAmount + shippingCost} TL</span>
                        </div>

                        <Link
                            to="/odeme"
                            className="btn btn-primary cart-summary__checkout"
                        >
                            Siparişi Tamamla
                        </Link>

                        <div className="cart-summary__info">
                            <p>✓ Güvenli ödeme</p>
                            <p>✓ 2.000 TL üzeri ücretsiz kargo</p>
                            <p>✓ 14 gün iade garantisi</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Cart;
