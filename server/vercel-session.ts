// server/vercel-session.ts - Session middleware compatible avec Vercel utilisant PostgreSQL pour la persistance
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';

const { Pool } = pg;
const PgSession = connectPgSimple(session);

// Configuration du pool PostgreSQL pour les sessions
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuration session adaptée pour Vercel (serverless) avec persistance DB
export const vercelSessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'Apaddicto2024SecretKey',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    httpOnly: true, // Protection XSS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site pour Vercel
    path: '/',
  }
});

export default vercelSessionMiddleware;
