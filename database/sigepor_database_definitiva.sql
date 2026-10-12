-- ========================================================
-- SIGEPOR - SCRIPT DE BASE DE DATOS DEFINITIVA Y UNIFICADA
-- Compatible con Backend Node.js / Express y Frontend React
-- Motor: MySQL 8.0+ / MariaDB 10.4+
-- Base de Datos: sigepor
-- ========================================================

CREATE DATABASE IF NOT EXISTS `sigepor` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sigepor`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Tabla: roles
-- --------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uk_nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Empleado'),
(3, 'Veterinario'),
(4, 'Cliente');

-- --------------------------------------------------------
-- 2. Tabla: usuarios
-- --------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `usuario` VARCHAR(100) NOT NULL,
  `contraseña` VARCHAR(255) NOT NULL,
  `idRol` INT DEFAULT 2,
  `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  UNIQUE KEY `uk_usuarios_usuario` (`usuario`),
  KEY `fk_usuarios_roles` (`idRol`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`idRol`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios iniciales con contraseñas encriptadas con Bcrypt (Salt 10)
-- admin123, vet123, empleado123, cliente123
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `usuario`, `contraseña`, `idRol`, `fecha_registro`, `activo`) VALUES
(1, 'Administrador Principal', 'admin@sigepor.com', 'admin', '$2a$10$VfO8qri6CKCbwszTGYd8.ewEp4DZUOV9DSsMKLjNwf14ty9IT3lmK', 1, NOW(), 1),
(2, 'Carlos Mendoza', 'vet@sigepor.com', 'cmendoza', '$2a$10$UGZ4rGTYxV9FG3GDTPf76ez/IYpHZl/dC5ZbcGNfH8QpSB89G0xXS', 3, NOW(), 1),
(3, 'Operario Juan Pérez', 'operario@sigepor.com', 'jperez', '$2a$10$1YJEauqshonpMs/gCkk3E.jJCj0ONWla5Oz9/dXLJxDLui6165jxS', 2, NOW(), 1),
(4, 'Cliente Porcícola', 'cliente@sigepor.com', 'cliente', '$2a$10$cU80gPB0nR3wIEACs1uvyOoVQTFPwuxdCI9aYaDL63BPXd15kSWKu', 4, NOW(), 1);

-- --------------------------------------------------------
-- 3. Tabla: veterinarios
-- --------------------------------------------------------
DROP TABLE IF EXISTS `veterinarios`;
CREATE TABLE `veterinarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `usuario` VARCHAR(50) NOT NULL,
  `contraseña` VARCHAR(255) NOT NULL,
  `fecha_registro` DATE NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_veterinarios_email` (`email`),
  UNIQUE KEY `uk_veterinarios_usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `veterinarios` (`id`, `nombre`, `email`, `usuario`, `contraseña`, `fecha_registro`, `activo`) VALUES
(1, 'Dr. Carlos Mendoza', 'vet@sigepor.com', 'cmendoza', '$2a$10$UGZ4rGTYxV9FG3GDTPf76ez/IYpHZl/dC5ZbcGNfH8QpSB89G0xXS', CURDATE(), 1);

-- --------------------------------------------------------
-- 4. Tabla: porcinos
-- --------------------------------------------------------
DROP TABLE IF EXISTS `porcinos`;
CREATE TABLE `porcinos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `identificacion` VARCHAR(50) NOT NULL,
  `raza` VARCHAR(50) NOT NULL,
  `peso` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `estado_salud` VARCHAR(50) NOT NULL DEFAULT 'Saludable',
  `fecha_nacimiento` DATE NOT NULL,
  `genero` VARCHAR(20) NOT NULL DEFAULT 'Macho',
  `veterinario_id` INT DEFAULT NULL,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_porcinos_identificacion` (`identificacion`),
  KEY `fk_porcinos_veterinarios` (`veterinario_id`),
  CONSTRAINT `fk_porcinos_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `porcinos` (`id`, `identificacion`, `raza`, `peso`, `estado_salud`, `fecha_nacimiento`, `genero`, `veterinario_id`, `fecha_registro`) VALUES
(1, 'POR-1001', 'Landrace', 85.50, 'Saludable', '2025-08-10', 'Macho', 1, NOW()),
(2, 'POR-1002', 'Yorkshire', 92.00, 'Saludable', '2025-07-15', 'Hembra', 1, NOW()),
(3, 'POR-1003', 'Duroc', 78.20, 'En Tratamiento', '2025-09-01', 'Macho', 1, NOW());

-- --------------------------------------------------------
-- 5. Tabla: eventos_reproductivos
-- --------------------------------------------------------
DROP TABLE IF EXISTS `eventos_reproductivos`;
CREATE TABLE `eventos_reproductivos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `porcino_id` INT NOT NULL,
  `tipo_evento` VARCHAR(50) NOT NULL,
  `fecha_evento` DATE NOT NULL,
  `fecha_probable_parto` DATE DEFAULT NULL,
  `lechones_nacidos` INT DEFAULT 0,
  `observaciones` TEXT,
  PRIMARY KEY (`id`),
  KEY `fk_eventos_porcinos` (`porcino_id`),
  CONSTRAINT `fk_eventos_porcinos` FOREIGN KEY (`porcino_id`) REFERENCES `porcinos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `eventos_reproductivos` (`id`, `porcino_id`, `tipo_evento`, `fecha_evento`, `fecha_probable_parto`, `lechones_nacidos`, `observaciones`) VALUES
