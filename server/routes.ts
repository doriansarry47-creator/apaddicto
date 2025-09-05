// server/routes.ts - API routes for the application
import { type Express, type Request, type Response } from 'express';
import { sql, eq } from 'drizzle-orm';
import { getDB } from './db.ts';
import { AuthService, requireAuth, requireAdmin } from './auth.ts';
import { users, exercises, cravingEntries, exerciseSessions } from './schema.ts';
import './types.ts'; // Import session types

export function registerRoutes(app: Express) {
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
      const db = getDB();
      const result = await db.execute(sql`SELECT 1 as test, NOW() as current_time`);
      res.json({ 
        ok: true, 
        message: 'Database connection successful', 
        result: result.rows,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Database test failed:', error);
      res.status(500).json({ 
        ok: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
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

      // Create user
      const newUser = await AuthService.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'patient',
        isActive: true,
        createdAt: new Date()
      });

      // Set session
      req.session.user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      };

      console.log('✅ User registered successfully:', email);
      
      res.json({ 
        user: req.session.user, 
        message: "Inscription réussie" 
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      res.status(500).json({ 
        message: error.message || "Erreur lors de l'inscription" 
      });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login attempt for:', email);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      // Find user by email
      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Verify password
      const isValidPassword = await AuthService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Compte désactivé' });
      }

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      console.log('✅ User logged in successfully:', email);

      res.json({ 
        user: req.session.user, 
        message: "Connexion réussie" 
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        message: error.message || "Erreur lors de la connexion" 
      });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const userEmail = req.session?.user?.email;
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      console.log('👋 User logged out:', userEmail);
      res.json({ message: 'Déconnexion réussie' });
    });
  });

  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    res.json({ user: req.session.user });
  });

  // User management routes
  app.get('/api/users', requireAdmin, async (req: Request, res: Response) => {
    try {
      const db = getDB();
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      }).from(users);
      
      res.json(allUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // Exercise routes
  app.get('/api/exercises', requireAuth, async (req: Request, res: Response) => {
    try {
      const db = getDB();
      const allExercises = await db.select().from(exercises);
      res.json(allExercises);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
    }
  });

  app.post('/api/exercises', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { title, description, duration, difficulty, category, instructions } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Titre et description requis' });
      }

      const db = getDB();
      const newExercise = await db.insert(exercises).values({
        title,
        description,
        duration: duration || 15,
        difficulty: difficulty || 'beginner',
        category: category || 'general',
        instructions: instructions || null,
        createdAt: new Date()
      }).returning();

      res.json(newExercise[0]);
    } catch (error: any) {
      console.error('Error creating exercise:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'exercice' });
    }
  });

  // Craving tracking routes
  app.post('/api/cravings', requireAuth, async (req: Request, res: Response) => {
    try {
      const { intensity, triggers, notes } = req.body;
      
      const db = getDB();
      const newCraving = await db.insert(cravingEntries).values({
        userId: req.session.user!.id,
        intensity: intensity || 1,
        triggers: triggers || null,
        notes: notes || null,
        createdAt: new Date()
      }).returning();

      res.json(newCraving[0]);
    } catch (error: any) {
      console.error('Error creating craving entry:', error);
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
    }
  });

  app.get('/api/cravings', requireAuth, async (req: Request, res: Response) => {
    try {
      const db = getDB();
      const userCravings = await db.select()
        .from(cravingEntries)
        .where(eq(cravingEntries.userId, req.session.user!.id));
      
      res.json(userCravings);
    } catch (error: any) {
      console.error('Error fetching cravings:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  });

  // Exercise session routes
  app.post('/api/exercise-sessions', requireAuth, async (req: Request, res: Response) => {
    try {
      const { exerciseId, duration, completed, notes } = req.body;
      
      const db = getDB();
      const newSession = await db.insert(exerciseSessions).values({
        userId: req.session.user!.id,
        exerciseId: exerciseId || null,
        duration: duration || 0,
        completed: completed || false,
        notes: notes || null,
        createdAt: new Date()
      }).returning();

      res.json(newSession[0]);
    } catch (error: any) {
      console.error('Error creating exercise session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
    }
  });

  app.get('/api/exercise-sessions', requireAuth, async (req: Request, res: Response) => {
    try {
      const db = getDB();
      const userSessions = await db.select()
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, req.session.user!.id));
      
      res.json(userSessions);
    } catch (error: any) {
      console.error('Error fetching exercise sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  });
}