import Skeleton from './Skeleton';
import ProductSkeleton from './ProductSkeleton';
import './Skeleton.css';

const HomeSkeleton = () => {
    return (
        <div className="home-skeleton">
            {/* Hero Section Skeleton - Full Width with Overlay */}
            <div className="skeleton-section hero-skeleton" style={{
                position: 'relative',
                width: '100%',
                height: '90vh',
                minHeight: '650px',
                maxHeight: '900px',
                overflow: 'hidden',
                backgroundColor: '#f5f5f0'
            }}>
                {/* Background Image Skeleton */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                    <Skeleton style={{ width: '100%', height: '100%', borderRadius: 0 }} />
                </div>

                {/* Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 75%)',
                    zIndex: 2
                }} />

                {/* Content Skeleton - Positioned like real hero */}
                <div style={{
                    position: 'relative',
                    zIndex: 3,
                    width: '100%',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '1.5rem'
                }}>
                    <Skeleton style={{ width: '140px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton style={{ width: '600px', maxWidth: '80%', height: '80px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
                    <Skeleton style={{ width: '400px', maxWidth: '60%', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <Skeleton style={{ width: '180px', height: '50px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        <Skeleton style={{ width: '180px', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    </div>
                </div>
            </div>

            {/* Categories Skeleton */}
            <div className="container" style={{ padding: '4rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <Skeleton style={{ width: '200px', height: '30px' }} />
                </div>
                <div className="skeleton-grid">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} style={{ aspectRatio: '3/4' }}>
                            <Skeleton style={{ width: '100%', height: '100%' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* New Arrivals Skeleton */}
            <div className="container" style={{ padding: '4rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <Skeleton style={{ width: '200px', height: '30px' }} />
                    <Skeleton style={{ width: '100px', height: '20px' }} />
                </div>
                <div className="skeleton-grid">
                    {Array(4).fill(0).map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </div>

            {/* Promo Banner Skeleton */}
            <div className="container" style={{ padding: '0 2rem', marginBottom: '4rem' }}>
                <Skeleton style={{ width: '100%', height: '400px', borderRadius: '12px' }} />
            </div>
        </div>
    );
};

export default HomeSkeleton;
