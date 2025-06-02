// lib/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function getDb() {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'sqlite-database.db');
  console.log(`Intentando conectar o crear DB en: ${dbPath}`); // Añadido para depuración

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log('¡Conexión a la base de datos establecida con éxito!'); // Añadido para depuración

    // Crea la tabla 'submissions' si no existe.
    // Esta tabla almacenará los datos de los formularios de contacto.
    await db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        submissionDate TEXT NOT NULL,
        submissionTime TEXT NOT NULL
      )
    `);
    console.log('Tabla "submissions" verificada/creada.'); // Añadido para depuración

    return db;
  } catch (error) {
    console.error('❌ Error al conectar o inicializar la base de datos:', error); // Mensaje de error más detallado
    db = null; // Asegurarse de que db es null si falla la conexión
    throw error; // Relanzar el error para que sea capturado por la API que llama a getDb
  }
}