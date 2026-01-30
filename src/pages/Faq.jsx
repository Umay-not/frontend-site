import { useState, useEffect } from 'react';
import { getAllFaqs } from '@/services/faqService';
import { getSetting } from '@/services/settingsService';
import './Faq.css';

const Faq = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [faqData, setFaqData] = useState([]);
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [faqResult, contactResult] = await Promise.all([
                    getAllFaqs(),
                    getSetting('contact_info')
                ]);

                if (faqResult.success) {
                    setFaqData(faqResult.data || []);
                }
                if (contactResult.success) {
                    setContactInfo(contactResult.data);
                }
            } catch (error) {
                console.error('Error fetching FAQ data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleQuestion = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === key ? null : key);
    };

    if (loading) {
        return (
            <main className="faq">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="faq">
            <div className="container">
                <div className="faq__header">
                    <h1>Sıkça Sorulan Sorular</h1>
                    <p>Aradığınız cevabı bulamadıysanız bizimle iletişime geçmekten çekinmeyin.</p>
                </div>

                <div className="faq__content">
                    {faqData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="faq__category">
                            <h2 className="faq__category-title">{category.category}</h2>
                            <div className="faq__questions">
                                {category.questions.map((item, questionIndex) => {
                                    const key = `${categoryIndex}-${questionIndex}`;
                                    const isOpen = openIndex === key;
                                    return (
                                        <div
                                            key={item.id || questionIndex}
                                            className={`faq__item ${isOpen ? 'open' : ''}`}
                                        >
                                            <button
                                                className="faq__question"
                                                onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{item.question || item.q}</span>
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d={isOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                                                </svg>
                                            </button>
                                            <div className="faq__answer">
                                                <p>{item.answer || item.a}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="faq__contact">
                    <h2>Başka Sorularınız mı Var?</h2>
                    <p>Yukarıdaki sorular arasında aradığınızı bulamadıysanız, müşteri hizmetlerimize ulaşabilirsiniz.</p>
                    <div className="faq__contact-methods">
                        <a href={`tel:${contactInfo?.phone?.replace(/\s/g, '') || '+902125551234'}`} className="faq__contact-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>{contactInfo?.phone || '+90 212 555 12 34'}</span>
                        </a>
                        <a href={`mailto:${contactInfo?.emails?.[0] || 'info@fiftyone.com'}`} className="faq__contact-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>{contactInfo?.emails?.[0] || 'info@fiftyone.com'}</span>
                        </a>
                        <a href={contactInfo?.whatsapp ? `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}` : 'https://wa.me/902125551234'} className="faq__contact-item">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            <span>WhatsApp Destek</span>
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Faq;
