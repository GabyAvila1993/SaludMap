import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppWrapper from './AppWrapper.jsx';
import './i18n/config'; // Importar configuración de i18n

// Seleccionamos el elemento raíz
const rootElement = document.getElementById('root');

// En JSX/JS no usamos el "!" (non-null assertion) que usa TS
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  );
}

// 👇 Registrar el Service Worker (Lógica de SaludMap)
if ('serviceWorker' in navigator) {
  // Durante desarrollo, fuerza la des-registración para evitar cachés viejos
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()))
      .catch((err) => console.warn('Error al des-registrar SW:', err));
  } else {
    // Aquí iría la lógica de registro en producción
  }
}