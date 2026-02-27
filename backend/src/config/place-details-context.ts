export const placeDetailsContext = {
  id: 'place-details',
  name: 'Ficha de Establecimiento',
  keywords: ['ficha establecimiento', 'detalles lugar', 'información establecimiento', 'horarios', 'teléfono'],
  priority: 9,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'reseñas fuera de crear', 'turnos no relacionados']
  },
  content: {
    description: 'Mostrar información detallada de un establecimiento seleccionado: nombre, dirección, horario, teléfono y tags.',
    steps: [
      'Identifica el establecimiento seleccionado por el usuario.',
      'Muestra nombre, dirección, horario de atención y teléfono si están disponibles.',
      'Incluye etiquetas relevantes y servicios ofrecidos.',
      'Indica acciones disponibles desde la ficha (ej.: llamar, solicitar turno) si aplica.'
    ],
    requirements: ['Disponibilidad de datos del establecimiento desde la API.'],
    commonIssues: [
      { problem: 'Datos incompletos', solution: 'Informar qué datos faltan y ofrecer alternativas (buscar contacto o dirección cercana).' },
      { problem: 'Número de teléfono inválido', solution: 'Sugerir verificar en la web oficial o en otra fuente.' }
    ],
    constraints: ['No generar reseñas ni solicitudes de turno en este flujo; solo mostrar datos y guiar al usuario.']
  }
};
