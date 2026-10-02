import axiosClient from './axiosClient';

export const reproduccionService = {
  getEventos: async () => {
    const response = await axiosClient.get('/reproduccion');
    return response.data;
  },

  createEvento: async (data) => {
    const response = await axiosClient.post('/reproduccion', data);
    return response.data;
  },

  deleteEvento: async (id) => {
    const response = await axiosClient.delete(`/reproduccion/${id}`);
    return response.data;
  }
};
