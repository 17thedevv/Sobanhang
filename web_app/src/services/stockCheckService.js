import axios from 'axios';

export const stockCheckService = {
  getChecks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`/api/stock-checks?${query}`);
    return response.data;
  },

  getCheckById: async (id) => {
    const response = await axios.get(`/api/stock-checks/${id}`);
    return response.data;
  },

  createCheck: async (data) => {
    const response = await axios.post('/api/stock-checks', data);
    return response.data;
  },

  updateCheckStatus: async (id, status) => {
    const response = await axios.put(`/api/stock-checks/${id}/status`, { status });
    return response.data;
  }
};
