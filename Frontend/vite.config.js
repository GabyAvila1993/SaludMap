import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
   proxy: {
  '/places': {
    target: 'http://localhost:3000', // puerto real del backend
    changeOrigin: true,
  },
},

  },
});
