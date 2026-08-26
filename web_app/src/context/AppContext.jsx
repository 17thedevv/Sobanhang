import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from 'axios';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  // Vẫn dùng local storage cho giỏ hàng vì nó mang tính tạm thời của thiết bị
  const [cart, setCart] = useLocalStorage('sbh_cart', {});

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchDashboardStats();
    } else {
      setProducts([]);
      setOrders([]);
      setDashboardStats(null);
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      setDashboardStats(res.data);
    } catch (err) {
      console.error('Lỗi khi tải thống kê:', err);
    }
  };

  // Product Actions
  const addProduct = async (productData) => {
    try {
      const res = await axios.post('/api/products', productData);
      setProducts([res.data.product, ...products]);
      return true;
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      return false;
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const res = await axios.put(`/api/products/${updatedProduct.id}`, updatedProduct);
      setProducts(products.map(p => p.id === res.data.product.id ? res.data.product : p));
      return true;
    } catch (err) {
      console.error('Lỗi cập nhật sản phẩm:', err);
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi xóa sản phẩm');
      return false;
    }
  };

  // Cart Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev[product.id];
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Vượt quá số lượng tồn kho!');
          return prev;
        }
        return { ...prev, [product.id]: { ...existing, quantity: existing.quantity + 1 } };
      }
      if (product.stock < 1) {
        alert('Sản phẩm đã hết hàng!');
        return prev;
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
  const checkout = async (payload) => {
    try {
      const items = Object.values(cart).map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const res = await axios.post('/api/orders', {
        ...payload,
        items
      });
      
      // Update local states immediately
      setOrders([res.data.order, ...orders]);
      clearCart();
      
      // Refresh products & stats for accurate stock & dashboard
      fetchProducts();
      fetchDashboardStats();
      
      return res.data.order;
    } catch (err) {
      console.error('Lỗi thanh toán:', err);
      alert(err.response?.data?.error || 'Lỗi thanh toán');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      cart, addToCart, removeFromCart, clearCart, cartItemsCount, cartTotalAmount,
      orders, checkout,
      dashboardStats, refreshDashboard: fetchDashboardStats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
