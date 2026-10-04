import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles.css';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || '');
    const base64 = result.includes(',') ? result.split(',')[1] : result;
    resolve(base64);
  };
  reader.onerror = () => reject(reader.error || new Error('No se pudo preparar el PDF.'));
  reader.readAsDataURL(file);
});

const isPdfShare = (data = {}) => Array.isArray(data.files)
  && data.files.some((file) => file?.type === 'application/pdf');

const defineNavigatorMethod = (name, value) => {
  try {
    Object.defineProperty(navigator, name, {
      configurable: true,
      value,
    });
    return true;
  } catch {
    try {
      Object.defineProperty(Navigator.prototype, name, {
        configurable: true,
        value,
      });
      return true;
    } catch {
      return false;
    }
  }
};

const configurePdfDelivery = () => {
  if (typeof navigator === 'undefined') return;

  if (Capacitor.isNativePlatform()) {
    const nativeCanShare = (data = {}) => isPdfShare(data);

    const nativeShare = async (data = {}) => {
      const pdfFile = Array.isArray(data.files)
        ? data.files.find((file) => file?.type === 'application/pdf')
        : null;

      if (!pdfFile) {
        await Share.share({
          title: data.title || 'Foto Minerva',
          text: data.text || '',
          dialogTitle: 'Compartir',
        });
        return;
      }

      const base64 = await fileToBase64(pdfFile);
      const safeName = String(pdfFile.name || `Foto-Minerva-${Date.now()}.pdf`).replace(/[\\/:*?"<>|]+/g, '-');
      const saved = await Filesystem.writeFile({
        path: `foto-minerva/${safeName}`,
        data: base64,
        directory: Directory.Cache,
        recursive: true,
      });

      window.alert(
        'PDF generado correctamente. Ahora elige una opción para Guardar o Compartir el documento.'
      );

      await Share.share({
        title: data.title || 'Foto Minerva',
        text: 'PDF generado por Foto Minerva.',
        files: [saved.uri],
        dialogTitle: 'Guardar / Compartir PDF',
      });
    };

    defineNavigatorMethod('canShare', nativeCanShare);
    defineNavigatorMethod('share', nativeShare);
    return;
  }

  // En navegador de escritorio desactivamos Web Share para que
  // la función de PDF use siempre la descarga directa del navegador.
  defineNavigatorMethod('canShare', undefined);
  defineNavigatorMethod('share', undefined);
};

configurePdfDelivery();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
