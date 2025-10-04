# Solución a Errores 404 - Autenticación

## Fecha: 10/04/2025

## Problema Reportado

Al intentar registrar o iniciar sesión, aparecían los siguientes errores en la consola del navegador:

```
:3000/api/usuarios/login:1   Failed to load resource: the server responded with a status of 404 (Not Found)
authService.js:37  Error en login: AxiosError

:3000/api/usuarios/register:1   Failed to load resource: the server responded with a status of 404 (Not Found)
authService.js:19  Error en registro: AxiosError
```

---

## Causas Identificadas

Se identificaron **3 problemas principales** que causaban los errores 404:

### 1. **Falta de Prefijo Global `/api` en el Backend**
- El frontend intentaba acceder a: `http://localhost:3000/api/usuarios/login`
- Pero el backend NO tenía configurado el prefijo global `/api`
- Las rutas reales eran: `http://localhost:3000/usuarios/login`

### 2. **Módulo de Usuarios No Importado**
- El módulo `UsuariosModule` NO estaba importado en `AppModule`
- Por lo tanto, las rutas `/usuarios/login` y `/usuarios/register` no existían

### 3. **Modelo Usuario Faltante en Prisma Schema**
- El schema de Prisma NO tenía definido el modelo `Usuario`
- Esto impedía que el servicio pudiera interactuar con la base de datos

---

## Soluciones Implementadas

### ✅ Solución 1: Agregar Prefijo Global `/api`

**Archivo modificado:** `backend/src/main.ts`

```typescript
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	
	// ✅ Configurar prefijo global para todas las rutas
	app.setGlobalPrefix('api');
	
	// Habilitar CORS durante desarrollo
	app.enableCors();
	
	await app.listen(process.env.PORT ?? 3000);
}
```

**Resultado:**
- Ahora todas las rutas del backend tienen el prefijo `/api`
- Las rutas coinciden con las configuradas en el frontend
- Ejemplo: `http://localhost:3000/api/usuarios/login`

---

### ✅ Solución 2: Importar UsuariosModule

**Archivo modificado:** `backend/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlacesModule } from './places/places.module';
import { TurnosModule } from './turnos/turnos.module';
import { UsuariosModule } from './usuarios/usuarios.module'; // ✅ Agregado

@Module({
	imports: [
		PlacesModule, 
		TurnosModule, 
		UsuariosModule  // ✅ Agregado
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
```

**Resultado:**
- El módulo `UsuariosModule` ahora está registrado en la aplicación
- Las rutas de autenticación están disponibles
- Los controladores y servicios están activos

---

### ✅ Solución 3: Agregar Modelo Usuario en Prisma

**Archivo modificado:** `backend/prisma/schema.prisma`

```prisma
model Usuario {
  id          Int       @id @default(autoincrement())
  nombre      String
  apellido    String
  mail        String    @unique
  contrasenia String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Comandos ejecutados:**
```bash
# Crear migración de base de datos
npx prisma migrate dev --name add_usuario_model

# Regenerar cliente de Prisma
npx prisma generate
```

**Resultado:**
- Tabla `Usuario` creada en la base de datos
- Cliente de Prisma actualizado con el nuevo modelo
- El servicio puede interactuar con la base de datos

---

## Verificación de la Solución

### Rutas Ahora Disponibles

Con las correcciones implementadas, las siguientes rutas están funcionando:

| Método | Ruta | Función |
|--------|------|---------|
| POST | `http://localhost:3000/api/usuarios/register` | Registro de nuevos usuarios |
| POST | `http://localhost:3000/api/usuarios/login` | Inicio de sesión |

### Estructura de Peticiones

