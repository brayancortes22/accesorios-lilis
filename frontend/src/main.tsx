import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initSecurityShield } from './utils/securityShield';
import './index.css';

// Activar protecciones anti-inspección y seguridad de código fuente
initSecurityShield();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
