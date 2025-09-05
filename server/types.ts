// server/types.ts - Type definitions for the application
declare global {
  namespace Express {
    interface Request {
      session: {
        user?: {
          id: string;
          email: string;
          firstName?: string;
          lastName?: string;
          role: string;
        };
        destroy: (callback: (err: any) => void) => void;
      };
    }
  }
}

export {};