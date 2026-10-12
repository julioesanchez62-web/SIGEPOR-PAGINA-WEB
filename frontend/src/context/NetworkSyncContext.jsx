import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  enqueueOfflineRequest,
  getOfflineQueue,
  removeOfflineRequest
} from '../services/indexedDB';

const NetworkSyncContext = createContext(null);

export const NetworkSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'|'danger'|'warning', message: string }

  // Actualizar conteo de elementos en la cola IndexedDB
  const updatePendingCount = useCallback(async () => {
    try {
      const queue = await getOfflineQueue();
      setPendingCount(queue.length);
    } catch (e) {
      console.error('Error al consultar conteo offline:', e);
    }
  }, []);

  // Sincronizar cola de IndexedDB con el backend MySQL
  const syncPendingRequests = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      const queue = await getOfflineQueue();
      if (!queue || queue.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      console.log(`🔄 Iniciando sincronización de ${queue.length} transacciones con MySQL...`);

      let exitosas = 0;
      let rechazadas = 0;
      let fallidasServidor = 0;

      for (const item of queue) {
        try {
          const token = localStorage.getItem('sigepor_token');
          const headers = {
            'Content-Type': 'application/json',
            ...(item.headers || {})
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(item.endpoint, {
            method: item.method,
            headers,
            body: item.payload ? JSON.stringify(item.payload) : undefined
          });

          // Regla estricta: Solo 2xx es éxito
          if (response.ok && response.status >= 200 && response.status < 300) {
            exitosas++;
            await removeOfflineRequest(item.id);
            console.log(`✅ [HTTP ${response.status}] Transacción ${item.id} sincronizada en MySQL.`);
          } else if (response.status >= 400 && response.status < 500) {
            // Error de cliente (400, 401, 403, 404, etc.): RECHAZADO
            // No se valida como exitoso; se descarta de la cola para no bloquear el flujo
            rechazadas++;
            await removeOfflineRequest(item.id);
            const errData = await response.json().catch(() => ({}));
            const msg = errData.message || `Transacción rechazada por el servidor con código ${response.status}`;
            console.warn(`⛔ [HTTP ${response.status}] ${msg}`);
          } else {
            // Error 5xx del servidor: mantener en cola para posterior reintento
            fallidasServidor++;
            console.error(`💥 [HTTP ${response.status}] Fallo de servidor backend. Permanece en cola.`);
          }
        } catch (fetchError) {
          // Pérdida momentánea de conexión
          console.warn(`📡 Error de red procesando ${item.id}:`, fetchError.message);
          break; // Detener bucle hasta que la conexión sea estable
        }
      }

      await updatePendingCount();

      // Notificación de estado al usuario
      if (exitosas > 0 && rechazadas === 0 && fallidasServidor === 0) {
        setSyncStatus({
          type: 'success',
          message: `¡Sincronización completada! ${exitosas} transacción(es) persistidas en MySQL.`
        });
      } else if (rechazadas > 0 || fallidasServidor > 0) {
        setSyncStatus({
          type: 'warning',
          message: `Sincronización finalizada: ${exitosas} guardadas, ${rechazadas} rechazadas por la API, ${fallidasServidor} pendientes por error 5xx.`
        });
      }
    } catch (err) {
      console.error('Error general durante la sincronización:', err);
      setSyncStatus({
        type: 'danger',
        message: 'Ocurrió un error inesperado al sincronizar con el servidor.'
      });
    } finally {
      setIsSyncing(false);
      // Limpiar mensaje tras 7 segundos
      setTimeout(() => setSyncStatus(null), 7000);
    }
  }, [isSyncing, updatePendingCount]);

  // Encolar acción cuando no haya conexión
  const queueAction = async (endpoint, method, payload, role = null) => {
    const item = await enqueueOfflineRequest({
      endpoint,
      method,
      payload,
      role
    });
    await updatePendingCount();
    setSyncStatus({
      type: 'warning',
      message: 'Sin conexión a internet. La acción fue guardada en IndexedDB y se sincronizará automáticamente al volver en línea.'
    });
    return item;
  };

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexión a internet restablecida.');
      setIsOnline(true);
      syncPendingRequests();
    };

    const handleOffline = () => {
      console.log('📡 Dispositivo sin conexión. Modo offline activado.');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingRequests, updatePendingCount]);

  return (
    <NetworkSyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        syncStatus,
        setSyncStatus,
        syncPendingRequests,
        queueAction,
        updatePendingCount
      }}
    >
      {children}
    </NetworkSyncContext.Provider>
  );
};

export const useNetworkSync = () => {
  const context = useContext(NetworkSyncContext);
  if (!context) {
    throw new Error('useNetworkSync debe ser utilizado dentro de un NetworkSyncProvider');
  }
  return context;
};
