import axios from 'axios';

export const stockReceiptService = {
  getReceipts: async (params = {}) => {
    const response = await axios.get('/api/stock-receipts', { params });
    return response.data;
  },

  getReceiptById: async (id) => {
    const response = await axios.get(`/api/stock-receipts/${id}`);
    return response.data;
  },

  createReceipt: async (payload) => {
    const response = await axios.post('/api/stock-receipts', payload);
    return response.data;
  },

  confirmReceipt: async (id, payload) => {
    const response = await axios.put(`/api/stock-receipts/${id}/confirm`, payload);
    return response.data;
  },

  payReceiptDebt: async (id, payload) => {
    const response = await axios.put(`/api/stock-receipts/${id}/pay`, payload);
    return response.data;
  },

  deleteReceipt: async (id) => {
    const response = await axios.delete(`/api/stock-receipts/${id}`);
    return response.data;
  }
};
