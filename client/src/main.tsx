// client/src/main.tsx - Minimal React entry point
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Apaddicto - Activité Physique Adaptée</h1>
      <p>Application de thérapie sportive en cours de développement.</p>
      <p>Les API endpoints sont disponibles:</p>
      <ul>
        <li>POST /api/auth/register - Inscription</li>
        <li>POST /api/auth/login - Connexion</li>
        <li>GET /api/exercises - Exercices (authentification requise)</li>
        <li>GET /api/cravings - Suivi des envies (authentification requise)</li>
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);