// lib/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

async function getDb() {
  if (db) return db;

  const dbPath = path.join(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? 'prod.sqlite' : 'dev.sqlite'
  );

  console.log("📍 dbPath:", dbPath); // Deja esto temporalmente

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      appointmentDate TEXT NOT NULL,
      appointmentTime TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(appointmentDate, appointmentTime)
    );
  `);

  console.log("✅ Database initialized");
  return db;
}

export { getDb };
