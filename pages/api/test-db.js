import { getDb } from '../../lib/db';

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const result = await db.all('SELECT NOW() AS now');
    res.status(200).json({ success: true, time: result[0].now });
  } catch (err) {
    console.error('❌ Error probando conexión:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
