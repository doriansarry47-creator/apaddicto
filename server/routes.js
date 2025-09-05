// server/routes.js - Minimal routes for API functionality
import express from 'express';

export function registerRoutes(app) {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Apaddicto API is running'
    });
  });

  // Test database connection
  app.get('/api/test-db', async (req, res) => {
    try {
      // Basic response for now
      res.json({ 
        status: 'connected',
        message: 'Database connection test successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed',
        error: error.message 
      });
    }
  });

  // Basic auth endpoints placeholder
  app.get('/api/auth/me', (req, res) => {
    res.json({ user: null, authenticated: false });
  });

  // Basic exercises endpoint placeholder  
  app.get('/api/exercises', (req, res) => {
    res.json({ exercises: [], message: 'Exercises endpoint available' });
  });

  // Basic psycho-education endpoint placeholder
  app.get('/api/psycho-education', (req, res) => {
    res.json({ content: [], message: 'Psycho-education endpoint available' });
  });

  // Catch all API endpoint
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  });
}