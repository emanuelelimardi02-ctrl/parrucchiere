import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
const scryptAsync = promisify(scrypt);

function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL non configurata');
  return neon(process.env.DATABASE_URL);
}

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const derivedKey = await scryptAsync(password, salt, 64);
  const expectedKey = Buffer.from(hash, 'hex');
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}

async function ensureUsersTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  const adminHash = await hashPassword('admin');
  await sql`INSERT INTO admin_users (username, password_hash) VALUES ('admin', ${adminHash}) ON CONFLICT (username) DO NOTHING`;
}

export async function POST(request) {
  try {
    const { action, username, password } = await request.json();
    const normalizedUsername = username?.trim();

    if (!normalizedUsername || !password || normalizedUsername.length < 3 || normalizedUsername.length > 64 || password.length < 4) {
      return Response.json({ error: 'Inserisci un username valido e una password di almeno 4 caratteri.' }, { status: 400 });
    }

    const sql = getDatabase();
    await ensureUsersTable(sql);

    if (action === 'register') {
      const passwordHash = await hashPassword(password);
      try {
        await sql`INSERT INTO admin_users (username, password_hash) VALUES (${normalizedUsername}, ${passwordHash})`;
      } catch (error) {
        if (error.code === '23505') return Response.json({ error: 'Questo username è già registrato.' }, { status: 409 });
        throw error;
      }
      return Response.json({ username: normalizedUsername }, { status: 201 });
    }

    if (action === 'login') {
      const [user] = await sql`SELECT username, password_hash FROM admin_users WHERE username = ${normalizedUsername} LIMIT 1`;
      if (!user || !(await verifyPassword(password, user.password_hash))) {
        return Response.json({ error: 'Username o password non validi.' }, { status: 401 });
      }
      return Response.json({ username: user.username });
    }

    return Response.json({ error: 'Operazione non supportata.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/auth', error);
    return Response.json({ error: 'Impossibile completare l’operazione.' }, { status: 500 });
  }
}
