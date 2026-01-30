/**
 * Settings Service - API calls for site settings
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get all site settings
 */
export const getAllSettings = async () => {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch settings');
        }

        return data;
    } catch (error) {
        console.error('Get all settings error:', error);
        throw error;
    }
};

/**
 * Get specific setting by key
 */
export const getSetting = async (key) => {
    try {
        const response = await fetch(`${API_URL}/settings/${key}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch setting');
        }

        return data;
    } catch (error) {
        console.error('Get setting error:', error);
        throw error;
    }
};

/**
 * Alias for backward compatibility
 */
export const getSettings = getAllSettings;

export default {
    getAllSettings,
    getSetting,
    getSettings
};
