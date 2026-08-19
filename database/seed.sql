-- Seed del usuario administrador usado por la coleccion Postman
-- Ejecutar con: mysql -u root -p sice < database/seed.sql

USE sice;

INSERT INTO usuario (nombre, correo, contrasena, estado, id_rol_fk)
VALUES (
  'Carolina Forero',
  'carolina.administrador@sice.com',
  '$2b$10$JXjHxA.Ru2PXX7rt/HsYa.AMFjHvSXP1SAq7bT7BsljDWUQVD2UEG',
  1,
  1
)
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena);
