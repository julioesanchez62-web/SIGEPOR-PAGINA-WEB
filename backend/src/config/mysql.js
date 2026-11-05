/**
 * Configuración de MySQL con Pool de Conexiones
 * SIGEPOR
 */

const mysql = require('mysql2/promise');
const { db } = require('./env');

const pool = mysql.createPool({
  host: db.host,
  port: parseInt(db.port, 10) || 3306,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

/**
 * Asegurar que una columna exista en una tabla (Auto-Migración)
 */
async function ensureColumn(table, column, typeDef) {
  try {
    const [cols] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `, [db.database, table, column]);

    if (!cols || cols.length === 0) {
      console.log(`🔧 Migrando esquema: añadiendo columna '${column}' a la tabla '${table}'...`);
      await pool.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${typeDef}`);
    }
  } catch (err) {
    console.warn(`⚠️ Aviso al migrar columna ${column} en ${table}:`, err.message);
  }
}

/**
 * Renombrar columna si el nombre antiguo existe (Normalización automática)
 */
async function renameColumnIfOldExists(table, oldCol, newCol, typeDef) {
  try {
    const [cols] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `, [db.database, table, oldCol]);

    if (cols && cols.length > 0) {
      console.log(`🔧 Normalizando esquema: renombrando '${oldCol}' a '${newCol}' en '${table}'...`);
      await pool.execute(`ALTER TABLE \`${table}\` CHANGE \`${oldCol}\` \`${newCol}\` ${typeDef}`);
    }
  } catch (err) {
    console.warn(`⚠️ Aviso al renombrar columna ${oldCol} en ${table}:`, err.message);
  }
}

/**
 * Conectar y validar MySQL (Fail Fast con Migración Automática de Esquema)
 */
