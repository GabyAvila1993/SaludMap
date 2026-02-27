export const preferencesContext = {
  id: 'preferences',
  name: 'Guardado de Preferencias Locales',
  keywords: ['preferencias', 'guardar preferencias', 'tema', 'idioma', 'ubicaciones guardadas'],
  priority: 5,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['respaldo remoto', 'pagos']
  },
  content: {
    description: 'Explica cómo se guardan y recuperan preferencias locales como tema, idioma y ubicaciones guardadas.',
    steps: [
      'Describe qué preferencias se guardan localmente (tema, idioma, ubicaciones).',
      'Indica cómo el usuario puede revisar y cambiar esas preferencias.',
      'Confirma que los cambios se persisten y cómo restablecer valores por defecto.'
    ],
    requirements: ['Almacenamiento local accesible y funcional.'],
    commonIssues: [
      { problem: 'Preferencias no se aplican', solution: 'Verificar que la app cargue las preferencias al iniciar y reintentar guardar.' }
    ],
    constraints: ['No exportar preferencias a servicios externos sin consentimiento explícito.']
  }
};
