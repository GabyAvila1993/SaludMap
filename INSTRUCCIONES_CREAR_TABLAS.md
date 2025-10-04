# Instrucciones para Crear Tablas en MySQL

## 📋 Pasos para Ejecutar el Script SQL

### **Paso 1: Abrir MySQL Workbench**
1. Abre MySQL Workbench
2. Conéctate a tu servidor local (el que usas con la base de datos `saludmap`)

### **Paso 2: Abrir el Script**
1. En MySQL Workbench, ve a: **File → Open SQL Script...**
2. Navega a: `E:\SaludMap\backend\create_tables.sql`
3. Haz clic en **Open**

### **Paso 3: Ejecutar el Script**
1. Con el script abierto en MySQL Workbench
2. Haz clic en el icono del **rayo** ⚡ (Execute) o presiona `Ctrl+Shift+Enter`
3. El script se ejecutará completamente

### **Paso 4: Verificar Resultados**
Deberías ver en la ventana de resultados:

**Output:**
```
> USE saludmap
> DROP TABLE IF EXISTS Turno          (0 rows affected)
> DROP TABLE IF EXISTS Ubicacion      (0 rows affected)
> DROP TABLE IF EXISTS Usuario        (0 rows affected)
> CREATE TABLE Usuario                (0 rows affected)
> CREATE TABLE Ubicacion              (0 rows affected)
> CREATE TABLE Turno                  (0 rows affected)
```

**En la pestaña SHOW TABLES:**
```
Tables_in_saludmap
------------------
_prisma_migrations
Turno
Ubicacion
Usuario
```

**En la pestaña DESCRIBE Usuario:**
```
Field       | Type         | Null | Key | Default           
------------|--------------|------|-----|-------------------
id          | int          | NO   | PRI | NULL              
nombre      | varchar(191) | NO   |     | NULL              
apellido    | varchar(191) | NO   |     | NULL              
mail        | varchar(191) | NO   | UNI | NULL              
contrasenia | varchar(191) | NO   |     | NULL              
createdAt   | datetime(3)  | NO   |     | CURRENT_TIMESTAMP 
updatedAt   | datetime(3)  | NO   |     | CURRENT_TIMESTAMP 
```

---

## ✅ Verificación Rápida

Después de ejecutar el script, ejecuta manualmente:

```sql
USE saludmap;
SHOW TABLES;
```

**Resultado esperado:**
- `_prisma_migrations` ✅
- `Turno` ✅
- `Ubicacion` ✅
- `Usuario` ✅

---

## 🚀 Siguiente Paso: Reiniciar Backend

Una vez que las tablas estén creadas:

1. **Detener el backend** (Ctrl+C en la terminal)
2. **Reiniciar el backend:**
   ```bash
   cd backend
   npm run start:dev
   ```
3. **Verificar inicio exitoso** (debes ver los mensajes de NestJS sin errores)

---

## 🧪 Probar Registro

1. Abrir la aplicación en el navegador
2. Hacer clic en "Iniciar Sesión" → "Registrarse"
3. Completar el formulario:
   - Nombre: Test
   - Apellido: Usuario
   - Email: test@example.com
   - Contraseña: test123
4. Hacer clic en "Registrarse"

**Resultado esperado:**
- ✅ Usuario registrado exitosamente
- ✅ Sesión iniciada automáticamente
- ✅ Sin errores 500
- ✅ Nombre visible: "👤 Test Usuario"

---

## 🔍 Verificar en MySQL

Después del registro exitoso, verifica en MySQL:

```sql
SELECT * FROM Usuario;
```

**Resultado esperado:**
```
id | nombre | apellido | mail              | contrasenia  | createdAt           | updatedAt
---|--------|----------|-------------------|--------------|---------------------|--------------------
1  | Test   | Usuario  | test@example.com  | $2b$10$...   | 2025-04-10 14:09:00 | 2025-04-10 14:09:00
```

La contraseña debe estar hasheada (no en texto plano).

---

## ❓ Si hay algún error

Si aparece algún error al ejecutar el script, envíame el mensaje de error exacto.

---

**Desarrollador:** Cline AI  
**Fecha:** 10/04/2025
