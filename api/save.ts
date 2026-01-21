import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, gameState } = req.body;

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database configuration error' });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Upsert
    await sql`
      INSERT INTO player_saves (user_id, save_data, updated_at)
      VALUES (${userId}, ${gameState}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET save_data = ${gameState}, updated_at = NOW();
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Save Error:', error);
    return res.status(500).json({ error: 'Save failed' });
  }
}