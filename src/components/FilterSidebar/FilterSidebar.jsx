import { useState } from 'react';
import './FilterSidebar.css';

/**
 * FilterSidebar Component
 * E-ticaret standartlarına uygun filtreleme paneli
 * 
 * - Renk filtresi (ürünlerden dinamik)
 * - Beden filtresi (ürünlerden dinamik)
 * - Fiyat aralığı (seri fiyatı üzerinden - toptan satış standardı)
 */
const FilterSidebar = ({
    availableColors = [],
    availableSizes = [],
    selectedFilters = {},
    onFilterChange,
    onClearFilters,
    totalProducts = 0,
    filteredCount = 0
}) => {
    const [priceMin, setPriceMin] = useState(selectedFilters.priceMin || '');
    const [priceMax, setPriceMax] = useState(selectedFilters.priceMax || '');

    // Renk seçimi toggle
    const handleColorToggle = (colorCode) => {
        const currentColors = selectedFilters.colors || [];
        const newColors = currentColors.includes(colorCode)
            ? currentColors.filter(c => c !== colorCode)
            : [...currentColors, colorCode];

        onFilterChange({ ...selectedFilters, colors: newColors });
    };

    // Beden seçimi toggle
    const handleSizeToggle = (size) => {
        const currentSizes = selectedFilters.sizes || [];
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter(s => s !== size)
            : [...currentSizes, size];

        onFilterChange({ ...selectedFilters, sizes: newSizes });
    };

    // Fiyat filtresi uygula
    const handlePriceApply = () => {
        onFilterChange({
            ...selectedFilters,
            priceMin: priceMin ? parseFloat(priceMin) : null,
            priceMax: priceMax ? parseFloat(priceMax) : null
        });
    };

    // Enter ile fiyat filtresi uygula
    const handlePriceKeyDown = (e) => {
        if (e.key === 'Enter') {
            handlePriceApply();
        }
    };

    // Aktif filtre var mı kontrol
    const hasActiveFilters =
        (selectedFilters.colors?.length > 0) ||
        (selectedFilters.sizes?.length > 0) ||
        selectedFilters.priceMin ||
        selectedFilters.priceMax;

    return (
        <aside className="filter-sidebar">
            {/* Filtre Başlığı ve Sonuç Sayısı */}
            <div className="filter-sidebar__header">
                <h2 className="filter-sidebar__title">FİLTRELER</h2>
                {hasActiveFilters && (
                    <span className="filter-sidebar__count">
                        {filteredCount} / {totalProducts} ürün
                    </span>
                )}
            </div>

            {/* Renk Filtresi */}
            {availableColors.length > 0 && (
                <div className="filter-group">
                    <h3 className="filter-group__title">RENK</h3>
                    <div className="filter-group__colors">
                        {availableColors.map((color) => (
                            <button
                                key={color.code}
                                className={`filter-color ${selectedFilters.colors?.includes(color.code) ? 'active' : ''
                                    }`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => handleColorToggle(color.code)}
                                title={color.name}
                                aria-label={`${color.name} rengi ${selectedFilters.colors?.includes(color.code) ? 'seçili' : ''
                                    }`}
                            />
                        ))}
                    </div>
                    {selectedFilters.colors?.length > 0 && (
                        <div className="filter-group__selected">
                            {selectedFilters.colors.map(code => {
                                const color = availableColors.find(c => c.code === code);
                                return color ? (
                                    <span key={code} className="filter-tag">
                                        {color.name}
                                        <button
                                            onClick={() => handleColorToggle(code)}
                                            aria-label={`${color.name} filtresini kaldır`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Beden Filtresi */}
            {availableSizes.length > 0 && (
                <div className="filter-group">
                    <h3 className="filter-group__title">BEDEN</h3>
                    <div className="filter-group__sizes">
                        {availableSizes.map((size) => (
                            <button
                                key={size}
                                className={`filter-size ${selectedFilters.sizes?.includes(size) ? 'active' : ''
                                    }`}
                                onClick={() => handleSizeToggle(size)}
                                aria-label={`${size} bedeni ${selectedFilters.sizes?.includes(size) ? 'seçili' : ''
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Fiyat Filtresi - Seri Fiyatı üzerinden (Toptan Satış Standardı) */}
            <div className="filter-group">
                <h3 className="filter-group__title">FİYAT ARALIĞI</h3>
                <p className="filter-group__subtitle">Seri fiyatı (TL)</p>
                <div className="filter-group__price">
                    <input
                        type="number"
                        placeholder="Min"
                        className="filter-price-input"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        onKeyDown={handlePriceKeyDown}
                        min="0"
                    />
                    <span className="filter-price-separator">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className="filter-price-input"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        onKeyDown={handlePriceKeyDown}
                        min="0"
                    />
                    <button
                        className="filter-price-apply"
                        onClick={handlePriceApply}
                        aria-label="Fiyat filtresini uygula"
                    >
                        →
                    </button>
                </div>
                {(selectedFilters.priceMin || selectedFilters.priceMax) && (
                    <div className="filter-group__price-range">
                        {selectedFilters.priceMin || '0'} TL - {selectedFilters.priceMax || '∞'} TL
                    </div>
                )}
            </div>

            {/* Filtreleri Temizle */}
            {hasActiveFilters && (
                <button
                    className="filter-sidebar__clear"
                    onClick={onClearFilters}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Filtreleri Temizle
                </button>
            )}
        </aside>
    );
};

export default FilterSidebar;
