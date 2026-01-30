import Skeleton from './Skeleton';
import './Skeleton.css';

const ProductDetailSkeleton = () => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '48px' }}>
            {/* Gallery Skeleton */}
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} style={{ width: '80px', height: '100px' }} />
                    ))}
                </div>
                <div style={{ flex: 1, aspectRatio: '3/4' }}>
                    <Skeleton style={{ width: '100%', height: '100%' }} />
                </div>
            </div>

            {/* Info Skeleton */}
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Skeleton style={{ height: '32px', width: '70%' }} />

                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e5e5', paddingBottom: '24px' }}>
                    <Skeleton style={{ height: '24px', width: '20%' }} />
                    <Skeleton style={{ height: '24px', width: '20%' }} />
                </div>

                <Skeleton style={{ height: '40px', width: '40%' }} />

                <div style={{ height: '100px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
                    {/* Cart area placeholder */}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Skeleton style={{ height: '16px', width: '100%' }} />
                    <Skeleton style={{ height: '16px', width: '100%' }} />
                    <Skeleton style={{ height: '16px', width: '80%' }} />
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
