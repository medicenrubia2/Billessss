// lib/db.js (para MySQL en Hostinger)
import mysql from 'mysql2/promise'; // Importa el módulo mysql2/promise para usar async/await

let pool = null; // Usaremos un pool de conexiones para gestionar las conexiones de manera eficiente

async function getDb() {
  if (pool) {
    // Si el pool ya existe, retornamos una interfaz compatible con tu código de API
    return {
      get: async (sql, params) => {
        const [rows] = await pool.execute(sql, params);
        return rows[0] || null; // Para consultas que esperan un solo resultado
      },
      all: async (sql, params) => {
        const [rows] = await pool.execute(sql, params);
        return rows; // Para consultas que esperan múltiples resultados
      },
      run: async (sql, params) => {
        const [result] = await pool.execute(sql, params);
        // Para operaciones INSERT, UPDATE, DELETE, devuelve el ID insertado si aplica
        return { lastID: result.insertId }; 
      },
    };
  }

  // Si la variable de entorno DATABASE_URL no está configurada, lanzamos un error.
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: La variable de entorno DATABASE_URL no está configurada.');
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  // Crea un nuevo pool de conexiones MySQL usando la cadena de conexión de la variable de entorno
  pool = mysql.createPool(process.env.DATABASE_URL);

  // Opcional: Intenta crear la tabla 'appointments' si no existe.
  // Esto es útil para la primera vez que despliegas o cuando la DB está vacía.
  // En proyectos grandes, usarías herramientas de migración de esquema.
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,        -- ID único auto-incrementable
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        appointmentDate VARCHAR(10) NOT NULL,     -- Formato 'YYYY-MM-DD'
        appointmentTime VARCHAR(5) NOT NULL,      -- Formato 'HH:mm'
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',     -- Estado de la cita
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de creación
        UNIQUE(appointmentDate, appointmentTime)  -- Restricción para evitar duplicados en la misma franja
      );
    `);
    console.log("✅ Tabla 'appointments' verificada/creada en MySQL.");
  } catch (err) {
    console.error("❌ Error al verificar/crear la tabla en MySQL:", err);
    throw err; // Vuelve a lanzar el error para que sea capturado
  }

  // Retorna la interfaz de métodos compatibles con tu código de API
  return {
    get: async (sql, params) => {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },
    all: async (sql, params) => {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    run: async (sql, params) => {
      const [result] = await pool.execute(sql, params);
      return { lastID: result.insertId };
    },
  };
}

export { getDb };