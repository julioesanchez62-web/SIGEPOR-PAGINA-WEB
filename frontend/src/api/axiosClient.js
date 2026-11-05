import axios from 'axios';

/**
 * Cliente HTTP centralizado con Axios para SIGEPOR
 * - Configura baseURL dinámica con protocolo 'https://' garantizado (previene rutas relativas en Vercel)
 * - withCredentials: true para permitir intercambio de cookies SameSite y sesiones entre Vercel y Railway
 * - Interceptor de solicitud: adjunta Authorization: Bearer <token>
 * - Interceptor de respuesta: captura y formatea errores HTTP (401, 403, 404, 500)
 */

// 1. Obtener la variable de entorno de Vite o usar el dominio de producción en Railway
const rawBaseURL = import.meta.env.VITE_API_URL || 'https://sigepor-pagina-web-production.up.railway.app';

// 2. Normalizar la URL: asegurar que inicie con https:// o http:// (si falta, el navegador la trata como ruta relativa local)
let formattedURL = String(rawBaseURL).trim();
if (!formattedURL.startsWith('http://') && !formattedURL.startsWith('https://')) {
  formattedURL = `https://${formattedURL}`;
}

// 3. Remover barra diagonal final si existe para evitar dobles barras en las peticiones
const baseURL = formattedURL.endsWith('/') ? formattedURL.slice(0, -1) : formattedURL;

const axiosClient = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
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
      mensaje = error.response.data.message || error.response.data.error || error.response.data.mensaje || mensaje;
    } else if (error.message && error.message.includes('Network Error')) {
      mensaje = 'No se pudo establecer conexión con el servidor en Railway. Verifique si el servicio está activo.';
    }

    if (status === 401) {
      // Sesión expirada o credenciales inválidas
      console.warn('🔒 Error 401: No autenticado o credenciales incorrectas.');
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
