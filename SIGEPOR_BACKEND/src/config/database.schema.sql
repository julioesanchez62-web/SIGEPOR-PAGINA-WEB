/**
 * SIGEPOR Backend - Schema de Base de Datos
 * 
 * Este archivo contiene todas las tablas y estructura base de la BD.
 * 
 * Instrucciones:
 * 1. Crea una BD en MySQL: CREATE DATABASE sigepor_db;
 * 2. Selecciona la BD: USE sigepor_db;
 * 3. Ejecuta este archivo: mysql -u usuario -p sigepor_db < database.schema.sql
 * 
 * O en MySQL Workbench:
 * 1. Abre una nueva conexión
 * 2. Pega todo el contenido de este archivo
 * 3. Ejecuta (Ctrl+Enter)
 */

-- ============================================================================
-- TABLA: ROLES
-- ============================================================================
-- Descripción: Define los roles del sistema (Administrador, Usuario, etc.)
-- 
-- Campos:
-- - id: Identificador único (auto-incrementado)
-- - nombre: Nombre del rol (ADMIN, USER, MODERATOR, etc.)
-- - descripcion: Breve descripción del rol
-- - creado_en: Timestamp de creación (auto-asignado)

CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: USERS (Usuarios)
-- ============================================================================
-- Descripción: Almacena información de los usuarios del sistema
-- 
-- Campos:
-- - id: Identificador único (auto-incrementado)
-- - nombre: Nombre completo del usuario
-- - correo: Email único del usuario
-- - contraseña_hash: Contraseña cifrada con bcryptjs (NUNCA en texto plano)
-- - id_rol: Referencia al rol (FK a tabla roles)
-- - activo: Flag para soft-delete (0=inactivo, 1=activo)
-- - creado_en: Timestamp de creación
-- - actualizado_en: Timestamp de última actualización
-- 
-- Índices:
-- - UNIQUE en correo (no pueden haber dos usuarios con el mismo email)
-- - INDEX en id_rol (para búsquedas rápidas por rol)

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  contraseña_hash VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  activo TINYINT DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key: Un usuario debe tener un rol válido
  CONSTRAINT fk_users_rol FOREIGN KEY (id_rol) REFERENCES roles(id),
  
  -- Índices para búsquedas rápidas
  INDEX idx_users_correo (correo),
  INDEX idx_users_id_rol (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS INICIALES: Roles por defecto
-- ============================================================================
-- 
-- Los roles se insertan automáticamente al crear la BD.
-- Puedes modificar estos valores según tu negocio.
-- 
-- Roles sugeridos:
-- 1 = ADMINISTRADOR (acceso total)
-- 2 = USUARIO (acceso limitado)
-- 3 = MODERADOR (acceso intermedio)

INSERT IGNORE INTO roles (id, nombre, descripcion) VALUES
(1, 'ADMIN', 'Administrador del sistema con acceso total'),
(2, 'USER', 'Usuario estándar con acceso limitado'),
(3, 'MODERATOR', 'Moderador con acceso intermedio');

-- ============================================================================
-- NOTAS DE SEGURIDAD
-- ============================================================================
-- 
-- ✅ NUNCA almacenar contraseñas en texto plano (usar bcryptjs)
-- ✅ Usar placeholders (?) en queries (evita SQL injection)
-- ✅ Validar datos en el backend (no confiar en cliente)
-- ✅ UNIQUE en correo (evita duplicados)
-- ✅ Foreign Key id_rol (mantiene integridad referencial)
-- ✅ Índices en campos de búsqueda (optimiza queries)
-- ✅ utf8mb4 + unicode_ci (soporta caracteres especiales)
-- ✅ creado_en y actualizado_en (auditoría)
-- ✅ activo (soft-delete: permite marcar como inactivo sin eliminar)
