import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import DeferredWrapper from '../components/Skeleton/DeferredWrapper';
import HomeSkeleton from '../components/Skeleton/HomeSkeleton';
import HeroSection from '../components/HeroSection';
import { getAllProducts, getNewProducts } from '@/services/productService';
import { getAllCategories } from '@/services/categoryService';
import { getActiveContentBlocks } from '@/services/contentService';
import { getSetting } from '@/services/settingsService';
import { formatProductsForCards } from '@/utils/productHelpers';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [siteContent, setSiteContent] = useState(null);
    const [infoBanners, setInfoBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Kategori görselleri için fallback (veritabanından alınamazsa)
    const defaultCategoryImages = {
        'yeni-gelenler': '/images/category-knitwear.png',
        'kazak': '/images/category-kazak.png',
        'hirka': '/images/category-hirka.png',
        'triko': '/images/category-kazak.png',
        'elbise': '/images/category-elbise.png',
        'mont-kaban': '/images/category-mont.png',
    };

    // Kategori görselini al (DB'den veya fallback)
    const getCategoryImage = (category) => {
        return category.image || defaultCategoryImages[category.slug] || '/images/category-knitwear.png';
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsResult, categoriesResult, newProductsResult, contentBlocksResult, infoBannersResult] = await Promise.all([
                    getAllProducts(),
                    getAllCategories(),
                    getNewProducts(),
                    getActiveContentBlocks(),
                    getSetting('home_info_banners')
                ]);

                if (productsResult?.success) {
                    setProducts(formatProductsForCards(productsResult.data)?.slice(0, 8) || []);
                }
                if (categoriesResult?.success) {
                    setCategories(categoriesResult.data || []);
                }
                if (newProductsResult?.success) {
                    setFeaturedProducts(formatProductsForCards(newProductsResult.data)?.slice(0, 4) || []);
                }
                if (contentBlocksResult?.success) {
                    setSiteContent(contentBlocksResult.data || {});
                }
                if (infoBannersResult?.success) {
                    setInfoBanners(infoBannersResult.data?.value || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="home">
                <DeferredWrapper>
                    <HomeSkeleton />
                </DeferredWrapper>
            </main>
        );
    }

    return (
        <main className="home">
            {/* Hero Section - only show if exists (getActiveContentBlocks already filters active ones) */}
            {/* Hero Section - only show if exists (getActiveContentBlocks already filters active ones) */}
            {/* Hero Section - Always render with defaults if specific content missing */}
            <HeroSection content={siteContent?.heroBanner || {}} />

            {/* Category Grid */}
            <section className="categories container">
                <h2 className="section-title">KATEGORİLER</h2>
                <div className="categories__grid">
                    {categories.slice(0, 4).map((cat) => (
                        <Link
                            key={cat.id || cat.slug}
                            to={`/kategori/${cat.slug}`}
                            className="category-card"
                            style={{
                                backgroundImage: `url(${getCategoryImage(cat)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="category-card__overlay"></div>
                            <span className="category-card__name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* New Arrivals */}
            <section className="new-arrivals container">
                <div className="section-header">
                    <h2 className="section-title">YENİ GELENLER</h2>
                    <Link to="/kategori/yeni-gelenler" className="section-link">
                        Tümünü Gör →
                    </Link>
                </div>
                <div className="products-row">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Promo Banner - only show if exists (getActiveContentBlocks already filters active ones) */}
            {siteContent?.promoBanner && (
                <section className="promo-banner">
                    <div className="promo-banner__content">
                        <img
                            src={siteContent?.promoBanner?.image || '/images/promo-banner.png'}
                            alt={siteContent?.promoBanner?.title || "Kış İndirimi"}
                            className="promo-banner__image"
                        />
                        <div className="promo-banner__overlay">
                            <span className="promo-banner__eyebrow">
                                {siteContent?.promoBanner?.eyebrow || 'ÖZEL FIRSAT'}
                            </span>
                            <h2 className="promo-banner__title">
                                {siteContent?.promoBanner?.title || 'Kış Koleksiyonu'}
                            </h2>
                            <p className="promo-banner__text">
                                {siteContent?.promoBanner?.text || 'Toptan alımlarınızda ekstra %10 indirim fırsatını kaçırmayın'}
                            </p>
                            <Link
                                to={siteContent?.promoBanner?.buttonLink || "/kategori/kazak"}
                                className="promo-banner__btn"
                            >
                                {siteContent?.promoBanner?.buttonText || 'Hemen İncele'}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Info Banner */}
            <section className="info-banner">
                <div className="container">
                    <div className="info-banner__grid">
                        {infoBanners.map((banner, index) => (
                            <div key={index} className="info-banner__item">
                                <div className="info-banner__icon">
                                    {/* Icon rendering logic - defaulting to simple SVG shapes based on icon name or generic */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        {banner.icon === 'box' && <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
                                        {banner.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                                        {banner.icon === 'truck' && <>
                                            <rect x="1" y="3" width="15" height="13" />
                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                        </>}
                                        {banner.icon === 'message' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                                        {!['box', 'shield', 'truck', 'message'].includes(banner.icon) && <circle cx="12" cy="12" r="10" />}
                                    </svg>
                                </div>
                                <h3 className="info-banner__title">{banner.title}</h3>
                                <p className="info-banner__text">{banner.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Products */}
            <section className="all-products container">
                <div className="section-header">
                    <h2 className="section-title">TÜM ÜRÜNLER</h2>
                    <Link to="/kategori/kazak" className="section-link">
                        Tümünü Gör →
                    </Link>
                </div>
                <div className="products-row products-row--4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Home;
