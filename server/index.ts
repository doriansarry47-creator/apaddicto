import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple'; // Import manquant
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';
import { registerGoogleAuthRoutes } from './google-auth.js';
import './migrate.js';
import { debugTablesRouter } from './debugTables.js';
import { Pool } from 'pg';

// Pour obtenir __dirname dans ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === INITIALISATION EXPRESS ===
const app = express();

// === CONFIGURATION DU PROXY POUR VERCEL ET SESSIONS SÉCURISÉES ===
app.set('trust proxy', 1);

// === CONFIG CORS (DOIT ÊTRE AVANT LA SESSION) ===
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true,
  exposedHeaders: ['set-cookie'],
}));

// === CONNEXION POSTGRES POUR SESSION ===
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialiser le store de session PostgreSQL
const PgSession = connectPgSimple(session);

// === SESSION ===
// Configuration adaptée pour fonctionner en sandbox et production
const isProduction = process.env.NODE_ENV === 'production';
const isSandbox = process.env.IS_SANDBOX === 'true' || !process.env.VERCEL;

app.use(session({
  store: new PgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid', // Nom explicite du cookie
  cookie: {
    // En sandbox, on utilise lax/false pour faciliter les tests
    // En production Vercel, on utilise none/true pour le cross-origin
    sameSite: (isProduction && !isSandbox) ? 'none' : 'lax',
    secure: (isProduction && !isSandbox),
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    httpOnly: true,
    path: '/',
  },
}));

// === PARSING JSON ===
app.use(express.json());

// === SERVIR LES FICHIERS STATIQUES ===
const distPath = path.join(__dirname, '..', 'dist');
console.log('📁 Serving static files from:', distPath);
app.use(express.static(distPath));

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
registerGoogleAuthRoutes(app);
app.use('/api', debugTablesRouter);

// === CONNEXION POSTGRES ===
// Le pool est déjà défini pour la session, réutiliser ou définir un nouveau si nécessaire
// Ici, nous allons le réutiliser pour les autres requêtes DB

// === ENDPOINT POUR LISTER LES TABLES ===
app.get('/api/tables', async (_req, res) => {
  try {
    const result = await pgPool.query(`
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
      const result = await pgPool.query(`SELECT * FROM ${table};`);
      data[table] = result.rows;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ message: 'Erreur interne' });
});

// === FALLBACK POUR SPA (Single Page Application) ===
// Toutes les routes non-API doivent servir le fichier index.html pour React Router
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// === DEBUG ROUTES DISPONIBLES ===
console.log("Routes disponibles :");
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

// === LANCEMENT DU SERVEUR ===
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

