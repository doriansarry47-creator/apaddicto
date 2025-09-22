import { Application } from 'express';
import { AuthService, requireAuth, requireAdmin } from './auth.js';
import { storage } from './storage.js';

export function registerRoutes(app: Application) {
  // === ROUTES D'AUTHENTIFICATION ===
  
  // POST /api/auth/register - Inscription
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

      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role: role || 'patient'
      });

      // Set session
      req.session.user = user as any;

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

  // POST /api/auth/login - Connexion
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login attempt for:', email);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      const user = await AuthService.login(email, password);

      // Set session
      req.session.user = user as any;

      console.log('✅ User logged in successfully:', email);

      res.json({ 
        user: req.session.user, 
        message: "Connexion réussie" 
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(401).json({ 
        message: error.message || "Erreur lors de la connexion" 
      });
    }
  });

  // POST /api/auth/logout - Déconnexion
  app.post('/api/auth/logout', (req, res) => {
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

  // GET /api/auth/me - Profil utilisateur
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.session.user });
  });

  // POST /api/auth/forgot-password - Mot de passe oublié
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email requis" });
      }

      console.log('🔑 Forgot password request for:', email);

      // Récupérer l'utilisateur de la base de données
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
        return res.json({ message: "Si cet email existe, le mot de passe sera envoyé par email." });
      }

      // Pour cette implémentation simple, on renvoie directement le mot de passe
      // Dans un environnement de production, il faudrait:
      // 1. Générer un token de réinitialisation
      // 2. Envoyer un email avec un lien de réinitialisation
      // 3. Permettre à l'utilisateur de définir un nouveau mot de passe
      
      // Simulation d'envoi d'email (affichage console pour démonstration)
      console.log('📧 Simulated email sent to:', email);
      console.log('📧 Password would be sent to user email:', user.email);
      
      // Pour les besoins de démonstration, on suppose que le mot de passe est envoyé
      res.json({ 
        message: "Un email contenant votre mot de passe a été envoyé à votre adresse email.",
        // En production, ne jamais renvoyer le mot de passe dans la réponse
        demo_note: "Dans cette démo, votre mot de passe a été envoyé par email."
      });
      
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({ 
        message: "Erreur lors de l'envoi de l'email" 
      });
    }
  });

  // PUT /api/auth/profile - Mise à jour du profil
  app.put('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await AuthService.updateUser(req.session.user!.id, {
        firstName,
        lastName, 
        email
      });

      req.session.user = updatedUser as any;
      
      res.json({ 
        user: updatedUser,
        message: 'Profil mis à jour avec succès' 
      });
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      res.status(400).json({ 
        message: error.message || "Erreur lors de la mise à jour" 
      });
    }
  });

  // PUT /api/auth/password - Changement de mot de passe
  app.put('/api/auth/password', requireAuth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      
      await AuthService.updatePassword(req.session.user!.id, oldPassword, newPassword);
      
      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error: any) {
      console.error('❌ Password update error:', error);
      res.status(400).json({ 
        message: error.message || "Erreur lors du changement de mot de passe" 
      });
    }
  });

  // === ROUTES DE GESTION DES UTILISATEURS ===
  
  // GET /api/users - Liste des utilisateurs (admin)
  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // === ROUTES DES EXERCICES ===
  
  // GET /api/exercises - Liste des exercices
  app.get('/api/exercises', requireAuth, async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
    }
  });

  // GET /api/exercises/:id - Récupérer un exercice spécifique
  app.get('/api/exercises/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExerciseById(id);
      
      if (!exercise) {
        return res.status(404).json({ message: 'Exercice non trouvé' });
      }
      
      res.json(exercise);
    } catch (error: any) {
      console.error('Error fetching exercise:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'exercice' });
    }
  });

  // POST /api/exercises - Créer un exercice (admin)
  app.post('/api/exercises', requireAdmin, async (req, res) => {
    try {
      const { title, description, duration, difficulty, category, instructions } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Titre et description requis' });
      }

      const exercise = await storage.createExercise({
        title,
        description,
        duration: duration || 15,
        difficulty: difficulty || 'beginner',
        category: category || 'general',
        instructions: instructions || null
      });

      res.json(exercise);
    } catch (error: any) {
      console.error('Error creating exercise:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'exercice' });
    }
  });

  // === ROUTES DE SUIVI DES ENVIES ===
  
  // POST /api/cravings - Enregistrer une envie
  app.post('/api/cravings', requireAuth, async (req, res) => {
    try {
      const { intensity, triggers, emotions, notes } = req.body;
      
      console.log('📝 Craving entry request for user:', req.session.user!.id);
      console.log('📝 Craving data:', { intensity, triggers, emotions, notes });
      
      // Validation
      const intensityNum = Number(intensity);
      if (isNaN(intensityNum) || intensityNum < 0 || intensityNum > 10) {
        console.error('❌ Invalid intensity:', intensity);
        return res.status(400).json({ message: 'Intensité invalide (0-10 requis)' });
      }
      
      const cravingData = {
        userId: req.session.user!.id,
        intensity: intensityNum,
        triggers: Array.isArray(triggers) ? triggers : [],
        emotions: Array.isArray(emotions) ? emotions : [],
        notes: notes && typeof notes === 'string' ? notes.trim() : null
      };
      
      console.log('🔍 Processed craving data:', cravingData);
      
      const craving = await storage.createCravingEntry(cravingData);
      
      console.log('✅ Craving entry created successfully:', craving.id);
      res.json(craving);
    } catch (error: any) {
      console.error('❌ Error creating craving entry:', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'enregistrement', 
        error: error.message 
      });
    }
  });

  // GET /api/cravings - Historique des envies
  app.get('/api/cravings', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const cravings = await storage.getCravingEntriesByUser(req.session.user!.id, limit);
      res.json(cravings);
    } catch (error: any) {
      console.error('Error fetching cravings:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  });

  // === ROUTES DES SESSIONS D'EXERCICES ===
  
  // POST /api/exercise-sessions - Enregistrer une session
  app.post('/api/exercise-sessions', requireAuth, async (req, res) => {
    try {
      const { exerciseId, duration, completed, notes, cravingBefore, cravingAfter } = req.body;
      
      // Vérifier si l'exercice existe si un exerciseId est fourni
      let validExerciseId = exerciseId;
      if (exerciseId) {
        const exercise = await storage.getExerciseById(exerciseId);
        if (!exercise) {
          // Si l'exercice n'existe pas, utiliser le premier exercice disponible
          const exercises = await storage.getAllExercises();
          if (exercises.length > 0) {
            validExerciseId = exercises[0].id;
          } else {
            return res.status(400).json({ message: 'Aucun exercice disponible dans la base de données' });
          }
        }
      } else {
        // Si aucun exerciceId fourni, utiliser le premier exercice disponible
        const exercises = await storage.getAllExercises();
        if (exercises.length > 0) {
          validExerciseId = exercises[0].id;
        } else {
          return res.status(400).json({ message: 'Aucun exercice disponible dans la base de données' });
        }
      }
      
      const session = await storage.createExerciseSession({
        userId: req.session.user!.id,
        exerciseId: validExerciseId,
        duration: duration || 0,
        completed: completed || false,
        cravingBefore: cravingBefore || null,
        cravingAfter: cravingAfter || null,
        notes: notes || null
      });

      res.json(session);
    } catch (error: any) {
      console.error('Error creating exercise session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
    }
  });

  // GET /api/exercise-sessions - Historique des sessions
  app.get('/api/exercise-sessions', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getExerciseSessionsByUser(req.session.user!.id, limit);
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching exercise sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  });

  // === ROUTES DU CONTENU PSYCHOÉDUCATIF ===
  
  // GET /api/psycho-education - Liste du contenu
  app.get('/api/psycho-education', requireAuth, async (req, res) => {
    try {
      const content = await storage.getAllPsychoEducationContent();
      res.json(content);
    } catch (error: any) {
      console.error('Error fetching psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du contenu' });
    }
  });

  // POST /api/psycho-education - Créer du contenu (admin)
  app.post('/api/psycho-education', requireAdmin, async (req, res) => {
    try {
      const { title, content, category } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Titre et contenu requis' });
      }

      const newContent = await storage.createPsychoEducationContent({
        title,
        content,
        category: category || 'general'
      });

      res.json(newContent);
    } catch (error: any) {
      console.error('Error creating psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la création du contenu' });
    }
  });

  // === ROUTES DES ANALYSES BECK ===
  
  // POST /api/beck-analyses - Créer une analyse Beck
  app.post('/api/beck-analyses', requireAuth, async (req, res) => {
    try {
      const { situation, automaticThoughts, emotions, emotionIntensity, rationalResponse, newFeeling, newIntensity } = req.body;
      
      console.log('📝 Beck analysis request for user:', req.session.user!.id);
      console.log('📝 Beck analysis data:', { situation, automaticThoughts, emotions, emotionIntensity, rationalResponse, newFeeling, newIntensity });
      
      // Validation des champs requis
      if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
        console.error('❌ Invalid situation:', situation);
        return res.status(400).json({ message: 'Situation requise et non vide' });
      }
      
      if (!automaticThoughts || typeof automaticThoughts !== 'string' || automaticThoughts.trim().length === 0) {
        console.error('❌ Invalid automaticThoughts:', automaticThoughts);
        return res.status(400).json({ message: 'Pensées automatiques requises et non vides' });
      }
      
      if (!emotions || typeof emotions !== 'string' || emotions.trim().length === 0) {
        console.error('❌ Invalid emotions:', emotions);
        return res.status(400).json({ message: 'Émotions requises et non vides' });
      }
      
      // Validation des intensités
      let emotionIntensityNum = null;
      if (emotionIntensity !== null && emotionIntensity !== undefined) {
        emotionIntensityNum = Number(emotionIntensity);
        if (isNaN(emotionIntensityNum) || emotionIntensityNum < 1 || emotionIntensityNum > 10) {
          console.error('❌ Invalid emotionIntensity:', emotionIntensity);
          return res.status(400).json({ message: 'Intensité émotionnelle invalide (1-10 requis)' });
        }
      }
      
      let newIntensityNum = null;
      if (newIntensity !== null && newIntensity !== undefined) {
        newIntensityNum = Number(newIntensity);
        if (isNaN(newIntensityNum) || newIntensityNum < 1 || newIntensityNum > 10) {
          console.error('❌ Invalid newIntensity:', newIntensity);
          return res.status(400).json({ message: 'Nouvelle intensité invalide (1-10 requis)' });
        }
      }
      
      const analysisData = {
        userId: req.session.user!.id,
        situation: situation.trim(),
        automaticThoughts: automaticThoughts.trim(),
        emotions: emotions.trim(),
        emotionIntensity: emotionIntensityNum,
        rationalResponse: rationalResponse && typeof rationalResponse === 'string' ? rationalResponse.trim() : null,
        newFeeling: newFeeling && typeof newFeeling === 'string' ? newFeeling.trim() : null,
        newIntensity: newIntensityNum
      };
      
      console.log('🔍 Processed Beck analysis data:', analysisData);

      const analysis = await storage.createBeckAnalysis(analysisData);

      console.log('✅ Beck analysis created successfully:', analysis.id);
      res.json(analysis);
    } catch (error: any) {
      console.error('❌ Error creating Beck analysis:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création de l\'analyse',
        error: error.message 
      });
    }
  });

  // GET /api/beck-analyses - Historique des analyses Beck
  app.get('/api/beck-analyses', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const analyses = await storage.getBeckAnalysesByUser(req.session.user!.id, limit);
      res.json(analyses);
    } catch (error: any) {
      console.error('Error fetching Beck analyses:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des analyses' });
    }
  });

  // === ROUTES DES STRATÉGIES ===
  
  // POST /api/strategies - Sauvegarder des stratégies anti-craving
  app.post('/api/strategies', requireAuth, async (req, res) => {
    try {
      const { strategies } = req.body;
      
      console.log('📝 Strategies save request for user:', req.session.user!.id);
      console.log('📝 Received strategies data:', strategies);
      
      if (!strategies || !Array.isArray(strategies) || strategies.length === 0) {
        console.warn('❌ No strategies provided or invalid format');
        return res.status(400).json({ message: 'Au moins une stratégie requise' });
      }

      const savedStrategies = [];
      
      for (let i = 0; i < strategies.length; i++) {
        const strategyData = strategies[i];
        const { context, exercise, effort, duration, cravingBefore, cravingAfter } = strategyData;
        
        console.log(`🔍 Validating strategy ${i + 1}:`, strategyData);
        
        // Validation plus détaillée
        if (!context || typeof context !== 'string') {
          console.error(`❌ Invalid context for strategy ${i + 1}:`, context);
          return res.status(400).json({ message: `Contexte invalide pour la stratégie ${i + 1}` });
        }
        
        if (!exercise || typeof exercise !== 'string' || exercise.trim().length === 0) {
          console.error(`❌ Invalid exercise for strategy ${i + 1}:`, exercise);
          return res.status(400).json({ message: `Description d'exercice requise pour la stratégie ${i + 1}` });
        }
        
        if (!effort || typeof effort !== 'string') {
          console.error(`❌ Invalid effort for strategy ${i + 1}:`, effort);
          return res.status(400).json({ message: `Niveau d'effort invalide pour la stratégie ${i + 1}` });
        }
        
        const durationNum = Number(duration);
        if (isNaN(durationNum) || durationNum < 1 || durationNum > 180) {
          console.error(`❌ Invalid duration for strategy ${i + 1}:`, duration);
          return res.status(400).json({ message: `Durée invalide pour la stratégie ${i + 1} (1-180 min requis)` });
        }
        
        const cravingBeforeNum = Number(cravingBefore);
        if (isNaN(cravingBeforeNum) || cravingBeforeNum < 0 || cravingBeforeNum > 10) {
          console.error(`❌ Invalid cravingBefore for strategy ${i + 1}:`, cravingBefore);
          return res.status(400).json({ message: `Craving avant invalide pour la stratégie ${i + 1} (0-10 requis)` });
        }
        
        const cravingAfterNum = Number(cravingAfter);
        if (isNaN(cravingAfterNum) || cravingAfterNum < 0 || cravingAfterNum > 10) {
          console.error(`❌ Invalid cravingAfter for strategy ${i + 1}:`, cravingAfter);
          return res.status(400).json({ message: `Craving après invalide pour la stratégie ${i + 1} (0-10 requis)` });
        }
        
        try {
          const strategy = await storage.createStrategy({
            userId: req.session.user!.id,
            context: context.trim(),
            exercise: exercise.trim(),
            effort: effort.trim(),
            duration: durationNum,
            cravingBefore: cravingBeforeNum,
            cravingAfter: cravingAfterNum
          });
          
          console.log(`✅ Strategy ${i + 1} created successfully:`, strategy.id);
          savedStrategies.push(strategy);
        } catch (dbError: any) {
          console.error(`❌ Database error for strategy ${i + 1}:`, dbError);
          return res.status(500).json({ message: `Erreur de base de données pour la stratégie ${i + 1}: ${dbError.message}` });
        }
      }

      console.log(`✅ All ${savedStrategies.length} strategies saved successfully`);
      res.json({ strategies: savedStrategies, message: `${savedStrategies.length} stratégies sauvegardées avec succès` });
    } catch (error: any) {
      console.error('❌ Unexpected error creating strategies:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création des stratégies',
        error: error.message 
      });
    }
  });

  // GET /api/strategies - Liste des stratégies
  app.get('/api/strategies', requireAuth, async (req, res) => {
    try {
      const strategies = await storage.getStrategiesByUser(req.session.user!.id);
      res.json(strategies);
    } catch (error: any) {
      console.error('Error fetching strategies:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des stratégies' });
    }
  });

  // PUT /api/strategies/:id - Mettre à jour une stratégie
  app.put('/api/strategies/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category, effectiveness } = req.body;
      
      const strategy = await storage.updateStrategy(id, req.session.user!.id, {
        title,
        description,
        category,
        effectiveness
      });

      if (!strategy) {
        return res.status(404).json({ message: 'Stratégie non trouvée' });
      }

      res.json(strategy);
    } catch (error: any) {
      console.error('Error updating strategy:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la stratégie' });
    }
  });

  // DELETE /api/strategies/:id - Supprimer une stratégie
  app.delete('/api/strategies/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteStrategy(id, req.session.user!.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Stratégie non trouvée' });
      }

      res.json({ message: 'Stratégie supprimée avec succès' });
    } catch (error: any) {
      console.error('Error deleting strategy:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la stratégie' });
    }
  });

  // === ROUTES DE STATISTIQUES ET DASHBOARD ===
  
  // GET /api/dashboard/stats - Statistiques pour le dashboard
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.user!.id);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  });

  // === ROUTES D'EXERCICES DE RELAXATION ===
  
  // GET /api/relaxation-exercises - Exercices de relaxation
  app.get('/api/relaxation-exercises', requireAuth, async (req, res) => {
    try {
      const exercises = await storage.getRelaxationExercises();
      res.json(exercises);
    } catch (error: any) {
      console.error('Error fetching relaxation exercises:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des exercices de relaxation' });
    }
  });

  // === ROUTES D'ADMINISTRATION ===
  
  // GET /api/admin/users - Liste de tous les utilisateurs (admin uniquement)
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithStats();
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // DELETE /api/admin/users/:id - Supprimer un utilisateur (admin uniquement)
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Empêcher la suppression d'un admin par un autre admin
      const userToDelete = await storage.getUserById(id);
      if (userToDelete?.role === 'admin') {
        return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  });

  // === ROUTES DES ROUTINES D'URGENCE ===
  
  // GET /api/emergency-routines - Récupérer les routines d'urgence d'un utilisateur
  app.get('/api/emergency-routines', requireAuth, async (req, res) => {
    try {
      const routines = await storage.getEmergencyRoutines(req.session.user!.id);
      res.json(routines);
    } catch (error: any) {
      console.error('Error fetching emergency routines:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des routines d\'urgence' });
    }
  });

  // POST /api/emergency-routines - Créer une routine d'urgence
  app.post('/api/emergency-routines', requireAuth, async (req, res) => {
    try {
      const routineData = {
        ...req.body,
        userId: req.session.user!.id
      };
      const routine = await storage.createEmergencyRoutine(routineData);
      res.json(routine);
    } catch (error: any) {
      console.error('Error creating emergency routine:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la routine d\'urgence' });
    }
  });

  // PUT /api/emergency-routines/:id - Modifier une routine d'urgence
  app.put('/api/emergency-routines/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;
      
      // Vérifier que la routine appartient à l'utilisateur
      const existingRoutine = await storage.getEmergencyRoutineById(id);
      if (!existingRoutine || existingRoutine.userId !== userId) {
        return res.status(403).json({ message: 'Routine non trouvée ou accès refusé' });
      }
      
      const routine = await storage.updateEmergencyRoutine(id, req.body);
      res.json(routine);
    } catch (error: any) {
      console.error('Error updating emergency routine:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la routine d\'urgence' });
    }
  });

  // DELETE /api/emergency-routines/:id - Supprimer une routine d'urgence
  app.delete('/api/emergency-routines/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;
      
      // Vérifier que la routine appartient à l'utilisateur
      const existingRoutine = await storage.getEmergencyRoutineById(id);
      if (!existingRoutine || existingRoutine.userId !== userId) {
        return res.status(403).json({ message: 'Routine non trouvée ou accès refusé' });
      }
      
      const success = await storage.deleteEmergencyRoutine(id);
      if (success) {
        res.json({ message: 'Routine d\'urgence supprimée avec succès' });
      } else {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
      }
    } catch (error: any) {
      console.error('Error deleting emergency routine:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la routine d\'urgence' });
    }
  });

  // === ROUTES DES VARIATIONS D'EXERCICES ===
  
  // GET /api/exercises/:id/variations - Récupérer les variations d'un exercice
  app.get('/api/exercises/:id/variations', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const variations = await storage.getExerciseVariations(id);
      res.json(variations);
    } catch (error: any) {
      console.error('Error fetching exercise variations:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des variations' });
    }
  });

  // POST /api/exercises/:id/variations - Créer une variation d'exercice (admin)
  app.post('/api/exercises/:id/variations', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { type, title, description, instructions, difficultyModifier, benefits } = req.body;
      
      if (!type || !title || !description) {
        return res.status(400).json({ message: 'Type, titre et description requis' });
      }

      const variation = await storage.createExerciseVariation({
        exerciseId: id,
        type,
        title,
        description,
        instructions,
        difficultyModifier: difficultyModifier || 0,
        benefits
      });

      res.json(variation);
    } catch (error: any) {
      console.error('Error creating exercise variation:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la variation' });
    }
  });

  // === ROUTES DES SÉANCES PERSONNALISÉES ===
  
  // GET /api/custom-sessions - Liste des séances (publiques + celles de l'utilisateur)
  app.get('/api/custom-sessions', requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getCustomSessions(req.session.user!.id);
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching custom sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances' });
    }
  });

  // GET /api/custom-sessions/:id - Récupérer une séance spécifique avec ses éléments
  app.get('/api/custom-sessions/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getCustomSessionById(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Séance non trouvée' });
      }

      // Vérifier l'accès (séance publique ou créée par l'utilisateur)
      if (!session.isPublic && session.creatorId !== req.session.user!.id && req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé à cette séance' });
      }

      const elements = await storage.getSessionElements(id);
      res.json({ ...session, elements });
    } catch (error: any) {
      console.error('Error fetching custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la séance' });
    }
  });

  // POST /api/custom-sessions - Créer une nouvelle séance personnalisée
  app.post('/api/custom-sessions', requireAuth, async (req, res) => {
    try {
      const { title, description, category, difficulty, isTemplate, isPublic, tags, exercises } = req.body;
      
      if (!title || !description || !exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ message: 'Titre, description et exercices requis' });
      }

      if (exercises.length === 0) {
        return res.status(400).json({ message: 'Au moins un exercice est requis' });
      }

      // Calculer la durée totale
      const totalDuration = exercises.reduce((total: number, ex: any) => {
        return total + (ex.duration * ex.repetitions) + ex.restTime;
      }, 0);

      const sessionData = {
        creatorId: req.session.user!.id,
        title,
        description,
        category: category || 'maintenance',
        difficulty: difficulty || 'beginner',
        totalDuration,
        isTemplate: isTemplate !== false, // Par défaut true
        isPublic: isPublic === true, // Par défaut false
        tags: Array.isArray(tags) ? tags : []
      };

      const session = await storage.createCustomSession(sessionData);

      // Créer les éléments de la séance
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        await storage.createSessionElement({
          sessionId: session.id,
          exerciseId: exercise.exerciseId,
          variationId: exercise.variationId || null,
          order: i,
          duration: exercise.duration,
          repetitions: exercise.repetitions || 1,
          restTime: exercise.restTime || 0,
          notes: exercise.notes || null,
          isOptional: exercise.isOptional || false
        });
      }

      res.json(session);
    } catch (error: any) {
      console.error('Error creating custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la séance' });
    }
  });

  // PUT /api/custom-sessions/:id - Modifier une séance personnalisée
  app.put('/api/custom-sessions/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;
      
      // Vérifier que la séance appartient à l'utilisateur ou qu'il est admin
      const existingSession = await storage.getCustomSessionById(id);
      if (!existingSession) {
        return res.status(404).json({ message: 'Séance non trouvée' });
      }

      if (existingSession.creatorId !== userId && req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const { title, description, category, difficulty, isPublic, tags, exercises } = req.body;

      // Mettre à jour la séance
      const updatedSession = await storage.updateCustomSession(id, {
        title,
        description,
        category,
        difficulty,
        isPublic,
        tags,
        totalDuration: exercises ? exercises.reduce((total: number, ex: any) => {
          return total + (ex.duration * ex.repetitions) + ex.restTime;
        }, 0) : existingSession.totalDuration
      });

      // Si des exercices sont fournis, recréer les éléments
      if (exercises && Array.isArray(exercises)) {
        await storage.deleteSessionElements(id);
        
        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];
          await storage.createSessionElement({
            sessionId: id,
            exerciseId: exercise.exerciseId,
            variationId: exercise.variationId || null,
            order: i,
            duration: exercise.duration,
            repetitions: exercise.repetitions || 1,
            restTime: exercise.restTime || 0,
            notes: exercise.notes || null,
            isOptional: exercise.isOptional || false
          });
        }
      }

      res.json(updatedSession);
    } catch (error: any) {
      console.error('Error updating custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la séance' });
    }
  });

  // POST /api/custom-sessions/:id/copy - Créer une copie personnelle d'une séance
  app.post('/api/custom-sessions/:id/copy', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;
      
      const originalSession = await storage.getCustomSessionById(id);
      if (!originalSession) {
        return res.status(404).json({ message: 'Séance non trouvée' });
      }

      // Vérifier l'accès à la séance originale
      if (!originalSession.isPublic && originalSession.creatorId !== userId && req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé à cette séance' });
      }

      const elements = await storage.getSessionElements(id);

      // Créer la copie
      const copyData = {
        creatorId: userId,
        title: `Ma copie - ${originalSession.title}`,
        description: originalSession.description,
        category: originalSession.category,
        difficulty: originalSession.difficulty,
        totalDuration: originalSession.totalDuration,
        isTemplate: true,
        isPublic: false, // Les copies sont privées par défaut
        tags: originalSession.tags
      };

      const copiedSession = await storage.createCustomSession(copyData);

      // Copier les éléments
      for (const element of elements) {
        await storage.createSessionElement({
          sessionId: copiedSession.id,
          exerciseId: element.exerciseId,
          variationId: element.variationId,
          order: element.order,
          duration: element.duration,
          repetitions: element.repetitions,
          restTime: element.restTime,
          notes: element.notes,
          isOptional: element.isOptional
        });
      }

      res.json({ 
        ...copiedSession, 
        elements,
        message: 'Séance copiée avec succès. Vous pouvez maintenant la personnaliser.' 
      });
    } catch (error: any) {
      console.error('Error copying custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la copie de la séance' });
    }
  });

  // DELETE /api/custom-sessions/:id - Supprimer une séance personnalisée
  app.delete('/api/custom-sessions/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;
      
      const existingSession = await storage.getCustomSessionById(id);
      if (!existingSession) {
        return res.status(404).json({ message: 'Séance non trouvée' });
      }

      if (existingSession.creatorId !== userId && req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      const success = await storage.deleteCustomSession(id);
      if (success) {
        res.json({ message: 'Séance supprimée avec succès' });
      } else {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
      }
    } catch (error: any) {
      console.error('Error deleting custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la séance' });
    }
  });

  // === ROUTES DES INSTANCES DE SÉANCES ===
  
  // POST /api/session-instances - Démarrer une instance de séance
  app.post('/api/session-instances', requireAuth, async (req, res) => {
    try {
      const { sessionId, cravingBefore, moodBefore } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'ID de séance requis' });
      }

      const sessionInstance = await storage.createSessionInstance({
        userId: req.session.user!.id,
        sessionId,
        status: 'started',
        currentElementIndex: 0,
        cravingBefore,
        moodBefore,
        completedElements: []
      });

      res.json(sessionInstance);
    } catch (error: any) {
      console.error('Error creating session instance:', error);
      res.status(500).json({ message: 'Erreur lors du démarrage de la séance' });
    }
  });

  // PUT /api/session-instances/:id - Mettre à jour une instance de séance
  app.put('/api/session-instances/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;
      
      // Vérifier que l'instance appartient à l'utilisateur
      const existingInstance = await storage.getSessionInstanceById(id);
      if (!existingInstance || existingInstance.userId !== userId) {
        return res.status(403).json({ message: 'Instance non trouvée ou accès refusé' });
      }

      const updatedInstance = await storage.updateSessionInstance(id, req.body);
      res.json(updatedInstance);
    } catch (error: any) {
      console.error('Error updating session instance:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'instance' });
    }
  });

  // GET /api/session-instances/user - Historique des instances de séances de l'utilisateur
  app.get('/api/session-instances/user', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const instances = await storage.getSessionInstancesByUser(req.session.user!.id, limit);
      res.json(instances);
    } catch (error: any) {
      console.error('Error fetching session instances:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
  });

  console.log('✅ All routes registered successfully');
}