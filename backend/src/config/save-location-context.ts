export const saveLocationContext = {
  id: 'save-map-location',
  name: 'Guardar Ubicación del Mapa',
  keywords: ['guardar ubicación', 'guardar vista', 'guardar mapa', 'ubicaciones guardadas', 'guardar posición'],
  priority: 7,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'reseñas', 'turnos']
  },
  content: {
    description: 'Flujo para guardar la posición o la vista actual del mapa con un nombre identificable.',
    steps: [
      'Pide al usuario que centre el mapa en la vista que desea guardar.',
      'Solicita un nombre corto para la ubicación guardada.',
      'Confirma los detalles (nombre, coordenadas y nivel de zoom).',
      'Guarda la ubicación localmente y notifica éxito.',
      'Indica cómo acceder o eliminar ubicaciones guardadas.'
    ],
    requirements: ['Espacio de almacenamiento local para guardar metadatos.'],
    commonIssues: [
      { problem: 'Nombre duplicado', solution: 'Solicitar un nombre distinto o agregar sufijo numérico.' },
      { problem: 'Fallo al guardar', solution: 'Reintentar y verificar permisos de almacenamiento local.' }
    ],
    constraints: ['No listar otras funcionalidades fuera de este flujo.', 'No solicitar autenticación en este paso.']
  }
};
