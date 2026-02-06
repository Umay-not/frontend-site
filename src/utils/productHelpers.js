/**
 * Product Data Helpers
 * API'den gelen ürün verilerini frontend formatına dönüştürür
 */

// Seri sabitleri
const SERIES_COUNT = 10; // Standart seri adedi

/**
 * API'den gelen görselleri renklere göre grupla
 * Input: [{url, colorCode, displayOrder}]
 * Output: [[url1, url2], [url3]] - renklere göre gruplanmış
 */
export const groupImagesByColor = (images) => {
    if (!images || images.length === 0) {
        return [['/images/placeholder.png']];
    }

    // Renk kodlarına göre grupla
    const colorGroups = {};

    images.forEach(img => {
        const colorCode = img.colorCode || img.color_code || 'default';
        if (!colorGroups[colorCode]) {
            colorGroups[colorCode] = [];
        }
        colorGroups[colorCode].push(img.url || img.image_url);
    });

    // Grupları array'e çevir
    const result = Object.values(colorGroups);

    // Her grubu displayOrder'a göre sırala (zaten sıralı olmalı)
    return result.length > 0 ? result : [['/images/placeholder.png']];
};

/**
 * API ürün verisini ProductCard formatına dönüştür
 */
export const formatProductForCard = (product) => {
    if (!product) return null;

    // Handle images - backend may return:
    // 1. Already grouped 2D array: [[url1, url2], [url3]]
    // 2. Flat array of objects: [{url, colorCode}, ...]
    // 3. Flat array of strings: [url1, url2]
    let images;

    if (!product.images || product.images.length === 0) {
        images = [['/images/placeholder.png']];
    } else if (Array.isArray(product.images[0]) && typeof product.images[0][0] === 'string') {
        // Already grouped 2D array from backend - use directly
        images = product.images;
    } else if (typeof product.images[0] === 'string') {
        // Flat array of strings - wrap in array
        images = [product.images];
    } else {
        // Flat array of objects - needs grouping
        images = groupImagesByColor(product.images);
    }

    const seriesPrice = product.seriesPrice || Math.round((product.price || 0) * SERIES_COUNT);

    return {
        id: product.id,
        name: product.name,
        price: product.price,
        seriesPrice: seriesPrice,
        seriesCount: product.seriesCount || SERIES_COUNT,
        images: images,
        colors: product.colors || [],
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        isNew: product.isNew || product.is_new || false,
        inStock: product.inStock !== undefined ? product.inStock : (product.in_stock !== undefined ? product.in_stock : true),
        category: product.category,
        categoryId: product.categoryId || product.category_id,
        description: product.description
    };
};

/**
 * API ürün listesini ProductCard formatına dönüştür
 */
export const formatProductsForCards = (products) => {
    if (!products || !Array.isArray(products)) return [];
    return products.map(formatProductForCard).filter(Boolean);
};

export default {
    groupImagesByColor,
    formatProductForCard,
    formatProductsForCards,
    SERIES_COUNT
};
