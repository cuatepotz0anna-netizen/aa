import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles.css';

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('button');
    if (button?.textContent?.trim() !== 'Generar PDF') return;

    window.alert(
      'Se generará el PDF. Al terminar se abrirán las opciones disponibles para Guardar / Compartir el documento.'
    );
  }, true);
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
