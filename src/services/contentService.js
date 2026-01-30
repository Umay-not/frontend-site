/**
 * Content Service - API calls for content blocks
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get all active content blocks
 */
export const getActiveContentBlocks = async () => {
    try {
        const response = await fetch(`${API_URL}/content`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch content blocks');
        }

        return data.data || {};
    } catch (error) {
        console.error('Get active content blocks error:', error);
        throw error;
    }
};

/**
 * Alias for backward compatibility
 */
export const getContentBlocks = getActiveContentBlocks;

export default {
    getActiveContentBlocks,
    getContentBlocks
};
