import { eq, desc, count, avg, and, sql } from 'drizzle-orm';
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
  UserEmergencyRoutine,
  InsertUserEmergencyRoutine,
  ExerciseVariation,
  InsertExerciseVariation,
  CustomSession,
  InsertCustomSession,
  SessionElement,
  InsertSessionElement,
  SessionInstance,
  InsertSessionInstance
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
  userEmergencyRoutines,
  exerciseVariations,
  customSessions,
  sessionElements,
  sessionInstances
} from '../shared/schema.js';

class Storage {
  private db = getDB();

  // === USERS ===
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
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
    const result = await this.db.insert(exercises).values(exerciseData).returning();
    return result[0];
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

  // === CRAVING ENTRIES ===
  async createCravingEntry(cravingData: InsertCravingEntry): Promise<CravingEntry> {
    try {
      console.log('💾 Creating craving entry:', cravingData);
      
      const result = await this.db.insert(cravingEntries).values({
        userId: cravingData.userId,
        intensity: cravingData.intensity,
        triggers: cravingData.triggers || [],
        emotions: cravingData.emotions || [],
        notes: cravingData.notes
      }).returning();
      
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
      const todayAvgCraving = Number(todaysCravings[0]?.avg) || 0;
      const yesterdayAvgCraving = Number(yesterdaysCravings[0]?.avg) || 0;
      const todaysCravingCount = Number(todaysCravings[0]?.count) || 0;
      
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
      const result = await this.db
        .select()
        .from(userEmergencyRoutines)
        .where(eq(userEmergencyRoutines.userId, userId))
        .orderBy(desc(userEmergencyRoutines.updatedAt));
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
        .from(userEmergencyRoutines)
        .where(eq(userEmergencyRoutines.id, routineId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching emergency routine by ID:', error);
      return null;
    }
  }

  async createEmergencyRoutine(routineData: InsertUserEmergencyRoutine) {
    try {
      const result = await this.db
        .insert(userEmergencyRoutines)
        .values({
          ...routineData,
          updatedAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating emergency routine:', error);
      throw new Error('Failed to create emergency routine');
    }
  }

  async updateEmergencyRoutine(routineId: string, updateData: Partial<InsertUserEmergencyRoutine>) {
    try {
      const result = await this.db
        .update(userEmergencyRoutines)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(userEmergencyRoutines.id, routineId))
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
        .delete(userEmergencyRoutines)
        .where(eq(userEmergencyRoutines.id, routineId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting emergency routine:', error);
      return false;
    }
  }

  // Les méthodes getAllUsersWithStats, getUserById et deleteUser sont déjà définies plus haut

  // === EXERCISE VARIATIONS ===
  async getExerciseVariations(exerciseId: string) {
    try {
      const result = await this.db
        .select()
        .from(exerciseVariations)
        .where(and(
          eq(exerciseVariations.exerciseId, exerciseId),
          eq(exerciseVariations.isActive, true)
        ))
        .orderBy(exerciseVariations.type, exerciseVariations.difficultyModifier);
      return result;
    } catch (error) {
      console.error('Error fetching exercise variations:', error);
      throw new Error('Failed to fetch exercise variations');
    }
  }

  async createExerciseVariation(variationData: any) {
    try {
      const result = await this.db
        .insert(exerciseVariations)
        .values({
          ...variationData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating exercise variation:', error);
      throw new Error('Failed to create exercise variation');
    }
  }

  // === CUSTOM SESSIONS ===
  async getCustomSessions(userId: string) {
    try {
      const result = await this.db
        .select()
        .from(customSessions)
        .where(
          and(
            eq(customSessions.isActive, true),
            sql`(${customSessions.isPublic} = true OR ${customSessions.creatorId} = ${userId})`
          )
        )
        .orderBy(desc(customSessions.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching custom sessions:', error);
      throw new Error('Failed to fetch custom sessions');
    }
  }

  async getCustomSessionById(sessionId: string) {
    try {
      const result = await this.db
        .select()
        .from(customSessions)
        .where(eq(customSessions.id, sessionId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching custom session:', error);
      throw new Error('Failed to fetch custom session');
    }
  }

  async createCustomSession(sessionData: any) {
    try {
      // Extraire les exercices pour les traiter séparément
      const { exercises, ...sessionOnly } = sessionData;
      
      const result = await this.db
        .insert(customSessions)
        .values({
          ...sessionOnly,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating custom session:', error);
      throw new Error('Failed to create custom session');
    }
  }

  async updateCustomSession(sessionId: string, updateData: any) {
    try {
      // Extraire les exercices pour les traiter séparément
      const { exercises, ...sessionOnly } = updateData;
      
      const result = await this.db
        .update(customSessions)
        .set({
          ...sessionOnly,
          updatedAt: new Date()
        })
        .where(eq(customSessions.id, sessionId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating custom session:', error);
      throw new Error('Failed to update custom session');
    }
  }

  async deleteCustomSession(sessionId: string): Promise<boolean> {
    try {
      // D'abord supprimer les éléments de la séance
      await this.deleteSessionElements(sessionId);
      
      // Puis supprimer la séance elle-même
      const result = await this.db
        .delete(customSessions)
        .where(eq(customSessions.id, sessionId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting custom session:', error);
      return false;
    }
  }

  // === SESSION ELEMENTS ===
  async getSessionElements(sessionId: string) {
    try {
      const result = await this.db
        .select()
        .from(sessionElements)
        .where(eq(sessionElements.sessionId, sessionId))
        .orderBy(sessionElements.order);
      return result;
    } catch (error) {
      console.error('Error fetching session elements:', error);
      throw new Error('Failed to fetch session elements');
    }
  }

  async createSessionElement(elementData: any) {
    try {
      const result = await this.db
        .insert(sessionElements)
        .values({
          ...elementData,
          createdAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating session element:', error);
      throw new Error('Failed to create session element');
    }
  }

  async deleteSessionElements(sessionId: string): Promise<boolean> {
    try {
      await this.db
        .delete(sessionElements)
        .where(eq(sessionElements.sessionId, sessionId));
      return true;
    } catch (error) {
      console.error('Error deleting session elements:', error);
      return false;
    }
  }

  // === SESSION INSTANCES ===
  async createSessionInstance(instanceData: any) {
    try {
      const result = await this.db
        .insert(sessionInstances)
        .values({
          ...instanceData,
          createdAt: new Date()
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating session instance:', error);
      throw new Error('Failed to create session instance');
    }
  }

  async getSessionInstanceById(instanceId: string) {
    try {
      const result = await this.db
        .select()
        .from(sessionInstances)
        .where(eq(sessionInstances.id, instanceId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching session instance:', error);
      throw new Error('Failed to fetch session instance');
    }
  }

  async updateSessionInstance(instanceId: string, updateData: any) {
    try {
      const result = await this.db
        .update(sessionInstances)
        .set(updateData)
        .where(eq(sessionInstances.id, instanceId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating session instance:', error);
      throw new Error('Failed to update session instance');
    }
  }

  async getSessionInstancesByUser(userId: string, limit?: number) {
    try {
      let query = this.db
        .select()
        .from(sessionInstances)
        .where(eq(sessionInstances.userId, userId))
        .orderBy(desc(sessionInstances.createdAt));
      
      if (limit) {
        query = query.limit(limit);
      }

      const result = await query;
      return result;
    } catch (error) {
      console.error('Error fetching session instances by user:', error);
      throw new Error('Failed to fetch session instances');
    }
  }
}

export const storage = new Storage();