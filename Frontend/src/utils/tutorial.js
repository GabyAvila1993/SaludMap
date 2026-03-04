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
    color: #0056b3;
  }
  .saludmap-tour .driver-popover-description {
    font-size: 1rem;
  }
  .saludmap-tour .driver-popover-footer button {
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    padding: 8px 16px;
    text-shadow: none;
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

const ensureMapMenuOpen = (isMobileMap) => {
    if (!isMobileMap) return;
    if (!document.querySelector('.mobile-map-menu')) {
        click('.mobile-map-toggle');
    }
}

const ensureAllMenusClosed = (isMobile, isMobileMap) => {
  if (isMobile && document.querySelector('.mobile-menu')) {
    click('.hamburger');
  }
  if (isMobileMap && document.querySelector('.mobile-map-menu')) {
    click('.mobile-map-toggle');
  }
};


export const startTutorial = async () => {
  try {
    const { driver } = await import('driver.js');
    await import('driver.js/dist/driver.css');

    addCustomStyles();

    const isMobile = window.innerWidth <= 768;
    const isMobileMap = window.innerWidth <= 1024;

    let steps = [
      {
        element: '.logo',
        popover: {
          title: '🗺️ Bienvenido a SaludMap',
          description: 'Tu guía para encontrar servicios de salud. ¡Empecemos el recorrido!',
          side: 'bottom',
          align: 'start',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
      },
      {
        id: 'main-nav', // Add an ID to find this step easily
        element: '.nav-buttons',
        popover: {
          title: '📌 Navegación Principal',
          description: 'Usa estos botones para cambiar entre el mapa, tus turnos y los seguros de salud.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '.nav-right',
        popover: {
          title: '⚙️ Controles de Usuario',
          description: 'Desde aquí puedes cambiar el idioma, cambiar el tema, ver tu perfil o iniciar sesión.',
          side: 'bottom',
          align: 'end',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
      },
      {
        id: 'map-controls-intro', // Add an ID
        element: '[data-tour="update-location"]',
        popover: {
          title: '📍 Controles del Mapa',
          description: 'Desde aquí puedes actualizar tu ubicación.',
          side: 'right',
          align: 'start',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
      },
      {
        element: '[data-tour="filters"]',
        popover: {
          title: '🔍 Filtros del Mapa',
          description: 'Filtra los establecimientos por tipo (hospital, clínica, etc.) para encontrar lo que necesitas.',
          side: 'left',
          align: 'start',
        },
        onHighlightStarted: () => ensureMapMenuOpen(isMobileMap),
      },
      {
        element: '[data-tour="offline-download"]',
        popover: {
            title: '⬇️ Área Offline',
            description: 'Descarga un área del mapa para poder usar la aplicación sin conexión a internet.',
            side: 'left',
            align: 'start',
        },
        onHighlightStarted: () => ensureMapMenuOpen(isMobileMap),
      },
      {
        element: '[data-tour="save-location"]',
        popover: {
            title: '💾 Guardar Ubicación',
            description: 'Guarda una ubicación específica con un nombre para acceder a ella rápidamente más tarde.',
            side: 'left',
            align: 'start',
        },
        onHighlightStarted: () => ensureMapMenuOpen(isMobileMap),
      },
      {
        element: '[data-tour="view-locations"]',
        popover: {
            title: '📋 Ver Ubicaciones',
            description: 'Accede a tu lista de ubicaciones guardadas.',
            side: 'left',
            align: 'start',
        },
        onHighlightStarted: () => ensureMapMenuOpen(isMobileMap),
      },
      {
        element: '.map-root',
        popover: {
          title: '🏥 El Mapa Interactivo',
          description: 'Aquí verás tu ubicación y los establecimientos cercanos. Haz clic en un marcador para ver más detalles.',
          side: 'top',
          align: 'center',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
      },
      {
        element: '.chatbot-avatar',
        popover: {
            title: '🤖 Asistente Virtual AURA',
            description: 'Haz clic aquí para hablar con nuestro asistente y resolver tus dudas.',
            side: 'top',
            align: 'start',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
      },
      {
        popover: {
            title: '🎉 ¡Recorrido finalizado!',
            description: '¡Ya estás listo para usar SaludMap! Si necesitas ayuda, siempre puedes volver a iniciar este tutorial.',
        },
        onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
      }
    ];

    if (isMobile) {
        const navStepIndex = steps.findIndex(s => s.id === 'main-nav');
        if (navStepIndex !== -1) {
            steps.splice(navStepIndex, 1, 
                {
                    element: '.hamburger',
                    popover: {
                        title: '📌 Menú Principal',
                        description: 'Toca aquí para abrir la navegación principal de la aplicación.',
                        side: 'bottom',
                        align: 'center',
                    },
                    onHighlightStarted: () => ensureMainMenuOpen(isMobile),
                },
                {
                    element: '[data-tour="nav-mapa"]',
                    popover: { title: '🗺️ Mapa', description: 'Vuelve al mapa principal.' },
                    onHighlightStarted: () => ensureMainMenuOpen(isMobile),
                },
                {
                    element: '[data-tour="nav-turnos"]',
                    popover: { title: '🗓️ Turnos', description: 'Consulta tus próximos turnos.' },
                    onHighlightStarted: () => ensureMainMenuOpen(isMobile),
                },
                {
                    element: '[data-tour="nav-seguros"]',
                    popover: { title: '🛡️ Seguros', description: 'Explora las opciones de seguros de salud.' },
                    onHighlightStarted: () => ensureMainMenuOpen(isMobile),
                }
            );
        }
    }

    if (isMobileMap) {
        const mapIntroIndex = steps.findIndex(s => s.id === 'map-controls-intro');
        if (mapIntroIndex !== -1) {
            steps[mapIntroIndex] = {
                element: '.mobile-map-toggle',
                popover: {
                  title: '📍 Controles del Mapa',
                  description: 'Toca aquí para ver todas las opciones disponibles para el mapa.',
                  side: 'bottom',
                  align: 'start',
                },
                onHighlightStarted: () => ensureAllMenusClosed(isMobile, isMobileMap),
            };
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
        ensureAllMenusClosed(isMobile, isMobileMap);
        driverInstance.destroy();
      },
    });

    driverInstance.drive();
  } catch (error) {
    console.error("Error al iniciar el tutorial:", error);
    alert("No se pudo iniciar el tutorial. Por favor, intente más tarde.");
  }
};
