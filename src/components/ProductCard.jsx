import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(0);

    const {
        id,
        name,
        price,
        seriesPrice,
        seriesCount,
        images,
        colors,
        isNew,
        inStock
    } = product;

    // İkinci görsel var mı kontrol et
    const hasSecondImage = !!(images[selectedColor]?.[1] || images[0]?.[1]);

    // İlk görsel: İkinci görsel yoksa HER ZAMAN active, varsa sadece hover değilken active
    const showFirstImage = !hasSecondImage || !isHovered;

    // İkinci görsel: Sadece varsa ve hover durumundaysa active
    const showSecondImage = hasSecondImage && isHovered;

    return (
        <div
            className="product-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="product-card__image-wrapper">
                <Link to={`/urun/${id}`} className="product-card__image-container">
                    <img
                        src={images[selectedColor]?.[0] || images[0]?.[0]}
                        alt={name}
                        className={`product-card__image ${showFirstImage ? 'active' : ''}`}
                    />
                    {hasSecondImage && (
                        <img
                            src={images[selectedColor]?.[1] || images[0]?.[1]}
                            alt={name}
                            className={`product-card__image product-card__image--hover ${showSecondImage ? 'active' : ''}`}
                        />
                    )}

                    {/* Badges */}
                    <div className="product-card__badges">
                        {isNew && <span className="badge badge-new">Yeni</span>}
                        {!inStock && <span className="badge badge-outofstock">Tükendi</span>}
                    </div>
                </Link>

                {/* Quick Add (Visible on Hover - Inside Image) */}
                <div className={`product-card__quick-add ${isHovered ? 'active' : ''}`}>
                    <Link to={`/urun/${id}`} className="btn btn-primary product-card__add-btn">
                        Seri Ekle
                    </Link>
                </div>
            </div>

            {/* Product Info */}
            <div className="product-card__info">
                <Link to={`/urun/${id}`} className="product-card__name">
                    {name}
                </Link>

                <div className="product-card__pricing">
                    <span className="product-card__price">{seriesPrice} TL</span>
                    <span className="product-card__series-info">/ Seri ({seriesCount} adet)</span>
                </div>

                <span className="product-card__unit-price">
                    Birim: {price} TL
                </span>

                {/* Color Swatches */}
                {colors && colors.length > 1 && (
                    <div className="product-card__colors">
                        {colors.map((color, index) => (
                            <button
                                key={color.code}
                                className={`product-card__color-swatch ${selectedColor === index ? 'active' : ''}`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => setSelectedColor(index)}
                                title={color.name}
                                aria-label={color.name}
                            />
                        ))}
                        <span className="product-card__color-count">+{colors.length}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
