import { useState, useEffect } from 'react';
import { getSettings } from '@/services/settingsService';
import './About.css';

const About = () => {
    const [aboutStory, setAboutStory] = useState(null);
    const [aboutStats, setAboutStats] = useState(null);
    const [aboutValues, setAboutValues] = useState([]);
    const [aboutWhyUs, setAboutWhyUs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await getSettings(['about_story', 'about_stats', 'about_values', 'about_why_us']);
                if (result.success) {
                    setAboutStory(result.data.about_story);
                    setAboutStats(result.data.about_stats);
                    setAboutValues(result.data.about_values || []);
                    setAboutWhyUs(result.data.about_why_us || []);
                }
            } catch (error) {
                console.error('Error fetching about data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="about-page">
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
        <main className="about-page">
            {/* Hero */}
            <section className="about-hero">
                <div className="container">
                    <h1>Hakkımızda</h1>
                    <p>Kadın giyimde güvenilir toptan satış ortağınız</p>
                </div>
            </section>

            <div className="container">
                {/* Story */}
                <section className="about-section">
                    <div className="about-section__content">
                        <span className="about-section__label">Hikayemiz</span>
                        <h2>{aboutStory?.title || '2020\'den Beri Yanınızdayız'}</h2>
                        {aboutStory?.content?.split('\n\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        )) || (
                                <>
                                    <p>
                                        FIFTYONE, 2020 yılında İstanbul'da kadın giyim sektöründe toptan satış yapmak
                                        amacıyla kuruldu. Kısa sürede Türkiye'nin dört bir yanındaki perakende
                                        mağazalarına ve butiklere hizmet veren güvenilir bir iş ortağı haline geldik.
                                    </p>
                                    <p>
                                        Amacımız, en son moda trendlerini uygun fiyatlarla sunarak müşterilerimizin
                                        işlerini büyütmelerine yardımcı olmaktır.
                                    </p>
                                </>
                            )}
                    </div>
                    <div className="about-section__image">
                        <img
                            src="https://bwsfgmmbyybtpqdwmbsw.supabase.co/storage/v1/object/public/content/categories/yeni-gelenler/category-knitwear.png"
                            alt="FIFTYONE Showroom"
                            onError={(e) => { e.target.src = '/images/category-knitwear.png'; }}
                        />
                    </div>
                </section>

                {/* Values */}
                <section className="about-values">
                    <h2 className="section-title">Değerlerimiz</h2>
                    <div className="values-grid">
                        {aboutValues.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-card__number">{value.number}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="about-stats">
                    <div className="stat-item">
                        <span className="stat-item__number">{aboutStats?.customers || '500+'}</span>
                        <span className="stat-item__label">Aktif Müşteri</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-item__number">{aboutStats?.products || '1000+'}</span>
                        <span className="stat-item__label">Ürün Çeşidi</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-item__number">{aboutStats?.cities || '81'}</span>
                        <span className="stat-item__label">İl'e Teslimat</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-item__number">{aboutStats?.satisfaction || '%98'}</span>
                        <span className="stat-item__label">Müşteri Memnuniyeti</span>
                    </div>
                </section>

                {/* Why Us */}
                <section className="about-why">
                    <h2 className="section-title">Neden FIFTYONE?</h2>
                    <div className="why-grid">
                        {aboutWhyUs.map((item, index) => (
                            <div key={index} className="why-item">
                                <div className="why-item__icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        {item.icon === 'box' && <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
                                        {item.icon === 'truck' && <>
                                            <rect x="1" y="3" width="15" height="13" />
                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                        </>}
                                        {item.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                                        {item.icon === 'support' && <>
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </>}
                                        {!['box', 'truck', 'shield', 'support'].includes(item.icon) && <circle cx="12" cy="12" r="10" />}
                                    </svg>
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default About;
