import axiosClient from './axiosClient';

export const inventarioService = {
  getAlimentos: async () => {
    const response = await axiosClient.get('/inventario/alimentos');
    return response.data;
  },

  createAlimento: async (data) => {
    const response = await axiosClient.post('/inventario/alimentos', data);
    return response.data;
  },

  deleteAlimento: async (id) => {
    const response = await axiosClient.delete(`/inventario/alimentos/${id}`);
    return response.data;
  },

  getCorrales: async () => {
    const response = await axiosClient.get('/inventario/corrales');
    return response.data;
  },

  createCorral: async (data) => {
    const response = await axiosClient.post('/inventario/corrales', data);
    return response.data;
  },

  getProveedores: async () => {
    const response = await axiosClient.get('/inventario/proveedores');
    return response.data;
  },

  createProveedor: async (data) => {
    const response = await axiosClient.post('/inventario/proveedores', data);
    return response.data;
  }
};
