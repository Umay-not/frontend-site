/**
 * Contact Service - API calls for contact form
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://fiftyone-backend.onrender.com/api';

/**
 * Send contact message
 */
export const sendContactMessage = async (messageData) => {
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send contact message');
        }

        return data;
    } catch (error) {
        console.error('Send contact message error:', error);
        throw error;
    }
};

export default {
    sendContactMessage
};
