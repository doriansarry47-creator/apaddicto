# Guide d'Administration - Apaddicto

## Nouvelles Fonctionnalités Administrateur

Cette mise à jour ajoute des fonctionnalités complètes de gestion des patients pour les administrateurs, avec suivi d'inactivité et gestion améliorée des erreurs de connexion.

## 🔧 Améliorations de la Gestion des Erreurs

### Connexion à la Base de Données
- **Logique de retry** : 3 tentatives automatiques avec délais de 2 secondes
- **Timeout de connexion** : 2 secondes par tentative
- **Pool de connexions** : Jusqu'à 20 connexions simultanées
- **Gestion gracieuse** : L'application continue même si certaines opérations échouent

### Exemple d'utilisation :
```javascript
// Toutes les opérations de base de données utilisent maintenant executeWithRetry
const result = await executeWithRetry(async () => {
  return await db.select().from(users).where(eq(users.email, email));
});
```

## 📊 Suivi d'Inactivité des Patients

### Champ last_activity
- Automatiquement mis à jour lors de la connexion
- Mis à jour sur tous les appels API (middleware trackActivity)
- Stocké dans la base de données pour persistance

### Calcul d'inactivité
- Calcul automatique du nombre de jours d'inactivité
- Disponible dans tous les endpoints d'administration

## 🛡️ Endpoints d'Administration

### 1. Liste de Tous les Patients
```
GET /api/admin/patients
Authorization: Session avec role='admin'
```

**Réponse :**
```json
{
  "patients": [
    {
      "id": "uuid",
      "email": "patient@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "lastActivity": "2024-01-15T14:30:00Z",
      "daysInactive": 5
    }
  ]
}
```

### 2. Patients Inactifs
```
GET /api/admin/patients/inactive/:days
Authorization: Session avec role='admin'
```

**Exemple :**
```bash
# Patients inactifs depuis plus de 30 jours
GET /api/admin/patients/inactive/30
```

**Réponse :**
```json
{
  "inactivePatients": [...],
  "criteria": "Inactifs depuis plus de 30 jours"
}
```

### 3. Désactiver un Patient
```
PUT /api/admin/patients/:id/deactivate
Authorization: Session avec role='admin'
```

**Réponse :**
```json
{
  "message": "Compte patient désactivé avec succès",
  "patient": {
    "id": "uuid",
    "email": "patient@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

### 4. Supprimer un Patient
```
DELETE /api/admin/patients/:id
Authorization: Session avec role='admin'
```

**Note :** Supprime également toutes les données associées :
- Sessions d'exercices (exercise_sessions)
- Entrées de cravings (craving_entries)
- Compte utilisateur

**Réponse :**
```json
{
  "message": "Compte patient supprimé avec succès",
  "patient": {
    "email": "patient@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

## 🔐 Sécurité

### Protection des Endpoints
- Tous les endpoints admin sont protégés par `requireAdmin`
- Vérification automatique du rôle utilisateur
- Session requise pour tous les appels

### Middleware d'Activité
- Suivi automatique sur tous les appels API
- Mise à jour silencieuse (n'affecte pas la réponse si elle échoue)
- Exclusion des endpoints système (/api/test-db, /api/init-db)

## 📝 Logs et Monitoring

### Logs d'Administration
```
👤 Patient account deactivated by admin: patient@example.com
🗑️ Patient account deleted by admin: patient@example.com
```

### Logs d'Erreur
```
❌ Database initialization attempt 1 failed: Connection timeout
❌ Error fetching patients: Database operation failed after 2 attempts
```

## 🚀 Utilisation Pratique

### Créer un Compte Administrateur
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apaddicto.com",
    "password": "motdepassefort",
    "firstName": "Admin",
    "lastName": "System",
    "role": "admin"
  }'
```

### Se Connecter en tant qu'Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@apaddicto.com",
    "password": "motdepassefort"
  }'
```

### Lister les Patients Inactifs
```bash
# Avec la session admin
curl -X GET http://localhost:3000/api/admin/patients/inactive/30 \
  -H "Cookie: connect.sid=SESSION_ID"
```

## 🔄 Migration de Base de Données

L'application met automatiquement à jour la base de données :

1. Ajoute la colonne `last_activity` si elle n'existe pas
2. Initialise les valeurs à la date actuelle
3. Pas de migration manuelle requise

## ⚠️ Considérations

### Performance
- Les requêtes d'inactivité utilisent des index sur `last_activity`
- Le suivi d'activité est optimisé pour minimiser l'impact
- Pool de connexions configuré pour la charge

### Sécurité
- Toujours vérifier le rôle avant les opérations admin
- Logs complets pour l'audit
- Suppression en cascade pour éviter les données orphelines

### Disponibilité
- Retry automatique sur les échecs de connexion
- Dégradation gracieuse si le suivi d'activité échoue
- Timeouts appropriés pour éviter les blocages