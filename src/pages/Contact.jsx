import { useState, useEffect } from 'react';
import { getSetting } from '@/services/settingsService';
import { sendContactMessage } from '@/services/contactService';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [contactInfo, setContactInfo] = useState(null);
    const [socialLinks, setSocialLinks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [contactResult, socialResult] = await Promise.all([
                    getSetting('contact_info'),
                    getSetting('social_links')
                ]);

                if (contactResult.success) {
                    setContactInfo(contactResult.data);
                }
                if (socialResult.success) {
                    setSocialLinks(socialResult.data);
                }
            } catch (error) {
                console.error('Error fetching contact data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await sendContactMessage(formData);

        if (result.success) {
            alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } else {
            alert('Bir hata oluştu: ' + (result.error || 'Lütfen tekrar deneyin.'));
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <main className="contact-page">
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
        <main className="contact-page">
            <div className="container">
                <header className="contact-header">
                    <h1>İletişim</h1>
                    <p>Sorularınız için bizimle iletişime geçin</p>
                </header>

                <div className="contact-layout">
                    {/* Contact Info */}
                    <div className="contact-info">
                        <div className="contact-info__item">
                            <div className="contact-info__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="contact-info__content">
                                <h3>Adres</h3>
                                <p>{contactInfo?.address?.split(',')[0] || 'Merter Tekstil Merkezi'}</p>
                                <p>{contactInfo?.address?.split(',').slice(1).join(',').trim() || 'İstanbul, Türkiye'}</p>
                            </div>
                        </div>

                        <div className="contact-info__item">
                            <div className="contact-info__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div className="contact-info__content">
                                <h3>Telefon</h3>
                                <p>{contactInfo?.phone || '+90 (212) 555 0000'}</p>
                                <p>{contactInfo?.whatsapp || '+90 (532) 555 0000'} (WhatsApp)</p>
                            </div>
                        </div>

                        <div className="contact-info__item">
                            <div className="contact-info__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div className="contact-info__content">
                                <h3>E-posta</h3>
                                {contactInfo?.emails?.map((email, index) => (
                                    <p key={index}>{email}</p>
                                )) || (
                                        <>
                                            <p>info@fiftyone.com</p>
                                            <p>satis@fiftyone.com</p>
                                        </>
                                    )}
                            </div>
                        </div>

                        <div className="contact-info__item">
                            <div className="contact-info__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="contact-info__content">
                                <h3>Çalışma Saatleri</h3>
                                <p>{contactInfo?.workingHours?.weekdays || 'Pazartesi - Cumartesi: 09:00 - 19:00'}</p>
                                <p>{contactInfo?.workingHours?.weekend || 'Pazar: Kapalı'}</p>
                            </div>
                        </div>

                        <div className="contact-social">
                            {socialLinks?.instagram && (
                                <a href={socialLinks.instagram} className="social-btn" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                                    </svg>
                                </a>
                            )}
                            {socialLinks?.whatsapp && (
                                <a href={socialLinks.whatsapp} className="social-btn" aria-label="WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <h2>Mesaj Gönderin</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Ad Soyad *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">E-posta *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Telefon</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Konu *</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="siparis">Sipariş Hakkında</option>
                                    <option value="urun">Ürün Bilgisi</option>
                                    <option value="iade">İade/Değişim</option>
                                    <option value="isbirligi">İş Birliği</option>
                                    <option value="diger">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Mesajınız *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="input textarea"
                                rows="5"
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Gönderiliyor...' : 'Gönder'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Contact;
