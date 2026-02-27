export const uiActionsContext = {
  id: 'ui-actions',
  name: 'Acciones UI Generales (Sidebar / Modales)',
  keywords: ['sidebar', 'panel lateral', 'abrir sidebar', 'cerrar modal', 'confirmar', 'cancelar'],
  priority: 4,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['funcionalidades de negocio', 'descarga offline']
  },
  content: {
    description: 'Instrucciones para abrir/cerrar el sidebar, abrir el modal de filtros y usar botones de confirmar/cancelar.',
    steps: [
      'Indica cómo abrir y cerrar el sidebar o panel lateral.',
      'Explica cómo abrir el modal de filtros desde la UI y cómo cerrarlo.',
      'Describe la diferencia entre confirmar y cancelar y cuándo usar cada uno.'
    ],
    requirements: ['Interfaz con controles visibles para sidebar y modales.'],
    commonIssues: [
      { problem: 'Modal no cierra', solution: 'Intentar cerrar con el botón de cancelar o recargar la vista.' }
    ],
    constraints: ['No describir funcionalidades no relacionadas dentro de este flujo.']
  }
};
