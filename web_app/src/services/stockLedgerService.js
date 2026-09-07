import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sbh_access_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const stockLedgerService = {
  getLedgerTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/stock-ledger?${query}`, getAuthHeaders());
    return response.data;
  },

  getProductLedger: async (productId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/stock-ledger/products/${productId}?${query}`, getAuthHeaders());
    return response.data;
  }
};
