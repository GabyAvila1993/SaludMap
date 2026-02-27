export const authContext = {
  id: 'authentication',
  name: 'Autenticación y Cuenta de Usuario',
  keywords: ['login', 'registrarse', 'iniciar sesión', 'cuenta', 'autenticación'],
  priority: 10,
  behavior: {
    scope: 'single_feature',
    responseStyle: 'step_by_step',
    avoidTopics: ['tema', 'descarga offline', 'mapa']
  },
  content: {
    description: 'Pasos para iniciar sesión o registrarse y el manejo básico de estado de sesión.',
    steps: [
      'Explica cómo iniciar sesión o registrarse indicando los campos necesarios.',
      'Indica que algunas acciones requieren autenticación y que aparecerá un modal si es necesario.',
      'Describe cómo verificar el estado de sesión en el perfil básico.'
    ],
    requirements: ['Conexión a la API de autenticación y credenciales válidas.'],
    commonIssues: [
      { problem: 'Credenciales incorrectas', solution: 'Solicitar reintentar con credenciales correctas o recuperar contraseña.' },
      { problem: 'Token expirado', solution: 'Pedir reingresar o refrescar sesión según mecanismo implementado.' }
    ],
    constraints: ['No realizar operaciones de cuenta avanzadas (eliminar cuenta) en este flujo.']
  }
};
