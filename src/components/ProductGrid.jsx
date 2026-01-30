import ProductCard from './ProductCard';
import './ProductGrid.css';

/**
 * ProductGrid Component
 * Basit ürün grid'i - filtreleme artık Category sayfasında yönetiliyor
 */
const ProductGrid = ({ products, title }) => {
    return (
        <section className="product-grid-section">
            {title && (
                <div className="product-grid__header">
                    <h2 className="product-grid__title">{title}</h2>
                    <span className="product-grid__count">{products.length} ürün</span>
                </div>
            )}

            <div className="product-grid">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default ProductGrid;
