import axios from 'axios';

export const stockIssueService = {
  getIssues: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(`/api/stock-issues?${query}`);
    return response.data;
  },

  getIssueById: async (id) => {
    const response = await axios.get(`/api/stock-issues/${id}`);
    return response.data;
  },

  createIssue: async (data) => {
    const response = await axios.post('/api/stock-issues', data);
    return response.data;
  },

  updateIssueStatus: async (id, status) => {
    const response = await axios.put(`/api/stock-issues/${id}/status`, { status });
    return response.data;
  }
};
