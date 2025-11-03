import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppWrapper from './AppWrapper.jsx';
import './i18n/config'; // Importar configuración de i18n

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AppWrapper />
	</StrictMode>,
);

// 👇 Registrar el Service Worker
if ('serviceWorker' in navigator) {
  // Durante desarrollo, fuerza la des-registración para evitar cachés viejos
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()))
      .catch(() => {});
  } else {
    // aquí va la lógica de registro en producción (si la tienes)
    // navigator.serviceWorker.register('/sw.js')...
  }
}
