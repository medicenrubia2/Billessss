// lib/db.js (o .ts)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

async function getDb() {
  if (db) return db;

  // Ruta a tu archivo de base de datos SQLite
  // Usa `process.cwd()` para asegurar la ruta correcta en producción.
  const dbPath = process.env.NODE_ENV === 'production'
    ? process.cwd() + '/prod.sqlite' // En producción, es buena idea tener un nombre específico
    : process.cwd() + '/dev.sqlite'; // En desarrollo

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Crea la tabla de citas si no existe
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      appointmentDate TEXT NOT NULL,
      appointmentTime TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(appointmentDate, appointmentTime) -- Asegura que no haya dos citas en la misma franja
    );
  `);

  console.log("Database initialized and table checked/created.");
  return db;
}

export { getDb };