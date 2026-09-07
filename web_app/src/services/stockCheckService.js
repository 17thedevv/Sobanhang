import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sbh_access_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const stockCheckService = {
  getChecks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/stock-checks?${query}`, getAuthHeaders());
    return response.data;
  },

  getCheckById: async (id) => {
    const response = await axios.get(`${API_URL}/stock-checks/${id}`, getAuthHeaders());
    return response.data;
  },

  createCheck: async (data) => {
    const response = await axios.post(`${API_URL}/stock-checks`, data, getAuthHeaders());
    return response.data;
  },

  updateCheckStatus: async (id, status) => {
    const response = await axios.put(`${API_URL}/stock-checks/${id}/status`, { status }, getAuthHeaders());
    return response.data;
  }
};
