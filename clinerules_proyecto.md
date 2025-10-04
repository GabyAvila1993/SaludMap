# Reglas del Proyecto – Cline Configuration

## Contexto del Proyecto
Este proyecto utiliza los siguientes lenguajes y tecnologías:
- **JavaScript**
- **TypeScript**
- **React**
- **CSS puro**

Cline debe tener en cuenta estas tecnologías para aplicar buenas prácticas, sintaxis correcta y convenciones de estilo consistentes.

---

## Estilo de Código

- Utilizar **tabulaciones** en lugar de espacios para la indentación.
- Mantener el código limpio, legible y coherente con las convenciones de cada lenguaje.
- En **TypeScript** y **JavaScript**:
  - Usar `const` siempre que sea posible.
  - En caso contrario, usar `let`.
  - **Nunca** usar `var`.
- En **TypeScript** o **JavaScript**, usar **CamelCase** para variables, funciones y métodos.
- Usar **PascalCase** para clases y componentes de React.
- Longitud máxima de línea recomendada: **100 caracteres**.
- Mantener un espaciado consistente entre bloques y funciones.

---

## Documentación y Comentarios

- Todas las funciones y clases deben estar documentadas con comentarios claros.
- Cada función debe incluir un **comentario explicativo breve** sobre:
  - Qué hace.
  - Qué parámetros recibe (si aplica).
  - Qué devuelve.
- En **TypeScript**, utilizar comentarios tipo **JSDoc** para describir las funciones.
- Añadir comentarios breves en partes críticas del código para explicar su propósito o lógica.
- En los componentes de React, describir brevemente su rol o comportamiento esperado.

Ejemplo:
```ts
/**
 * Calcula el total de una lista de precios.
 * @param {number[]} precios - Lista de precios de productos.
 * @returns {number} Total acumulado.
 */
function calcularTotal(precios) {
	const total = precios.reduce((acc, p) => acc + p, 0);
	return total;
}
```

---

## Arquitectura y Organización

- Seguir una **estructura modular y organizada**:
  ```
  src/
   ├─ components/
   ├─ hooks/
   ├─ services/
   ├─ utils/
   ├─ styles/
   └─ main.tsx
  ```
- Separar la lógica de presentación (componentes React) de la lógica de negocio (servicios o controladores).
- Mantener un archivo `index.ts` o `index.js` en cada carpeta para gestionar exportaciones limpias.
- Colocar los estilos CSS en archivos separados.
- Mantener un `README.md` actualizado con las dependencias y comandos principales.

---

## Buenas Prácticas

- Aplicar los principios **SOLID** en lo posible.
- Favorecer funciones puras y componentes reutilizables.
- Evitar duplicación de código.
- Manejar correctamente los **estados** y **efectos** en React.
- No dejar `console.log()` en producción (solo para debugging temporal).
- Revisar que no existan importaciones sin uso.

---

## Seguridad y Manejo de Errores

- Utilizar bloques `try/catch` en operaciones críticas o asíncronas.
- Validar siempre los datos de entrada.
- Evitar exponer información sensible en mensajes de error o logs.
- En formularios, sanitizar entradas antes de procesarlas.
- Mostrar mensajes de error claros al usuario cuando algo falle.
- No ejecutar comandos peligrosos sin confirmación previa (por ejemplo, operaciones destructivas o de base de datos).

---

## Reglas de Ejecución / Terminal

- Antes de ejecutar comandos que modifiquen el entorno (instalaciones, builds, etc.), Cline debe solicitar confirmación.
- No realizar cambios en dependencias o scripts sin aprobación explícita.

---

## Comunicación y Respuestas de Cline

- Responder siempre en **español**.
- Explicar brevemente cada acción o corrección sugerida.
- Si realiza una modificación o refactorización, incluir un resumen corto del cambio y su motivo.
- En caso de duda, pedir confirmación antes de asumir una acción.

---



## Fin del Archivo

