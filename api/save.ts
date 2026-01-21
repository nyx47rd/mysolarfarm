import { neon } from '@neondatabase/serverless';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { userId, gameState } = await request.json();

    if (!process.env.DATABASE_URL) {
      throw new Error('Database connection string missing');
    }

    const sql = neon(process.env.DATABASE_URL);

    // Upsert: Varsa güncelle, yoksa yeni oluştur
    await sql`
      INSERT INTO player_saves (user_id, save_data, updated_at)
      VALUES (${userId}, ${gameState}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET save_data = ${gameState}, updated_at = NOW();
    `;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Save Error:', error);
    return new Response(JSON.stringify({ error: 'Save failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}