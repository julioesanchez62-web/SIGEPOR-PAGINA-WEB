-- Active: 1779669429676@@127.0.0.1@3306@sigepor
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: sigepor_database
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alimentacion`
--

DROP TABLE IF EXISTS `alimentacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alimentacion` (
  `id_alimento` int NOT NULL AUTO_INCREMENT,
  `tipo_alimento` varchar(50) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fecha_suministro` date NOT NULL,
  `id_proveedor` int DEFAULT NULL,
  `id_corral` int DEFAULT NULL,
  PRIMARY KEY (`id_alimento`),
  KEY `fk_alimentacion_proveedores` (`id_proveedor`),
  KEY `fk_alimentacion_corrales_idx` (`id_corral`),
  CONSTRAINT `fk_alimentacion_corrales` FOREIGN KEY (`id_corral`) REFERENCES `corrales` (`id_corral`),
  CONSTRAINT `fk_alimentacion_proveedores` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimentacion`
--

LOCK TABLES `alimentacion` WRITE;
/*!40000 ALTER TABLE `alimentacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `alimentacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cerdos`
--

DROP TABLE IF EXISTS `cerdos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cerdos` (
  `id_cerdo` int NOT NULL AUTO_INCREMENT,
  `raza` varchar(50) NOT NULL,
  `edad` varchar(100) NOT NULL,
  `peso` varchar(45) NOT NULL,
  `sexo` varchar(45) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `estado_salud` varchar(45) NOT NULL,
  `id_corral` int DEFAULT NULL,
  PRIMARY KEY (`id_cerdo`),
  KEY `fk_cerdos_corrales` (`id_corral`),
  CONSTRAINT `fk_cerdos_corrales` FOREIGN KEY (`id_corral`) REFERENCES `corrales` (`id_corral`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cerdos`
--

LOCK TABLES `cerdos` WRITE;
/*!40000 ALTER TABLE `cerdos` DISABLE KEYS */;
/*!40000 ALTER TABLE `cerdos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(45) NOT NULL,
  `correo` varchar(45) NOT NULL,
  `direccion` varchar(45) DEFAULT NULL,
  `telefono` varchar(45) NOT NULL,
  `tipo_cliente` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corrales`
--

DROP TABLE IF EXISTS `corrales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `corrales` (
  `id_corral` int NOT NULL AUTO_INCREMENT,
  `capacidad` int NOT NULL,
  `tipo_alimentacion` varchar(45) NOT NULL,
  `estado_limpieza` varchar(45) DEFAULT NULL,
  `ubicacion_granja` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_corral`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corrales`
--

LOCK TABLES `corrales` WRITE;
/*!40000 ALTER TABLE `corrales` DISABLE KEYS */;
/*!40000 ALTER TABLE `corrales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int NOT NULL AUTO_INCREMENT,
  `tipo_pago` varchar(45) NOT NULL,
  `tipo_venta` varchar(45) NOT NULL,
  `id_venta` int DEFAULT NULL,
  `id_cerdo` int DEFAULT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `fk_detalle_ventas` (`id_venta`),
  KEY `fk_detalle_cerdos` (`id_cerdo`),
  CONSTRAINT `fk_detalle_cerdos` FOREIGN KEY (`id_cerdo`) REFERENCES `cerdos` (`id_cerdo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_ventas` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enfermedades`
--

DROP TABLE IF EXISTS `enfermedades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enfermedades` (
  `id_enfermedad` int NOT NULL AUTO_INCREMENT,
  `tipo_enfermedad` varchar(45) NOT NULL,
  `fecha_diagnostico` date NOT NULL,
  `id_cerdo` int NOT NULL,
  `tratamiento` varchar(45) NOT NULL,
  PRIMARY KEY (`id_enfermedad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enfermedades`
--

LOCK TABLES `enfermedades` WRITE;
/*!40000 ALTER TABLE `enfermedades` DISABLE KEYS */;
/*!40000 ALTER TABLE `enfermedades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(100) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(2,'Empleado'),(3,'Veterinario'),(4,'Cliente');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `idRol` int DEFAULT '2',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES 
(2,'laura actualizado 2','laura@actualizado.com','laura.gomez@correo.com','123456',2,'2026-09-03 00:01:42',1),
(6,'Laura Perez','laura@correo.com','laura@correo.com','$2a$10$Juajsfl/ENX5xue5arDOOZYmiBPLnIwv...',2,'2026-09-03 00:20:11',1),
(7,'juan actualizado','juan@actualizado.com','luis.rod@correo.com','$2a$10$EQ7D1VYMNMy.wgVFZ.jcupeGWHydD...',2,'2026-09-03 00:21:30',1),
(8,'diego actualizado','rozo@ana.com','diego.m@correo.com','$2a$10$h30gDQ61LFz189HZc/sDfus7xLxSOSCI...',2,'2026-09-03 00:25:42',1),
(11,'julio seguridad','seguridad@gmail.com','seguridad@gmail.com','$2a$10$KIUPKrXzg69mpuQj9QKCeAFuOGPUk...',2,'2026-09-04 00:32:19',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacunacion`
--

DROP TABLE IF EXISTS `vacunacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacunacion` (
  `id_vacuna` int NOT NULL AUTO_INCREMENT,
  `tipo_vacuna` varchar(50) NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `id_cerdo` int DEFAULT NULL,
  `id_enfermedad` int DEFAULT NULL,
  PRIMARY KEY (`id_vacuna`),
  KEY `fk_vacunacion_cerdos` (`id_cerdo`),
  KEY `fk_vacunacion_enfermedades` (`id_enfermedad`),
  CONSTRAINT `fk_vacunacion_cerdos` FOREIGN KEY (`id_cerdo`) REFERENCES `cerdos` (`id_cerdo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vacunacion_enfermedades` FOREIGN KEY (`id_enfermedad`) REFERENCES `enfermedades` (`id_enfermedad`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacunacion`
--

LOCK TABLES `vacunacion` WRITE;
/*!40000 ALTER TABLE `vacunacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `vacunacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `veterinarios`
--

DROP TABLE IF EXISTS `veterinarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `veterinarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_registro` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `usuario_UNIQUE` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `veterinarios`
--

LOCK TABLES `veterinarios` WRITE;
/*!40000 ALTER TABLE `veterinarios` DISABLE KEYS */;
INSERT INTO `veterinarios` VALUES 
(1,'Dr. Carlos Veterinario','carlos.vet@sigepor.com','carlosvet','123456','2026-03-01',1),
(2,'Dra. María Gómez','maria.vet@sigepor.com','mariav','123456','2026-03-10',1),
(3,'Dr. Andrés López','andres.vet@sigepor.com','andresl','123456','2026-03-12',0);
/*!40000 ALTER TABLE `veterinarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `porcinos`
--

DROP TABLE IF EXISTS `porcinos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `porcinos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identificacion` varchar(50) NOT NULL,
  `raza` varchar(50) NOT NULL,
  `peso` decimal(10,2) NOT NULL,
  `estado_salud` varchar(50) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` varchar(20) NOT NULL,
  `veterinario_id` int DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_porcinos_veterinarios` (`veterinario_id`),
  CONSTRAINT `fk_porcinos_veterinarios` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `porcinos`
--

LOCK TABLES `porcinos` WRITE;
/*!40000 ALTER TABLE `porcinos` DISABLE KEYS */;
/*!40000 ALTER TABLE `porcinos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `feha_venta` date NOT NULL,
  `cantidad_cerdos` int NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `fk_ventas_cliente` (`id_cliente`),
  KEY `fk_vacunacion_usuarios` (`id_usuario`),
  CONSTRAINT `fk_vacunacion_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-30 23:13:21
