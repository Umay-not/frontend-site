import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPaymentResult } from '../services/paytrService.js';
import './PaymentResult.css';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            // PayTR redirects with ?status=success or ?status=fail
            const status = searchParams.get('status');

            // Try to get order info from localStorage (stored during checkout)
            const lastOrderStr = localStorage.getItem('fiftyone_last_order');
            let orderNumber = null;

            if (lastOrderStr) {
                try {
                    const lastOrder = JSON.parse(lastOrderStr);
                    orderNumber = lastOrder.orderNumber;
                } catch (e) {
                    console.error('Could not parse last order:', e);
                }
            }

            // If PayTR says failed, show error immediately
            if (status === 'fail') {
                setError('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
                setLoading(false);
                return;
            }

            // If we have order number, verify from DB
            if (orderNumber) {
                const paymentResult = await checkPaymentResult(orderNumber);

                if (paymentResult.success || paymentResult.paymentStatus === 'success') {
                    setResult({
                        success: true,
                        orderNumber: paymentResult.orderNumber
                    });

                    // Clear cart after successful payment
                    localStorage.removeItem('fiftyone_cart');
                    localStorage.removeItem('fiftyone_last_order');

                    // Redirect to order confirmation after 2 seconds
                    setTimeout(() => {
                        navigate(`/siparis-onay/${paymentResult.orderNumber}`);
                    }, 2000);
                } else if (paymentResult.paymentStatus === 'pending') {
                    // Payment still processing
                    setResult({
                        success: true,
                        pending: true,
                        orderNumber: paymentResult.orderNumber
                    });
                } else {
                    setError(paymentResult.error || 'Ödeme durumu doğrulanamadı');
                }
            } else if (status === 'success') {
                // PayTR says success but we don't have order number
                // Show success message anyway
                setResult({ success: true, pending: true });
                localStorage.removeItem('fiftyone_cart');
            } else {
                setError('Geçersiz ödeme bilgisi');
            }

            setLoading(false);
        };

        verifyPayment();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <main className="payment-result">
                <div className="container">
                    <div className="payment-result__loading">
                        <div className="spinner"></div>
                        <h1>Ödeme Doğrulanıyor...</h1>
                        <p>Lütfen bekleyin, ödemeniz kontrol ediliyor.</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="payment-result">
                <div className="container">
                    <div className="payment-result__error">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc3545">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
                            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
                        </svg>
                        <h1>Ödeme Başarısız</h1>
                        <p>{error}</p>
                        <button onClick={() => navigate('/sepet')} className="btn btn-primary">
                            Sepete Dön
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (result?.pending) {
        return (
            <main className="payment-result">
                <div className="container">
                    <div className="payment-result__success">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ffc107">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path d="M12 8v4M12 16h.01" strokeWidth="2" />
                        </svg>
                        <h1>Ödeme İşleniyor</h1>
                        <p>Ödemeniz işleniyor. Kısa süre içinde e-posta ile bilgilendirileceksiniz.</p>
                        {result.orderNumber && (
                            <p>Sipariş numaranız: <strong>{result.orderNumber}</strong></p>
                        )}
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="payment-result">
            <div className="container">
                <div className="payment-result__success">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#28a745">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path d="M9 12l2 2 4-4" strokeWidth="2" />
                    </svg>
                    <h1>Ödeme Başarılı!</h1>
                    <p>Sipariş numaranız: <strong>{result?.orderNumber}</strong></p>
                    <p>Sipariş onay sayfasına yönlendiriliyorsunuz...</p>
                </div>
            </div>
        </main>
    );
};

export default PaymentResult;
