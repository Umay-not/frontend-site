import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSetting } from '../../backend-server/src/services/siteSettingsService.js';
import { getContentBlocks } from '../../backend-server/src/services/admin/adminContentService.js';
import './Footer.css';

const Footer = () => {
    const [contactInfo, setContactInfo] = useState(null);
    const [socialLinks, setSocialLinks] = useState(null);
    const [logoUrl, setLogoUrl] = useState('/images/logo.png');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contactResult, socialResult, contentResult] = await Promise.all([
                    getSetting('contact_info'),
                    getSetting('social_links'),
                    getContentBlocks()
                ]);

                if (contactResult.success) {
                    setContactInfo(contactResult.data);
                }
                if (socialResult.success) {
                    setSocialLinks(socialResult.data);
                }
                if (contentResult.success && contentResult.data?.logo?.url) {
                    setLogoUrl(contentResult.data.logo.url);
                }
            } catch (error) {
                console.error('Error fetching footer data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    {/* Brand Column */}
                    <div className="footer__column footer__brand">
                        <Link to="/" className="footer__logo">
                            <img src={logoUrl} alt="Fifty One" className="footer__logo-img" />
                        </Link>
                        <p className="footer__tagline">
                            Kadın giyim toptan satış platformu.
                            En yeni trendleri uygun fiyatlarla keşfedin.
                        </p>
                        <div className="footer__social">
                            {socialLinks?.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            )}
                            {socialLinks?.whatsapp && (
                                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer__column">
                        <h4 className="footer__heading">Hızlı Linkler</h4>
                        <ul className="footer__links">
                            <li><Link to="/kategori/yeni-gelenler">YENİ GELENLER</Link></li>
                            <li><Link to="/kategori/kazak">KAZAK & HIRKA</Link></li>
                            <li><Link to="/kategori/elbise">ELBİSE</Link></li>
                            <li><Link to="/kategori/mont-kaban">MONT & KABAN</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="footer__column">
                        <h4 className="footer__heading">Müşteri Hizmetleri</h4>
                        <ul className="footer__links">
                            <li><Link to="/hakkimizda">Hakkımızda</Link></li>
                            <li><Link to="/iletisim">İletişim</Link></li>
                            <li><Link to="/sss">S.S.S.</Link></li>
                            <li><Link to="/kargo">Kargo & Teslimat</Link></li>
                            <li><Link to="/iade">İade Koşulları</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer__column">
                        <h4 className="footer__heading">İletişim</h4>
                        <ul className="footer__contact">
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>{contactInfo?.phone || '+90 (212) 555 0000'}</span>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{contactInfo?.emails?.[0] || 'info@fiftyone.com'}</span>
                            </li>
                            <li>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{contactInfo?.address?.split(',').slice(-1)[0]?.trim() || 'İstanbul, Türkiye'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <p>© 2026 FIFTYONE. Tüm hakları saklıdır.</p>
                    <div className="footer__legal">
                        <Link to="/gizlilik">Gizlilik Politikası</Link>
                        <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
