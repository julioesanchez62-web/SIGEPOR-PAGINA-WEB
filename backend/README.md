# Backend SIGEPOR

## Conexión con MySQL desde Workbench

1. Abre MySQL Workbench.
2. Crea una conexión local con estos datos:
   - Host: 127.0.0.1
   - Port: 3306
   - User: root
   - Password: la que tengas configurada en Workbench
3. Crea la base de datos `sigepor`.
4. Ejecuta este SQL:

```sql
CREATE DATABASE IF NOT EXISTS sigepor;
USE sigepor;

CREATE TABLE IF NOT EXISTS veterinarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  usuario VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Ajusta el archivo `.env` con tus credenciales reales si es necesario.
