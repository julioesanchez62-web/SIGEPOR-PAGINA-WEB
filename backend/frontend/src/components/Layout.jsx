import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { setGlobalErrorHandler } from '../api/axiosClient';
import { useNetworkSync } from '../context/NetworkSyncContext';

export const Layout = () => {
  const [globalError, setGlobalError] = useState(null);
  const { syncStatus, setSyncStatus } = useNetworkSync();

  useEffect(() => {
    // Configurar escucha para capturar errores HTTP reportados por Axios
    setGlobalErrorHandler((errorObj) => {
      setGlobalError(errorObj.message);
      // Auto-ocultar después de 6 segundos
      setTimeout(() => {
        setGlobalError(null);
      }, 6000);
    });

    return () => {
      setGlobalErrorHandler(null);
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        {syncStatus && (
          <div style={{ padding: '1rem 1.75rem 0' }}>
            <div className={`alert alert-${syncStatus.type}`}>
              <span>{syncStatus.message}</span>
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setSyncStatus(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {globalError && (
          <div style={{ padding: '1rem 1.75rem 0' }}>
            <div className="alert alert-danger">
              <span>⚠️ {globalError}</span>
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setGlobalError(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
