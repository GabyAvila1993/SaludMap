export const offlineDownloadContext = {
  id: 'offline-download',
  name: 'Descarga/Precarga de Área (Offline)',
  keywords: [
    'descargar área', 'precargar tiles', 'uso offline', 'área offline', 'guardar mapa', 'precarga', 'tiles offline', 'descarga de mapa'
  ],
  priority: 8,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'reseñas', 'turnos', 'autenticación', 'filtros de búsqueda']
  },
  content: {
    description: 'Pasos para descargar o precargar una zona del mapa (tiles y datos) y dejarla disponible en modo offline.',
    steps: [
      'Centra el mapa en la zona que quieres guardar y ajusta el nivel de zoom.',
      'Confirma el área y el nivel máximo de zoom a precargar.',
      'Solicita permiso de almacenamiento si la plataforma lo requiere.',
      'Muestra el tamaño estimado y solicita confirmación para iniciar.',
      'Inicia la descarga y muestra progreso porcentual y tiempo estimado restante.',
      'Si la conexión se interrumpe, pausa y reanuda automáticamente al restaurarse.',
      'Al finalizar, confirma que el área está disponible en modo offline.'
    ],
    requirements: [
      'Conexión a internet para la descarga inicial.',
      'Espacio libre suficiente en el dispositivo.',
      'Permiso de almacenamiento local si aplica.'
    ],
    commonIssues: [
      { problem: 'Espacio insuficiente', solution: 'Reducir área o niveles de zoom, o liberar espacio en el dispositivo.' },
      { problem: 'Descarga interrumpida', solution: 'Pausar y reintentar; esperar a que la conexión se restablezca para reanudar.' },
      { problem: 'Permisos denegados', solution: 'Indicar cómo habilitar permiso de almacenamiento y pedir reintentar.' }
    ],
    constraints: [
      'No iniciar descargas automáticas sin confirmación explícita.',
      'No solicitar autenticación ni pagos en este flujo.',
      'No modificar preferencias globales de la app.'
    ]
  }
};
