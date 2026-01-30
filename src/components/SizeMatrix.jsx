import { useState, useEffect } from 'react';
import './SizeMatrix.css';

const SizeMatrix = ({ sizes, seriesCount, onQuantityChange }) => {
    const [quantities, setQuantities] = useState({});
    const [totalQuantity, setTotalQuantity] = useState(0);

    // Initialize quantities
    useEffect(() => {
        const initial = {};
        sizes.forEach(size => {
            initial[size] = 0;
        });
        setQuantities(initial);
    }, [sizes]);

    // Calculate total
    useEffect(() => {
        const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
        setTotalQuantity(total);
        if (onQuantityChange) {
            onQuantityChange(quantities, total);
        }
    }, [quantities, onQuantityChange]);

    const handleQuantityChange = (size, value) => {
        const qty = Math.max(0, parseInt(value) || 0);
        setQuantities(prev => ({
            ...prev,
            [size]: qty
        }));
    };

    const increment = (size) => {
        setQuantities(prev => ({
            ...prev,
            [size]: prev[size] + 1
        }));
    };

    const decrement = (size) => {
        setQuantities(prev => ({
            ...prev,
            [size]: Math.max(0, prev[size] - 1)
        }));
    };

    const fillSeries = () => {
        // Standard series distribution (e.g., S:2, M:3, L:3, XL:2)
        const distribution = {
            'S': 2, 'M': 3, 'L': 3, 'XL': 2,
            'XS': 1, '2XL': 1, '3XL': 1
        };

        const newQuantities = {};
        sizes.forEach(size => {
            newQuantities[size] = distribution[size] || 2;
        });
        setQuantities(newQuantities);
    };

    const clearAll = () => {
        const cleared = {};
        sizes.forEach(size => {
            cleared[size] = 0;
        });
        setQuantities(cleared);
    };

    return (
        <div className="size-matrix">
            <div className="size-matrix__header">
                <h3 className="size-matrix__title">Beden Seçimi</h3>
                <div className="size-matrix__actions">
                    <button
                        type="button"
                        className="size-matrix__action-btn"
                        onClick={fillSeries}
                    >
                        Seri Doldur
                    </button>
                    <button
                        type="button"
                        className="size-matrix__action-btn size-matrix__action-btn--clear"
                        onClick={clearAll}
                    >
                        Temizle
                    </button>
                </div>
            </div>

            <div className="size-matrix__grid">
                {sizes.map(size => (
                    <div key={size} className="size-matrix__item">
                        <span className="size-matrix__size">{size}</span>
                        <div className="size-matrix__input-group">
                            <button
                                type="button"
                                className="size-matrix__btn"
                                onClick={() => decrement(size)}
                            >
                                −
                            </button>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={quantities[size] || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/^0+/, '').replace(/\D/g, '');
                                    handleQuantityChange(size, val);
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '') {
                                        handleQuantityChange(size, 0);
                                    }
                                }}
                                placeholder="0"
                                className="size-matrix__input"
                            />
                            <button
                                type="button"
                                className="size-matrix__btn"
                                onClick={() => increment(size)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="size-matrix__summary">
                <div className="size-matrix__total">
                    <span className="size-matrix__total-label">Toplam Adet:</span>
                    <span className="size-matrix__total-value">{totalQuantity}</span>
                </div>
                {seriesCount && (
                    <p className="size-matrix__hint">
                        Standart seri: {seriesCount} adet
                    </p>
                )}
            </div>
        </div>
    );
};

export default SizeMatrix;
