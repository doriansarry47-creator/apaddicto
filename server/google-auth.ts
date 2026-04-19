import { Application, Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage.js';

/**
 * Détermine l'URL de base de l'application de façon dynamique.
 * Priorité : variable d'env BASE_URL > en-têtes de la requête > localhost
 */
function getBaseUrl(req?: Request): string {
  // 1. Variable d'environnement explicite (configurée dans Vercel dashboard)
  if (process.env.BASE_URL && !process.env.BASE_URL.includes('localhost')) {
    return process.env.BASE_URL;
  }

  // 2. Déduction depuis la requête entrante (fonctionne sur tous les domaines Vercel)
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    if (host) {
      return `${proto}://${host}`;
    }
  }

  // 3. Fallback développement local
  return process.env.BASE_URL || 'http://localhost:5000';
}

export function registerGoogleAuthRoutes(app: Application) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  // If Google credentials not configured, skip
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing). Skipping Google auth routes.');
    
    // Return placeholder routes that return helpful error
    app.get('/api/auth/google', (_req, res) => {
      res.redirect('/?error=google_not_configured');
    });
    app.get('/api/auth/google/callback', (_req, res) => {
      res.redirect('/?error=google_not_configured');
    });
    return;
  }

  // Configure Passport Google Strategy with dynamic callbackURL
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        // callbackURL dynamique : lu depuis la requête au moment de l'auth
        callbackURL: '/api/auth/google/callback',
        // Permet à passport-google de construire l'URL complète depuis la requête
        proxy: true,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const firstName = profile.name?.givenName;
          const lastName = profile.name?.familyName;
          const profileImageUrl = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('Impossible de récupérer l\'email depuis Google'), undefined);
          }

          // Check if user exists by Google ID
          let user = await storage.getUserByGoogleId(googleId);

          if (!user) {
            // Check if user exists by email (link accounts)
            const existingByEmail = await storage.getUserByEmail(email);
            if (existingByEmail) {
              // Link Google to existing account
              await storage.linkGoogleAccount(existingByEmail.id, googleId, profileImageUrl);
              user = await storage.getUser(existingByEmail.id);
            } else {
              // Create new user with Google
              user = await storage.createGoogleUser({
                email,
                firstName,
                lastName,
                googleId,
                profileImageUrl,
              });
            }
          }

          if (!user) {
            return done(new Error('Erreur lors de la création du compte'), undefined);
          }

          // Update last login
          await storage.updateUserLastLogin(user.id);

          const authUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };

          return done(null, authUser);
        } catch (error) {
          console.error('[GOOGLE AUTH] Error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Initialize passport
  app.use(passport.initialize());

  // Google OAuth initiation
  app.get(
    '/api/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  );

  // Google OAuth callback
  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/login?error=google_failed',
    }),
    (req: any, res) => {
      // Store user in session (same as normal login)
      const user = req.user;
      if (!user) {
        return res.redirect('/login?error=google_failed');
      }

      req.session.user = user;
      req.session.save((err: any) => {
        if (err) {
          console.error('[GOOGLE AUTH] Session save error:', err);
          return res.redirect('/login?error=session_error');
        }
        console.log('✅ Google login successful for:', user.email);
        res.redirect('/');
      });
    }
  );

  console.log('✅ Google OAuth routes registered');
}
