/**
 * Static Products Data (Fallback)
 * Supabase bağlantısı yokken kullanılan statik veriler
 */

export const categories = [
    { id: 'kazak', slug: 'kazak', name: 'Kazak & Triko' },
    { id: 'hirka', slug: 'hirka', name: 'Hırka' },
    { id: 'elbise', slug: 'elbise', name: 'Elbise' },
    { id: 'mont-kaban', slug: 'mont-kaban', name: 'Mont & Kaban' },
    { id: 'yeni-gelenler', slug: 'yeni-gelenler', name: 'Yeni Gelenler' }
];

export const products = [
    {
        id: 1,
        name: 'Örnek Kazak',
        price: 150,
        seriesPrice: 1350,
        seriesCount: 10,
        category: 'kazak',
        isNew: true,
        inStock: true,
        images: [['/images/placeholder.png']],
        colors: [{ name: 'Siyah', hex: '#000000', code: 'black' }],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Örnek ürün açıklaması'
    }
];

/**
 * Kategoriye göre ürünleri filtrele
 */
export const getProductsByCategory = (categorySlug) => {
    if (categorySlug === 'yeni-gelenler') {
        return products.filter(p => p.isNew);
    }
    return products.filter(p => p.category === categorySlug);
};

/**
 * ID ile ürün getir
 */
export const getProductById = (id) => {
    return products.find(p => p.id === parseInt(id)) || null;
};

export default {
    products,
    categories,
    getProductsByCategory,
    getProductById
};
