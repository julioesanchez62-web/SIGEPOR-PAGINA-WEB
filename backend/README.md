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

## Configuración del `.env`

Puedes crear el archivo `.env` en cualquiera de estas rutas:

- `/home/runner/work/SIGEPOR-PAGINA-WEB/SIGEPOR-PAGINA-WEB/.env`
- `/home/runner/work/SIGEPOR-PAGINA-WEB/SIGEPOR-PAGINA-WEB/backend/.env`

Variables necesarias:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_real
DB_NAME=sigepor
JWT_SECRET=una_clave_segura
```

## Error típico en Postman y cómo resolverlo

Si en Postman aparece un error de conexión a base de datos, revisa la consola del backend.

Ejemplo de error:

- `No se pudo conectar a MySQL (ECONNREFUSED): connect ECONNREFUSED 127.0.0.1:3306`

Significa que la API no puede abrir conexión con MySQL en host/puerto configurados.

### Paso a paso para futuras ocasiones

1. Verifica que MySQL esté iniciado.
2. Verifica host, puerto, usuario, contraseña y base de datos en `.env`.
3. Inicia backend con `npm start`.
4. Confirma en consola que no salga error de conexión.
5. Prueba en Postman:
   - `GET http://localhost:3001/` (debe responder API activa)
   - `POST http://localhost:3001/api/auth/login`
6. Si falla, revisa el código de error:
   - `ECONNREFUSED`: MySQL apagado o puerto incorrecto.
   - `ER_ACCESS_DENIED_ERROR`: usuario o contraseña incorrectos.
   - `ER_BAD_DB_ERROR`: base de datos no existe.
