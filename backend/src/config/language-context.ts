export const languageContext = {
  id: 'language-selector',
  name: 'Selector de Idioma (i18n)',
  keywords: ['idioma', 'selector de idioma', 'cambiar idioma', 'i18n'],
  priority: 5,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'mapa', 'descarga offline']
  },
  content: {
    description: 'Instrucciones para cambiar el idioma de la interfaz y confirmar la persistencia de la selección.',
    steps: [
      'Indica dónde está el selector de idioma en la interfaz.',
      'Explica cómo elegir el idioma preferido y que los textos se actualizarán.',
      'Confirma que la preferencia se guarda localmente para futuras sesiones.'
    ],
    requirements: ['Soporte de i18n en la aplicación y traducciones disponibles.'],
    commonIssues: [
      { problem: 'Traducción incompleta', solution: 'Informar qué partes no están traducidas y ofrecer el idioma por defecto.' }
    ],
    constraints: ['No cambiar contenidos específicos de datos (reseñas, lugares) en origen; solo la UI.']
  }
};
