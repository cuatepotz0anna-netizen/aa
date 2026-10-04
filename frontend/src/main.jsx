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

const installNativePdfShare = () => {
  if (!Capacitor.isNativePlatform() || typeof navigator === 'undefined') return;

  const nativeCanShare = (data = {}) => Array.isArray(data.files)
    && data.files.some((file) => file?.type === 'application/pdf');

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

    await Share.share({
      title: data.title || 'Foto Minerva',
      text: 'PDF generado correctamente. Elige dónde guardarlo o compartirlo.',
      files: [saved.uri],
      dialogTitle: 'Guardar / Compartir PDF',
    });
  };

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

  defineNavigatorMethod('canShare', nativeCanShare);
  defineNavigatorMethod('share', nativeShare);
};

installNativePdfShare();

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
