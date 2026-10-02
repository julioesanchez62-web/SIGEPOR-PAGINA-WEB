import axiosClient from './axiosClient';

export const porcinosService = {
  getAll: async () => {
    const response = await axiosClient.get('/porcinos');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/porcinos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/porcinos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/porcinos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/porcinos/${id}`);
    return response.data;
  },

  getVeterinariosList: async () => {
    const response = await axiosClient.get('/porcinos/veterinarios');
    return response.data;
  }
};
