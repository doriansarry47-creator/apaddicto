import { eq, desc, count, avg, and, sql, or } from 'drizzle-orm';
import { getDB } from './db.js';
import type { 
  User, 
  InsertUser, 
  Exercise,
  InsertExercise,
  PsychoEducationContent,
  InsertPsychoEducationContent,
  CravingEntry,
  InsertCravingEntry,
  ExerciseSession,
  InsertExerciseSession,
  BeckAnalysis,
  InsertBeckAnalysis,
  AntiCravingStrategy,
  InsertAntiCravingStrategy,
  UserStats,
  EmergencyRoutine,
  InsertEmergencyRoutine,
  CustomSession,
  InsertCustomSession,
  PatientSession,
  InsertPatientSession,
  EducationalContent,
  InsertEducationalContent,
  ContentCategory,
  InsertContentCategory,
  ContentTag,
  InsertContentTag,
  ContentInteraction,
  InsertContentInteraction
} from '../shared/schema.js';
import { 
  users, 
  exercises,
  psychoEducationContent,
  cravingEntries,
  exerciseSessions,
  beckAnalyses,
  antiCravingStrategies,
  userStats,
  userBadges,
  emergencyRoutines,
  customSessions,
  sessionElements,
  patientSessions,
  favoriteSessions,
  educationalContents,
  contentCategories,
  contentTags,
  contentInteractions
} from '../shared/schema.js';

class Storage {
  private db = getDB();

  // === USERS ===
  async getUserByEmail(email: string): Promise<User | null> {
    console.log('[STORAGE] Looking for user with email:', email);
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log('[STORAGE] Found:', result.length > 0 ? result[0].email : 'none');
    return result[0] || null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }

  async getUser(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  // Alias pour la compatibilité
  async getUserById(id: string): Promise<User | null> {
    return this.getUser(id);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const result = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const result = await this.db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isActive: users.isActive,
      level: users.level,
      points: users.points,
      profileImageUrl: users.profileImageUrl,
      lastLoginAt: users.lastLoginAt,
      inactivityThreshold: users.inactivityThreshold,
      notes: users.notes,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);
    return result;
  }

  async getAllUsersWithStats(): Promise<Omit<User, 'password'>[]> {
    // Pour l'instant, retourner la même chose que getAllUsers
    // Peut être étendu plus tard pour inclure des statistiques
    return this.getAllUsers();
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // === EXERCISES ===
  async getAllExercises(): Promise<Exercise[]> {
    const result = await this.db
      .select()
      .from(exercises)
      .where(eq(exercises.isActive, true))
      .orderBy(desc(exercises.createdAt));
    return result;
  }

  async createExercise(exerciseData: InsertExercise): Promise<Exercise> {
    try {
      console.log('💾 Creating exercise in storage with data:', exerciseData);
      
      // Validation supplémentaire côté storage
      if (!exerciseData.title || !exerciseData.description) {
        throw new Error('Titre et description requis pour créer un exercice');
      }

      const insertData = {
        ...exerciseData,
        tags: exerciseData.tags ? Array.from(exerciseData.tags as string[]) : [],
      };
      const result = await this.db.insert(exercises).values(insertData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion de l\'exercice');
      }
      
      console.log('✅ Exercise created in storage successfully:', result[0].id);
      return result[0];
    } catch (error: any) {
      console.error('❌ Error in storage createExercise:', error);
      throw new Error(`Erreur lors de la création de l'exercice: ${error.message}`);
    }
  }

  async getExercise(id: string): Promise<Exercise | null> {
    const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return result[0] || null;
  }

  // Alias pour la compatibilité
  async getExerciseById(id: string): Promise<Exercise | null> {
    return this.getExercise(id);
  }

  async getRelaxationExercises(): Promise<Exercise[]> {
    const result = await this.db
      .select()
      .from(exercises)
      .where(and(
        eq(exercises.isActive, true),
        eq(exercises.category, 'relaxation')
      ))
      .orderBy(desc(exercises.createdAt));
    return result;
  }

  // === PSYCHO EDUCATION CONTENT ===
  async getAllPsychoEducationContent(): Promise<PsychoEducationContent[]> {
    const result = await this.db
      .select()
      .from(psychoEducationContent)
      .where(eq(psychoEducationContent.isActive, true))
      .orderBy(desc(psychoEducationContent.createdAt));
    return result;
  }

  async createPsychoEducationContent(contentData: InsertPsychoEducationContent): Promise<PsychoEducationContent> {
    const result = await this.db.insert(psychoEducationContent).values(contentData).returning();
    return result[0];
  }

