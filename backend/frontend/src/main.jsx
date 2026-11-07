import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NetworkSyncProvider } from './context/NetworkSyncContext';
import App from './App';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerRegistration';

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NetworkSyncProvider>
          <App />
        </NetworkSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