(1, 2, 'Inseminación Artificial', '2026-01-10', '2026-05-04', 0, 'Inseminación con semen Duroc de alto rendimiento.');

-- --------------------------------------------------------
-- 6. Tabla: vacunacion
-- --------------------------------------------------------
DROP TABLE IF EXISTS `vacunacion`;
CREATE TABLE `vacunacion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `porcino_id` INT NOT NULL,
  `nombre_vacuna` VARCHAR(100) NOT NULL,
  `fecha_aplicacion` DATE NOT NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'Aplicada',
  `dosis` DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  `proxima_vacuna_dias` INT DEFAULT 14,
  `notas` TEXT,
  PRIMARY KEY (`id`),
  KEY `fk_vacunacion_porcinos` (`porcino_id`),
  CONSTRAINT `fk_vacunacion_porcinos` FOREIGN KEY (`porcino_id`) REFERENCES `porcinos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `vacunacion` (`id`, `porcino_id`, `nombre_vacuna`, `fecha_aplicacion`, `estado`, `dosis`, `proxima_vacuna_dias`, `notas`) VALUES
(1, 1, 'Peste Porcina Clásica (PPC)', '2026-02-15', 'Aplicada', 2.00, 21, 'Lote VAC-992. Sin efectos adversos.');

-- --------------------------------------------------------
-- 7. Tabla: enfermedades
-- --------------------------------------------------------
DROP TABLE IF EXISTS `enfermedades`;
CREATE TABLE `enfermedades` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `porcino_id` INT NOT NULL,
  `tipo_enfermedad` VARCHAR(100) NOT NULL,
  `fecha_diagnostico` DATE NOT NULL,
  `tratamiento` TEXT NOT NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'En Tratamiento',
  PRIMARY KEY (`id`),
  KEY `fk_enfermedades_porcinos` (`porcino_id`),
  CONSTRAINT `fk_enfermedades_porcinos` FOREIGN KEY (`porcino_id`) REFERENCES `porcinos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `enfermedades` (`id`, `porcino_id`, `tipo_enfermedad`, `fecha_diagnostico`, `tratamiento`, `estado`) VALUES
(1, 3, 'Neumonía Enzoótica', '2026-02-20', 'Tilosina 10mg/kg intramuscular por 5 días.', 'En Tratamiento');

-- --------------------------------------------------------
-- 8. Tabla: alimentacion
-- --------------------------------------------------------
DROP TABLE IF EXISTS `alimentacion`;
CREATE TABLE `alimentacion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_alimento` VARCHAR(100) NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `fecha_suministro` DATE NOT NULL,
  `proveedor` VARCHAR(100) DEFAULT NULL,
  `corral` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `alimentacion` (`id`, `tipo_alimento`, `cantidad`, `fecha_suministro`, `proveedor`, `corral`) VALUES
(1, 'Concentrado Crecimiento', 250.00, '2026-02-28', 'Agroinsumos del Llano', 'Corral 1'),
(2, 'Concentrado Gestación', 180.00, '2026-03-01', 'Nutripig Colombia', 'Corral 2');

-- --------------------------------------------------------
-- 9. Tabla: corrales
-- --------------------------------------------------------
DROP TABLE IF EXISTS `corrales`;
CREATE TABLE `corrales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `capacidad` INT NOT NULL DEFAULT 10,
  `tipo_alimentacion` VARCHAR(50) NOT NULL,
  `estado_limpieza` VARCHAR(50) DEFAULT 'Limpio',
  `ubicacion` VARCHAR(100) DEFAULT 'Granja Principal',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_corrales_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `corrales` (`id`, `nombre`, `capacidad`, `tipo_alimentacion`, `estado_limpieza`, `ubicacion`) VALUES
(1, 'Corral 1 - Crecimiento', 15, 'Concentrado Crecimiento', 'Limpio', 'Nave A'),
(2, 'Corral 2 - Maternidad', 8, 'Concentrado Lactancia', 'Limpio', 'Nave B');

-- --------------------------------------------------------
-- 10. Tabla: proveedores
-- --------------------------------------------------------
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `direccion` VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_proveedores_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `proveedores` (`id`, `nombre`, `telefono`, `email`, `direccion`) VALUES
(1, 'Agroinsumos del Llano', '3104567890', 'ventas@agroinsumos.com', 'Km 5 Vía Principal'),
(2, 'Nutripig Colombia', '3201234567', 'contacto@nutripig.com', 'Zona Industrial Manzana 4');

-- --------------------------------------------------------
-- 11. Tabla: logs_actividad
-- --------------------------------------------------------
DROP TABLE IF EXISTS `logs_actividad`;
CREATE TABLE `logs_actividad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `veterinario_id` INT DEFAULT NULL,
  `accion` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `fecha_hora` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_logs_veterinarios` (`veterinario_id`),
  CONSTRAINT `fk_logs_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `logs_actividad` (`id`, `veterinario_id`, `accion`, `descripcion`, `fecha_hora`) VALUES
(1, 1, 'Registro Sanitario', 'Aplicación de vacuna PPC y chequeo general del lote 1', NOW()),
(2, 1, 'Diagnóstico Clínico', 'Diagnóstico de neumonía en porcino POR-1003 e inicio de tratamiento', NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- FIN DEL SCRIPT DEFINITIVO SIGEPOR
-- ========================================================