  async updatePsychoEducationContent(id: string, updateData: Partial<InsertPsychoEducationContent>): Promise<PsychoEducationContent | null> {
    try {
      const result = await this.db
        .update(psychoEducationContent)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(psychoEducationContent.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating psycho-education content:', error);
      throw error;
    }
  }

  async deletePsychoEducationContent(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(psychoEducationContent)
        .where(eq(psychoEducationContent.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting psycho-education content:', error);
      throw error;
    }
  }

  // === CRAVING ENTRIES ===
  async createCravingEntry(cravingData: InsertCravingEntry): Promise<CravingEntry> {
    try {
      console.log('💾 Creating craving entry:', cravingData);
      
      const insertData: InsertCravingEntry = {
        userId: cravingData.userId,
        intensity: cravingData.intensity,
        triggers: Array.isArray(cravingData.triggers) ? (cravingData.triggers as string[]) : [],
        emotions: Array.isArray(cravingData.emotions) ? (cravingData.emotions as string[]) : [],
        notes: cravingData.notes
      };
      
      console.log('💾 Processed insert data:', insertData);
      
      const result = await this.db.insert(cravingEntries).values(insertData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion du craving');
      }
      
      console.log('✅ Craving entry created in database:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('❌ Database error creating craving entry:', error);
      throw new Error(`Erreur de base de données lors de la création du craving: ${error.message}`);
    }
  }

  async getCravingEntriesByUser(userId: string, limit?: number): Promise<CravingEntry[]> {
    const baseQuery = this.db
      .select()
      .from(cravingEntries)
      .where(eq(cravingEntries.userId, userId))
      .orderBy(desc(cravingEntries.createdAt));
    
    if (limit) {
      return await baseQuery.limit(limit);
    }
    
    return await baseQuery;
  }

  // === EXERCISE SESSIONS ===
  async createExerciseSession(sessionData: InsertExerciseSession): Promise<ExerciseSession> {
    const result = await this.db.insert(exerciseSessions).values(sessionData).returning();
    return result[0];
  }

  async getExerciseSessionsByUser(userId: string, limit?: number): Promise<ExerciseSession[]> {
    try {
      const baseQuery = this.db
        .select({
          id: exerciseSessions.id,
          userId: exerciseSessions.userId,
          exerciseId: exerciseSessions.exerciseId,
          duration: exerciseSessions.duration,
          completed: exerciseSessions.completed,
          cravingBefore: exerciseSessions.cravingBefore,
          cravingAfter: exerciseSessions.cravingAfter,
          notes: exerciseSessions.notes,
          createdAt: exerciseSessions.createdAt,
          updatedAt: exerciseSessions.updatedAt,
          // Ajout des informations de l'exercice (peut être null)
          exerciseTitle: exercises.title,
          exerciseCategory: exercises.category
        })
        .from(exerciseSessions)
        .leftJoin(exercises, eq(exerciseSessions.exerciseId, exercises.id))
        .where(eq(exerciseSessions.userId, userId))
        .orderBy(desc(exerciseSessions.createdAt));
      
      const result = limit ? await baseQuery.limit(limit) : await baseQuery;
      
      return result.map(session => ({
        ...session,
        exerciseTitle: session.exerciseTitle || session.exerciseId || 'Exercice',
        exerciseCategory: session.exerciseCategory || 'general'
      })) as ExerciseSession[];
    } catch (error) {
      console.error('Error in getExerciseSessionsByUser:', error);
      // Fallback : récupérer sans jointure
      const fallbackQuery = this.db
        .select()
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, userId))
        .orderBy(desc(exerciseSessions.createdAt));
      
      return limit ? await fallbackQuery.limit(limit) : await fallbackQuery;
    }
  }

  // === BECK ANALYSES ===
  async createBeckAnalysis(analysisData: InsertBeckAnalysis): Promise<BeckAnalysis> {
    try {
      console.log('💾 Creating Beck analysis:', analysisData);
      
      const result = await this.db.insert(beckAnalyses).values(analysisData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion de l\'analyse Beck');
      }
      
      console.log('✅ Beck analysis created in database:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('❌ Database error creating Beck analysis:', error);
      throw new Error(`Erreur de base de données lors de la création de l'analyse Beck: ${error.message}`);
    }
  }

  async getBeckAnalysesByUser(userId: string, limit?: number): Promise<BeckAnalysis[]> {
    const baseQuery = this.db
      .select()
      .from(beckAnalyses)
      .where(eq(beckAnalyses.userId, userId))
      .orderBy(desc(beckAnalyses.createdAt));
    
    if (limit) {
      return await baseQuery.limit(limit);
    }
    
    return await baseQuery;
  }

  // === ANTI-CRAVING STRATEGIES ===
  async createStrategy(strategyData: InsertAntiCravingStrategy): Promise<AntiCravingStrategy> {
    try {
      console.log('💾 Creating anti-craving strategy:', strategyData);
      
      const result = await this.db.insert(antiCravingStrategies).values(strategyData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion de la stratégie');
      }
      
      console.log('✅ Strategy created in database:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('❌ Database error creating strategy:', error);
      throw new Error(`Erreur de base de données lors de la création de la stratégie: ${error.message}`);
    }
  }

  async getStrategiesByUser(userId: string): Promise<AntiCravingStrategy[]> {
    const result = await this.db
      .select()
      .from(antiCravingStrategies)
      .where(eq(antiCravingStrategies.userId, userId))
      .orderBy(desc(antiCravingStrategies.createdAt));
    return result;
  }

  async updateStrategy(
    id: string, 
    userId: string, 
    data: Partial<InsertAntiCravingStrategy>
  ): Promise<AntiCravingStrategy | null> {
    const result = await this.db
      .update(antiCravingStrategies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(antiCravingStrategies.id, id),
        eq(antiCravingStrategies.userId, userId)
      ))
      .returning();
    return result[0] || null;
  }

  async deleteStrategy(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(antiCravingStrategies)
      .where(and(
        eq(antiCravingStrategies.id, id),
        eq(antiCravingStrategies.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // === USER STATS ===
  async getUserStats(userId: string): Promise<any> {
    try {
      // Récupérer les statistiques de base
      const userStatsResult = await this.db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

      // Calculs des dates pour les statistiques temporelles
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);

      // Récupérer les données additionnelles avec des calculs temporels améliorés
      const [
        totalCravings,
        totalExerciseSessions,
        totalBeckAnalyses,
        totalStrategies,
        avgCravingIntensity,
        todaysCravings,
        yesterdaysCravings,
        weeklyExercises,
        weeklyBeckAnalyses,
        weeklyStrategies,
        recentCravings,
        recentSessions,
        recentAnalyses,
        recentStrategies
      ] = await Promise.all([
        // Total de cravings
        this.db
          .select({ count: count() })
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, userId)),
        
        // Total de sessions d'exercices
        this.db
          .select({ count: count() })
          .from(exerciseSessions)
          .where(eq(exerciseSessions.userId, userId)),
        
        // Total d'analyses Beck
        this.db
          .select({ count: count() })
          .from(beckAnalyses)
          .where(eq(beckAnalyses.userId, userId)),
        
        // Total de stratégies
        this.db
          .select({ count: count() })
          .from(antiCravingStrategies)
          .where(eq(antiCravingStrategies.userId, userId)),
        
        // Intensité moyenne des cravings (tous)
        this.db
          .select({ avg: avg(cravingEntries.intensity) })
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, userId)),

        // Cravings d'aujourd'hui (moyenne d'intensité)
        this.db
          .select({ avg: avg(cravingEntries.intensity), count: count() })
          .from(cravingEntries)
          .where(
            and(
              eq(cravingEntries.userId, userId),
              sql`${cravingEntries.createdAt} >= ${todayStart}`
            )
          ),

        // Cravings d'hier (moyenne d'intensité pour comparaison)
        this.db
          .select({ avg: avg(cravingEntries.intensity) })
          .from(cravingEntries)
          .where(
            and(
              eq(cravingEntries.userId, userId),
              sql`${cravingEntries.createdAt} >= ${yesterdayStart}`,
              sql`${cravingEntries.createdAt} < ${todayStart}`
            )
          ),

        // Exercices de la semaine
        this.db
          .select({ count: count() })
          .from(exerciseSessions)
          .where(
            and(
              eq(exerciseSessions.userId, userId),
              sql`${exerciseSessions.createdAt} >= ${weekStart}`
            )
          ),

        // Analyses Beck de la semaine
        this.db
          .select({ count: count() })
          .from(beckAnalyses)
          .where(
            and(
              eq(beckAnalyses.userId, userId),
              sql`${beckAnalyses.createdAt} >= ${weekStart}`
            )
          ),

        // Stratégies de la semaine
        this.db
          .select({ count: count() })
          .from(antiCravingStrategies)
          .where(
            and(
              eq(antiCravingStrategies.userId, userId),
              sql`${antiCravingStrategies.createdAt} >= ${weekStart}`
            )
          ),
        
        // Cravings récents (7 derniers jours)
        this.db
          .select()
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, userId))
          .orderBy(desc(cravingEntries.createdAt))
          .limit(10),
        
        // Sessions récentes
        this.db
          .select()
          .from(exerciseSessions)
          .where(eq(exerciseSessions.userId, userId))
          .orderBy(desc(exerciseSessions.createdAt))
          .limit(10),
        
        // Analyses Beck récentes
        this.db
          .select()
          .from(beckAnalyses)
          .where(eq(beckAnalyses.userId, userId))
          .orderBy(desc(beckAnalyses.createdAt))
          .limit(5),
        
        // Stratégies récentes
        this.db
          .select()
          .from(antiCravingStrategies)
          .where(eq(antiCravingStrategies.userId, userId))
          .orderBy(desc(antiCravingStrategies.createdAt))
          .limit(5)
      ]);

