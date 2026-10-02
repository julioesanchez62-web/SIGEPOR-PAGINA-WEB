import axios from 'axios';

/**
 * Cliente HTTP centralizado con Axios para SIGEPOR
 * - Configura baseURL dinámica o proxy de desarrollo
 * - Interceptor de solicitud: adjunta Authorization: Bearer <token>
 * - Interceptor de respuesta: captura y formatea errores HTTP (401, 403, 404, 500)
 */

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Callback global opcional para notificaciones de error en la UI
let globalErrorHandler = null;

export const setGlobalErrorHandler = (handler) => {
  globalErrorHandler = handler;
};

// Interceptor de Solicitudes: Adjuntar JWT automáticamente
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sigepor_token') || sessionStorage.getItem('sigepor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas: Procesamiento estricto de códigos HTTP
axiosClient.interceptors.response.use(
  (response) => {
    // Si la transacción fue exitosa (2xx), retornar la respuesta
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    let mensaje = 'Error de conexión con el servidor. Verifique su red.';

    if (error.response && error.response.data) {
      mensaje = error.response.data.message || error.response.data.error || mensaje;
    }

    if (status === 401) {
      // Sesión expirada o no autenticado
      console.warn('🔒 Error 401: Token inválido o no suministrado.');
      // Opcionalmente limpiar si no es la ruta de login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('sigepor_token');
        localStorage.removeItem('usuario_sigepor');
      }
    } else if (status === 403) {
      console.warn('⛔ Error 403: Permisos insuficientes (RBAC).');
    } else if (status === 404) {
      console.warn('🔍 Error 404: Recurso no encontrado.');
    } else if (status >= 500) {
      console.error('💥 Error 500: Fallo interno en el servidor backend o base de datos.');
      mensaje = `Error interno del servidor (HTTP ${status}): ${mensaje}`;
    }

    // Notificar a la UI si existe un manejador global registrado
    if (globalErrorHandler) {
      globalErrorHandler({
        status,
        message: mensaje
      });
    }

    // Rechazar la promesa para que los componentes NO asuman éxito ni persistan datos falsos
    return Promise.reject({
      status,
      message: mensaje,
      originalError: error
    });
  }
);

export default axiosClient;
