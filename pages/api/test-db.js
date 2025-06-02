// pages/api/test-db.js
import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const db = await getDb();
    // En SQLite, no hay NOW(), usamos CURRENT_TIMESTAMP
    const result = await db.all('SELECT CURRENT_TIMESTAMP AS now');
    res.status(200).json({ success: true, time: result[0].now, database: 'SQLite' });
  } catch (err) {
    console.error('❌ Error probando conexión SQLite:', err);
    res.status(500).json({ success: false, error: err.message, database: 'SQLite' });
  }
}