import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = ({ content }) => {
    // Default fallback values if content is missing
    const {
        eyebrow = 'TOPTAN SATIŞ',
        title = '2026 Kış Koleksiyonu',
        subtitle = 'En yeni trendleri toptan fiyatlarla keşfedin. Minimum sipariş tutarı 500 TL.',
        primaryButton = { text: 'Koleksiyonu Keşfet', link: '/kategori/yeni-gelenler' },
        secondaryButton = { text: 'Triko & Kazak', link: '/kategori/kazak' },
        image = '/images/hero_winter_fashion.png'
    } = content || {};

    return (
        <section className="hero-section">
            <div className="hero-section__image-container">
                <img
                    src={image}
                    alt={title}
                    className="hero-section__image"
                    loading="eager"
                />
            </div>

            <div className="hero-section__overlay"></div>

            <div className="hero-section__content">
                {eyebrow && <div className="hero-section__eyebrow">{eyebrow}</div>}

                <h1 className="hero-section__title">
                    {title}
                </h1>

                {subtitle && <p className="hero-section__subtitle">{subtitle}</p>}

                <div className="hero-section__actions">
                    <Link to={primaryButton.link} className="hero-btn hero-btn--primary">
                        {primaryButton.text}
                    </Link>
                    {secondaryButton && (
                        <Link to={secondaryButton.link} className="hero-btn hero-btn--secondary">
                            {secondaryButton.text}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
