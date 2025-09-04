import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import bcrypt from 'bcryptjs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql, eq } from 'drizzle-orm';
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import ws from 'ws';

// Configure Neon
neonConfig.webSocketConstructor = ws;

const app = express();
const port = 3000;

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🚀 Starting Apaddicto server...');
console.log('📊 Database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

// Define tables directly in the server
const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("patient"), // 'patient' or 'admin'
  level: integer("level").default(1),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  difficulty: varchar("difficulty").default("beginner"),
  duration: integer("duration"),
  instructions: text("instructions"),
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const cravingEntries = pgTable("craving_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  intensity: integer("intensity").notNull(),
  triggers: jsonb("triggers").default([]),
  emotions: jsonb("emotions").default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

const exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  exerciseId: varchar("exercise_id"),
  duration: integer("duration"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

let db;
let pool;

// Enhanced database connection with retry logic
async function initializeDatabase(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      pool = new Pool({ 
        connectionString: DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      db = drizzle({ client: pool, schema: { users, exercises, cravingEntries, exerciseSessions } });
      
      // Test connection
      await pool.query('SELECT 1');
      console.log('✅ Database initialized successfully');
      return;
    } catch (error) {
      console.error(`❌ Database initialization attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error('❌ All database connection attempts failed');
        process.exit(1);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Database operation wrapper with error handling
async function executeWithRetry(operation, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        throw new Error(`Database operation failed after ${retries} attempts: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Initialize database
await initializeDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const MemoryStore = memorystore(session);
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'Apaddicto2024SecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  }),
);

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Apply activity tracking to all API routes (except system endpoints)
app.use('/api', (req, res, next) => {
  // Skip activity tracking for system endpoints
  if (req.path === '/api/test-db' || req.path === '/api/init-db') {
    return next();
  }
  trackActivity(req, res, next);
});

// Authentication helpers
class AuthService {
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getUserByEmail(email) {
    return executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    });
  }

  static async createUser(userData) {
    return executeWithRetry(async () => {
      const result = await db.insert(users).values(userData).returning();
      return result[0];
    });
  }

  static async getUserById(id) {
    return executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    });
  }

  static async updateUserActivity(userId) {
    return executeWithRetry(async () => {
      await db.execute(sql`
        UPDATE users 
        SET last_activity = NOW() 
        WHERE id = ${userId}
      `);
    });
  }
}

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  
  next();
}

// Middleware to track user activity
async function trackActivity(req, res, next) {
  if (req.session?.user?.id) {
    try {
      await AuthService.updateUserActivity(req.session.user.id);
    } catch (error) {
      console.error('Error tracking user activity:', error);
      // Don't fail the request if activity tracking fails
    }
  }
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'apaddicto-server',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Database test
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT 1 as test, NOW() as current_time`);
    res.json({ 
      ok: true, 
      message: 'Database connection successful', 
      result: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize database tables
app.get('/api/init-db', async (req, res) => {
  try {
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR DEFAULT 'patient',
        level INTEGER DEFAULT 1,
        points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        last_activity TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        description TEXT,
        category VARCHAR NOT NULL,
        difficulty VARCHAR DEFAULT 'beginner',
        duration INTEGER,
        instructions TEXT,
        benefits TEXT,
        image_url VARCHAR,
        video_url VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS craving_entries (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        intensity INTEGER NOT NULL,
        triggers JSONB DEFAULT '[]',
        emotions JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercise_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        exercise_id VARCHAR,
        duration INTEGER,
        completed BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add last_activity column if it doesn't exist (for existing tables)
    try {
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW()
      `);
    } catch (error) {
      // Column might already exist, ignore error
      console.log('Last activity column already exists or error adding it:', error.message);
    }

    res.json({ message: 'Database tables initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    console.log('📝 Registration attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Check if user already exists
    const existingUser = await AuthService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user using raw SQL to avoid schema issues
    const result = await db.execute(sql`
      INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at)
      VALUES (${email}, ${hashedPassword}, ${firstName || null}, ${lastName || null}, ${role || 'patient'}, true, NOW())
      RETURNING id, email, first_name, last_name, role
    `);

    const newUser = result.rows[0];

    // Set session
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
    };

    console.log('✅ User registered successfully:', email);
    
    res.json({ 
      user: req.session.user, 
      message: "Inscription réussie" 
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de l'inscription" 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Find user by email using raw SQL
    const result = await db.execute(sql`
      SELECT id, email, password, first_name, last_name, role, is_active
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    };

    // Update last activity
    try {
      await AuthService.updateUserActivity(user.id);
    } catch (error) {
      console.error('Error updating user activity:', error);
      // Don't fail login if activity update fails
    }

    console.log('✅ User logged in successfully:', email);

    res.json({ 
      user: req.session.user, 
      message: "Connexion réussie" 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de la connexion" 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const userEmail = req.session?.user?.email;
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    console.log('👋 User logged out:', userEmail);
    res.json({ message: 'Déconnexion réussie' });
  });
});

app.get('/api/auth/me', requireAuth, trackActivity, (req, res) => {
  res.json({ user: req.session.user });
});

// Admin routes for patient management
app.get('/api/admin/patients', requireAdmin, trackActivity, async (req, res) => {
  try {
    const result = await executeWithRetry(async () => {
      return await db.execute(sql`
        SELECT 
          id, 
          email, 
          first_name, 
          last_name, 
          is_active, 
          created_at,
          last_activity,
          EXTRACT(EPOCH FROM (NOW() - last_activity)) / 86400 as days_inactive
        FROM users 
        WHERE role = 'patient'
        ORDER BY last_activity DESC
      `);
    });

    const patients = result.rows.map(patient => ({
      id: patient.id,
      email: patient.email,
      firstName: patient.first_name,
      lastName: patient.last_name,
      isActive: patient.is_active,
      createdAt: patient.created_at,
      lastActivity: patient.last_activity,
      daysInactive: Math.floor(patient.days_inactive || 0)
    }));

    res.json({ patients });
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de la récupération des patients" 
    });
  }
});

app.get('/api/admin/patients/inactive/:days', requireAdmin, trackActivity, async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 30;
    
    const result = await executeWithRetry(async () => {
      return await db.execute(sql`
        SELECT 
          id, 
          email, 
          first_name, 
          last_name, 
          is_active, 
          created_at,
          last_activity,
          EXTRACT(EPOCH FROM (NOW() - last_activity)) / 86400 as days_inactive
        FROM users 
        WHERE role = 'patient' 
          AND last_activity < NOW() - INTERVAL '${days} days'
        ORDER BY last_activity ASC
      `);
    });

    const inactivePatients = result.rows.map(patient => ({
      id: patient.id,
      email: patient.email,
      firstName: patient.first_name,
      lastName: patient.last_name,
      isActive: patient.is_active,
      createdAt: patient.created_at,
      lastActivity: patient.last_activity,
      daysInactive: Math.floor(patient.days_inactive || 0)
    }));

    res.json({ 
      inactivePatients,
      criteria: `Inactifs depuis plus de ${days} jours`
    });
  } catch (error) {
    console.error('❌ Error fetching inactive patients:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de la récupération des patients inactifs" 
    });
  }
});

app.put('/api/admin/patients/:id/deactivate', requireAdmin, trackActivity, async (req, res) => {
  try {
    const patientId = req.params.id;
    
    const result = await executeWithRetry(async () => {
      return await db.execute(sql`
        UPDATE users 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${patientId} AND role = 'patient'
        RETURNING id, email, first_name, last_name
      `);
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }

    const patient = result.rows[0];
    console.log(`👤 Patient account deactivated by admin:`, patient.email);

    res.json({ 
      message: 'Compte patient désactivé avec succès',
      patient: {
        id: patient.id,
        email: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name
      }
    });
  } catch (error) {
    console.error('❌ Error deactivating patient:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de la désactivation du patient" 
    });
  }
});

app.delete('/api/admin/patients/:id', requireAdmin, trackActivity, async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // First get patient info for logging
    const patientResult = await executeWithRetry(async () => {
      return await db.execute(sql`
        SELECT email, first_name, last_name 
        FROM users 
        WHERE id = ${patientId} AND role = 'patient'
      `);
    });

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }

    const patient = patientResult.rows[0];

    // Delete related data first
    await executeWithRetry(async () => {
      await db.execute(sql`DELETE FROM exercise_sessions WHERE user_id = ${patientId}`);
      await db.execute(sql`DELETE FROM craving_entries WHERE user_id = ${patientId}`);
      await db.execute(sql`DELETE FROM users WHERE id = ${patientId} AND role = 'patient'`);
    });

    console.log(`🗑️ Patient account deleted by admin:`, patient.email);

    res.json({ 
      message: 'Compte patient supprimé avec succès',
      patient: {
        email: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name
      }
    });
  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    res.status(500).json({ 
      message: error.message || "Erreur lors de la suppression du patient" 
    });
  }
});

// Static file serving
app.use(express.static('dist/public'));

// Catch all for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '/home/user/webapp/dist/public' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Apaddicto server is running on http://0.0.0.0:${port}`);
  console.log(`📊 Health check: http://0.0.0.0:${port}/health`);
  console.log(`🔍 Database test: http://0.0.0.0:${port}/api/test-db`);
  console.log(`🔧 Initialize DB: http://0.0.0.0:${port}/api/init-db`);
  console.log(`🚪 Available endpoints:`);
  console.log(`   POST /api/auth/register - Créer un compte`);
  console.log(`   POST /api/auth/login - Se connecter`);
  console.log(`   POST /api/auth/logout - Se déconnecter`);
  console.log(`   GET  /api/auth/me - Profil utilisateur`);
  console.log(`🔧 Admin endpoints (requires admin role):`);
  console.log(`   GET  /api/admin/patients - Liste tous les patients`);
  console.log(`   GET  /api/admin/patients/inactive/:days - Patients inactifs`);
  console.log(`   PUT  /api/admin/patients/:id/deactivate - Désactiver un patient`);
  console.log(`   DELETE /api/admin/patients/:id - Supprimer un patient`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});