import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS Headers (opsiyonel ama iyi pratik)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel req.body'yi otomatik parse eder
    const { action, username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL missing");
      return res.status(500).json({ error: 'Database configuration error' });
    }

    const sql = neon(process.env.DATABASE_URL);

    if (action === 'register') {
      // 1. Kullanıcı adı kontrolü
      const existingUser = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // 2. Kayıt
      const user = await sql`
        INSERT INTO users (username, password)
        VALUES (${username}, ${password})
        RETURNING id, username
      `;

      return res.status(200).json({ user: user[0], saveData: null });

    } else if (action === 'login') {
      // 1. Giriş Kontrolü
      const users = await sql`
        SELECT id, username FROM users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = users[0];

      // 2. Save Verisini Çek
      const saves = await sql`
        SELECT save_data FROM player_saves WHERE user_id = ${user.id}
      `;

      const saveData = saves.length > 0 ? saves[0].save_data : null;

      return res.status(200).json({ user, saveData });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error: any) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}