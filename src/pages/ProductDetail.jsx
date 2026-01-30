import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SizeMatrix from '../components/SizeMatrix';
import ProductCard from '../components/ProductCard';
import DeferredWrapper from '../components/Skeleton/DeferredWrapper';
import ProductDetailSkeleton from '../components/Skeleton/ProductDetailSkeleton';
import { getProductById, getAllProducts } from '@/services/productService';
import { getSettings } from '@/services/settingsService';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantities, setQuantities] = useState({});
    const [totalQty, setTotalQty] = useState(0);
    const [productInfo, setProductInfo] = useState({});
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch product by ID
                const productResult = await getProductById(id);

                if (productResult.success && productResult.data) {
                    setProduct(productResult.data);

                    // Fetch related products and product info
                    const [allProductsResult, infoResult] = await Promise.all([
                        getAllProducts(),
                        getSettings(['product_care_info', 'shipping_details', 'return_policy'])
                    ]);

                    if (allProductsResult.success) {
                        const related = allProductsResult.data
                            .filter(p => p.id !== parseInt(id))
                            .slice(0, 4);
                        setRelatedProducts(related);
                    }

                    if (infoResult.success) {
                        setProductInfo(infoResult.data);
                    }
                } else {
                    setError('Ürün bulunamadı');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message || 'Ürün yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <main className="product-detail">
                <div className="container">
                    <DeferredWrapper>
                        <ProductDetailSkeleton />
                    </DeferredWrapper>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <div className="container">
                <div className="not-found">
                    <h1>{error || 'Ürün Bulunamadı'}</h1>
                    <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    const currentImages = product.images?.[selectedColor] || product.images?.[0] || ['/images/placeholder.png'];
    const totalPrice = totalQty * product.price;

    const handleQuantityChange = (newQuantities, total) => {
        setQuantities(newQuantities);
        setTotalQty(total);
        if (total > 0) setSubmitError(null);
    };

    const handleAddToCart = () => {
        if (totalQty === 0) {
            setSubmitError('Lütfen sepete eklemek için en az bir beden seçiniz.');
            return;
        }
        addToCart({ ...product, selectedColor: selectedColor }, quantities, totalQty);
        navigate('/sepet');
    };

    return (
        <main className="product-detail">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Ana Sayfa</Link>
                    <span className="breadcrumb__separator">/</span>
                    <Link to={`/kategori/${product.category}`}>
                        {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                    </Link>
                    <span className="breadcrumb__separator">/</span>
                    <span className="breadcrumb__current">{product.name}</span>
                </nav>

                <div className="product-detail__main">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="product-gallery__thumbnails">
                            {currentImages.map((img, index) => (
                                <button
                                    key={index}
                                    className={`product-gallery__thumb ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                        <div className="product-gallery__main">
                            <img
                                src={currentImages[selectedImage]}
                                alt={product.name}
                                className="product-gallery__image"
                            />
                            {product.isNew && (
                                <span className="product-gallery__badge">Yeni</span>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <h1 className="product-info__name">{product.name}</h1>

                        <div className="product-info__pricing">
                            <div className="product-info__series-price">
                                <span className="product-info__price-label">Seri Fiyatı:</span>
                                <span className="product-info__price-value">{product.seriesPrice} TL</span>
                            </div>
                            <div className="product-info__unit-price">
                                <span>Birim Fiyatı: {product.price} TL</span>
                                <span className="product-info__series-count">
                                    (Seride {product.seriesCount} adet)
                                </span>
                            </div>
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 1 && (
                            <div className="product-info__colors">
                                <span className="product-info__label">
                                    Renk: <strong>{product.colors[selectedColor]?.name}</strong>
                                </span>
                                <div className="product-info__color-swatches">
                                    {product.colors.map((color, index) => (
                                        <button
                                            key={color.code || index}
                                            className={`color-swatch ${selectedColor === index ? 'active' : ''}`}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => {
                                                setSelectedColor(index);
                                                setSelectedImage(0);
                                            }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Matrix */}
                        <SizeMatrix
                            sizes={product.sizes || ['S', 'M', 'L', 'XL']}
                            seriesCount={product.seriesCount || 10}
                            onQuantityChange={handleQuantityChange}
                        />

                        {/* Total & Add to Cart */}
                        <div className="product-info__cart">
                            <div className="product-info__total">
                                <span className="product-info__total-label">Toplam:</span>
                                <span className="product-info__total-value">{totalPrice} TL</span>
                                <span className="product-info__total-qty">({totalQty} adet)</span>
                            </div>
                            <div className="product-info__actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                {submitError && (
                                    <div className="error-message" style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>
                                        {submitError}
                                    </div>
                                )}
                                <button
                                    className="btn btn-primary product-info__add-btn"
                                    onClick={handleAddToCart}
                                >
                                    Sepete Ekle
                                </button>
                            </div>
                        </div>

                        {/* Product Description */}
                        <div className="product-info__description">
                            <h3 className="product-info__section-title">Ürün Bilgileri</h3>
                            <p>{product.description}</p>
                        </div>

                        {/* Accordion Info */}
                        <div className="product-info__accordion">
                            <details className="accordion-item">
                                <summary className="accordion-item__header">
                                    İçerik & Bakım
                                </summary>
                                <div className="accordion-item__content">
                                    <p>{product.careInfo?.material || productInfo.product_care_info?.material || '%50 Akrilik, %50 Polyester'}</p>
                                    <p>{product.careInfo?.washingInstructions || productInfo.product_care_info?.washingInstructions || 'Maksimum 30°C\'de makinede yıkayın.'}</p>
                                </div>
                            </details>
                            <details className="accordion-item">
                                <summary className="accordion-item__header">
                                    Kargo & Teslimat
                                </summary>
                                <div className="accordion-item__content">
                                    <p>{product.shippingInfo?.deliveryTime || productInfo.shipping_details?.deliveryTime || 'Türkiye geneli 2-4 iş günü içinde teslimat.'}</p>
                                    <p>{product.shippingInfo?.freeThreshold || productInfo.shipping_details?.freeThreshold || '500 TL ve üzeri siparişlerde ücretsiz kargo.'}</p>
                                </div>
                            </details>
                            <details className="accordion-item">
                                <summary className="accordion-item__header">
                                    İade Koşulları
                                </summary>
                                <div className="accordion-item__content">
                                    <p>{product.returnInfo?.conditions || productInfo.return_policy?.conditions || '14 gün içinde koşulsuz iade hakkı. Ürünlerin orijinal etiketleri sökülmemiş olmalıdır.'}</p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="related-products">
                        <h2 className="section-title">Benzer Ürünler</h2>
                        <div className="related-products__grid">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

export default ProductDetail;
