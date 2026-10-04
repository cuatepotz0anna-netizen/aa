import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles.css';

if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
  const nativeShare = navigator.share.bind(navigator);
  try {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data) => {
        const isPdfShare = Array.isArray(data?.files) && data.files.some((file) => file?.type === 'application/pdf');
        if (isPdfShare) {
          const continueToShare = window.confirm(
            'PDF generado correctamente.\n\nPresiona Aceptar para abrir las opciones de Guardar / Compartir. Ahí puedes elegir Archivos, Descargas, Drive o la aplicación donde quieras enviarlo.'
          );
          if (!continueToShare) {
            throw new DOMException('Acción cancelada por el usuario', 'AbortError');
          }
        }
        return nativeShare(data);
      },
    });
  } catch {
    // Si el navegador no permite envolver navigator.share, se conserva el flujo nativo existente.
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
