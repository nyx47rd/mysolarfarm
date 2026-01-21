import { neon } from '@neondatabase/serverless';

export default async function handler(request: Request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { action, username, password } = await request.json();

    if (!process.env.DATABASE_URL) throw new Error('DB URL missing');
    const sql = neon(process.env.DATABASE_URL);

    if (action === 'register') {
      // 1. Kullanıcıyı oluştur
      // Not: Gerçek projede şifreyi hash'lemek gerekir (bcrypt vb.). Burada basit tutuyoruz.
      const existingUser = await sql`SELECT id FROM users WHERE username = ${username}`;
      if (existingUser.length > 0) {
        return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 400 });
      }

      const user = await sql`
        INSERT INTO users (username, password)
        VALUES (${username}, ${password})
        RETURNING id, username
      `;

      // Yeni kullanıcı için boş save varmış gibi davranmayalım, null dönsün frontend handle etsin.
      return new Response(JSON.stringify({ user: user[0], saveData: null }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (action === 'login') {
      // 1. Kullanıcıyı bul
      const users = await sql`
        SELECT id, username FROM users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (users.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
      }

      const user = users[0];

      // 2. Varsa kayıtlı oyununu getir
      const saves = await sql`
        SELECT save_data FROM player_saves WHERE user_id = ${user.id}
      `;

      const saveData = saves.length > 0 ? saves[0].save_data : null;

      return new Response(JSON.stringify({ user, saveData }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

  } catch (error: any) {
    console.error('Auth Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}