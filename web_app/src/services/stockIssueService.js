import axios from 'axios';

// Get base URL from environment variable, fallback to localhost for development
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sbh_access_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const stockIssueService = {
  getIssues: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/stock-issues?${query}`, getAuthHeaders());
    return response.data;
  },

  getIssueById: async (id) => {
    const response = await axios.get(`${API_URL}/stock-issues/${id}`, getAuthHeaders());
    return response.data;
  },

  createIssue: async (data) => {
    const response = await axios.post(`${API_URL}/stock-issues`, data, getAuthHeaders());
    return response.data;
  },

  updateIssueStatus: async (id, status) => {
    const response = await axios.put(`${API_URL}/stock-issues/${id}/status`, { status }, getAuthHeaders());
    return response.data;
  }
};
