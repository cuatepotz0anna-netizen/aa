import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const productionApiUrl = 'https://apta-backend-e3t7.onrender.com/api';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: './',
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        mode === 'production' ? productionApiUrl : env.VITE_API_URL || ''
      ),
    },
    plugins: [react()],
    server: {
      port: 5173,
      host: '127.0.0.1',
      strictPort: true,
    },
  };
});
