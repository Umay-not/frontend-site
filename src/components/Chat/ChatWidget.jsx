/**
 * Chat Widget Component
 * AI müşteri temsilcisi chat widget
 */

import { useState, useEffect, useRef } from 'react';
import { askQuestion, getConversation, checkResponseStatus } from '../../services/aiService';
import './ChatWidget.css';

const ChatWidget = () => {
    // Storage keys
    const STORAGE_KEYS = {
        MESSAGES: 'chat_messages',
        CONVERSATION_ID: 'chat_conversation_id',
        IS_OPEN: 'chat_is_open'
    };

    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.IS_OPEN);
        return saved === 'true';
    });
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        return saved ? JSON.parse(saved) : [];
    });
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }, [messages]);

    // Save isOpen state to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.IS_OPEN, isOpen.toString());
    }, [isOpen]);

    // Cross-tab synchronization - listen for storage changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEYS.MESSAGES && e.newValue) {
                setMessages(JSON.parse(e.newValue));
            } else if (e.key === STORAGE_KEYS.IS_OPEN && e.newValue) {
                setIsOpen(e.newValue === 'true');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversation history when widget opens (only if localStorage is empty)
    useEffect(() => {
        if (isOpen) {
            // If we have messages in localStorage, don't fetch from server
            if (messages.length === 0) {
                loadConversation();
            }
            inputRef.current?.focus();
        }
    }, [isOpen]);



    const loadConversation = async () => {
        const result = await getConversation();
        if (result.success && result.data?.messages) {
            const formattedMessages = result.data.messages.map(msg => ({
                id: msg.id,
                type: msg.type === 'user' ? 'user' : 'ai',
                content: msg.content,
                createdAt: msg.createdAt,
                pending: false
            }));
            setMessages(formattedMessages);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const message = inputValue.trim();
        if (!message || isLoading) return;

        // Add user message to UI
        const userMessage = {
            id: 'temp_' + Date.now(),
            type: 'user',
            content: message,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await askQuestion(message);

            if (result.success && result.data.content) {
                // Add AI response immediately
                const aiMessage = {
                    id: result.data.messageId,
                    type: 'ai',
                    content: result.data.content,
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                // Show error message
                const errorMessage = {
                    id: 'error_' + Date.now(),
                    type: 'ai',
                    content: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="chat-widget">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    className="chat-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Canlı destek"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-avatar">👗</div>
                        <div className="chat-header-info">
                            <h3 className="chat-header-title">Stil Danışmanı</h3>
                            <span className="chat-header-status">Aktif</span>
                        </div>
                        <button
                            className="chat-close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Kapat"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="welcome-message">
                                <div className="welcome-emoji">👋</div>
                                <h3>Merhaba!</h3>
                                <p>
                                    Ben Trafo'nun stil danışmanıyım. Size ürünlerimiz hakkında
                                    yardımcı olabilirim. Beden, renk, kombinasyon veya
                                    herhangi bir konuda soru sorabilirsiniz.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`message ${msg.type} ${msg.pending ? 'pending' : ''}`}
                                >
                                    <div className="message-bubble">
                                        {msg.content}
                                    </div>
                                    <span className="message-time">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                    {msg.pending && (
                                        <div className="pending-indicator">
                                            <div className="pending-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form className="chat-input-area" onSubmit={handleSubmit}>
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Bir soru sorun..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={!inputValue.trim() || isLoading}
                            aria-label="Gönder"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
