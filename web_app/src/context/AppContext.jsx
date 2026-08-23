import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useLocalStorage('sbh_products', []);
  const [cart, setCart] = useLocalStorage('sbh_cart', {});
  const [orders, setOrders] = useLocalStorage('sbh_orders', []);

  // Product Actions
  const addProduct = (product) => {
    setProducts([...products, { ...product, id: uuidv4() }]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Cart Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev[product.id];
      if (existing) {
        return { ...prev, [product.id]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [product.id]: { product, quantity: 1 } };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev[productId];
      if (!existing) return prev;
      
      const newCart = { ...prev };
      if (existing.quantity > 1) {
        newCart[productId] = { ...existing, quantity: existing.quantity - 1 };
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const clearCart = () => setCart({});

  const cartItemsCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalAmount = Object.values(cart).reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Order Actions
  const checkout = (isDebt, paymentMethod) => {
    const newOrder = {
      id: uuidv4(),
      date: new Date().toISOString(),
      items: Object.values(cart),
      total: cartTotalAmount,
      isDebt,
      paymentMethod,
    };
    setOrders([...orders, newOrder]);
    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      cart, addToCart, removeFromCart, clearCart, cartItemsCount, cartTotalAmount,
      orders, checkout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
