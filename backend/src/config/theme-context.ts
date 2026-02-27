export const themeContext = {
  id: 'theme-toggle',
  name: 'Alternar Tema (Claro/Oscuro)',
  keywords: ['tema', 'modo oscuro', 'modo claro', 'alternar tema', 'guardar tema'],
  priority: 4,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['mapa', 'descarga offline', 'autenticación']
  },
  content: {
    description: 'Instrucciones breves para alternar entre modo claro y oscuro y guardar la preferencia.',
    steps: [
      'Indica al usuario que presione el control de tema para alternar entre claro y oscuro.',
      'Confirma que la preferencia se guardó localmente para futuras sesiones.',
      'Si el usuario pregunta cómo revertirlo, muestra el mismo control y pasos.'
    ],
    requirements: ['Almacenamiento local disponible para persistir la preferencia.'],
    commonIssues: [
      { problem: 'Preferencia no se guarda', solution: 'Verificar permisos de almacenamiento y reintentar.' }
    ],
    constraints: ['No explicar otras features (mapa, filtros) fuera de este flujo.']
  }
};
