// server/auth.ts - Authentication service
import { type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from './schema.ts';
import { getDB } from './db.ts';
import './types.ts'; // Import session types

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getUserByEmail(email: string) {
    const db = getDB();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  static async createUser(userData: any) {
    const db = getDB();
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  static async getUserById(id: string) {
    const db = getDB();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }
}

// Auth middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  
  next();
}