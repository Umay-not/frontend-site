/**
 * AI Service - Frontend
 * Chat widget için API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Session ID oluştur veya mevcut olanı al
 */
export const getSessionId = () => {
    let sessionId = localStorage.getItem('ai_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('ai_session_id', sessionId);
    }
    return sessionId;
};

/**
 * Soru sor
 */
export const askQuestion = async (message, customerName = null, customerEmail = null) => {
    try {
        const sessionId = getSessionId();

        const response = await fetch(`${API_URL}/ai/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId,
                message,
                customerName,
                customerEmail
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ask question error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Konuşma geçmişini getir
 */
export const getConversation = async () => {
    try {
        const sessionId = getSessionId();

        const response = await fetch(`${API_URL}/ai/conversation/${sessionId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get conversation error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Mesaj durumunu kontrol et (polling)
 */
export const checkResponseStatus = async (messageId) => {
    try {
        const response = await fetch(`${API_URL}/ai/response/${messageId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Check response status error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Yeni session başlat (konuşmayı sıfırla)
 */
export const resetConversation = () => {
    localStorage.removeItem('ai_session_id');
    return getSessionId();
};

export default {
    getSessionId,
    askQuestion,
    getConversation,
    checkResponseStatus,
    resetConversation
};
