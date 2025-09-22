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
      req.session.user = user;

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
      req.session.user = user;

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
      
      const updatedUser = await AuthService.updateUser(req.session.user.id, {
        firstName,
        lastName, 
        email
      });

      req.session.user = updatedUser;
      
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
      
      await AuthService.updatePassword(req.session.user.id, oldPassword, newPassword);
      
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
      
      console.log('📝 Craving entry request for user:', req.session.user.id);
      console.log('📝 Craving data:', { intensity, triggers, emotions, notes });
      
      // Validation
      const intensityNum = Number(intensity);
      if (isNaN(intensityNum) || intensityNum < 0 || intensityNum > 10) {
        console.error('❌ Invalid intensity:', intensity);
        return res.status(400).json({ message: 'Intensité invalide (0-10 requis)' });
      }
      
      const cravingData = {
        userId: req.session.user.id,
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
      const cravings = await storage.getCravingEntriesByUser(req.session.user.id, limit);
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
        userId: req.session.user.id,
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
      const sessions = await storage.getExerciseSessionsByUser(req.session.user.id, limit);
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
      const { title, content, category, tags } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Titre et contenu requis' });
      }

      const newContent = await storage.createPsychoEducationContent({
        title,
        content,
        category: category || 'general',
        tags: tags || null
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
      
      console.log('📝 Beck analysis request for user:', req.session.user.id);
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
        userId: req.session.user.id,
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
      const analyses = await storage.getBeckAnalysesByUser(req.session.user.id, limit);
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
      
      console.log('📝 Strategies save request for user:', req.session.user.id);
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
            userId: req.session.user.id,
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
      const strategies = await storage.getStrategiesByUser(req.session.user.id);
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
      
      const strategy = await storage.updateStrategy(id, req.session.user.id, {
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
      
      const success = await storage.deleteStrategy(id, req.session.user.id);
      
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
      const stats = await storage.getUserStats(req.session.user.id);
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
      const routines = await storage.getEmergencyRoutines(req.session.user.id);
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
        userId: req.session.user.id
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
      const userId = req.session.user.id;
      
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
      const userId = req.session.user.id;
      
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

  // === ROUTES DES SESSIONS PERSONNALISÉES ===
  
  // POST /api/custom-sessions - Créer une session personnalisée
  app.post('/api/custom-sessions', requireAuth, async (req, res) => {
    try {
      // Vérifier le rôle (admin ou thérapeute)
      if (req.session.user.role !== 'admin' && req.session.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Accès refusé - rôle requis: admin ou thérapeute' });
      }
      
      // Validation des données
      if (!req.body.title || !req.body.category) {
        return res.status(400).json({ message: 'Titre et catégorie requis' });
      }
      
      const sessionData = {
        ...req.body,
        creatorId: req.session.user.id
      };
      const session = await storage.createCustomSession(sessionData);
      res.json(session);
    } catch (error: any) {
      console.error('Error creating custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la session' });
    }
  });

  // GET /api/custom-sessions - Récupérer mes sessions
  app.get('/api/custom-sessions', requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getCustomSessionsByCreator(req.session.user.id);
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching custom sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des sessions' });
    }
  });

  // GET /api/custom-sessions/published - Récupérer les sessions publiées
  app.get('/api/custom-sessions/published', requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getPublishedSessions();
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching published sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des sessions publiées' });
    }
  });

  // PUT /api/custom-sessions/:id/publish - Publier une session
  app.put('/api/custom-sessions/:id/publish', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { targetAudience = 'all' } = req.body;
      
      // Vérifier que la session appartient à l'utilisateur
      const session = await storage.getCustomSession(id);
      if (!session || session.creatorId !== req.session.user.id) {
        return res.status(403).json({ message: 'Session non trouvée ou accès refusé' });
      }
      
      const publishedSession = await storage.publishSession(id, targetAudience);
      res.json(publishedSession);
    } catch (error: any) {
      console.error('Error publishing session:', error);
      res.status(500).json({ message: 'Erreur lors de la publication de la session' });
    }
  });

  // PUT /api/custom-sessions/:id - Mettre à jour une session
  app.put('/api/custom-sessions/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier que la session appartient à l'utilisateur
      const session = await storage.getCustomSession(id);
      if (!session || session.creatorId !== req.session.user.id) {
        return res.status(403).json({ message: 'Session non trouvée ou accès refusé' });
      }
      
      const updatedSession = await storage.updateCustomSession(id, req.body);
      res.json(updatedSession);
    } catch (error: any) {
      console.error('Error updating custom session:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la session' });
    }
  });

  // === ROUTES DES ASSIGNATIONS DE SESSIONS ===
  
  // POST /api/session-assignments - Assigner une session à un patient
  app.post('/api/session-assignments', requireAuth, async (req, res) => {
    try {
      // Vérifier le rôle (admin ou thérapeute)
      if (req.session.user.role !== 'admin' && req.session.user.role !== 'therapist') {
        return res.status(403).json({ message: 'Accès refusé - rôle requis: admin ou thérapeute' });
      }
      
      const { sessionId, patientId } = req.body;
      
      // Validation des données requises
      if (!sessionId || !patientId) {
        return res.status(400).json({ message: 'sessionId et patientId requis' });
      }
      
      // Vérifier que la session existe et est publiée
      const session = await storage.getCustomSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session non trouvée' });
      }
      if (session.status !== 'published') {
        return res.status(400).json({ message: 'Seules les sessions publiées peuvent être assignées' });
      }
      
      // Vérifier que le patient existe
      const patient = await storage.getUser(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient non trouvé' });
      }
      if (patient.role !== 'patient') {
        return res.status(400).json({ message: 'L\'utilisateur doit avoir le rôle patient' });
      }
      
      const assignmentData = {
        ...req.body,
        assignedBy: req.session.user.id
      };
      const assignment = await storage.createSessionAssignment(assignmentData);
      res.json(assignment);
    } catch (error: any) {
      console.error('Error creating session assignment:', error);
      res.status(500).json({ message: 'Erreur lors de l\'assignation de la session' });
    }
  });

  // GET /api/session-assignments/patient - Mes sessions assignées (patient)
  app.get('/api/session-assignments/patient', requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getSessionAssignmentsByPatient(req.session.user.id);
      res.json(assignments);
    } catch (error: any) {
      console.error('Error fetching patient assignments:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des assignations' });
    }
  });

  // GET /api/session-assignments/therapist - Sessions que j'ai assignées (thérapeute)
  app.get('/api/session-assignments/therapist', requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getSessionAssignmentsByTherapist(req.session.user.id);
      res.json(assignments);
    } catch (error: any) {
      console.error('Error fetching therapist assignments:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des assignations' });
    }
  });

  // PUT /api/session-assignments/:id/complete - Marquer une assignation comme complétée
  app.put('/api/session-assignments/:id/complete', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;
      
      // Récupérer l'assignation pour vérifier les permissions
      const assignments = await storage.getSessionAssignmentsByPatient(req.session.user.id);
      const assignment = assignments.find(a => a.id === id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignation non trouvée ou accès refusé' });
      }
      
      const completedAssignment = await storage.completeSessionAssignment(id, feedback);
      res.json(completedAssignment);
    } catch (error: any) {
      console.error('Error completing session assignment:', error);
      res.status(500).json({ message: 'Erreur lors de la finalisation de l\'assignation' });
    }
  });

  // === ROUTES DES ÉLÉMENTS DE SESSIONS ===
  
  // GET /api/session-elements/:sessionId - Récupérer les éléments d'une session
  app.get('/api/session-elements/:sessionId', requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const elements = await storage.getSessionElements(sessionId);
      res.json(elements);
    } catch (error: any) {
      console.error('Error fetching session elements:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des éléments de session' });
    }
  });

  // POST /api/session-elements - Créer un élément de session
  app.post('/api/session-elements', requireAuth, async (req, res) => {
    try {
      const element = await storage.createSessionElement(req.body);
      res.json(element);
    } catch (error: any) {
      console.error('Error creating session element:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'élément de session' });
    }
  });

  // PUT /api/session-elements/:id - Mettre à jour un élément de session
  app.put('/api/session-elements/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const element = await storage.updateSessionElement(id, req.body);
      res.json(element);
    } catch (error: any) {
      console.error('Error updating session element:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élément de session' });
    }
  });

  console.log('✅ All routes registered successfully');
}