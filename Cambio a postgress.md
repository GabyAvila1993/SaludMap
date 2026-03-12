# Análisis de Migración de MySQL a PostgreSQL

A continuación se detallan los archivos que contienen consultas SQL específicas de MySQL y las recomendaciones para adaptarlas a PostgreSQL.

El análisis se centra principalmente en el archivo `backend/create_tables.sql`, ya que no se encontraron otras consultas SQL sin formato (raw queries) en el código fuente. El resto del proyecto utiliza Prisma, que se encarga de la compatibilidad entre bases de datos.

---

## Archivo: `backend/create_tables.sql`

Este archivo contiene un script para la creación inicial de la estructura de la base de datos. La sintaxis utilizada es específica de MySQL.

### Resumen de Cambios Necesarios:

A continuación se listan los cambios necesarios para hacer este script compatible con PostgreSQL:

1.  **Declaración `USE saludmap;`**
    *   **MySQL:** `USE saludmap;`
    *   **Análisis:** Este comando es específico de MySQL para seleccionar una base de datos. En PostgreSQL, la conexión se establece directamente con la base de datos deseada, por lo que esta línea debe ser eliminada.

2.  **Cláusula `AUTO_INCREMENT` para IDs**
    *   **MySQL:** `id INT NOT NULL AUTO_INCREMENT`
    *   **Análisis:** Esta es la forma en que MySQL crea columnas con valores que se incrementan solos.
    *   **Cambio para PostgreSQL:** Se debe reemplazar el tipo `INT` y la cláusula `AUTO_INCREMENT` por los pseudo-tipos `SERIAL` (para enteros de 4 bytes) o `BIGSERIAL` (para enteros de 8 bytes). Estos crean automáticamente la secuencia necesaria.
    *   **Ejemplo:** `id SERIAL PRIMARY KEY`

3.  **Tipo de dato `DATETIME`**
    *   **MySQL:** `DATETIME(3)`
    *   **Análisis:** Es el tipo de dato para fecha y hora en MySQL.
    *   **Cambio para PostgreSQL:** El equivalente es `TIMESTAMP` o `TIMESTAMP(3)` para mantener la precisión de milisegundos.
    *   **Ejemplo:** `createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`

4.  **Cláusula `ON UPDATE CURRENT_TIMESTAMP`**
    *   **MySQL:** `ON UPDATE CURRENT_TIMESTAMP(3)`
    *   **Análisis:** Es una función de MySQL para actualizar automáticamente un campo de fecha/hora cuando se modifica un registro. No existe en PostgreSQL.
    *   **Cambio para PostgreSQL:** Se debe lograr creando una función de trigger que actualice el campo, y luego asociar ese trigger a la tabla.
    *   **Ejemplo:**
        ```sql
        -- Primero, crear la función
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
           NEW."updatedAt" = NOW();
           RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Luego, crear el trigger en la tabla después de haberla creado
        CREATE TRIGGER update_usuario_updated_at
        BEFORE UPDATE ON "Usuario"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        ```

5.  **Motor de Almacenamiento y Charset (`ENGINE`, `CHARSET`, `COLLATE`)**
    *   **MySQL:** `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    *   **Análisis:** Estas cláusulas son totalmente específicas de MySQL para definir el motor de almacenamiento y la codificación de caracteres.
    *   **Cambio para PostgreSQL:** Deben ser eliminadas por completo. PostgreSQL maneja esto de forma diferente, generalmente configurado a nivel de base de datos durante su creación.

6.  **Comandos de Introspección (`SHOW`, `DESCRIBE`)**
    *   **MySQL:** `SHOW TABLES;`, `DESCRIBE Usuario;`
    *   **Análisis:** Son comandos para usar en la consola de MySQL. No son parte del estándar SQL para definir esquemas.
    *   **Cambio para PostgreSQL:** Deben ser eliminados del script. Los equivalentes en la consola de PostgreSQL (`psql`) son `\dt` y `\d "Usuario"`.

### Ejemplo de Script Convertido para PostgreSQL:

A continuación un ejemplo de cómo quedaría la tabla `Usuario` convertida:

**Original (MySQL):**
```sql
CREATE TABLE Usuario (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(191) NOT NULL,
    apellido VARCHAR(191) NOT NULL,
    mail VARCHAR(191) NOT NULL,
    contrasenia VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE INDEX Usuario_mail_key (mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Convertido (PostgreSQL):**
```sql
-- Los nombres con mayúsculas se deben entrecomillar en PostgreSQL
CREATE TABLE "Usuario" (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(191) NOT NULL,
    "apellido" VARCHAR(191) NOT NULL,
    "mail" VARCHAR(191) NOT NULL UNIQUE,
    "contrasenia" VARCHAR(191) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- El trigger para updatedAt se crea aparte, como se explicó en el punto 4.
CREATE TRIGGER update_usuario_updated_at
BEFORE UPDATE ON "Usuario"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); -- (Asegurarse que la función ya fue creada)
```
