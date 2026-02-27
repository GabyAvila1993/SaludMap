export const viewReviewsContext = {
  id: 'view-reviews',
  name: 'Ver Reseñas de Establecimiento',
  keywords: ['ver reseñas', 'leer comentarios', 'promedio estrellas', 'reseñas establecimiento'],
  priority: 8,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['crear reseña', 'autenticación', 'turnos']
  },
  content: {
    description: 'Mostrar reseñas y puntuaciones de un establecimiento seleccionado de forma ordenada y breve.',
    steps: [
      'Carga y muestra el promedio de estrellas y el total de reseñas disponibles.',
      'Presenta las reseñas más recientes con autor, fecha y texto.',
      'Permite paginar o cargar más reseñas si hay muchas.'
    ],
    requirements: ['Conexión a la API de reseñas; datos públicos o autenticados según política.'],
    commonIssues: [
      { problem: 'No hay reseñas', solution: 'Informar que no existen reseñas y sugerir crear la primera si está autenticado.' },
      { problem: 'Error al cargar', solution: 'Reintentar y mostrar mensaje de estado.' }
    ],
    constraints: ['No publicar reseñas ni solicitar login en este flujo; solo lectura.']
  }
};
