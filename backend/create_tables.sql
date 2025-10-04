-- Script para crear todas las tablas necesarias en SaludMap
-- Fecha: 10/04/2025
-- Ejecutar este script en MySQL Workbench

USE saludmap;

-- Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS Turno;
DROP TABLE IF EXISTS Ubicacion;
DROP TABLE IF EXISTS Usuario;

-- Tabla Usuario (para autenticación)
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

-- Tabla Ubicacion (para lugares guardados)
CREATE TABLE Ubicacion (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(191) NOT NULL,
    direccion VARCHAR(191) NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Turno (para turnos médicos)
CREATE TABLE Turno (
    id INT NOT NULL AUTO_INCREMENT,
    fecha DATETIME(3) NOT NULL,
    paciente VARCHAR(191) NOT NULL,
    ubicacionId INT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    FOREIGN KEY (ubicacionId) REFERENCES Ubicacion(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar que las tablas se crearon correctamente
SHOW TABLES;

-- Verificar estructura de la tabla Usuario
DESCRIBE Usuario;
