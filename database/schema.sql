-- Esquema de la base de datos SICE (backend src/)
-- Ejecutar con: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS sice
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sice;

CREATE TABLE IF NOT EXISTS rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  estado TINYINT NOT NULL DEFAULT 1,
  id_rol_fk INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol_fk) REFERENCES rol(id_rol)
);

-- Roles usados por src/modules/users/users.routes.js (ROLE_IDS)
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
  (1, 'Administrador del sistema', 'Acceso total al sistema'),
  (2, 'Analista de Recursos Humanos', 'Gestion de procesos de contratacion'),
  (3, 'Aspirante', 'Usuario que aplica a convocatorias'),
  (4, 'Director de Recursos Humanos', 'Supervision de procesos de RRHH')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
