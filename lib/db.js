// lib/db.js
import mysql from 'mysql2/promise';

let pool = null;

async function getDb() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no configurada.');
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  if (!pool) {
    try {
      pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log('✅ Pool de conexión a MySQL creado.');

      // Verifica que la tabla exista (ejecuta solo una vez al iniciar en producción)
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          appointmentDate VARCHAR(10) NOT NULL,
          appointmentTime VARCHAR(5) NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(appointmentDate, appointmentTime)
        );
      `);

      console.log("✅ Tabla 'appointments' verificada/creada.");
    } catch (err) {
      console.error('❌ Error al inicializar conexión o crear tabla:', err);
      throw err;
    }
  }

  // Métodos para usar en tu API
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
