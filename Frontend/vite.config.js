import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/turnos': 'http://localhost:3000',
      '/places': 'http://localhost:3000',
    }
  }
});