      const stats = userStatsResult[0] || {
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCraving: 0,
        beckAnalysesCompleted: 0
      };

      // Calculs des statistiques améliorées
      const todayAvgCraving = Number(todaysCravings[0]?.avg || 0);
      const yesterdayAvgCraving = Number(yesterdaysCravings[0]?.avg || 0);
      const todaysCravingCount = Number(todaysCravings[0]?.count || 0);
      
      // Calcul de la tendance (comparaison aujourd'hui vs hier)
      let cravingTrend = 0;
      if (yesterdayAvgCraving > 0) {
        cravingTrend = ((todayAvgCraving - yesterdayAvgCraving) / yesterdayAvgCraving) * 100;
      }

      // Calcul des progrès de la semaine
      const weeklyProgress = {
        exercisesCompleted: weeklyExercises[0]?.count || 0,
        beckAnalysesCompleted: weeklyBeckAnalyses[0]?.count || 0,
        strategiesUsed: weeklyStrategies[0]?.count || 0,
        totalActivities: (weeklyExercises[0]?.count || 0) + (weeklyBeckAnalyses[0]?.count || 0) + (weeklyStrategies[0]?.count || 0)
      };

      return {
        ...stats,
        // Totaux généraux
        totalCravings: totalCravings[0]?.count || 0,
        totalExerciseSessions: totalExerciseSessions[0]?.count || 0,
        totalBeckAnalyses: totalBeckAnalyses[0]?.count || 0,
        totalStrategies: totalStrategies[0]?.count || 0,
        avgCravingIntensity: avgCravingIntensity[0]?.avg || 0,
        
        // Statistiques temporelles corrigées
        todayCravingLevel: Number(todayAvgCraving) || 0,
        todayCravingCount: todaysCravingCount,
        cravingTrend: Number(cravingTrend) || 0,
        
        // Progrès hebdomadaire détaillé
        weeklyProgress,
        
        // Données récentes
        recentData: {
          cravings: recentCravings,
          sessions: recentSessions,
          beckAnalyses: recentAnalyses,
          strategies: recentStrategies
        }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCraving: 0,
        beckAnalysesCompleted: 0,
        totalCravings: 0,
        totalExerciseSessions: 0,
        totalBeckAnalyses: 0,
        totalStrategies: 0,
        avgCravingIntensity: 0,
        todayCravingLevel: 0,
        todayCravingCount: 0,
        cravingTrend: 0,
        weeklyProgress: {
          exercisesCompleted: 0,
          beckAnalysesCompleted: 0,
          strategiesUsed: 0,
          totalActivities: 0
        },
        recentData: {
          cravings: [],
          sessions: [],
          beckAnalyses: [],
          strategies: []
        }
      };
    }
  }

  // === UTILITY METHODS ===
  async initializeUserStats(userId: string): Promise<UserStats> {
    const result = await this.db
      .insert(userStats)
      .values({
        userId,
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        beckAnalysesCompleted: 0
      })
      .onConflictDoNothing()
      .returning();
    
    if (result.length === 0) {
      // Si l'utilisateur a déjà des stats, les récupérer
      const existing = await this.db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);
      return existing[0];
    }
    
    return result[0];
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    await this.db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId));
  }

  // === DEBUGGING HELPERS ===
  async debugGetAllTables(): Promise<Record<string, any[]>> {
    try {
      const [
        allUsers,
        allExercises,
        allCravings,
        allSessions,
        allBeckAnalyses,
        allStrategies,
        allStats
      ] = await Promise.all([
        this.getAllUsers(),
        this.getAllExercises(),
        this.db.select().from(cravingEntries),
        this.db.select().from(exerciseSessions),
        this.db.select().from(beckAnalyses),
        this.db.select().from(antiCravingStrategies),
        this.db.select().from(userStats)
      ]);

      return {
        users: allUsers,
        exercises: allExercises,
        cravingEntries: allCravings,
        exerciseSessions: allSessions,
        beckAnalyses: allBeckAnalyses,
        strategies: allStrategies,
        userStats: allStats
      };
    } catch (error) {
      console.error('Error in debugGetAllTables:', error);
      return {};
    }
  }

  // === USER EMERGENCY ROUTINES ===
  async getEmergencyRoutines(userId: string) {
    try {
      // emergencyRoutines est une table globale, pas par utilisateur
      const result = await this.db
        .select()
        .from(emergencyRoutines)
        .where(eq(emergencyRoutines.isActive, true))
        .orderBy(desc(emergencyRoutines.updatedAt));
      return result;
    } catch (error) {
      console.error('Error fetching emergency routines:', error);
      return [];
    }
  }

  async getEmergencyRoutineById(routineId: string) {
    try {
      const result = await this.db
        .select()
        .from(emergencyRoutines)
        .where(eq(emergencyRoutines.id, routineId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching emergency routine by ID:', error);
      return null;
    }
  }

  async createEmergencyRoutine(routineData: InsertEmergencyRoutine) {
    try {
      const result = await this.db
        .insert(emergencyRoutines)
        .values({
          ...routineData,
          updatedAt: new Date(),
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating emergency routine:', error);
      throw new Error('Failed to create emergency routine');
    }
  }

  async updateEmergencyRoutine(routineId: string, updateData: Partial<InsertEmergencyRoutine>) {
    try {
      const result = await this.db
        .update(emergencyRoutines)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(emergencyRoutines.id, routineId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating emergency routine:', error);
      throw new Error('Failed to update emergency routine');
    }
  }

  async deleteEmergencyRoutine(routineId: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(emergencyRoutines)
        .where(eq(emergencyRoutines.id, routineId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting emergency routine:', error);
      return false;
    }
  }

  // === NOUVELLES MÉTHODES POUR LES FONCTIONNALITÉS AVANCÉES ===
  
  // === GESTION DES SÉANCES ===
  async getSessions(filters: {
    status?: string;
    tags?: string[];
    category?: string;
    userId: string;
    userRole: string;
  }) {
    try {
      const conditions: (SQL | undefined)[] = [];

      if (filters.userRole === 'patient') {
        conditions.push(eq(customSessions.status, 'published'));
      } else if (filters.userRole === 'admin' || filters.userRole === 'superadmin') {
        // Admins see all
      } else {
        conditions.push(
          or(
            eq(customSessions.status, 'published'),
            eq(customSessions.creatorId, filters.userId)
          )
        );
      }

      if (filters.status) {
        conditions.push(eq(customSessions.status, filters.status));
      }
      if (filters.category) {
        conditions.push(eq(customSessions.category, filters.category));
      }

      const query = this.db
        .select()
        .from(customSessions)
        .where(and(...conditions.filter((c): c is SQL => !!c)));

      const sessions = await query.orderBy(desc(customSessions.createdAt));
      
      // Récupérer les exercices pour chaque séance
      const sessionsWithExercises = await Promise.all(
        sessions.map(async (session) => {
          const elements = await this.db
            .select()
            .from(sessionElements)
            .where(eq(sessionElements.sessionId, session.id))
            .orderBy(sessionElements.order);
          
          return {
            ...session,
            exercises: elements,
            exerciseCount: elements.length
          };
        })
      );
      
      return sessionsWithExercises;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  async createSession(sessionData: any): Promise<CustomSession> {
    try {
      console.log('[DEBUG] Creating session with data:', JSON.stringify(sessionData, null, 2));
      
      // Extraire les exercices de la session
      const { exercises, blocks, ...sessionInfo } = sessionData;
      
      // Préparer les données de session avec validation
      const insertData = {
        title: sessionInfo.title || 'Sans titre',
        description: sessionInfo.description || '',
        category: sessionInfo.category || 'maintenance',
        difficulty: sessionInfo.difficulty || 'beginner',
        protocol: sessionInfo.protocol || 'standard',
        totalDuration: sessionInfo.totalDuration || 0,
        creatorId: sessionInfo.creatorId,
        status: sessionInfo.status || 'draft',
        tags: sessionInfo.tags ? (sessionInfo.tags as string[]) : [],
        protocolConfig: sessionInfo.protocolConfig || null,
        isPublic: sessionInfo.isPublic !== undefined ? sessionInfo.isPublic : false,
        imageUrl: sessionInfo.imageUrl || null,
        warmupVideo: sessionInfo.warmupVideo || null,
        cooldownNotes: sessionInfo.cooldownNotes || null,
      };
      
      console.log('[DEBUG] Insert data prepared:', insertData);
      
      // Créer la session
      const result = await this.db.insert(customSessions).values(insertData).returning();
      const createdSession = result[0];
      
      console.log('[DEBUG] Session created with ID:', createdSession.id);
      
      // Insérer les exercices si présents (format simple)
      if (exercises && Array.isArray(exercises) && exercises.length > 0) {
        console.log('[DEBUG] Processing', exercises.length, 'exercises');
        const sessionExercises = exercises.map((exercise: any, index: number) => ({
          sessionId: createdSession.id,
          exerciseId: exercise.exerciseId,
          variationId: exercise.variationId || null,
          order: exercise.order ?? index,
          duration: exercise.duration || 0,
          repetitions: exercise.repetitions || exercise.repetitionCount || 0,
          sets: exercise.sets || 1,
          restTime: exercise.restTime || 0,
          workTime: exercise.intervals?.work || exercise.workTime || null,
          restInterval: exercise.intervals?.rest || exercise.restInterval || null,
          timerSettings: exercise.intervals ? JSON.stringify(exercise.intervals) : null,
          notes: exercise.notes || null,
          isOptional: exercise.isOptional || false,
        }));
        
        console.log('[DEBUG] Inserting session exercises:', sessionExercises);
        await this.db.insert(sessionElements).values(sessionExercises);
        console.log('[DEBUG] Session exercises inserted successfully');
      }
      
      // Insérer les blocs si présents (format avancé avec protocoles)
      if (blocks && Array.isArray(blocks) && blocks.length > 0) {
        console.log('[DEBUG] Processing', blocks.length, 'blocks');
        let globalOrder = 0;
        for (const block of blocks) {
          if (block.exercises && Array.isArray(block.exercises)) {
            const blockExercises = block.exercises.map((exercise: any, index: number) => ({
              sessionId: createdSession.id,
              exerciseId: exercise.exerciseId,
              variationId: exercise.variationId || null,
              order: globalOrder++,
              duration: block.protocol?.workDuration || exercise.duration || 0,
              repetitions: block.protocol?.repsPerExercise || block.protocol?.repsPerMinute || 0,
              sets: block.protocol?.rounds || block.protocol?.cycles || 1,
              restTime: block.protocol?.restDuration || 0,
              workTime: block.protocol?.workDuration || null,
              restInterval: block.protocol?.restDuration || null,
              timerSettings: block.protocol ? JSON.stringify(block.protocol) : null,
              notes: block.notes || exercise.notes || null,
              isOptional: false,
            }));
            
            console.log('[DEBUG] Inserting block exercises:', blockExercises);
            await this.db.insert(sessionElements).values(blockExercises);
          }
        }
        console.log('[DEBUG] All blocks processed successfully');
      }
      
      console.log('[DEBUG] Session creation completed:', createdSession.id);
      return createdSession;
    } catch (error) {
      console.error('[ERROR] Error creating session:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('[ERROR] Error message:', error.message);
        console.error('[ERROR] Error stack:', error.stack);
      }
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: Partial<InsertCustomSession>): Promise<CustomSession | null> {
    try {
      const result = await this.db
        .update(customSessions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(customSessions.id, sessionId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async publishSession(sessionId: string, patientIds?: string[]): Promise<CustomSession | null> {
    try {
      // Mettre à jour le statut de la séance
      const session = await this.updateSession(sessionId, { status: 'published' });
      
      if (!session) return null;
      
      // Si des patients spécifiques sont sélectionnés, leur assigner la séance
      if (patientIds && patientIds.length > 0) {
        const assignments = patientIds.map(patientId => ({
          patientId,
          sessionId,
          status: 'assigned' as const
        }));
        
        await this.db.insert(patientSessions).values(assignments);
      }
      
      return session;
    } catch (error) {
      console.error('Error publishing session:', error);
      throw error;
    }
  }

  // === GESTION DES ASSIGNATIONS DE SÉANCES ===
  async getPatientSessions(patientId: string): Promise<any[]> {
    try {
      const sessions = await this.db
        .select({
          id: patientSessions.id,
          sessionId: patientSessions.sessionId,
          status: patientSessions.status,
          feedback: patientSessions.feedback,
          effort: patientSessions.effort,
          duration: patientSessions.duration,
          assignedAt: patientSessions.assignedAt,
          completedAt: patientSessions.completedAt,
          session: customSessions
        })
        .from(patientSessions)
        .leftJoin(customSessions, eq(patientSessions.sessionId, customSessions.id))
        .where(eq(patientSessions.patientId, patientId))
        .orderBy(desc(patientSessions.assignedAt));
      
      // Pour chaque séance, récupérer les éléments (exercices)
      const sessionsWithElements = await Promise.all(
        sessions.map(async (session) => {
          if (session.sessionId) {
            const elements = await this.db
              .select()
              .from(sessionElements)
              .where(eq(sessionElements.sessionId, session.sessionId))
              .orderBy(sessionElements.order);
            
            return {
              ...session,
              session: session.session ? {
                ...session.session,
                elements: elements
              } : null
            };
          }
          return session;
        })
      );
      
      return sessionsWithElements;
    } catch (error) {
      console.error('Error fetching patient sessions:', error);
      throw error;
    }
  }

  async completePatientSession(patientSessionId: string, data: {
    feedback?: string;
    effort?: number;
    duration?: number;
    userId: string;
  }): Promise<PatientSession | null> {
    try {
      // Vérifier que la séance appartient au patient
      const existing = await this.db
        .select()
        .from(patientSessions)
        .where(eq(patientSessions.id, patientSessionId))
        .limit(1);
      
      if (!existing[0] || existing[0].patientId !== data.userId) {
        return null;
      }
      
      const result = await this.db
        .update(patientSessions)
        .set({
          status: 'done',
          feedback: data.feedback,
          effort: data.effort,
          duration: data.duration,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(patientSessions.id, patientSessionId))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error completing patient session:', error);
      throw error;
    }
  }

  async getAllPatientSessions(): Promise<any[]> {
    try {
      const sessions = await this.db
        .select({
          id: patientSessions.id,
          patientId: patientSessions.patientId,
          sessionId: patientSessions.sessionId,
          status: patientSessions.status,
          feedback: patientSessions.feedback,
          effort: patientSessions.effort,
          duration: patientSessions.duration,
          assignedAt: patientSessions.assignedAt,
          completedAt: patientSessions.completedAt,
          session: customSessions,
          // Informations du patient
          patient: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(patientSessions)
        .leftJoin(customSessions, eq(patientSessions.sessionId, customSessions.id))
        .leftJoin(users, eq(patientSessions.patientId, users.id))
        .orderBy(desc(patientSessions.assignedAt));
      
      return sessions;
    } catch (error) {
      console.error('Error fetching all patient sessions:', error);
      throw error;
    }
  }

  async deleteExercise(exerciseId: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(exercises)
        .where(eq(exercises.id, exerciseId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return false;
    }
  }

  async updateExercise(exerciseId: string, updates: Partial<InsertExercise>): Promise<Exercise | null> {
    try {
      const result = await this.db
        .update(exercises)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(exercises.id, exerciseId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  // === GESTION DES SÉANCES FAVORITES ===

  async getFavoriteSessions(userId: string): Promise<any[]> {
    try {
      const favorites = await this.db
        .select({
          id: favoriteSessions.id,
          userId: favoriteSessions.userId,
          sessionId: favoriteSessions.sessionId,
          customName: favoriteSessions.customName,
          customizedData: favoriteSessions.customizedData,
          createdAt: favoriteSessions.createdAt,
          session: customSessions
        })
        .from(favoriteSessions)
        .leftJoin(customSessions, eq(favoriteSessions.sessionId, customSessions.id))
        .where(eq(favoriteSessions.userId, userId))
        .orderBy(desc(favoriteSessions.createdAt));

      // Retourner les données avec customizedData si disponible, sinon session originale
      return favorites.map(fav => {
        if (fav.customizedData) {
          return {
            ...fav.customizedData,
            id: fav.id,
            title: fav.customName || fav.customizedData.title || fav.session?.title,
            isFavorite: true,
            customizedFrom: fav.sessionId
          };
        }
        return {
          ...fav.session,
          id: fav.id,
          title: fav.customName || fav.session?.title,
          isFavorite: true,
          customizedFrom: fav.sessionId
        };
      });
    } catch (error) {
      console.error('Error fetching favorite sessions:', error);
      throw error;
    }
  }

  async addFavoriteSession(data: {
    userId: string;
    sessionId: string;
    customName?: string;
    customizedData?: any;
  }): Promise<any> {
    try {
      const result = await this.db
        .insert(favoriteSessions)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          sessionId: data.sessionId,
          customName: data.customName,
          customizedData: data.customizedData,
          createdAt: new Date()
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error adding favorite session:', error);
      throw error;
    }
  }

  async deleteFavoriteSession(favoriteId: string, userId: string): Promise<boolean> {
    try {
      // Vérifier que la séance favorite appartient à l'utilisateur
      const existing = await this.db
        .select()
        .from(favoriteSessions)
        .where(eq(favoriteSessions.id, favoriteId))
        .limit(1);

      if (!existing[0] || existing[0].userId !== userId) {
        return false;
      }

      const result = await this.db
        .delete(favoriteSessions)
        .where(eq(favoriteSessions.id, favoriteId))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error deleting favorite session:', error);
      return false;
    }
  }

  // === DASHBOARD ADMINISTRATEUR ===
  async getAdminDashboardData() {
    try {
      // Récupérer les statistiques générales
      const totalPatients = await this.db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, 'patient'));
      
      const totalSessions = await this.db
        .select({ count: count() })
        .from(customSessions);
      
      const totalExercises = await this.db
        .select({ count: count() })
        .from(exercises)
        .where(eq(exercises.isActive, true));
      
      const completedSessions = await this.db
        .select({ count: count() })
        .from(patientSessions)
        .where(eq(patientSessions.status, 'done'));
      
      return {
        totalPatients: totalPatients[0]?.count || 0,
        totalSessions: totalSessions[0]?.count || 0,
        totalExercises: totalExercises[0]?.count || 0,
        completedSessions: completedSessions[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  }

  async getPatientsWithSessions() {
    try {
      const patients = await this.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.role, 'patient'))
        .orderBy(desc(users.createdAt));
      
      // Pour chaque patient, récupérer ses séances
      const patientsWithSessions = await Promise.all(
        patients.map(async (patient) => {
          const sessions = await this.getPatientSessions(patient.id);
          return {
            ...patient,
            sessions
          };
        })
      );
      
      return patientsWithSessions;
    } catch (error) {
      console.error('Error fetching patients with sessions:', error);
      throw error;
    }
  }

  // Les méthodes getAllUsersWithStats, getUserById et deleteUser sont déjà définies plus haut

  // === CONTENUS ÉDUCATIFS ===

  async getEducationalContents(filters: {
    categoryId?: string;
    type?: string;
    difficulty?: string;
    status?: string;
    search?: string;
    tags?: string[];
    isRecommended?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      let query = this.db.select().from(educationalContents);
      
      const conditions: any[] = [eq(educationalContents.isActive, true)];
      
      if (filters.categoryId) {
        conditions.push(eq(educationalContents.categoryId, filters.categoryId));
      }
      
      if (filters.type) {
        conditions.push(eq(educationalContents.type, filters.type));
      }
      
      if (filters.difficulty) {
        conditions.push(eq(educationalContents.difficulty, filters.difficulty));
      }
      
      if (filters.status) {
        conditions.push(eq(educationalContents.status, filters.status));
      }
      
      if (filters.isRecommended !== undefined) {
        conditions.push(eq(educationalContents.isRecommended, filters.isRecommended));
      }
      
      if (filters.search) {
        conditions.push(
          sql`(${educationalContents.title} ILIKE ${`%${filters.search}%`} OR ${educationalContents.description} ILIKE ${`%${filters.search}%`})`
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query.orderBy(desc(educationalContents.createdAt));
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching educational contents:', error);
      throw error;
    }
  }

  async getEducationalContentById(id: string): Promise<EducationalContent | null> {
    try {
      const result = await this.db
        .select()
        .from(educationalContents)
        .where(and(eq(educationalContents.id, id), eq(educationalContents.isActive, true)))
        .limit(1);
      
      if (result.length > 0) {
        // Incrémenter le compteur de vues
        await this.db
          .update(educationalContents)
          .set({ 
            viewCount: sql`${educationalContents.viewCount} + 1`
          })
          .where(eq(educationalContents.id, id));
      }
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching educational content by id:', error);
      throw error;
    }
  }

  async createEducationalContent(data: InsertEducationalContent): Promise<EducationalContent> {
    try {
      const result = await this.db.insert(educationalContents).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating educational content:', error);
      throw error;
    }
  }

  async updateEducationalContent(id: string, data: Partial<InsertEducationalContent>): Promise<EducationalContent | null> {
    try {
      // Récupérer le contenu existant
      const existingContent = await this.db
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.id, id))
        .limit(1);
      
      if (!existingContent || existingContent.length === 0) {
        console.error('Educational content not found for update:', id);
        return null;
      }

      // Fusionner les données sans écraser les champs non fournis
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      // S'assurer que les tags sont correctement formattés
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags.filter((tag: string) => tag && tag.trim().length > 0);
      }

      const result = await this.db
        .update(educationalContents)
        .set(updateData)
        .where(eq(educationalContents.id, id))
        .returning();
      
      console.log('✅ Educational content updated successfully:', id);
      return result[0] || null;
    } catch (error) {
      console.error('❌ Error updating educational content:', error);
      throw error;
    }
  }

  async deleteEducationalContent(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .update(educationalContents)
        .set({ isActive: false })
        .where(eq(educationalContents.id, id));
      
      return true; // Assume success if no error is thrown
    } catch (error) {
      console.error('Error deleting educational content:', error);
      throw error;
    }
  }

  // === CATÉGORIES DE CONTENU ===

  async getContentCategories() {
    try {
      return await this.db
        .select()
        .from(contentCategories)
        .where(eq(contentCategories.isActive, true))
        .orderBy(contentCategories.order, contentCategories.name);
    } catch (error) {
      console.error('Error fetching content categories:', error);
      throw error;
    }
  }

  async createContentCategory(data: InsertContentCategory): Promise<ContentCategory> {
    try {
      const result = await this.db.insert(contentCategories).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating content category:', error);
      throw error;
    }
  }

  async updateContentCategory(id: string, data: Partial<InsertContentCategory>): Promise<ContentCategory | null> {
    try {
      const result = await this.db
        .update(contentCategories)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(contentCategories.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating content category:', error);
      throw error;
    }
  }

  async deleteContentCategory(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .update(contentCategories)
        .set({ isActive: false })
        .where(eq(contentCategories.id, id));
      
      return true; // Assume success if no error is thrown
    } catch (error) {
      console.error('Error deleting content category:', error);
      throw error;
    }
  }

  // === TAGS DE CONTENU ===

  async getContentTags() {
    try {
      return await this.db
        .select()
        .from(contentTags)
        .where(eq(contentTags.isActive, true))
        .orderBy(desc(contentTags.usageCount), contentTags.name);
    } catch (error) {
      console.error('Error fetching content tags:', error);
      throw error;
    }
  }

  async createContentTag(data: InsertContentTag): Promise<ContentTag> {
    try {
      const result = await this.db.insert(contentTags).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating content tag:', error);
      throw error;
    }
  }

  // === INTERACTIONS UTILISATEUR ===

  async recordContentInteraction(data: InsertContentInteraction): Promise<ContentInteraction> {
    try {
      const result = await this.db.insert(contentInteractions).values(data).returning();
      
      // Mettre à jour les compteurs selon le type d'interaction
      if (data.interactionType === 'like') {
        await this.db
          .update(educationalContents)
          .set({ 
            likeCount: sql`${educationalContents.likeCount} + 1`
          })
          .where(eq(educationalContents.id, data.contentId));
      }
      
      return result[0];
    } catch (error) {
      console.error('Error recording content interaction:', error);
      throw error;
    }
  }

  async getUserContentInteractions(userId: string, interactionType?: string) {
    try {
      let query = this.db
        .select()
        .from(contentInteractions)
        .where(eq(contentInteractions.userId, userId));
      
      if (interactionType) {
        query = query.where(
          and(
            eq(contentInteractions.userId, userId),
            eq(contentInteractions.interactionType, interactionType)
          )
        );
      }
      
      return await query.orderBy(desc(contentInteractions.createdAt));
    } catch (error) {
      console.error('Error fetching user content interactions:', error);
      throw error;
    }
  }

  // === STATISTIQUES ADMINISTRATEUR ===
  
  async getAdminStats(): Promise<{
    totalPatients: number;
    activePatients: number;
    totalExercises: number;
    totalSessions: number;
    totalCravings: number;
    totalContent: number;
    recentActivity: {
      newUsers: number;
      completedSessions: number;
      cravingEntries: number;
    };
  }> {
    try {
      // Compter les patients totaux et actifs
      const [totalPatientsResult] = await this.db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, 'patient'));

      const [activePatientsResult] = await this.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.role, 'patient'),
            eq(users.isActive, true)
          )
        );

      // Compter les exercices
      const [totalExercisesResult] = await this.db
        .select({ count: count() })
        .from(exercises);

      // Compter les sessions d'exercice
      const [totalSessionsResult] = await this.db
        .select({ count: count() })
        .from(exerciseSessions);

      // Compter les entrées de craving
      const [totalCravingsResult] = await this.db
        .select({ count: count() })
        .from(cravingEntries);

      // Compter le contenu éducatif
      const [totalContentResult] = await this.db
        .select({ count: count() })
        .from(educationalContents)
        .where(eq(educationalContents.isActive, true));

      // Statistiques de la dernière semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [newUsersResult] = await this.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.role, 'patient'),
            sql`${users.createdAt} >= ${oneWeekAgo.toISOString()}`
          )
        );

      const [recentSessionsResult] = await this.db
        .select({ count: count() })
        .from(exerciseSessions)
        .where(sql`${exerciseSessions.completedAt} >= ${oneWeekAgo.toISOString()}`);

      const [recentCravingsResult] = await this.db
        .select({ count: count() })
        .from(cravingEntries)
        .where(sql`${cravingEntries.timestamp} >= ${oneWeekAgo.toISOString()}`);

      return {
        totalPatients: totalPatientsResult?.count || 0,
        activePatients: activePatientsResult?.count || 0,
        totalExercises: totalExercisesResult?.count || 0,
        totalSessions: totalSessionsResult?.count || 0,
        totalCravings: totalCravingsResult?.count || 0,
        totalContent: totalContentResult?.count || 0,
        recentActivity: {
          newUsers: newUsersResult?.count || 0,
          completedSessions: recentSessionsResult?.count || 0,
          cravingEntries: recentCravingsResult?.count || 0,
        }
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
}

export const storage = new Storage();