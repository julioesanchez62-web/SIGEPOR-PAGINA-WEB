import axiosClient from './axiosClient';

export const usersService = {
  getAll: async () => {
    const response = await axiosClient.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/users', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  }
};
