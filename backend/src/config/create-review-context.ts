export const createReviewContext = {
  id: 'create-review',
  name: 'Crear Reseña (Valoración y Comentario)',
  keywords: ['crear reseña', 'valorar', 'comentario', 'publicar reseña'],
  priority: 8,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'buscar lugares fuera de reseña']
  },
  content: {
    description: 'Flujo para crear y publicar una reseña con puntuación y texto (requiere autenticación).',
    steps: [
      'Verifica que el usuario esté autenticado; si no, indica que inicie sesión.',
      'Solicita la calificación (estrellas) y un comentario breve.',
      'Confirma la reseña mostrando calificación y texto antes de publicar.',
      'Publica la reseña y muestra confirmación o error según la respuesta del servidor.'
    ],
    requirements: ['Usuario autenticado (token válido).', 'Conexión a la API para enviar la reseña.'],
    commonIssues: [
      { problem: 'Usuario no autenticado', solution: 'Pedir que inicie sesión para poder publicar la reseña.' },
      { problem: 'Error al publicar', solution: 'Mostrar mensaje de error y permitir reintentar.' }
    ],
    constraints: ['No mostrar ni sugerir funcionalidades fuera de la creación de reseña.', 'No manejar procesos de registro en este flujo.']
  }
};
