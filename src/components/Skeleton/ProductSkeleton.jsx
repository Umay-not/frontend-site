import Skeleton from './Skeleton';
import './Skeleton.css';

const ProductSkeleton = () => {
    return (
        <div className="product-skeleton">
            <Skeleton className="product-skeleton__image" />
            <div className="product-skeleton__info">
                <Skeleton className="product-skeleton__text" />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Skeleton className="product-skeleton__price" />
                    <Skeleton className="product-skeleton__meta" style={{ width: '30%' }} />
                </div>
                <Skeleton className="product-skeleton__meta" />
            </div>
        </div>
    );
};

export default ProductSkeleton;
