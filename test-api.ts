// test-api.ts - Test our new API infrastructure
import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import { registerRoutes } from './server/routes.ts';

const app = express();
const port = 3001;

// Set up the same middleware as the serverless function
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session for testing
const MemoryStore = memorystore(session);
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    secret: process.env.SESSION_SECRET || 'test-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for local testing
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
    },
  }),
);

// Register our API routes
registerRoutes(app);

// Start the test server
app.listen(port, '0.0.0.0', () => {
  console.log(`🧪 Test API server is running on http://0.0.0.0:${port}`);
  console.log(`📊 Health check: http://0.0.0.0:${port}/health`);
  console.log(`🔍 Database test: http://0.0.0.0:${port}/api/test-db`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/auth/register - Register a new user');
  console.log('  POST /api/auth/login - Login');
  console.log('  POST /api/auth/logout - Logout');
  console.log('  GET  /api/auth/me - Get current user');
  console.log('  GET  /api/exercises - Get exercises (auth required)');
  console.log('  GET  /api/cravings - Get cravings (auth required)');
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');  
  process.exit(0);
});