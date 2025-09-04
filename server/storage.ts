import { 
  type User, 
  type InsertUser,
  type Craving,
  type InsertCraving,
  type Exercise,
  type InsertExercise,
  type ExerciseSession,
  type InsertExerciseSession,
  type JournalEntry,
  type InsertJournalEntry,
  type UserSettings,
  type InsertUserSettings,
  type TherapistPatient,
  type InsertTherapistPatient,
  users,
  cravings,
  exercises,
  exerciseSessions,
  journalEntries,
  userSettings,
  therapistPatients,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cravings
  getCravings(userId: string, limit?: number): Promise<Craving[]>;
  createCraving(craving: InsertCraving): Promise<Craving>;
  getCravingStats(userId: string, days: number): Promise<{ date: string; count: number; avgIntensity: number }[]>;

  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  getEmergencyExercises(): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Exercise Sessions
  getExerciseSessions(userId: string, limit?: number): Promise<ExerciseSession[]>;
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getUserStats(userId: string, days: number): Promise<{ 
    totalSessions: number; 
    totalMinutes: number; 
    completedSessions: number;
    dailyActivity: { date: string; sessions: number; minutes: number }[];
  }>;

  // Journal
  getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  // Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Therapist-Patient Relations
  getPatientsByTherapist(therapistId: string): Promise<User[]>;
  getTherapistByPatient(patientId: string): Promise<User | undefined>;
  assignPatientToTherapist(data: InsertTherapistPatient): Promise<TherapistPatient>;
  
  // Admin/Therapist views
  getPatientCravings(patientId: string, therapistId: string, limit?: number): Promise<Craving[]>;
  getPatientSessions(patientId: string, therapistId: string, limit?: number): Promise<ExerciseSession[]>;
  getPatientStats(patientId: string, therapistId: string, days: number): Promise<{
    totalSessions: number;
    totalMinutes: number;
    completedSessions: number;
    totalCravings: number;
    avgIntensity: number;
    dailyActivity: { date: string; sessions: number; minutes: number; cravings: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {

  constructor() {
    // Initialize database with default data if needed
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Wait a bit for database to be ready
      setTimeout(async () => {
        try {
          // Seed exercises if they don't exist
          const existingExercises = await db.select().from(exercises).limit(1);
          if (existingExercises.length === 0) {
            await this.seedExercises();
          }

          // Create default users if they don't exist
          const existingUsers = await db.select().from(users).limit(1);
          if (existingUsers.length === 0) {
            await this.seedDefaultUsers();
          }
          console.log('Database initialized successfully');
        } catch (error) {
          console.error('Database initialization error:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Database initialization setup error:', error);
    }
  }

  private async seedDefaultUsers() {
    // Create default patient
    const [defaultPatient] = await db.insert(users).values({
      id: "default-user",
      username: "patient",
      email: "patient@example.com",
      role: "patient",
    }).returning();

    // Create default therapist
    const [defaultTherapist] = await db.insert(users).values({
      id: "default-therapist", 
      username: "therapeute",
      email: "therapeute@example.com",
      role: "therapist",
    }).returning();

    // Create default admin
    const [defaultAdmin] = await db.insert(users).values({
      id: "default-admin",
      username: "admin", 
      email: "admin@example.com",
      role: "admin",
    }).returning();

    // Assign patient to therapist
    await db.insert(therapistPatients).values({
      therapistId: defaultTherapist.id,
      patientId: defaultPatient.id,
    });

    // Create default settings for patient
    await db.insert(userSettings).values({
      userId: defaultPatient.id,
      reminderEnabled: true,
      reminderTimes: ["09:00", "14:00", "19:00"],
      language: "fr",
      theme: "light",
    });
  }

  private async seedExercises() {
    const defaultExercises = [
      {
        id: "breathing-478",
        name: "Respiration 4-7-8",
        description: "Technique de respiration pour réduire l'anxiété et les cravings",
        type: "breathing",
        difficulty: "beginner",
        duration: 3,
        instructions: [
          { step: 1, text: "Asseyez-vous confortablement", duration: 10 },
          { step: 2, text: "Inspirez par le nez pendant 4 secondes", duration: 4 },
          { step: 3, text: "Retenez votre souffle pendant 7 secondes", duration: 7 },
          { step: 4, text: "Expirez par la bouche pendant 8 secondes", duration: 8 },
          { step: 5, text: "Répétez le cycle", duration: 0 }
        ],
        isEmergency: true,
        icon: "wind",
        color: "#A8D5BA",
      },
      {
        id: "squats-energetic",
        name: "Squats énergiques",
        description: "Exercice physique pour libérer les tensions et détourner l'attention",
        type: "physical",
        difficulty: "intermediate",
        duration: 5,
        instructions: [
          { step: 1, text: "Tenez-vous debout, pieds écartés", duration: 10 },
          { step: 2, text: "Descendez en position de squat", duration: 2 },
          { step: 3, text: "Remontez énergiquement", duration: 1 },
          { step: 4, text: "Répétez 15 fois", duration: 45 },
          { step: 5, text: "Pause de 30 secondes", duration: 30 },
          { step: 6, text: "2 séries supplémentaires", duration: 120 }
        ],
        isEmergency: true,
        icon: "dumbbell",
        color: "#F4A261",
      },
      {
        id: "mindful-walking",
        name: "Marche consciente",
        description: "Méditation en mouvement pour se reconnecter au moment présent",
        type: "meditation",
        difficulty: "beginner",
        duration: 10,
        instructions: [
          { step: 1, text: "Trouvez un espace pour marcher lentement", duration: 30 },
          { step: 2, text: "Concentrez-vous sur vos pas", duration: 120 },
          { step: 3, text: "Observez votre respiration", duration: 120 },
          { step: 4, text: "Remarquez votre environnement", duration: 120 },
          { step: 5, text: "Continuez en pleine conscience", duration: 210 }
        ],
        isEmergency: false,
        icon: "spa",
        color: "#4A90A4",
      },
      {
        id: "progressive-relaxation",
        name: "Relaxation progressive",
        description: "Détente musculaire pour réduire le stress et les tensions",
        type: "stretching",
        difficulty: "beginner",
        duration: 8,
        instructions: [
          { step: 1, text: "Allongez-vous confortablement", duration: 30 },
          { step: 2, text: "Tendez puis relâchez vos pieds", duration: 60 },
          { step: 3, text: "Tendez puis relâchez vos jambes", duration: 60 },
          { step: 4, text: "Tendez puis relâchez votre torse", duration: 60 },
          { step: 5, text: "Tendez puis relâchez vos bras", duration: 60 },
          { step: 6, text: "Tendez puis relâchez votre visage", duration: 60 },
          { step: 7, text: "Restez détendu quelques minutes", duration: 150 }
        ],
        isEmergency: false,
        icon: "leaf",
        color: "#7DB46C",
      }
    ];

    await db.insert(exercises).values(defaultExercises);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Cravings
  async getCravings(userId: string, limit = 50): Promise<Craving[]> {
    return await db.select()
      .from(cravings)
      .where(eq(cravings.userId, userId))
      .orderBy(desc(cravings.timestamp))
      .limit(limit);
  }

  async createCraving(insertCraving: InsertCraving): Promise<Craving> {
    const [craving] = await db.insert(cravings).values(insertCraving).returning();
    return craving;
  }

  async getCravingStats(userId: string, days: number): Promise<{ date: string; count: number; avgIntensity: number }[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const results = await db.select({
      date: sql<string>`DATE(${cravings.timestamp})`,
      count: sql<number>`COUNT(*)`,
      avgIntensity: sql<number>`ROUND(AVG(${cravings.intensity}), 1)`
    })
    .from(cravings)
    .where(and(
      eq(cravings.userId, userId),
      gte(cravings.timestamp, cutoffDate)
    ))
    .groupBy(sql`DATE(${cravings.timestamp})`)
    .orderBy(sql`DATE(${cravings.timestamp})`);

    return results;
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise;
  }

  async getEmergencyExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises).where(eq(exercises.isEmergency, true));
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db.insert(exercises).values(insertExercise).returning();
    return exercise;
  }

  // Exercise Sessions
  async getExerciseSessions(userId: string, limit = 50): Promise<ExerciseSession[]> {
    return await db.select()
      .from(exerciseSessions)
      .where(eq(exerciseSessions.userId, userId))
      .orderBy(desc(exerciseSessions.timestamp))
      .limit(limit);
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const [session] = await db.insert(exerciseSessions).values(insertSession).returning();
    return session;
  }

  async getUserStats(userId: string, days: number): Promise<{ 
    totalSessions: number; 
    totalMinutes: number; 
    completedSessions: number;
    dailyActivity: { date: string; sessions: number; minutes: number }[];
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const sessions = await db.select()
      .from(exerciseSessions)
      .where(and(
        eq(exerciseSessions.userId, userId),
        gte(exerciseSessions.timestamp, cutoffDate)
      ));

    const dailyActivity = await db.select({
      date: sql<string>`DATE(${exerciseSessions.timestamp})`,
      sessions: sql<number>`COUNT(*)`,
      minutes: sql<number>`SUM(${exerciseSessions.duration})`
    })
    .from(exerciseSessions)
    .where(and(
      eq(exerciseSessions.userId, userId),
      gte(exerciseSessions.timestamp, cutoffDate)
    ))
    .groupBy(sql`DATE(${exerciseSessions.timestamp})`)
    .orderBy(sql`DATE(${exerciseSessions.timestamp})`);

    return {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, session) => sum + session.duration, 0),
      completedSessions: sessions.filter(session => session.completed).length,
      dailyActivity: dailyActivity
    };
  }

  // Journal
  async getJournalEntries(userId: string, limit = 50): Promise<JournalEntry[]> {
    return await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.timestamp))
      .limit(limit);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    return entry;
  }

  // Settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async updateUserSettings(userId: string, settingsData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [updated] = await db.insert(userSettings)
      .values({ userId, ...settingsData })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: settingsData
      })
      .returning();
    return updated;
  }

  // Therapist-Patient Relations
  async getPatientsByTherapist(therapistId: string): Promise<User[]> {
    const patients = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(therapistPatients)
    .innerJoin(users, eq(therapistPatients.patientId, users.id))
    .where(eq(therapistPatients.therapistId, therapistId));
    
    return patients;
  }

  async getTherapistByPatient(patientId: string): Promise<User | undefined> {
    const [result] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(therapistPatients)
    .innerJoin(users, eq(therapistPatients.therapistId, users.id))
    .where(eq(therapistPatients.patientId, patientId));
    
    return result;
  }

  async assignPatientToTherapist(data: InsertTherapistPatient): Promise<TherapistPatient> {
    const [assignment] = await db.insert(therapistPatients).values(data).returning();
    return assignment;
  }

  // Admin/Therapist views
  async getPatientCravings(patientId: string, therapistId: string, limit = 50): Promise<Craving[]> {
    // Verify therapist has access to this patient
    const relation = await db.select()
      .from(therapistPatients)
      .where(and(
        eq(therapistPatients.therapistId, therapistId),
        eq(therapistPatients.patientId, patientId)
      ));
    
    if (relation.length === 0) {
      throw new Error('Unauthorized access to patient data');
    }

    return await db.select()
      .from(cravings)
      .where(eq(cravings.userId, patientId))
      .orderBy(desc(cravings.timestamp))
      .limit(limit);
  }

  async getPatientSessions(patientId: string, therapistId: string, limit = 50): Promise<ExerciseSession[]> {
    // Verify therapist has access to this patient
    const relation = await db.select()
      .from(therapistPatients)
      .where(and(
        eq(therapistPatients.therapistId, therapistId),
        eq(therapistPatients.patientId, patientId)
      ));
    
    if (relation.length === 0) {
      throw new Error('Unauthorized access to patient data');
    }

    return await db.select()
      .from(exerciseSessions)
      .where(eq(exerciseSessions.userId, patientId))
      .orderBy(desc(exerciseSessions.timestamp))
      .limit(limit);
  }

  async getPatientStats(patientId: string, therapistId: string, days: number): Promise<{
    totalSessions: number;
    totalMinutes: number;
    completedSessions: number;
    totalCravings: number;
    avgIntensity: number;
    dailyActivity: { date: string; sessions: number; minutes: number; cravings: number }[];
  }> {
    // Verify therapist has access to this patient
    const relation = await db.select()
      .from(therapistPatients)
      .where(and(
        eq(therapistPatients.therapistId, therapistId),
        eq(therapistPatients.patientId, patientId)
      ));
    
    if (relation.length === 0) {
      throw new Error('Unauthorized access to patient data');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get sessions
    const sessions = await db.select()
      .from(exerciseSessions)
      .where(and(
        eq(exerciseSessions.userId, patientId),
        gte(exerciseSessions.timestamp, cutoffDate)
      ));

    // Get cravings
    const patientCravings = await db.select()
      .from(cravings)
      .where(and(
        eq(cravings.userId, patientId),
        gte(cravings.timestamp, cutoffDate)
      ));

    // Get daily activity
    const dailyActivity = await db.select({
      date: sql<string>`DATE(${exerciseSessions.timestamp})`,
      sessions: sql<number>`COUNT(${exerciseSessions.id})`,
      minutes: sql<number>`SUM(${exerciseSessions.duration})`,
      cravings: sql<number>`(
        SELECT COUNT(*) 
        FROM ${cravings} 
        WHERE ${cravings.userId} = ${patientId} 
        AND DATE(${cravings.timestamp}) = DATE(${exerciseSessions.timestamp})
      )`
    })
    .from(exerciseSessions)
    .where(and(
      eq(exerciseSessions.userId, patientId),
      gte(exerciseSessions.timestamp, cutoffDate)
    ))
    .groupBy(sql`DATE(${exerciseSessions.timestamp})`)
    .orderBy(sql`DATE(${exerciseSessions.timestamp})`);

    return {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, session) => sum + session.duration, 0),
      completedSessions: sessions.filter(session => session.completed).length,
      totalCravings: patientCravings.length,
      avgIntensity: patientCravings.length > 0 
        ? Math.round((patientCravings.reduce((sum, craving) => sum + craving.intensity, 0) / patientCravings.length) * 10) / 10
        : 0,
      dailyActivity: dailyActivity
    };
  }
}

export const storage = new DatabaseStorage();
