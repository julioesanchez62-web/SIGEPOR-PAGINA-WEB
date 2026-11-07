/**
 * Servicio IndexedDB para almacenamiento offline de SIGEPOR
 * - Administra la cola de transacciones pendientes (offline_queue)
 * - Caché local de entidades para lectura sin conexión (cached_data)
 */

const DB_NAME = 'sigepor_offline_db';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline_queue';
const CACHE_STORE = 'cached_data';

// Abrir base de datos IndexedDB
export function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('⚠️ IndexedDB no está disponible en este entorno.');
      return reject(new Error('IndexedDB no soportado'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Almacén para cola de sincronización de peticiones (POST, PUT, DELETE)
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('endpoint', 'endpoint', { unique: false });
      }

      // Almacén para caché de datos leídos (GET porcinos, vacunas, etc.)
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('❌ Error abriendo IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// 1. Agregar petición a la cola de IndexedDB
export async function enqueueOfflineRequest(requestData) {
  try {
    const db = await openDB();
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      endpoint: requestData.endpoint,
      method: (requestData.method || 'POST').toUpperCase(),
      payload: requestData.payload || null,
      headers: requestData.headers || {},
      timestamp: new Date().toISOString(),
      role: requestData.role || null
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.add(item);

      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error guardando en cola IndexedDB:', error);
    throw error;
  }
}

// 2. Obtener todas las peticiones encoladas
export async function getOfflineQueue() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error leyendo cola IndexedDB:', error);
    return [];
  }
}

// 3. Eliminar un registro de la cola tras procesarse
export async function removeOfflineRequest(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error(`Error eliminando petición ${id} de IndexedDB:`, error);
    return false;
  }
}

// 4. Limpiar toda la cola
export async function clearOfflineQueue() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error limpiando cola IndexedDB:', error);
    return false;
  }
}

// 5. Guardar datos en caché local
export async function setCachedData(key, data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE, 'readwrite');
      const store = tx.objectStore(CACHE_STORE);
      const req = store.put({ key, data, cachedAt: new Date().toISOString() });

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error(`Error guardando caché ${key}:`, error);
    return false;
  }
}

// 6. Obtener datos de caché local
export async function getCachedData(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE, 'readonly');
      const store = tx.objectStore(CACHE_STORE);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error(`Error leyendo caché ${key}:`, error);
    return null;
  }
}