async function connectMySQL() {
  try {
    const [rows] = await pool.execute('SELECT 1 AS ok');

    if (!rows || rows.length === 0 || rows[0].ok !== 1) {
      throw new Error('MySQL health check failed');
    }

    console.log('✓ MySQL connected successfully');

    // 1. Roles
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id_rol INT NOT NULL AUTO_INCREMENT,
        nombre_rol VARCHAR(100) NOT NULL,
        PRIMARY KEY (id_rol)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Usuarios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        usuario VARCHAR(100) NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        idRol INT DEFAULT '2',
        fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        activo TINYINT(1) NOT NULL DEFAULT '1',
        PRIMARY KEY (id_usuario),
        UNIQUE KEY email_UNIQUE (email),
        UNIQUE KEY usuario_UNIQUE (usuario)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Veterinarios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS veterinarios (
        id_veterinario INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        usuario VARCHAR(50) NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        fecha_registro DATE NOT NULL,
        activo TINYINT(1) NOT NULL DEFAULT '1',
        PRIMARY KEY (id_veterinario),
        UNIQUE KEY email_UNIQUE (email),
        UNIQUE KEY usuario_UNIQUE (usuario)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Porcinos
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS porcinos (
        id_porcino INT NOT NULL AUTO_INCREMENT,
        identificacion VARCHAR(50) NOT NULL,
        raza VARCHAR(50) NOT NULL,
        peso DECIMAL(10,2) NOT NULL,
        estado_salud VARCHAR(50) NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        genero VARCHAR(20) NOT NULL,
        veterinario_id INT DEFAULT NULL,
        fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_porcino)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Eventos Reproductivos
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS eventos_reproductivos (
        id INT NOT NULL AUTO_INCREMENT,
        porcino_id INT NOT NULL,
        tipo_evento VARCHAR(50) NOT NULL,
        fecha_evento DATE NOT NULL,
        fecha_probable_parto DATE DEFAULT NULL,
        lechones_nacidos INT DEFAULT '0',
        observaciones TEXT,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Vacunacion
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS vacunacion (
        id INT NOT NULL AUTO_INCREMENT,
        porcino_id INT NOT NULL,
        nombre_vacuna VARCHAR(100) NOT NULL,
        fecha_aplicacion DATE NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Aplicada',
        dosis DECIMAL(5,2) NOT NULL DEFAULT '2.00',
        proxima_vacuna_dias INT DEFAULT '14',
        notas TEXT,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Enfermedades
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS enfermedades (
        id INT NOT NULL AUTO_INCREMENT,
        porcino_id INT NOT NULL,
        tipo_enfermedad VARCHAR(100) NOT NULL,
        fecha_diagnostico DATE NOT NULL,
        tratamiento TEXT NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'En Tratamiento',
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Alimentacion
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS alimentacion (
        id INT NOT NULL AUTO_INCREMENT,
        tipo_alimento VARCHAR(100) NOT NULL,
        cantidad DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        fecha_suministro DATE NOT NULL,
        proveedor VARCHAR(100) DEFAULT NULL,
        corral VARCHAR(50) DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Corrales
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS corrales (
        id_corral INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(50) NOT NULL,
        capacidad INT NOT NULL DEFAULT '10',
        tipo_alimentacion VARCHAR(50) NOT NULL,
        estado_limpieza VARCHAR(50) DEFAULT 'Limpio',
        ubicacion VARCHAR(100) DEFAULT 'Granja Principal',
        PRIMARY KEY (id_corral)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Proveedores
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id INT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(50) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        direccion VARCHAR(150) DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Logs
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS logs_actividad (
        id INT NOT NULL AUTO_INCREMENT,
        usuario_id INT DEFAULT NULL,
        usuario_nombre VARCHAR(100) DEFAULT NULL,
        accion VARCHAR(100) NOT NULL,
        detalles TEXT,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 12. AUTO-MIGRACIÓN DE NORMALIZACIÓN: Renombrar 'id' a 'id_*' si aún tiene el formato previo
    await renameColumnIfOldExists('usuarios', 'id', 'id_usuario', 'INT AUTO_INCREMENT');
    await renameColumnIfOldExists('corrales', 'id', 'id_corral', 'INT AUTO_INCREMENT');
    await renameColumnIfOldExists('porcinos', 'id', 'id_porcino', 'INT AUTO_INCREMENT');
    await renameColumnIfOldExists('veterinarios', 'id', 'id_veterinario', 'INT AUTO_INCREMENT');

    // 13. AUTO-MIGRACIÓN DE CLAVES FORÁNEAS Y CAMPOS REQUERIDOS
    await ensureColumn('veterinarios', 'id_usuario', 'INT NULL');
    await ensureColumn('porcinos', 'id_corral', 'INT NULL');
    await ensureColumn('alimentacion', 'id_porcino', 'INT NULL');
    await ensureColumn('alimentacion', 'id_usuario', 'INT NULL');
    await ensureColumn('vacunacion', 'id_veterinario', 'INT NULL');
    await ensureColumn('logs_actividad', 'id_usuario', 'INT NULL');

    await ensureColumn('vacunacion', 'porcino_id', 'INT NULL DEFAULT 1');
    await ensureColumn('vacunacion', 'nombre_vacuna', "VARCHAR(100) NOT NULL DEFAULT 'Vacuna General'");
    await ensureColumn('vacunacion', 'estado', "VARCHAR(50) NOT NULL DEFAULT 'Aplicada'");
    await ensureColumn('vacunacion', 'dosis', "DECIMAL(5,2) NOT NULL DEFAULT '2.00'");
    await ensureColumn('vacunacion', 'proxima_vacuna_dias', "INT DEFAULT '14'");
    await ensureColumn('vacunacion', 'notas', 'TEXT NULL');

    await ensureColumn('enfermedades', 'porcino_id', 'INT NULL DEFAULT 1');
    await ensureColumn('enfermedades', 'estado', "VARCHAR(50) NOT NULL DEFAULT 'En Tratamiento'");

    await ensureColumn('alimentacion', 'proveedor', 'VARCHAR(100) NULL');
    await ensureColumn('alimentacion', 'corral', 'VARCHAR(50) NULL');

    await ensureColumn('corrales', 'nombre', "VARCHAR(50) NOT NULL DEFAULT 'Corral Principal'");
    await ensureColumn('corrales', 'ubicacion', "VARCHAR(100) NULL DEFAULT 'Granja Principal'");

    await ensureColumn('proveedores', 'nombre', "VARCHAR(100) NOT NULL DEFAULT 'Proveedor General'");
    await ensureColumn('proveedores', 'email', 'VARCHAR(100) NULL');

    await ensureColumn('porcinos', 'identificacion', "VARCHAR(50) NOT NULL DEFAULT 'P-001'");
    await ensureColumn('porcinos', 'genero', "VARCHAR(20) NOT NULL DEFAULT 'Hembra'");

    await ensureColumn('usuarios', 'telefono', 'VARCHAR(50) NULL');
    await ensureColumn('logs_actividad', 'veterinario_id', 'INT NULL DEFAULT 1');
    await ensureColumn('logs_actividad', 'accion', "VARCHAR(255) NOT NULL DEFAULT 'Acción General'");
    await ensureColumn('logs_actividad', 'descripcion', 'TEXT NULL');
    await ensureColumn('logs_actividad', 'fecha_hora', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

    console.log('✓ Auto-migración y normalización en MySQL completadas exitosamente.');
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  connectMySQL
};
