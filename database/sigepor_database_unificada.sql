-- ========================================================
-- SIGEPOR - SCRIPT UNIFICADO PARA MYSQL WORKBENCH
-- Base de Datos: sigepor
-- Compatible con Backend Node.js y Frontend Web (HU-01 a HU-10)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `sigepor` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `sigepor`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Empleado'),
(3, 'Veterinario'),
(4, 'Cliente');

-- 2. Usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `usuario` VARCHAR(100) NOT NULL,
  `contraseña` VARCHAR(255) NOT NULL,
  `idRol` INT DEFAULT '2',
  `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `usuario_UNIQUE` (`usuario`),
  KEY `fk_usuarios_roles` (`idRol`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`idRol`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Veterinarios
DROP TABLE IF EXISTS `veterinarios`;
CREATE TABLE `veterinarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `usuario` VARCHAR(50) NOT NULL,
  `contraseña` VARCHAR(255) NOT NULL,
  `fecha_registro` DATE NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `usuario_UNIQUE` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Porcinos / Cerdos
DROP TABLE IF EXISTS `porcinos`;
CREATE TABLE `porcinos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `identificacion` VARCHAR(50) NOT NULL,
  `raza` VARCHAR(50) NOT NULL,
  `peso` DECIMAL(10,2) NOT NULL,
  `estado_salud` VARCHAR(50) NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  `genero` VARCHAR(20) NOT NULL,
  `veterinario_id` INT DEFAULT NULL,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_porcinos_veterinarios` (`veterinario_id`),
  CONSTRAINT `fk_porcinos_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Eventos Reproductivos
DROP TABLE IF EXISTS `eventos_reproductivos`;
CREATE TABLE `eventos_reproductivos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `porcino_id` INT NOT NULL,
  `tipo_evento` VARCHAR(50) NOT NULL,
  `fecha_evento` DATE NOT NULL,
  `fecha_probable_parto` DATE DEFAULT NULL,
  `lechones_nacidos` INT DEFAULT '0',
  `observaciones` TEXT,
  PRIMARY KEY (`id`),
  KEY `fk_eventos_porcinos` (`porcino_id`),
  CONSTRAINT `fk_eventos_porcinos` FOREIGN KEY (`porcino_id`) REFERENCES `porcinos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Vacunación
DROP TABLE IF EXISTS `vacunacion`;
CREATE TABLE `vacunacion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `porcino_id` INT NOT NULL,
  `nombre_vacuna` VARCHAR(100) NOT NULL,
  `fecha_aplicacion` DATE NOT NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'Aplicada',
  `dosis` DECIMAL(5,2) NOT NULL DEFAULT '2.00',
  `proxima_vacuna_dias` INT DEFAULT '14',
  `notas` TEXT,
  PRIMARY KEY (`id`),
  KEY `fk_vacunacion_porcinos` (`porcino_id`),
  CONSTRAINT `fk_vacunacion_porcinos` FOREIGN KEY (`porcino_id`) REFERENCES `porcinos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Enfermedades
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Alimentación
DROP TABLE IF EXISTS `alimentacion`;
CREATE TABLE `alimentacion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_alimento` VARCHAR(100) NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `fecha_suministro` DATE NOT NULL,
  `proveedor` VARCHAR(100) DEFAULT NULL,
  `corral` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Corrales
DROP TABLE IF EXISTS `corrales`;
CREATE TABLE `corrales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `capacidad` INT NOT NULL DEFAULT '10',
  `tipo_alimentacion` VARCHAR(50) NOT NULL,
  `estado_limpieza` VARCHAR(50) DEFAULT 'Limpio',
  `ubicacion` VARCHAR(100) DEFAULT 'Granja Principal',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Proveedores
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `direccion` VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Logs de Actividad
DROP TABLE IF EXISTS `logs_actividad`;
CREATE TABLE `logs_actividad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT DEFAULT NULL,
  `usuario_nombre` VARCHAR(100) DEFAULT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `detalles` TEXT,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
