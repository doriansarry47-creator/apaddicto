import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCravingSchema, 
  insertExerciseSessionSchema, 
  insertJournalEntrySchema,
  insertUserSettingsSchema,
  insertTherapistPatientSchema
} from "@shared/schema";
import { z } from "zod";

const DEFAULT_USER_ID = "default-user"; // For demo purposes

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Cravings routes
  app.get("/api/cravings", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const cravings = await storage.getCravings(DEFAULT_USER_ID, limit);
      res.json(cravings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cravings" });
    }
  });

  app.post("/api/cravings", async (req, res) => {
    try {
      const data = insertCravingSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const craving = await storage.createCraving(data);
      res.json(craving);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid craving data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create craving" });
      }
    }
  });

  app.get("/api/cravings/stats", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const stats = await storage.getCravingStats(DEFAULT_USER_ID, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch craving stats" });
    }
  });

  // Exercises routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/emergency", async (req, res) => {
    try {
      const exercises = await storage.getEmergencyExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Exercise Sessions routes
  app.get("/api/exercise-sessions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getExerciseSessions(DEFAULT_USER_ID, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise sessions" });
    }
  });

  app.post("/api/exercise-sessions", async (req, res) => {
    try {
      const data = insertExerciseSessionSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const session = await storage.createExerciseSession(data);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create exercise session" });
      }
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const stats = await storage.getUserStats(DEFAULT_USER_ID, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Journal routes
  app.get("/api/journal", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getJournalEntries(DEFAULT_USER_ID, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const data = insertJournalEntrySchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const entry = await storage.createJournalEntry(data);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid journal entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create journal entry" });
      }
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(DEFAULT_USER_ID);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const data = insertUserSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateUserSettings(DEFAULT_USER_ID, data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // Admin/Therapist endpoints
  app.get("/api/admin/patients", async (req, res) => {
    try {
      const therapistId = "default-therapist"; // In real app, get from authentication
      const patients = await storage.getPatientsByTherapist(therapistId);
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/admin/patients/:patientId/cravings", async (req, res) => {
    try {
      const { patientId } = req.params;
      const { limit = "50" } = req.query;
      const therapistId = "default-therapist";
      
      const cravings = await storage.getPatientCravings(patientId, therapistId, parseInt(limit as string));
      res.json(cravings);
    } catch (error) {
      console.error("Error fetching patient cravings:", error);
      res.status(500).json({ message: "Failed to fetch patient cravings" });
    }
  });

  app.get("/api/admin/patients/:patientId/sessions", async (req, res) => {
    try {
      const { patientId } = req.params;
      const { limit = "50" } = req.query;
      const therapistId = "default-therapist";
      
      const sessions = await storage.getPatientSessions(patientId, therapistId, parseInt(limit as string));
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching patient sessions:", error);
      res.status(500).json({ message: "Failed to fetch patient sessions" });
    }
  });

  app.get("/api/admin/patients/:patientId/stats", async (req, res) => {
    try {
      const { patientId } = req.params;
      const { days = "30" } = req.query;
      const therapistId = "default-therapist";
      
      const stats = await storage.getPatientStats(patientId, therapistId, parseInt(days as string));
      res.json(stats);
    } catch (error) {
      console.error("Error fetching patient stats:", error);
      res.status(500).json({ message: "Failed to fetch patient stats" });
    }
  });

  app.post("/api/admin/assign-patient", async (req, res) => {
    try {
      const data = insertTherapistPatientSchema.parse(req.body);
      const assignment = await storage.assignPatientToTherapist(data);
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning patient:", error);
      res.status(500).json({ message: "Failed to assign patient" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
