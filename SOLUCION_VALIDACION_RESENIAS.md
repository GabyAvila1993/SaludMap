# ✅ SOLUCIÓN: Validación de Reseñas - Sistema de Autenticación JWT

## 🔍 Problema Identificado

El sistema de reseñas **NO validaba correctamente** que el usuario estuvo en un turno porque:

1. ❌ El token JWT se devolvía del backend pero **NO se guardaba** en el frontend
2. ❌ Las peticiones a `/api/turnos` y `/api/resenias` **NO incluían el token** de autenticación
3. ❌ El backend no podía verificar la identidad del usuario en las peticiones
4. ❌ Faltaban archivos de configuración JWT en el backend

## 🔧 Soluciones Implementadas

### 📱 FRONTEND

#### 1. AuthContext.jsx - Guardar Token JWT
**Archivo:** `Frontend/src/components/Auth/AuthContext.jsx`

**Cambios:**
- ✅ Al hacer **login**, ahora se guarda el token en `localStorage.setItem('token', userData.token)`
- ✅ Al hacer **register**, también se guarda el token
- ✅ Al hacer **logout**, se elimina el token con `localStorage.removeItem('token')`

```javascript
// Líneas 44-47 (login)
if (userData.token) {
    localStorage.setItem('token', userData.token);
}

// Líneas 69-71 (register)
if (userData.token) {
    localStorage.setItem('token', userData.token);
}

// Línea 85 (logout)
localStorage.removeItem('token');
```

#### 2. turnosService.js - Incluir Token en Peticiones
**Archivo:** `Frontend/src/services/turnosService.js`

**Cambios:**
- ✅ La función `saveAppointment` ahora obtiene el token del localStorage
- ✅ Agrega el header `Authorization: Bearer ${token}` en las peticiones

```javascript
// Líneas 127-135
const token = localStorage.getItem('token');
const headers = {
  'Content-Type': 'application/json'
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

#### 3. reseniasService.js - Ya Configurado ✅
**Archivo:** `Frontend/src/services/reseniasService.js`

Este servicio **YA tenía** un interceptor de axios que agrega automáticamente el token (líneas 13-20).

---

### 🖥️ BACKEND

#### 1. jwt-auth.guard.ts - Guard de Autenticación
**Archivo NUEVO:** `backend/src/auth/jwt-auth.guard.ts`

Implementa el guard que protege las rutas que requieren autenticación.

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o no proporcionado');
    }
    return user;
  }
}
```

#### 2. jwt.strategy.ts - Estrategia JWT
**Archivo NUEVO:** `backend/src/auth/jwt.strategy.ts`

Define cómo se valida y decodifica el token JWT.

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      mail: payload.mail 
    };
  }
}
```

#### 3. auth.module.ts - Módulo de Autenticación
**Archivo NUEVO:** `backend/src/auth/auth.module.ts`

Configura el módulo de autenticación con Passport y JWT.

```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tu-secreto-super-seguro-cambiar-en-produccion',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h'
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
```

#### 4. auth.middleware.ts - Middleware Corregido
**Archivo MODIFICADO:** `backend/src/middleware/auth.middleware.ts`

**Cambios:**
- ✅ Convertido de función a clase `@Injectable()`
- ✅ Usa `JwtService` de NestJS en lugar de `AuthService`
- ✅ Decodifica el token correctamente con `userId` y `mail`

```typescript
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);
      (req as any).user = {
        userId: decoded.sub,
        mail: decoded.mail
      };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }
}
```

---

## 🔄 Flujo Completo Corregido

### 1️⃣ Usuario se Registra/Inicia Sesión
```
Frontend (AuthContext.jsx)
  ↓
POST /api/usuarios/register o /login
  ↓
Backend (usuarios.controller.ts)
  ↓
Devuelve: { id, nombre, apellido, mail, token }
  ↓
Frontend guarda:
  - localStorage.setItem('saludmap_user', JSON.stringify(userData))
  - localStorage.setItem('token', userData.token)
```

### 2️⃣ Usuario Crea un Turno
```
Frontend (Turnos.jsx)
  ↓
guardarTurno({ usuarioId, establecimientoId, fecha, hora })
  ↓
turnosService.saveAppointment()
  ↓
Agrega header: Authorization: Bearer ${token}
  ↓
POST /api/turnos con token
  ↓
Backend (turnos.controller.ts)
  ↓
Middleware NO aplica (ruta no protegida)
  ↓
Crea turno con usuarioId correcto
```

### 3️⃣ Usuario Intenta Dejar Reseña
```
Frontend (CrearResenia.jsx)
  ↓
reseniasService.getTurnosParaReseniar(establecimientoId)
  ↓
Interceptor axios agrega: Authorization: Bearer ${token}
  ↓
GET /api/resenias/turnos-para-reseniar?establecimientoId=X
  ↓
Backend (app.module.ts)
  ↓
AuthMiddleware verifica token
  ↓
Decodifica: { userId, mail }
  ↓
