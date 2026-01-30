import { useState, createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

// Cart Context
const CartContext = createContext();

// localStorage key
const CART_STORAGE_KEY = 'fiftyone_cart';
const GUEST_CART_KEY = 'fiftyone_guest_cart';

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Helper: localStorage'dan sepeti yükle
const loadCartFromStorage = (userId) => {
    try {
        const key = userId ? `${CART_STORAGE_KEY}_${userId}` : GUEST_CART_KEY;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Sepet yüklenirken hata:', error);
        return [];
    }
};

// Helper: Sepeti localStorage'a kaydet
const saveCartToStorage = (cartItems, userId) => {
    try {
        const key = userId ? `${CART_STORAGE_KEY}_${userId}` : GUEST_CART_KEY;
        localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (error) {
        console.error('Sepet kaydedilirken hata:', error);
    }
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const prevUserIdRef = useRef(null); // Track previous user ID (null = guest, string = user-id)
    const hasInitializedRef = useRef(false); // Track if we've done initial load

    // Kullanıcı değiştiğinde sepeti yükle
    useEffect(() => {
        const userId = user?.id ?? null; // null for guest, user-id for logged in
        const prevUserId = prevUserIdRef.current;

        // İlk yükleme - sadece cart'ı yükle, merge yapma
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            const loadedCart = loadCartFromStorage(userId);
            setCartItems(loadedCart);
            prevUserIdRef.current = userId;
            setIsInitialized(true);
            return;
        }

        // Login transition: misafirden (null) kullanıcıya (user-id) geçiş
        const isLoginTransition = prevUserId === null && userId !== null && userId !== undefined;

        if (isLoginTransition) {
            // Misafir sepetini al
            const guestCart = loadCartFromStorage(null);
            const userCart = loadCartFromStorage(userId);

            if (guestCart.length > 0) {
                // Misafir sepetini kullanıcı sepetine birleştir
                const mergedCart = [...userCart];

                guestCart.forEach(guestItem => {
                    const existingIndex = mergedCart.findIndex(
                        item => item.product.id === guestItem.product.id &&
                            item.colorIndex === guestItem.colorIndex
                    );

                    if (existingIndex === -1) {
                        // Ürün kullanıcı sepetinde yok, ekle
                        mergedCart.push({ ...guestItem, id: Date.now() + Math.random() });
                    } else {
                        // Ürün var, miktarları birleştir
                        const existing = mergedCart[existingIndex];
                        const mergedQuantities = { ...existing.quantities };

                        Object.keys(guestItem.quantities).forEach(size => {
                            mergedQuantities[size] = (mergedQuantities[size] || 0) + guestItem.quantities[size];
                        });

                        const newTotalQty = Object.values(mergedQuantities).reduce((sum, q) => sum + q, 0);

                        mergedCart[existingIndex] = {
                            ...existing,
                            quantities: mergedQuantities,
                            totalQty: newTotalQty
                        };
                    }
                });

                setCartItems(mergedCart);
                saveCartToStorage(mergedCart, userId);
                // Misafir sepetini temizle
                localStorage.removeItem(GUEST_CART_KEY);

                console.log('✅ Guest cart merged successfully:', {
                    guestItems: guestCart.length,
                    userItems: userCart.length,
                    mergedItems: mergedCart.length
                });
            } else {
                // Misafir sepeti boş, sadece kullanıcı sepetini yükle
                setCartItems(userCart);
            }
        } else if (prevUserId !== userId) {
            // User değişti (logout veya farklı user login) - normal yükleme
            const loadedCart = loadCartFromStorage(userId);
            setCartItems(loadedCart);
        }

        // Update previous user ref
        prevUserIdRef.current = userId;
        setIsInitialized(true);
    }, [user?.id]);

    // Sepet değiştiğinde localStorage'a kaydet
    useEffect(() => {
        if (isInitialized) {
            saveCartToStorage(cartItems, user?.id);
        }
    }, [cartItems, user?.id, isInitialized]);

    const addToCart = (product, quantities, totalQty) => {
        const existingIndex = cartItems.findIndex(
            item => item.product.id === product.id && item.colorIndex === product.selectedColor
        );

        if (existingIndex > -1) {
            // Update existing item
            const newItems = [...cartItems];
            newItems[existingIndex].quantities = quantities;
            newItems[existingIndex].totalQty = totalQty;
            setCartItems(newItems);
        } else {
            // Add new item
            setCartItems([
                ...cartItems,
                {
                    id: Date.now(),
                    product,
                    quantities,
                    totalQty,
                    colorIndex: product.selectedColor || 0
                }
            ]);
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, newQuantities, newTotalQty) => {
        setCartItems(cartItems.map(item =>
            item.id === itemId
                ? { ...item, quantities: newQuantities, totalQty: newTotalQty }
                : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.totalQty * item.product.price);
        }, 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((count, item) => count + item.totalQty, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartItemsCount,
            isInitialized
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;

