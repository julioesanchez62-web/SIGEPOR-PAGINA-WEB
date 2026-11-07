import axiosClient from './axiosClient';

export const reportesService = {
  getReportes: async () => {
    try {
      const response = await axiosClient.get('/reportes');
      return response.data;
    } catch {
      const response = await axiosClient.get('/reportes/alertas');
      return response.data;
    }
  },

  getAlertas: async () => {
    try {
      const response = await axiosClient.get('/reportes/alertas');
      return response.data;
    } catch {
      const response = await axiosClient.get('/reportes');
      return response.data;
    }
  },

  getTrazabilidad: async (id) => {
    const response = await axiosClient.get(`/reportes/trazabilidad/${id}`);
    return response.data;
  }
};