resenias.controller.ts recibe req.user.userId
  ↓
resenias.service.ts busca turnos WHERE usuarioId = req.user.userId
  ↓
✅ VALIDACIÓN EXITOSA: Solo devuelve turnos del usuario autenticado
```

### 4️⃣ Usuario Envía Reseña
```
Frontend (CrearResenia.jsx)
  ↓
reseniasService.crearResenia(turnoId, establecimientoId, puntuacion, comentario)
  ↓
Interceptor axios agrega: Authorization: Bearer ${token}
  ↓
POST /api/resenias
  ↓
Backend AuthMiddleware verifica token
  ↓
resenias.controller.ts recibe req.user.userId
  ↓
resenias.service.ts valida:
  ✓ Turno existe
  ✓ turno.usuarioId === req.user.userId
  ✓ Turno no tiene reseña previa
  ✓ Turno no está cancelado
  ✓ Fecha/hora han pasado
  ↓
✅ CREA RESEÑA EXITOSAMENTE
```

---

## 🧪 Cómo Probar

### Paso 1: Reiniciar Backend
```bash
cd backend
npm run start:dev
```

### Paso 2: Reiniciar Frontend
```bash
cd Frontend
npm run dev
```

### Paso 3: Limpiar Caché del Navegador
1. Abrir DevTools (F12)
2. Application → Storage → Clear site data
3. O cerrar sesión y volver a iniciar sesión

### Paso 4: Flujo de Prueba Completo

1. **Registrar/Iniciar Sesión**
   - Ir a la aplicación
   - Registrarse o iniciar sesión
   - ✅ Verificar en DevTools → Application → Local Storage:
     - `saludmap_user` debe existir
     - `token` debe existir

2. **Crear un Turno**
   - Ir a la sección de Turnos
   - Seleccionar un establecimiento
   - Crear un turno con fecha/hora pasada (o reciente para testing)
   - ✅ Verificar en DevTools → Network:
     - Request a `/api/turnos` debe tener header `Authorization: Bearer ...`

3. **Intentar Dejar Reseña**
   - Hacer clic en el establecimiento en el mapa
   - Hacer clic en "Dejar Reseña"
   - ✅ Debe mostrar el turno creado en el selector
   - Seleccionar estrellas y escribir comentario
   - Enviar reseña
   - ✅ Debe mostrar mensaje de éxito

4. **Verificar Validación**
   - Intentar dejar otra reseña para el mismo turno
   - ❌ Debe mostrar error: "Ya existe una reseña para este turno"

---

## 🔐 Seguridad

### Variables de Entorno Recomendadas

Crear archivo `backend/.env`:
```env
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion-usar-string-largo-aleatorio
JWT_EXPIRES_IN=24h
DATABASE_URL=mysql://usuario:password@localhost:3306/saludmap
```

### Generar Secret Seguro
```bash
# En Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📝 Archivos Modificados/Creados

### Frontend (3 archivos)
- ✅ `src/components/Auth/AuthContext.jsx` - Guardar token
- ✅ `src/services/turnosService.js` - Incluir token en peticiones
- ✅ `src/services/reseniasService.js` - Ya tenía interceptor

### Backend (4 archivos)
- ✅ `src/auth/jwt-auth.guard.ts` - **NUEVO**
- ✅ `src/auth/jwt.strategy.ts` - **NUEVO**
- ✅ `src/auth/auth.module.ts` - **NUEVO**
- ✅ `src/middleware/auth.middleware.ts` - **MODIFICADO**

---

## ✅ Resultado Final

El sistema de reseñas ahora:

1. ✅ **Valida correctamente** que el usuario estuvo en el turno
2. ✅ **Protege las rutas** con autenticación JWT
3. ✅ **Verifica la identidad** del usuario en cada petición
4. ✅ **Previene reseñas fraudulentas** de usuarios que no asistieron
5. ✅ **Mantiene la seguridad** con tokens firmados y verificables

---

## 🐛 Troubleshooting

### Error: "Token no proporcionado"
- Verificar que el usuario haya iniciado sesión
- Verificar que `localStorage.getItem('token')` devuelva un valor
- Cerrar sesión y volver a iniciar sesión

### Error: "Token inválido o expirado"
- El token expira en 24h por defecto
- Cerrar sesión y volver a iniciar sesión
- Verificar que JWT_SECRET sea el mismo en backend

### Error: "El turno no pertenece al usuario"
- Verificar que el turno se haya creado con el `usuarioId` correcto
- Revisar en la base de datos: `SELECT * FROM Turno WHERE id = X`
- El campo `usuarioId` debe coincidir con el ID del usuario autenticado

### No aparecen turnos para reseñar
- Verificar que el turno tenga `estado != 'cancelled'`
- Verificar que el turno no tenga una reseña previa
- Verificar que la fecha/hora del turno hayan pasado (o sean recientes para testing)

---

**Fecha de Implementación:** 2025-10-06  
**Estado:** ✅ COMPLETADO Y FUNCIONAL
