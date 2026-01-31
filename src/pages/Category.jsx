import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import ProductCard from '../components/ProductCard';
import DeferredWrapper from '../components/Skeleton/DeferredWrapper';
import CategorySkeleton from '../components/Skeleton/CategorySkeleton';
import { getProductsByCategory, getAllProducts } from '@/services/productService';
import { getCategoryBySlug } from '@/services/categoryService';
import { formatProductsForCards } from '@/utils/productHelpers';
import './Category.css';

const Category = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

    // Filtre state'i
    const [filters, setFilters] = useState({
        colors: searchParams.get('colors')?.split(',').filter(Boolean) || [],
        sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || [],
        priceMin: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')) : null,
        priceMax: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')) : null
    });

    // Ürünlerden mevcut renkleri ve bedenleri çıkar
    const availableColors = useMemo(() => {
        const colorMap = new Map();
        products.forEach(product => {
            if (product.colors && Array.isArray(product.colors)) {
                product.colors.forEach(color => {
                    if (color.code && !colorMap.has(color.code)) {
                        colorMap.set(color.code, {
                            code: color.code,
                            name: color.name,
                            hex: color.hex
                        });
                    }
                });
            }
        });
        return Array.from(colorMap.values());
    }, [products]);

    const availableSizes = useMemo(() => {
        const sizeSet = new Set();
        products.forEach(product => {
            if (product.sizes && Array.isArray(product.sizes)) {
                product.sizes.forEach(size => sizeSet.add(size));
            }
        });
        // Standart sıralama: XS, S, M, L, XL, XXL
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
        return Array.from(sizeSet).sort((a, b) => {
            const indexA = sizeOrder.indexOf(a);
            const indexB = sizeOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [products]);

    // Filtrelenmiş ve sıralanmış ürünler
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Renk filtresi
        if (filters.colors.length > 0) {
            result = result.filter(product => {
                if (!product.colors) return false;
                return product.colors.some(color => filters.colors.includes(color.code));
            });
        }

        // Beden filtresi
        if (filters.sizes.length > 0) {
            result = result.filter(product => {
                if (!product.sizes) return false;
                return product.sizes.some(size => filters.sizes.includes(size));
            });
        }

        // Fiyat filtresi (seri fiyatı üzerinden - toptan satış standardı)
        if (filters.priceMin !== null) {
            result = result.filter(product => product.seriesPrice >= filters.priceMin);
        }
        if (filters.priceMax !== null) {
            result = result.filter(product => product.seriesPrice <= filters.priceMax);
        }

        // Sıralama
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.seriesPrice - b.seriesPrice);
                break;
            case 'price-high':
                result.sort((a, b) => b.seriesPrice - a.seriesPrice);
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
                break;
            case 'newest':
            default:
                // Yeni ürünler önce, sonra ID'ye göre (en yeni = en yüksek ID varsayımı)
                result.sort((a, b) => {
                    if (a.isNew && !b.isNew) return -1;
                    if (!a.isNew && b.isNew) return 1;
                    return b.id - a.id;
                });
                break;
        }

        return result;
    }, [products, filters, sortBy]);

    // URL parametrelerini güncelle
    useEffect(() => {
        const params = new URLSearchParams();

        if (sortBy !== 'newest') params.set('sort', sortBy);
        if (filters.colors.length > 0) params.set('colors', filters.colors.join(','));
        if (filters.sizes.length > 0) params.set('sizes', filters.sizes.join(','));
        if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
        if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());

        setSearchParams(params, { replace: true });
    }, [sortBy, filters, setSearchParams]);

    // Veri çekme
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Kategori bilgisi
                if (slug) {
                    const categoryResult = await getCategoryBySlug(slug);
                    if (categoryResult.success) {
                        setCategory(categoryResult.data);
                    }

                    // Bu kategorinin ürünleri
                    const productsResult = await getProductsByCategory(slug);
                    if (productsResult.success) {
                        // Check if it's a category endpoint response with products array
                        const rawProducts = productsResult.data?.products || productsResult.data || [];
                        setProducts(formatProductsForCards(rawProducts));
                    }
                } else {
                    // Tüm ürünler
                    const productsResult = await getAllProducts();
                    if (productsResult.success) {
                        setProducts(formatProductsForCards(productsResult.data) || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching category data:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    // Filtre değişikliği
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Filtreleri temizle
    const handleClearFilters = () => {
        setFilters({
            colors: [],
            sizes: [],
            priceMin: null,
            priceMax: null
        });
    };

    // Sıralama değişikliği
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const categoryName = category?.name || 'Tüm Ürünler';

    if (loading) {
        return (
            <main className="category-page">
                <DeferredWrapper>
                    <CategorySkeleton />
                </DeferredWrapper>
            </main>
        );
    }

    return (
        <main className="category-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Ana Sayfa</Link>
                    <span className="breadcrumb__separator">/</span>
                    <span className="breadcrumb__current">{categoryName}</span>
                </nav>

                {/* Category Header */}
                <header className="category-header">
                    <div className="category-header__top">
                        <h1 className="category-header__title">{categoryName}</h1>
                        <span className="category-header__count">
                            {filteredProducts.length} ürün
                            {filteredProducts.length !== products.length && (
                                <span className="category-header__count-total">
                                    {' '}/ {products.length} toplam
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="category-header__controls">
                        <div className="category-header__sort">
                            <label htmlFor="sort-select" className="visually-hidden">
                                Sıralama
                            </label>
                            <select
                                id="sort-select"
                                className="sort-select"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <option value="newest">Yeni Gelenler</option>
                                <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                                <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                                <option value="name">İsme Göre</option>
                            </select>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="category-content">
                    {/* Filter Sidebar */}
                    <FilterSidebar
                        availableColors={availableColors}
                        availableSizes={availableSizes}
                        selectedFilters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        totalProducts={products.length}
                        filteredCount={filteredProducts.length}
                    />

                    {/* Product Grid */}
                    <div className="category-products">
                        {filteredProducts.length > 0 ? (
                            <div className="product-grid">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h2>Aradığınız kriterlere uygun ürün bulunamadı</h2>
                                <p>Farklı filtreler deneyebilir veya filtreleri temizleyebilirsiniz.</p>
                                <button
                                    onClick={handleClearFilters}
                                    className="btn btn-primary"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Category;
