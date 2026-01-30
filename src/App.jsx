import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/Chat/ChatWidget';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Account = lazy(() => import('./pages/Account'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Faq = lazy(() => import('./pages/Faq'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));


import './index.css';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    width: '100%'
  }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #333',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const AdminRedirect = () => {
  // Use environment variable or relative path if on same domain structure
  // For safety, we prefer the env variable if set
  if (import.meta.env.VITE_ADMIN_URL) {
    window.location.href = import.meta.env.VITE_ADMIN_URL;
  } else {
    // Fallback logic could be improved here or simply show a 404
    console.warn('Admin URL not configured');
    window.location.href = '/admin'; // Let standard browser routing handle it if configured, or fail
  }
  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={
            <div className="app">
              <Header />
              <PageLoader />
              <Footer />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <div className="app">
                  <Header />
                  <Home />
                  <Footer />
                </div>
              } />
              <Route path="/kategori/:slug" element={
                <div className="app">
                  <Header />
                  <Category />
                  <Footer />
                </div>
              } />
              <Route path="/urun/:id" element={
                <div className="app">
                  <Header />
                  <ProductDetail />
                  <Footer />
                </div>
              } />
              <Route path="/sepet" element={
                <div className="app">
                  <Header />
                  <Cart />
                  <Footer />
                </div>
              } />
              <Route path="/odeme" element={
                <div className="app">
                  <Header />
                  <Checkout />
                  <Footer />
                </div>
              } />
              <Route path="/siparis-onay/:orderNumber" element={
                <div className="app">
                  <Header />
                  <OrderConfirmation />
                  <Footer />
                </div>
              } />
              <Route path="/hesap" element={
                <div className="app">
                  <Header />
                  <Account />
                  <Footer />
                </div>
              } />
              <Route path="/iletisim" element={
                <div className="app">
                  <Header />
                  <Contact />
                  <Footer />
                </div>
              } />
              <Route path="/hakkimizda" element={
                <div className="app">
                  <Header />
                  <About />
                  <Footer />
                </div>
              } />
              <Route path="/sss" element={
                <div className="app">
                  <Header />
                  <Faq />
                  <Footer />
                </div>
              } />
              <Route path="/odeme-sonucu" element={
                <div className="app">
                  <Header />
                  <PaymentResult />
                  <Footer />
                </div>
              } />


              {/* Admin panel artık ayrı projede - yönlendirme */}
              {/* Admin panel redirect */}
              <Route path="/admin/*" element={<AdminRedirect />} />
            </Routes>
          </Suspense>
          <ChatWidget />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
