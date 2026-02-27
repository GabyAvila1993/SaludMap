export const syncContext = {
  id: 'sync-offline',
  name: 'Sincronización y Datos Offline',
  keywords: ['sincronización', 'sync', 'offline', 'precarga', 'sincronizar datos'],
  priority: 8,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['autenticación avanzada', 'pagos']
  },
  content: {
    description: 'Pasos para sincronizar datos descargados, gestionar precargas y resolver conflictos básicos.',
    steps: [
      'Explica cuándo y cómo se sincronizan los datos descargados con el servidor.',
      'Indica cómo forzar una sincronización manual si está disponible.',
      'Describe qué hacer ante conflictos o datos desactualizados (reintentar sincronización).'
    ],
    requirements: ['Conexión a internet para sincronización bidireccional cuando aplique.'],
    commonIssues: [
      { problem: 'Sincronización fallida', solution: 'Reintentar cuando haya conexión estable; informar el estado al usuario.' },
      { problem: 'Conflictos de datos', solution: 'Priorizar versión del servidor o pedir confirmación para sobrescribir según política.' }
    ],
    constraints: ['No transferir datos sensibles sin consentimiento explícito del usuario.']
  }
};
