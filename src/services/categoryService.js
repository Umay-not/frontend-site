/**
 * Category Service - API calls for categories
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get all categories
 */
export const getAllCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch categories');
        }

        return data.data || [];
    } catch (error) {
        console.error('Get all categories error:', error);
        throw error;
    }
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/categories/${slug}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch category');
        }

        return data.data;
    } catch (error) {
        console.error('Get category by slug error:', error);
        throw error;
    }
};

export default {
    getAllCategories,
    getCategoryBySlug
};
