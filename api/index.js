// Vercel Serverless Function pour l'API Apaddicto
// Ce fichier crée une instance Express compatible avec Vercel
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

console.log('🚀 Starting Apaddicto API on Vercel...');

// Créer l'application Express
const app = express();

// Configuration CORS
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true,
}));

// Parsing JSON
app.use(express.json());

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'Apaddicto2024SecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
  },
}));

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running on Vercel!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
    database: !!process.env.DATABASE_URL,
    session: !!process.env.SESSION_SECRET,
  });
});

// Debug endpoint
app.get('/api/debug', (_req, res) => {
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT_SET',
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// List tables endpoint
app.get('/api/tables', async (_req, res) => {
  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    res.json(result.map(r => r.table_name));
  } catch (err) {
    console.error('Error listing tables:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Get all data endpoint
app.get('/api/data', async (_req, res) => {
  try {
    const tables = [
      "users",
      "exercises",
      "exercise_sessions",
      "craving_entries",
      "psycho_education_content",
      "user_badges",
      "user_stats",
      "beck_analyses"
    ];

    const data = {};

    for (const table of tables) {
      try {
        const result = await sql(`SELECT * FROM ${table};`);
        data[table] = result;
      } catch (tableErr) {
        console.warn(`Table ${table} not found, skipping...`);
        data[table] = [];
      }
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Import bcrypt dynamically
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password, first_name, last_name, role, created_at)
      VALUES (${email}, ${hashedPassword}, ${firstName || ''}, ${lastName || ''}, ${role || 'patient'}, NOW())
      RETURNING id, email, first_name as "firstName", last_name as "lastName", role, created_at as "createdAt"
    `;

    req.session.user = newUser[0];
    
    res.json({ 
      user: newUser[0], 
      message: "Inscription réussie" 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de l'inscription" 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Find user
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = users[0];

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at
    };
    
    res.json({ 
      user: req.session.user, 
      message: "Connexion réussie" 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de la connexion" 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la déconnexion" });
    }
    res.json({ message: "Déconnexion réussie" });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  res.json(req.session.user);
});

// Get exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await sql`
      SELECT * FROM exercises ORDER BY id DESC
    `;
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des exercices" });
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ message: 'Erreur interne', error: err.message });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: '✅ API Apaddicto est en ligne sur Vercel!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
  });
});

// Export the Express app as a Vercel serverless function
export default app;
