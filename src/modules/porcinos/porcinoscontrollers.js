// Importamos el pool de conexiones que tienes en tu config
const { pool } = require('../../config/mysql'); 
// Asegúrate de que ya tienes importado el pool al inicio: const { pool } = require('../../config/mysql');

const obtenerVeterinarios = async (req, res) => {
  try {
    // Consultamos el id y el nombre completo de la tabla veterinarios (o usuarios, según tu base de datos)
    // Nota: Ajusta los nombres de las columnas 'id' y 'nombre' según tu tabla real
    const querySQL = 'SELECT id, nombre FROM veterinarios ORDER BY nombre ASC';
    const [results] = await pool.execute(querySQL);

    

    return res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('❌ Error en obtenerVeterinarios:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener la lista de veterinarios.' 
    });
  }
};

// Recuerda exportarla al final del archivo junto a registrarPorcino:
module.exports = {
  registrarPorcino,
  obtenerVeterinarios
};

// const registrarPorcino = async (req, res) => {  // Esta línea duplicada se puede eliminar

const registrarPorcino = async (req, res) => {
  try {
    const { veterinario_id, identificacion, raza, peso, estado_salud, fecha_nacimiento, genero } = req.body;

    // 1. Validación de campos obligatorios (Fail Fast)
    if (!veterinario_id || !identificacion || !raza || !peso || !estado_salud || !fecha_nacimiento || !genero) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Todos los campos son requeridos para el registro.' 
      });
    }

    // 2. Generar la fecha de registro actual en formato MySQL (YYYY-MM-DD HH:MM:SS)
    const fecha_registro = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 3. Definir la consulta utilizando placeholders (?) para prevenir Inyección SQL
    const sql = `INSERT INTO porcinos 
      (veterinario_id, identificacion, raza, peso, estado_salud, fecha_nacimiento, genero, fecha_registro) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const valores = [veterinario_id, identificacion, raza, peso, estado_salud, fecha_nacimiento, genero, fecha_registro];

    // 4. Ejecutar la consulta de manera asíncrona usando el Pool
    const [resultado] = await pool.execute(sql, valores);

    // 5. Responder con éxito incluyendo el ID generado
    return res.status(201).json({
      status: 'success',
      message: 'Porcino registrado exitosamente.',
      data: { id: resultado.insertId }
    });

  } catch (error) {
    console.error('❌ Error en registrarPorcino:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error interno en el servidor al procesar el registro.' 
    });
  }
};

// Ya exportamos registrarPorcino y obtenerVeterinarios al inicio, así que podemos eliminar esta segunda exportación