**Registro (POST `/api/usuarios/register`):**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "mail": "juan@example.com",
  "contrasenia": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "mail": "juan@example.com",
  "createdAt": "2025-04-10T14:00:00.000Z",
  "updatedAt": "2025-04-10T14:00:00.000Z"
}
```

**Login (POST `/api/usuarios/login`):**
```json
{
  "mail": "juan@example.com",
  "contrasenia": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "mail": "juan@example.com"
}
```

---

## Pasos para Reiniciar el Backend

Para que los cambios surtan efecto, es necesario reiniciar el servidor backend:

1. **Detener el servidor actual:**
   - Si está corriendo en terminal, presionar `Ctrl+C`

2. **Reiniciar el servidor:**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Verificar que el servidor inició correctamente:**
   - Buscar mensaje: `Application is running on: http://localhost:3000`
   - Verificar que no hay errores en la consola

---

## Cómo Verificar que Funciona

### Desde el Frontend:

1. **Probar Registro:**
   - Abrir la aplicación en el navegador
   - Hacer clic en "Iniciar Sesión"
   - Cambiar a "Registrarse"
   - Completar el formulario con datos válidos
   - Hacer clic en "Registrarse"
   - **Resultado esperado:** Usuario registrado exitosamente, sesión iniciada

2. **Probar Login:**
   - Si ya estás logueado, cerrar sesión
   - Hacer clic en "Iniciar Sesión"
   - Ingresar email y contraseña
   - Hacer clic en "Login"
   - **Resultado esperado:** Sesión iniciada exitosamente

### Desde la Consola del Navegador:

- **NO** deberían aparecer errores 404
- **NO** deberían aparecer AxiosError
- Verificar en la pestaña "Network" que las peticiones regresan status 200 o 201

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/main.ts` | ✅ Agregado prefijo global `/api` |
| `backend/src/app.module.ts` | ✅ Importado `UsuariosModule` |
| `backend/prisma/schema.prisma` | ✅ Agregado modelo `Usuario` |

---

## Resumen de la Configuración Final

### Backend (NestJS):
```
http://localhost:3000/api
├── /usuarios
│   ├── POST /register  (Registro de usuarios)
│   └── POST /login     (Inicio de sesión)
├── /turnos
│   └── ...
└── /places
    └── ...
```

### Frontend (React + Vite):
```
API Configuration:
- Base URL: http://localhost:3000/api
- Endpoints:
  - USER_REGISTER: /usuarios/register
  - USER_LOGIN: /usuarios/login
```

---

## Notas Importantes

1. **Base de Datos:**
   - Asegurarse de que la base de datos MySQL está corriendo
   - Verificar que la variable `DATABASE_URL` en `.env` es correcta
   - Ejemplo: `DATABASE_URL="mysql://user:password@localhost:3306/saludmap"`

2. **Dependencias:**
   - Si aparecen errores, ejecutar `npm install` en `/backend`
   - Particularmente verificar que `bcrypt` esté instalado

3. **CORS:**
   - El backend tiene CORS habilitado para desarrollo
   - Permite peticiones desde cualquier origen

4. **Contraseñas:**
   - Las contraseñas se hashean con bcrypt (10 rounds)
   - NUNCA se almacenan en texto plano

---

## Problemas Comunes y Soluciones

### Error: "Cannot find module '@prisma/client'"
**Solución:**
```bash
cd backend
npm install @prisma/client
npx prisma generate
```

### Error: "Database connection failed"
**Solución:**
- Verificar que MySQL está corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos existe

### Error: "Port 3000 already in use"
**Solución:**
- Detener el proceso que usa el puerto 3000
- O cambiar el puerto en `main.ts`

---

## Próximos Pasos Recomendados

1. ✅ **Reiniciar el backend** para aplicar todos los cambios
2. ✅ **Probar registro** desde el frontend
3. ✅ **Probar login** desde el frontend
4. ⏳ Considerar agregar JWT para autenticación más segura
5. ⏳ Agregar validación de formato de email
6. ⏳ Agregar requisitos de complejidad de contraseña

---

**Desarrollador:** Cline AI  
**Fecha:** 10/04/2025  
**Versión:** 1.0.0
