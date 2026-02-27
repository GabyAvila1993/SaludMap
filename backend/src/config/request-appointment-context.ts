export const requestAppointmentContext = {
  id: 'request-appointment',
  name: 'Solicitar Turno / Reservar Cita',
  keywords: ['solicitar turno', 'reservar cita', 'pedir turno', 'reservar servicio'],
  priority: 9,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'crear reseña']
  },
  content: {
    description: 'Proceso para solicitar un turno o reservar una cita desde la ficha de un establecimiento, con feedback de estado.',
    steps: [
      'Verifica disponibilidad del servicio para solicitar turno en la ficha.',
      'Confirma la identidad del usuario (autenticación si es necesaria).',
      'Solicita fecha y franja horaria preferida y datos necesarios.',
      'Envía la solicitud y muestra estado: confirmado, pendiente o error.',
      'Si hay error, indicar la causa y opciones para reintentar o elegir otra franja.'
    ],
    requirements: ['Usuario autenticado si el servicio lo exige.', 'Conexión a la API del establecimiento para consultar disponibilidad.'],
    commonIssues: [
      { problem: 'Servicio no disponible', solution: 'Informar que no hay turnos y ofrecer opciones alternativas o lista de espera si aplica.' },
      { problem: 'Conflicto de horario', solution: 'Solicitar otra fecha o franja horaria disponible.' }
    ],
    constraints: ['No procesar pagos en este flujo.', 'No entrar en configuraciones de cuenta o perfil fuera de la verificación necesaria.']
  }
};
