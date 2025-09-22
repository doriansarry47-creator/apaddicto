// Configuration et validation des variables d'environnement
console.log('🔍 Checking environment variables...');
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  // En développement, ne pas quitter le processus
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required');
  }
}
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ SESSION_SECRET not set, using fallback');
}
console.log('✅ Environment variables validated');

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { Pool } from 'pg';

// Imports conditionnels pour éviter les erreurs Vercel
let registerRoutes, debugTablesRouter;
try {
  const routesModule = await import('../server/routes.js');
  registerRoutes = routesModule.registerRoutes;
} catch (e) {
  console.warn('Could not load routes, using fallback');
  registerRoutes = (app) => {
    app.get('/api/fallback', (req, res) => res.json({ message: 'Routes not available' }));
  };
}

try {
  const debugModule = await import('../server/debugTables.js');
  debugTablesRouter = debugModule.debugTablesRouter;
} catch (e) {
  console.warn('Could not load debug tables');
}

try {
  await import('../server/migrate.js');
} catch (e) {
  console.warn('Could not run migrations:', e.message);
}

// === INITIALISATION EXPRESS ===
const app = express();

// === CONFIG CORS AMÉLIO ===
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser toutes les origines en développement 
    if (isDevelopment) {
      console.log('🔓 Development mode: allowing all origins');
      return callback(null, true);
    }
    
    // Autoriser les requêtes sans origine (applications mobiles, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Autoriser toutes les origines si CORS_ORIGIN est '*'
    if (CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    
    // Vérifier les origines autorisées
    const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`❌ Origin not allowed by CORS: ${origin}`);
    const error = new Error(`Origin ${origin} not allowed by CORS policy`);
    callback(error, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Accept'],
  optionsSuccessStatus: 200
}));

// === PARSING JSON ===
app.use(express.json());

// === CONFIGURATION SESSION AMÉLIORÉE ===
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-development',
  resave: false,
  saveUninitialized: false,
  name: 'apaddicto-session',
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semaine
    httpOnly: true
  },
};

// Ajout du store PostgreSQL si disponible
if (process.env.DATABASE_URL) {
  try {
    const pgSession = await import('connect-pg-simple');
    const PgStore = pgSession.default(session);
    sessionConfig.store = new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true
    });
    console.log('✅ PostgreSQL session store configured');
  } catch (e) {
    console.warn('⚠️ Could not configure PostgreSQL session store, using memory store');
  }
}

app.use(session(sessionConfig));

// === ENDPOINTS DE BASE ===
app.get('/', (_req, res) => {
  res.send('API Apaddicto est en ligne !');
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// === ROUTES DE L'APPLICATION ===
if (registerRoutes) {
  registerRoutes(app);
}
if (debugTablesRouter) {
  app.use('/api', debugTablesRouter);
}

// === CONNEXION POSTGRES SÉCURISÉE ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum de 10 connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion initial
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

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

    const data = {};

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT * FROM "${table}";`);
        data[table] = result.rows;
      } catch (tableErr) {
        console.warn(`⚠️ Table ${table} not accessible:`, tableErr.message);
        data[table] = [];
      }
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS AMÉLIORÉ ===
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Erreurs CORS spécifiques
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'Accès refusé par la politique CORS',
      error: process.env.NODE_ENV === 'development' ? err.message : 'CORS Error'
    });
  }
  
  // Erreur générique
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Pour Vercel, on exporte l'app au lieu de l'écouter
export default app;