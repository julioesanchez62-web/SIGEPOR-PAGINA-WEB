import axiosClient from './axiosClient';

export const authService = {
  // Iniciar sesión (admite endpoint /auth/login o /users/login)
  login: async (identificador, contraseña) => {
    // Intentar primero con /auth/login, con fallback a /users/login
    try {
      const response = await axiosClient.post('/auth/login', {
        email: identificador,
        usuario: identificador,
        identificador,
        contraseña
      });
      return response.data;
    } catch (err) {
      // Fallback a /users/login si /auth/login responde 404
      if (err.status === 404) {
        const response = await axiosClient.post('/users/login', {
          identificador,
          contraseña
        });
        return response.data;
      }
      throw err;
    }
  },

  // Obtener perfil autenticado
  getProfile: async () => {
    const response = await axiosClient.get('/perfil');
    return response.data;
  }
};
