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
      
      const updatedUser = await AuthService.updateUser(req.session.user!.id, {
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
      const { 
        title, 
        description, 
        duration, 
        difficulty, 
        category, 
        instructions, 
        benefits, 
        imageUrl, 
        videoUrl, 
        mediaUrl, 
        tags, 
        variable1, 
        variable2, 
        variable3, 
        isActive 
      } = req.body;
      
      console.log('📝 Creating exercise with data:', req.body);
      
      // Validation des champs requis
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        console.error('❌ Invalid title:', title);
        return res.status(400).json({ message: 'Titre requis et non vide' });
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        console.error('❌ Invalid description:', description);
        return res.status(400).json({ message: 'Description requise et non vide' });
      }

      // Validation des champs optionnels
      const validCategories = ['craving_reduction', 'relaxation', 'energy_boost', 'emotion_management', 'general'];
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];

      const finalCategory = validCategories.includes(category) ? category : 'craving_reduction';
      const finalDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'beginner';

      // Validation de la durée
      let finalDuration = 15;
      if (duration !== undefined && duration !== null) {
        const durationNum = Number(duration);
        if (!isNaN(durationNum) && durationNum > 0 && durationNum <= 180) {
          finalDuration = durationNum;
        }
      }

      const exerciseData = {
        title: title.trim(),
        description: description.trim(),
        duration: finalDuration,
        difficulty: finalDifficulty,
        category: finalCategory,
        instructions: instructions && typeof instructions === 'string' ? instructions.trim() : null,
        benefits: benefits && typeof benefits === 'string' ? benefits.trim() : null,
        imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : null,
        videoUrl: videoUrl && typeof videoUrl === 'string' ? videoUrl.trim() : null,
        mediaUrl: mediaUrl && typeof mediaUrl === 'string' ? mediaUrl.trim() : null,
        tags: Array.isArray(tags) ? [...tags] : [],
        variable1: variable1 && typeof variable1 === 'string' ? variable1.trim() : null,
        variable2: variable2 && typeof variable2 === 'string' ? variable2.trim() : null,
        variable3: variable3 && typeof variable3 === 'string' ? variable3.trim() : null,
        isActive: typeof isActive === 'boolean' ? isActive : true
      };

      console.log('🔍 Processed exercise data:', exerciseData);

      const exercise = await storage.createExercise(exerciseData);

      console.log('✅ Exercise created successfully:', exercise.id);
      res.json(exercise);
    } catch (error: any) {
      console.error('❌ Error creating exercise:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la création de l\'exercice',
        details: error.stack
      });
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
      const { 
        title, 
        content, 
        category, 
        type, 
        difficulty, 
        estimatedReadTime, 
        imageUrl, 
        videoUrl, 
        audioUrl 
      } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Titre et contenu requis' });
      }

      const newContent = await storage.createPsychoEducationContent({
        title,
        content,
        category: category || 'addiction',
        type: type || 'article',
        difficulty: difficulty || 'beginner',
        estimatedReadTime: estimatedReadTime ? parseInt(estimatedReadTime) : null,
        imageUrl,
        videoUrl,
        audioUrl
      });

      res.json(newContent);
    } catch (error: any) {
      console.error('Error creating psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la création du contenu' });
    }
  });

  // PUT /api/psycho-education/:id - Mettre à jour du contenu (admin)
  app.put('/api/psycho-education/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const content = await storage.updatePsychoEducationContent(id, updateData);
      
      if (!content) {
        return res.status(404).json({ message: 'Contenu non trouvé' });
      }
      
      res.json(content);
    } catch (error: any) {
      console.error('Error updating psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du contenu' });
    }
  });

  // DELETE /api/psycho-education/:id - Supprimer du contenu (admin)
  app.delete('/api/psycho-education/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePsychoEducationContent(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Contenu non trouvé' });
      }

      res.json({ message: 'Contenu supprimé avec succès' });
    } catch (error: any) {
      console.error('Error deleting psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du contenu' });
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
      const { context, exercise, effort, duration, cravingBefore, cravingAfter } = req.body;
      
      const strategy = await storage.updateStrategy(id, req.session.user!.id, {
        context,
        exercise,
        effort,
        duration,
        cravingBefore,
        cravingAfter
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
  
  // GET /api/admin/stats - Statistiques globales pour l'admin
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  });

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
      // Vérifier que l'utilisateur est admin (les routines sont globales)
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Seuls les admins peuvent créer des routines d\'urgence' });
      }
      
      const routine = await storage.createEmergencyRoutine(req.body);
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
      
      // Vérifier que l'utilisateur est admin (les routines sont globales)
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Seuls les admins peuvent modifier les routines d\'urgence' });
      }
      
      const existingRoutine = await storage.getEmergencyRoutineById(id);
      if (!existingRoutine) {
        return res.status(404).json({ message: 'Routine non trouvée' });
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
      
      // Vérifier que l'utilisateur est admin (les routines sont globales)
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Seuls les admins peuvent supprimer les routines d\'urgence' });
      }
      
      const existingRoutine = await storage.getEmergencyRoutineById(id);
      if (!existingRoutine) {
        return res.status(404).json({ message: 'Routine non trouvée' });
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

  // === ROUTES POUR LES NOUVELLES FONCTIONNALITÉS ===
  
  // === SÉANCES PERSONNALISÉES ===
  
  // GET /api/sessions - Récupérer les séances (avec filtres)
  app.get('/api/sessions', requireAuth, async (req, res) => {
    try {
      const { status, tags, category } = req.query;
      const sessions = await storage.getSessions({
        status: status as string,
        tags: tags ? (tags as string).split(',') : undefined,
        category: category ? (category as string) : undefined,
        userId: req.session.user!.id,
        userRole: req.session.user!.role || 'user'
      });
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances' });
    }
  });

  // POST /api/sessions - Créer une séance (admin)
  app.post('/api/sessions', requireAdmin, async (req, res) => {
    try {
      console.log('[POST /api/sessions] Received session data:', JSON.stringify(req.body, null, 2));
      
      const sessionData = {
        ...req.body,
        creatorId: req.session.user!.id,
        status: req.body.status || 'draft'
      };
      
      console.log('[POST /api/sessions] Prepared session data with creatorId:', sessionData.creatorId);
      
      const session = await storage.createSession(sessionData);
      console.log('[POST /api/sessions] Session created successfully:', session.id);
      res.json(session);
    } catch (error: any) {
      console.error('[POST /api/sessions] Error creating session:', error);
      console.error('[POST /api/sessions] Error details:', error.message, error.stack);
      res.status(500).json({ 
        message: 'Erreur lors de la création de la séance',
        error: error.message || 'Unknown error'
      });
    }
  });

  // PUT /api/sessions/:id - Mettre à jour une séance (admin)
  app.put('/api/sessions/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.updateSession(id, req.body);
      
      if (!session) {
        return res.status(404).json({ message: 'Séance non trouvée' });
      }
      
      res.json(session);
    } catch (error: any) {
      console.error('Error updating session:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la séance' });
    }
  });

  // POST /api/sessions/:id/publish - Publier une séance (admin)
  app.post('/api/sessions/:id/publish', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { patientIds } = req.body; // Array d'IDs de patients
      
      const session = await storage.publishSession(id, patientIds);
      
      if (!session) {
        return res.status(404).json({ message: 'Séance non trouvée' });
      }
      
      res.json({ 
        message: 'Séance publiée avec succès', 
        session,
        assignedPatients: patientIds?.length || 0
      });
    } catch (error: any) {
      console.error('Error publishing session:', error);
      res.status(500).json({ message: 'Erreur lors de la publication de la séance' });
    }
  });

  // === GESTION DES ASSIGNATIONS DE SÉANCES ===
  
  // GET /api/patient-sessions - Récupérer les séances assignées à un patient
  app.get('/api/patient-sessions', requireAuth, async (req, res) => {
    try {
      const patientSessions = await storage.getPatientSessions(req.session.user!.id);
      res.json(patientSessions);
    } catch (error: any) {
      console.error('Error fetching patient sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances' });
    }
  });

  // POST /api/patient-sessions/:id/complete - Marquer une séance comme terminée
  app.post('/api/patient-sessions/:id/complete', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback, effort, duration } = req.body;
      
      const patientSession = await storage.completePatientSession(id, {
        feedback,
        effort: effort ? parseInt(effort) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        userId: req.session.user!.id
      });
      
      if (!patientSession) {
        return res.status(404).json({ message: 'Séance non trouvée ou accès refusé' });
      }
      
      res.json(patientSession);
    } catch (error: any) {
      console.error('Error completing patient session:', error);
      res.status(500).json({ message: 'Erreur lors de la finalisation de la séance' });
    }
  });

  // === GESTION DES SÉANCES FAVORITES ===
  
  // GET /api/patient-sessions/favorites - Récupérer les séances favorites d'un patient
  app.get('/api/patient-sessions/favorites', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const favoriteSessions = await storage.getFavoriteSessions(userId);
      res.json(favoriteSessions);
    } catch (error: any) {
      console.error('Error fetching favorite sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances favorites' });
    }
  });

  // POST /api/patient-sessions/favorites - Ajouter une séance favorite
  app.post('/api/patient-sessions/favorites', requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const { sessionId, customName, customizedData } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID requis' });
      }

      const favoriteSession = await storage.addFavoriteSession({
        userId,
        sessionId,
        customName,
        customizedData
      });

      res.json(favoriteSession);
    } catch (error: any) {
      console.error('Error adding favorite session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout de la séance favorite' });
    }
  });

  // DELETE /api/patient-sessions/favorites/:id - Supprimer une séance favorite
  app.delete('/api/patient-sessions/favorites/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user!.id;

      const success = await storage.deleteFavoriteSession(id, userId);

      if (!success) {
        return res.status(404).json({ message: 'Séance favorite non trouvée ou accès refusé' });
      }

      res.json({ message: 'Séance favorite supprimée avec succès' });
    } catch (error: any) {
      console.error('Error deleting favorite session:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la séance favorite' });
    }
  });

  // === GESTION DES EXERCICES AVANCÉS ===
  
  // PUT /api/exercises/:id - Mettre à jour un exercice (admin)
  app.put('/api/exercises/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const exerciseData = {
        ...req.body,
        tags: Array.isArray(req.body.tags) ? req.body.tags : []
      };
      
      const exercise = await storage.updateExercise(id, exerciseData);
      
      if (!exercise) {
        return res.status(404).json({ message: 'Exercice non trouvé' });
      }
      
      res.json(exercise);
    } catch (error: any) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'exercice' });
    }
  });

  // === DASHBOARD ADMINISTRATEUR ===
  
  // GET /api/admin/dashboard - Statistiques pour le dashboard admin
  app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
    try {
      const dashboardData = await storage.getAdminDashboardData();
      res.json(dashboardData);
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des données du dashboard' });
    }
  });

  // GET /api/admin/patients - Liste des patients avec leurs séances
  app.get('/api/admin/patients', requireAdmin, async (req, res) => {
    try {
      const patients = await storage.getPatientsWithSessions();
      res.json(patients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
    }
  });

  // GET /api/admin/patient-sessions - Liste de toutes les séances assignées aux patients
  app.get('/api/admin/patient-sessions', requireAdmin, async (req, res) => {
    try {
      const patientSessions = await storage.getAllPatientSessions();
      res.json(patientSessions);
    } catch (error: any) {
      console.error('Error fetching admin patient sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances patients' });
    }
  });

  // DELETE /api/exercises/:id - Supprimer un exercice (admin)
  app.delete('/api/exercises/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExercise(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Exercice non trouvé' });
      }

      res.json({ message: 'Exercice supprimé avec succès' });
    } catch (error: any) {
      console.error('Error deleting exercise:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice' });
    }
  });

  // === ROUTES DES CONTENUS ÉDUCATIFS ===

  // GET /api/educational-contents - Liste des contenus éducatifs avec filtres
  app.get('/api/educational-contents', requireAuth, async (req, res) => {
    try {
      const { 
        category,
        categoryId, 
        type, 
        difficulty, 
        status, 
        search, 
        tags, 
        recommended,
        limit = 50, 
        offset = 0 
      } = req.query;

      const filters = {
        categoryId: (categoryId || category) as string,
        type: type as string,
        difficulty: difficulty as string,
        status: status as string,
        search: search as string,
        tags: tags ? (tags as string).split(',') : undefined,
        isRecommended: recommended === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const contents = await storage.getEducationalContents(filters);
      res.json(contents);
    } catch (error: any) {
      console.error('Error fetching educational contents:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des contenus éducatifs' });
    }
  });

  // GET /api/educational-contents/:id - Récupérer un contenu éducatif spécifique
  app.get('/api/educational-contents/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getEducationalContentById(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Contenu non trouvé' });
      }

      // Enregistrer la vue si l'utilisateur n'est pas admin
      if (req.session.user!.role !== 'admin') {
        await storage.recordContentInteraction({
          userId: req.session.user!.id,
          contentId: id,
          interactionType: 'view'
        });
      }
      
      res.json(content);
    } catch (error: any) {
      console.error('Error fetching educational content:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du contenu' });
    }
  });

  // POST /api/educational-contents - Créer un contenu éducatif (admin)
  app.post('/api/educational-contents', requireAdmin, async (req, res) => {
    try {
      const { 
        title, 
        description, 
        type, 
        categoryId, 
        tags, 
        mediaUrl, 
        mediaType,
        content, 
        difficulty, 
        estimatedReadTime,
        status,
        isRecommended,
        thumbnailUrl
      } = req.body;

      console.log('📝 Creating educational content:', { title, type, category: categoryId });

      // Validation des champs requis
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ message: 'Titre requis et non vide' });
      }

      if (!type || !['text', 'video', 'audio', 'pdf', 'image'].includes(type)) {
        return res.status(400).json({ message: 'Type de contenu invalide' });
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Contenu requis et non vide' });
      }

      const contentData = {
        title: title.trim(),
        description: description?.trim() || null,
        type,
        categoryId: categoryId?.trim() || null,
        tags: Array.isArray(tags) ? [...tags] : [],
        mediaUrl: mediaUrl?.trim() || null,
        mediaType: mediaType || null,
        content: content.trim(),
        difficulty: difficulty || 'easy',
        estimatedReadTime: estimatedReadTime ? parseInt(estimatedReadTime) : null,
        status: status || 'draft',
        isRecommended: Boolean(isRecommended),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        authorId: req.session.user!.id,
        publishedAt: status === 'published' ? new Date() : null
      };

      const newContent = await storage.createEducationalContent(contentData);
      console.log('✅ Educational content created:', newContent.id);
      
      res.json(newContent);
    } catch (error: any) {
      console.error('❌ Error creating educational content:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la création du contenu' 
      });
    }
  });

  // PUT /api/educational-contents/:id - Mettre à jour un contenu éducatif (admin)
  app.put('/api/educational-contents/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Si on publie le contenu, ajouter la date de publication
      if (updateData.status === 'published' && req.body.status !== 'published') {
        updateData.publishedAt = new Date();
      }

      const content = await storage.updateEducationalContent(id, updateData);
      
      if (!content) {
        return res.status(404).json({ message: 'Contenu non trouvé' });
      }
      
      res.json(content);
    } catch (error: any) {
      console.error('Error updating educational content:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du contenu' });
    }
  });

  // DELETE /api/educational-contents/:id - Supprimer un contenu éducatif (admin)
  app.delete('/api/educational-contents/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEducationalContent(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Contenu non trouvé' });
      }

      res.json({ message: 'Contenu supprimé avec succès' });
    } catch (error: any) {
      console.error('Error deleting educational content:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du contenu' });
    }
  });

  // === ROUTES DES CATÉGORIES DE CONTENU ===

  // GET /api/content-categories - Liste des catégories de contenu
  app.get('/api/content-categories', requireAuth, async (req, res) => {
    try {
      const categories = await storage.getContentCategories();
      res.json(categories);
    } catch (error: any) {
      console.error('Error fetching content categories:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
  });

  // POST /api/content-categories - Créer une catégorie de contenu (admin)
  app.post('/api/content-categories', requireAdmin, async (req, res) => {
    try {
      const { name, description, color, icon, order } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Nom de catégorie requis' });
      }

      const categoryData = {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || 'blue',
        icon: icon || null,
        order: order ? parseInt(order) : 0
      };

      const category = await storage.createContentCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      console.error('Error creating content category:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
    }
  });

  // PUT /api/content-categories/:id - Mettre à jour une catégorie (admin)
  app.put('/api/content-categories/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateContentCategory(id, req.body);
      
      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error('Error updating content category:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie' });
    }
  });

  // DELETE /api/content-categories/:id - Supprimer une catégorie (admin)
  app.delete('/api/content-categories/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContentCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (error: any) {
      console.error('Error deleting content category:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie' });
    }
  });

  // === ROUTES DES TAGS DE CONTENU ===

  // GET /api/content-tags - Liste des tags de contenu
  app.get('/api/content-tags', requireAuth, async (req, res) => {
    try {
      const tags = await storage.getContentTags();
      res.json(tags);
    } catch (error: any) {
      console.error('Error fetching content tags:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des tags' });
    }
  });

  // POST /api/content-tags - Créer un tag de contenu (admin)
  app.post('/api/content-tags', requireAdmin, async (req, res) => {
    try {
      const { name, description, color } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Nom de tag requis' });
      }

      const tagData = {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || 'gray'
      };

      const tag = await storage.createContentTag(tagData);
      res.json(tag);
    } catch (error: any) {
      console.error('Error creating content tag:', error);
      res.status(500).json({ message: 'Erreur lors de la création du tag' });
    }
  });

  // === ROUTES DES INTERACTIONS UTILISATEUR ===

  // POST /api/educational-contents/:id/like - Liker un contenu
  app.post('/api/educational-contents/:id/like', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.recordContentInteraction({
        userId: req.session.user!.id,
        contentId: id,
        interactionType: 'like'
      });

      res.json({ message: 'Contenu liké avec succès' });
    } catch (error: any) {
      console.error('Error liking content:', error);
      res.status(500).json({ message: 'Erreur lors du like' });
    }
  });

  // POST /api/educational-contents/:id/bookmark - Marquer un contenu comme favori
  app.post('/api/educational-contents/:id/bookmark', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.recordContentInteraction({
        userId: req.session.user!.id,
        contentId: id,
        interactionType: 'bookmark'
      });

      res.json({ message: 'Contenu ajouté aux favoris' });
    } catch (error: any) {
      console.error('Error bookmarking content:', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout aux favoris' });
    }
  });

  // POST /api/educational-contents/:id/complete - Marquer un contenu comme terminé
  app.post('/api/educational-contents/:id/complete', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { duration, progress } = req.body;
      
      await storage.recordContentInteraction({
        userId: req.session.user!.id,
        contentId: id,
        interactionType: 'complete',
        duration: duration ? parseInt(duration) : undefined,
        progress: progress ? parseInt(progress) : 100
      });

      res.json({ message: 'Contenu marqué comme terminé' });
    } catch (error: any) {
      console.error('Error completing content:', error);
      res.status(500).json({ message: 'Erreur lors de la completion' });
    }
  });

  // GET /api/user-content-interactions - Récupérer les interactions de l'utilisateur
  app.get('/api/user-content-interactions', requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const interactions = await storage.getUserContentInteractions(
        req.session.user!.id,
        type as string
      );
      res.json(interactions);
    } catch (error: any) {
      console.error('Error fetching user interactions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des interactions' });
    }
  });

  console.log('✅ All routes registered successfully');
}