// Estilos personalizados para que el popover del tutorial se vea mejor
const customPopoverStyles = `
  .saludmap-tour {
    background-color: #ffffff;
    color: #333333;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .saludmap-tour .driver-popover-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #61A196; /* Verde marca SaludMap */
  }
  .saludmap-tour .driver-popover-description {
    font-size: 1rem;
  }
  .saludmap-tour .driver-popover-footer button {
    background-color: #61A196;
    color: white;
    border-radius: 4px;
    padding: 8px 16px;
    text-shadow: none;
    border: none;
  }
  .saludmap-tour .driver-popover-footer .driver-close-btn {
    background-color: transparent;
    color: #6c757d;
  }
`;

const addCustomStyles = () => {
  if (document.getElementById('saludmap-tour-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'saludmap-tour-styles';
  styleEl.innerHTML = customPopoverStyles;
  document.head.appendChild(styleEl);
};

// --- Helpers para controlar menús en móvil ---
const click = (selector) => document.querySelector(selector)?.click();

const ensureMainMenuOpen = (isMobile) => {
  if (!isMobile) return;
  if (!document.querySelector('.mobile-menu')) {
    click('.hamburger');
  }
};

const ensureAllMenusClosed = (isMobile) => {
  if (isMobile && document.querySelector('.mobile-menu')) {
    click('.hamburger');
  }
};

export const startTutorial = async () => {
  try {
    const { driver } = await import('driver.js');
    await import('driver.js/dist/driver.css');

    addCustomStyles();

    const isMobile = window.innerWidth <= 768;

    let steps = [
      {
        element: '.logo',
        popover: {
          title: '🗺️ Bienvenido a SaludMap',
          description: 'Tu guía inteligente para encontrar servicios de salud. ¡Empecemos el recorrido!',
          side: 'bottom',
          align: 'start',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile),
      },
      {
        element: '.emergency-nav-container', /* <-- ¡AQUÍ ESTÁ EL CAMBIO! Apuntamos al contenedor */
        popover: {
          title: '🚨 Centro de Emergencias',
          description: 'En caso de crisis, este botón detecta tu país y te conecta con los servicios locales (Ambulancia o Policía).',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        id: 'main-nav', 
        element: '.nav-buttons',
        popover: {
          title: '📌 Navegación Principal',
          description: 'Cambia entre las distintas secciones de la aplicación de forma rápida.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '.nav-item-dropdown',
        popover: {
          title: '📍 Opciones del Mapa',
          description: 'Haz clic en la flechita del Mapa para desplegar herramientas como: Actualizar ubicación, descargar áreas offline, guardar lugares y aplicar filtros.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.nav-right',
        popover: {
          title: '⚙️ Tu Cuenta e Idioma',
          description: 'Cambia el idioma de la plataforma o inicia sesión para gestionar tus turnos y seguros.',
          side: 'bottom',
          align: 'end',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile),
      },
      {
        element: '.map-root',
        popover: {
          title: '🏥 El Mapa Interactivo',
          description: 'Aquí verás tu ubicación y los establecimientos cercanos. Haz clic en un marcador para ver más detalles.',
          side: 'top',
          align: 'center',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile),
      },
      {
        element: '.chatbot-avatar',
        popover: {
            title: '🤖 Asistente Virtual',
            description: '¿Tienes dudas? Haz clic aquí para hablar con nuestro asistente inteligente en cualquier momento.',
            side: 'top',
            align: 'start',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile),
      },
      {
        popover: {
            title: '🎉 ¡Recorrido finalizado!',
            description: 'Ya estás listo para sacarle todo el provecho a SaludMap. Puedes volver a ver este tutorial cuando quieras.',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile),
      }
    ];

    // Adaptación del tutorial para pantallas de celular
    if (isMobile) {
        const navStepIndex = steps.findIndex(s => s.id === 'main-nav');
        if (navStepIndex !== -1) {
            steps.splice(navStepIndex, 2, // Reemplazamos la nav de desktop por la de móvil
                {
                    element: '.hamburger',
                    popover: {
                        title: '📌 Menú Principal',
                        description: 'Toca aquí para abrir la navegación y las opciones del mapa.',
                        side: 'bottom',
                        align: 'center',
                    },
                    onHighlightStarted: () => ensureMainMenuOpen(isMobile),
                }
            );
        }
    }

    const driverInstance = driver({
      className: 'saludmap-tour',
      animate: true,
      opacity: 0.75,
      padding: 10,
      allowClose: true,
      doneBtnText: '¡Entendido!',
      closeBtnText: 'Cerrar',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      steps: steps,
      onLastStep: () => {
        const doneBtn = document.querySelector('.saludmap-tour .driver-done-btn');
        if (doneBtn) {
            doneBtn.textContent = 'Finalizar';
        }
      },
       onCloseClick: () => {
        ensureAllMenusClosed(isMobile);
        driverInstance.destroy();
      },
    });

    driverInstance.drive();
  } catch (error) {
    console.error("Error al iniciar el tutorial:", error);
    alert("No se pudo iniciar el tutorial. Por favor, intente más tarde.");
  }
};