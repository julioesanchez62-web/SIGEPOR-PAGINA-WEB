import axiosClient from './axiosClient';

export const reportesService = {
  getAlertas: async () => {
    const response = await axiosClient.get('/reportes/alertas');
    return response.data;
  },

  getTrazabilidad: async (id) => {
    const response = await axiosClient.get(`/reportes/trazabilidad/${id}`);
    return response.data;
  }
};
