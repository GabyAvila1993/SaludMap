export const searchPlacesContext = {
  id: 'search-places',
  name: 'Buscar Lugares Cercanos',
  keywords: ['buscar lugares', 'lugares cercanos', 'buscar cerca', 'búsqueda de establecimientos'],
  priority: 9,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'guardar ubicación', 'reseñas']
  },
  content: {
    description: 'Guía para buscar y mostrar establecimientos cercanos en el mapa según filtros y ubicación.',
    steps: [
      'Solicita la ubicación actual o pide centrar el mapa en la zona deseada.',
      'Pregunta si desea aplicar filtros (tipo de establecimiento, distancia).',
      'Realiza la búsqueda y muestra resultados en lista y en mapa.',
      'Permite seleccionar un resultado para ver la ficha de establecimiento.'
    ],
    requirements: ['Permiso de geolocalización si se usa la ubicación actual.', 'Conexión a la API de lugares.'],
    commonIssues: [
      { problem: 'Permiso de ubicación denegado', solution: 'Solicitar centrar manualmente el mapa o habilitar permisos en ajustes.' },
      { problem: 'Sin resultados', solution: 'Ampliar el radio de búsqueda o quitar filtros restrictivos.' }
    ],
    constraints: ['No gestionar autenticación en este flujo.', 'No iniciar descargas offline.']
  }
};
