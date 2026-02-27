export const geolocationContext = {
  id: 'geolocation',
  name: 'Localización y Marcador de Usuario',
  keywords: ['ubicación actual', 'geolocalización', 'centrar mapa', 'recentrar', 'marcador usuario', 'detener geolocalización'],
  priority: 9,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['descarga offline', 'guardar ubicaciones', 'tema']
  },
  content: {
    description: 'Flujo para obtener la ubicación actual, centrar/recentrar el mapa, mostrar/ocultar el marcador del usuario y detener la observación continua.',
    steps: [
      'Solicita permiso de geolocalización si aún no está habilitado.',
      'Al obtener la ubicación, centra el mapa en las coordenadas del usuario.',
      'Explica cómo activar/desactivar la visualización del marcador de usuario.',
      'Si la observación está activa, indica el botón "Detener" para pausar la actualización automática.',
      'Si el usuario desea recenter automático, explica cómo activar esa opción.'
    ],
    requirements: ['Permiso de geolocalización del navegador/dispositivo.'],
    commonIssues: [
      { problem: 'Permiso denegado', solution: 'Solicitar centrar manualmente el mapa o habilitar permisos en ajustes.' },
      { problem: 'Ubicación imprecisa', solution: 'Pedir al usuario intentar en un área abierta o activar GPS de alta precisión.' }
    ],
    constraints: ['No iniciar descargas ni cambios de configuración global fuera de la localización.']
  }
};
