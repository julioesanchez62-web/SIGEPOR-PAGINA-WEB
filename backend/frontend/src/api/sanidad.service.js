import axiosClient from './axiosClient';

export const sanidadService = {
  getVacunas: async () => {
    const response = await axiosClient.get('/sanidad/vacunas');
    return response.data;
  },

  getEstadisticasResumen: async () => {
    const response = await axiosClient.get('/sanidad/estadisticas/resumen');
    return response.data;
  },

  createVacuna: async (data) => {
    const response = await axiosClient.post('/sanidad/vacunas', data);
    return response.data;
  },

  deleteVacuna: async (id) => {
    const response = await axiosClient.delete(`/sanidad/vacunas/${id}`);
    return response.data;
  },

  getEnfermedades: async () => {
    const response = await axiosClient.get('/sanidad/enfermedades');
    return response.data;
  },

  createEnfermedad: async (data) => {
    const response = await axiosClient.post('/sanidad/enfermedades', data);
    return response.data;
  },

  deleteEnfermedad: async (id) => {
    const response = await axiosClient.delete(`/sanidad/enfermedades/${id}`);
    return response.data;
  }
};
