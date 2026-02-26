# SaludMap — Qué puedes hacer en la aplicación

Este documento lista las funcionalidades disponibles en la aplicación SaludMap y cómo acceder a ellas desde la interfaz.

- Tema (modo claro/oscuro):
  - Presiona el botón de tema para alternar entre modo claro y modo oscuro.
  - La preferencia de tema se guarda localmente para futuras sesiones.

- Localización y mapa:
  - Obtener ubicación actual: presiona el botón de ubicación para centrar el mapa en tu posición actual.
  - Recentrar automático: el mapa puede recenterarse automáticamente cuando tu ubicación cambia.
  - Guardar ubicación del mapa: presiona el botón "Guardar ubicación" para abrir el modal y almacenar la posición actual o la vista del mapa con un nombre.
  - Ver ubicaciones guardadas: abre la lista de ubicaciones guardadas para seleccionar y centrar el mapa en cualquiera de ellas.
  - Mostrar/ocultar tu marcador de usuario: puedes activar o desactivar la visualización del marcador que representa tu ubicación.

- Controles del mapa:
  - Zoom y desplazamiento con controles integrados y gestos (touch/mouse).
  - Botón "Detener" para detener la observación continua de la geolocalización.
  - Botón para descargar/precargar un área: permite bajar tiles y datos de lugares para uso offline en la zona seleccionada.
  - Offline Tile Layer: la aplicación usa una capa que admite modo offline (tiles precargados).

- Filtros y búsqueda de lugares:
  - Abrir modal de filtros: selecciona tipos de establecimientos (Hospital, Clínica, Médico, Veterinaria, etc.).
  - Botón "Todos" para activar/desactivar todos los filtros.
  - Buscar lugares cercanos: la app consulta y muestra establecimientos cercanos en el mapa.

- Información de establecimientos:
  - Abrir ficha de establecimiento: al seleccionar un marcador/resultado se muestra información detallada (nombre, dirección, horario, teléfono, tags).
  - Ver horarios de apertura (si están disponibles).
  - Ver estadísticas y analíticas básicas del establecimiento (si aplican).

- Reseñas (valoraciones y comentarios):
  - Ver reseñas: desde la ficha o la sección de reseñas puedes leer opiniones de usuarios.
  - Crear reseña: si estás autenticado, puedes publicar una reseña con texto y puntuación.
  - Ver promedio de estrellas y total de reseñas.

- Turnos / Reserva de citas:
  - Solicitar un turno o reserva desde la ficha del establecimiento (si el servicio está disponible).
  - Procesamiento de solicitudes de turno con feedback de estado (confirmación/errores).

- Autenticación y cuenta de usuario:
  - Iniciar sesión / Registrarse: accede a funciones protegidas como crear reseñas o solicitar turnos.
  - Modal de autenticación: aparece cuando intentas usar una función que requiere estar logueado.
  - Perfil básico de usuario y estado de sesión.

- Idioma y accesibilidad:
  - Selector de idioma: cambia la interfaz entre los idiomas soportados.
  - Textos internacionalizados en toda la UI (i18n).

- Funciones offline y sincronización:
  - Precarga de áreas para uso offline (tiles y datos de lugares).
  - Sincronización y almacenamiento local de lugares/ubicaciones descargadas.

- Servicios auxiliares y utilidades:
  - Guardado local de preferencias (tema, idioma, ubicaciones guardadas).
  - Descarga y guardado de datos relevantes para disminuir consumo de red.

- Botones y acciones UI generales:
  - Botón de abrir/cerrar sidebar o panel lateral para ver listas y opciones.
  - Botón para abrir modal de filtros.
  - Botones para cerrar modales y confirmar/Cancelar acciones.

- Integraciones del backend (visibles desde la app):
  - Consultas de establecimientos y datos vía API (consulta de lugares cercanos, detalles, reseñas, turnos).
  - Autorización JWT para rutas protegidas (login/register y acciones privadas).

Notas adicionales:
- Muchas acciones muestran mensajes de estado (progreso, errores, confirmaciones).
- Algunas funcionalidades dependen de permisos del navegador (geolocalización) y del estado de conexión (online/offline).

Si quieres, puedo adaptar este contenido para convertirlo en un README más visual, añadir capturas de pantalla, o incluir un índice con enlaces internos. También puedo actualizarlo con descripciones más detalladas de cada botón si quieres que inspeccione archivos específicos y extraiga textos exactos de la UI.
