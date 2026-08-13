# Instrucciones para trabajar en este proyecto

## Stack y configuración
- Usar Node.js con CommonJS.
- Usar Express como framework HTTP.
- Usar MySQL con mysql2/promise.
- Mantener un diseño por módulos para cada funcionalidad.
- Cada módulo debe separar Route, Validator, Controller, Service y Repository.
- No escribir credenciales reales ni secretos en el código. Usar variables de entorno y un archivo .env.local o .env con valores de ejemplo.

## Estructura recomendada
- src/app.js
- src/server.js
- src/config/*.js
- src/routes/*.js
- src/modules/<feature>/
  - <feature>.routes.js
  - <feature>.validator.js
  - <feature>.controller.js
  - <feature>.service.js
  - <feature>.repository.js

## Reglas de arquitectura
- El Controller solo recibe la petición, valida el contexto HTTP y devuelve la respuesta.
- El Service contiene la lógica de negocio.
- El Repository encapsula la comunicación con MySQL y ejecuta consultas SQL.
- No colocar reglas de negocio en el Controller.
- No colocar SQL en el Service.
- No almacenar contraseñas sin cifrar. Usar bcrypt o una librería equivalente antes de persistir.
- Mantener la lógica de acceso a datos fuera del Service y del Controller.

## Flujo de trabajo
- Modificar pocos archivos en cada etapa.
- Explicar cada cambio antes de hacerlo.
- No avanzar a la siguiente fase si la prueba actual no funciona.
- Escribir pruebas mínimas para validar cada cambio relevante.
- Reutilizar patrones consistentes en todos los módulos.

## Seguridad
- Nunca hardcodear credenciales en archivos fuente.
- Usar .env.example como base para variables de entorno.
- No exponer mensajes internos o stack traces en producción.
- Cifrar cualquier contraseña antes de guardarla en la base de datos.

## Validación antes de finalizar
- Ejecutar pruebas del módulo afectado antes de pasar a otra fase.
- Confirmar que el código sigue usando CommonJS y Express.
- Verificar que la capa de base de datos utiliza mysql2/promise.
