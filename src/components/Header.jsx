import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getContentBlocks } from '../../backend-server/src/services/admin/adminContentService.js';
import { getAllCategories } from '../../backend-server/src/services/categoryService.js';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const location = useLocation();
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  // Logo URL'ini site içeriğinden al
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const result = await getContentBlocks();
        if (result.success && result.data?.logo?.url) {
          setLogoUrl(result.data.logo.url);
        }
      } catch (error) {
        console.warn('Logo fetch error:', error);
      }
    };
    fetchLogo();
  }, []);

  // Kategorileri database'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const result = await getAllCategories();
        if (result.success && result.data) {
          // Backend'den gelen kategorileri Header formatına çevir
          const formattedCategories = result.data.map(cat => ({
            name: cat.name.toUpperCase(),
            path: `/kategori/${cat.slug}`
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Categories fetch error:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);


  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header__top-bar">
        <div className="container">
          <span>Toptan Satış | 2.000 TL Üzeri Ücretsiz Kargo</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="header__main">
        <div className="container flex-between">
          {/* Mobile Menu Button */}
          <button
            className="header__mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Logo */}
          <Link to="/" className="header__logo">
            <img src={logoUrl} alt="Fifty One" className="header__logo-img" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav">
            {categories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className={`header__nav-link ${location.pathname === cat.path ? 'active' : ''}`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header__actions">
            <button
              className="header__action-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Ara"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <Link to="/hesap" className="header__action-btn" aria-label="Hesap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link to="/sepet" className="header__action-btn header__cart" aria-label="Sepet">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="header__cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div className={`header__search-overlay ${isSearchOpen ? 'active' : ''}`}>
        <div className="container">
          <div className="header__search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Ürün ara..."
              className="header__search-input"
              autoFocus={isSearchOpen}
            />
            <button
              className="header__search-close"
              onClick={() => setIsSearchOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`header__mobile-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="header__mobile-nav-content">
          {categories.map((cat) => (
            <Link
              key={cat.path}
              to={cat.path}
              className="header__mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
