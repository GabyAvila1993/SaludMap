export const mapFiltersContext = {
  id: 'map-filters',
  name: 'Filtros y Búsqueda de Lugares',
  keywords: ['filtros', 'modal de filtros', 'tipo de establecimiento', 'todos los filtros', 'buscar lugares'],
  priority: 9,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'autenticación']
  },
  content: {
    description: 'Flujo para abrir el modal de filtros, seleccionar tipos de establecimientos, usar el botón "Todos" y ejecutar la búsqueda de lugares.',
    steps: [
      'Indica cómo abrir el modal de filtros.',
      'Explica cómo seleccionar o deseleccionar tipos (Hospital, Clínica, Médico, Veterinaria, etc.).',
      'Describe la función del botón "Todos" para activar/desactivar todos los filtros.',
      'Confirma cómo iniciar la búsqueda y cómo ver los resultados en mapa y lista.'
    ],
    requirements: ['Conexión a la API de lugares para obtener resultados filtrados.'],
    commonIssues: [
      { problem: 'Filtros no aplican', solution: 'Reiniciar el modal y reintentar; verificar conexión con la API.' },
      { problem: 'Resultados vacíos', solution: 'Ampliar el radio de búsqueda o quitar filtros restrictivos.' }
    ],
    constraints: ['No gestionar autenticación ni pagos en este flujo.']
  }
};
