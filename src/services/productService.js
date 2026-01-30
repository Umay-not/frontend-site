/**
 * Product Service - API calls for products
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://fiftyone-backend.onrender.com/api';

/**
 * Get all products with optional filters
 */
export const getAllProducts = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.category) queryParams.append('category', params.category);
        if (params.inStock !== undefined) queryParams.append('inStock', params.inStock);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        if (params.sort) queryParams.append('sort', params.sort);

        const url = `${API_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch products');
        }

        return data;
    } catch (error) {
        console.error('Get all products error:', error);
        throw error;
    }
};

/**
 * Get new products
 */
export const getNewProducts = async (limit = 8) => {
    try {
        const response = await fetch(`${API_URL}/products/new?limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch new products');
        }

        return data;
    } catch (error) {
        console.error('Get new products error:', error);
        throw error;
    }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (slug, params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `${API_URL}/products/category/${slug}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch products');
        }

        return data;
    } catch (error) {
        console.error('Get products by category error:', error);
        throw error;
    }
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch product');
        }

        return data;
    } catch (error) {
        console.error('Get product by ID error:', error);
        throw error;
    }
};

/**
 * Search products
 */
export const searchProducts = async (query, limit = 20) => {
    try {
        const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to search products');
        }

        return data;
    } catch (error) {
        console.error('Search products error:', error);
        throw error;
    }
};

export default {
    getAllProducts,
    getNewProducts,
    getProductsByCategory,
    getProductById,
    searchProducts
};
