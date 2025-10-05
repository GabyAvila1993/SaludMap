/* ========================================
   ARCHIVO: vite.config.js
   UBICACIÓN: E:\SaludMap\Frontend\vite.config.js
   ======================================== */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // ❌ REMOVIDO: rewrite que eliminaba /api
        // ✅ Ahora las peticiones llegarán con /api al backend
      }
    }
  }
})

/* ========================================
   FIN DEL ARCHIVO
   ======================================== */