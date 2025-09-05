// server/index.ts - Server entry point for local development
import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import { registerRoutes } from './routes.ts';

const app = express();
const port = process.env.PORT || 3000;

// Set up the same middleware as the serverless function
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const MemoryStore = memorystore(session);
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    },
  }),
);

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
  });
  
  next();
});

// Register API routes
registerRoutes(app);

// Serve static files from dist/public
app.use(express.static('dist/public'));

// Catch all for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist/public' });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(err);
  res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`🚀 Apaddicto server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔍 Database test: http://localhost:${port}/api/test-db`);
});