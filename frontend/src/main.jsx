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
    navigator[name] = value;
    if (navigator[name] === value) return true;
  } catch {
    // Continúa con defineProperty.
  }

  try {
    Object.defineProperty(navigator, name, {
      configurable: true,
      writable: true,
      value,
    });
    return true;
  } catch {
    try {
      Object.defineProperty(Navigator.prototype, name, {
        configurable: true,
        writable: true,
        value,
      });
      return true;
    } catch {
      return false;
    }
  }
};

const downloadPdfInBrowser = (file) => {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name || `Foto-Minerva-${Date.now()}.pdf`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
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

  // En web de escritorio, cualquier PDF que intente usar Web Share
  // se convierte directamente en una descarga del navegador.
  const browserCanShare = (data = {}) => isPdfShare(data);
  const browserShare = async (data = {}) => {
    const pdfFile = Array.isArray(data.files)
      ? data.files.find((file) => file?.type === 'application/pdf')
      : null;

    if (!pdfFile) {
      throw new Error('Compartir desde navegador no está habilitado para este contenido.');
    }

    downloadPdfInBrowser(pdfFile);
  };

  defineNavigatorMethod('canShare', browserCanShare);
  defineNavigatorMethod('share', browserShare);
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
