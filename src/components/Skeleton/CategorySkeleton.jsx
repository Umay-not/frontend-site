import Skeleton from './Skeleton';
import ProductSkeleton from './ProductSkeleton';
import './Skeleton.css';

const CategorySkeleton = () => {
    return (
        <div className="category-skeleton container" style={{ padding: '2rem' }}>
            {/* Breadcrumb */}
            <Skeleton style={{ width: '200px', height: '20px', marginBottom: '2rem' }} />

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Skeleton style={{ width: '300px', height: '40px', marginBottom: '1.5rem' }} /> {/* Title */}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Skeleton style={{ width: '100px', height: '35px', borderRadius: '20px' }} />
                        <Skeleton style={{ width: '100px', height: '35px', borderRadius: '20px' }} />
                        <Skeleton style={{ width: '100px', height: '35px', borderRadius: '20px' }} />
                    </div>
                    {/* Sort */}
                    <Skeleton style={{ width: '150px', height: '40px' }} />
                </div>
            </div>

            {/* Product Grid */}
            <div className="skeleton-grid">
                {Array(8).fill(0).map((_, i) => (
                    <ProductSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export default CategorySkeleton;
