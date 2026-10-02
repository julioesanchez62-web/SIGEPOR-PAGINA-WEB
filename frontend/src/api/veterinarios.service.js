import axiosClient from './axiosClient';

export const veterinariosService = {
  getAll: async () => {
    const response = await axiosClient.get('/veterinarios');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/veterinarios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/veterinarios', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/veterinarios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/veterinarios/${id}`);
    return response.data;
  }
};
