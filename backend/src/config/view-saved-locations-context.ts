export const viewSavedLocationsContext = {
  id: 'view-saved-locations',
  name: 'Ver Ubicaciones Guardadas',
  keywords: ['ubicaciones guardadas', 'ver ubicaciones', 'lista ubicaciones', 'centrar ubicación guardada'],
  priority: 7,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['descarga offline', 'tema', 'autenticación']
  },
  content: {
    description: 'Mostrar la lista de ubicaciones almacenadas y centrar el mapa en la selección o eliminar entradas.',
    steps: [
      'Presenta la lista de ubicaciones guardadas con nombre y vista previa.',
      'Al seleccionar una ubicación, centra el mapa en las coordenadas asociadas.',
      'Ofrece la opción de eliminar o renombrar la ubicación guardada con confirmación.'
    ],
    requirements: ['Acceso al almacenamiento local donde se guardan las metadatas de ubicaciones.'],
    commonIssues: [
      { problem: 'Lista vacía', solution: 'Informar que no hay ubicaciones guardadas y ofrecer guardar la vista actual.' },
      { problem: 'Error al eliminar', solution: 'Reintentar y verificar permisos de almacenamiento.' }
    ],
    constraints: ['No modificar datos remotos en este flujo; solo gestión local.']
  }
};
