import axios from 'axios';

export const stockLedgerService = {
  getLedgerTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`/api/stock-ledger?${query}`);
    return response.data;
  },

  getProductLedger: async (productId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`/api/stock-ledger/products/${productId}?${query}`);
    return response.data;
  }
};
