/**
 * FAQ Service - API calls for FAQs
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://fiftyone-backend.onrender.com/api';

/**
 * Get all FAQs
 */
export const getAllFaqs = async () => {
    try {
        const response = await fetch(`${API_URL}/faqs`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch FAQs');
        }

        return data.data || [];
    } catch (error) {
        console.error('Get all FAQs error:', error);
        throw error;
    }
};

export default {
    getAllFaqs
};
