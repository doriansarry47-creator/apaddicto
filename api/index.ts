import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from '../server/routes.js';
import '../server/migrate.js';
import { debugTablesRouter } from '../server/debugTables.js';
import { Pool } from 'pg';
import pgSession from 'connect-pg-simple';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Pour obtenir __dirname dans ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === INITIALISATION EXPRESS ===
const app = express();

// === CONFIG CORS ===
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: (origin, callback) => {
    if (isDevelopment) return callback(null, true);
    if (!origin) return callback(null, true);
    if (CORS_ORIGIN === '*') return callback(null, true);
    const allowedOrigins = CORS_ORIGIN.split(',');
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`❌ Origin not allowed by CORS: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

// === PARSING JSON ===
app.use(express.json());

// === SERVIR LES FICHIERS STATIQUES (pour Vercel, cela sera géré par le build client)
// const distPath = path.join(__dirname, '..', 'dist');
// app.use(express.static(distPath));

// === CONNEXION POSTGRES ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion à la base
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅ Base de données connectée:', res.rows[0].now);
  }
});

// === SESSION AVEC POSTGRES ===
const PgStore = pgSession(session);

app.use(session({
  store: new PgStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semaine
    httpOnly: true
  },
}));

// === ENDPOINTS DE BASE ===
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// === ROUTES DE L'APPLICATION ===
registerRoutes(app);
app.use('/api', debugTablesRouter);

// === ENDPOINT POUR LISTER LES TABLES ===
app.get('/api/tables', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === ENDPOINT POUR RENVOYER LE CONTENU DE TOUTES LES TABLES ===
app.get('/api/data', async (_req, res) => {
  try {
    const tables = [
      "beck_analyses",
      "craving_entries", 
      "exercise_sessions",
      "exercises",
      "psycho_education_content",
      "user_badges",
      "user_stats",
      "users"
    ];

    const data: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM ${table};`);
        data[table] = result.rows;
      } catch (tableErr: any) {
        console.warn(`⚠️ Table ${table} not found, skipping...`);
        data[table] = [];
      }
    }

    res.json(data);
  } catch (err: any) {
    console.error('❌ Erreur API /data:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Erreur serveur:', err.stack || err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Une erreur interne est survenue.' });
  } else {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// === FALLBACK POUR SPA (Single Page Application) ===
// Toutes les routes non-API doivent servir le fichier index.html pour React Router
// Cette partie ne doit pas être présente dans la fonction serverless de l'API
// app.get('*', (_req, res) => {
//   res.sendFile(path.join(distPath, 'index.html'));
// });

// === DEBUG ROUTES DISPONIBLES ===
// console.log("Routes disponibles :");
// app._router.stack.forEach((r: any) => {
//   if (r.route && r.route.path) {
//     console.log(r.route.path);
//   }
// });

// === LANCEMENT DU SERVEUR (non nécessaire pour Vercel serverless function) ===
// const port = process.env.PORT || 3000;
// app.listen(port, '0.0.0.0', () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });

// Export par défaut pour Vercel
// Vercel s'attend à une fonction handler pour les fonctions serverless
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}

