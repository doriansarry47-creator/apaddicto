// App.tsx - Configuration du routeur principal
import { Route, Switch, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import des pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ExercisesPage from "./pages/ExercisesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Hook pour l'authentification
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Routes publiques */}
      <Route path="/login">
        {user ? <Redirect to="/dashboard" /> : <LoginPage />}
      </Route>
      
      <Route path="/register">
        {user ? <Redirect to="/dashboard" /> : <RegisterPage />}
      </Route>

      {/* Routes protégées - AJOUTÉES POUR CORRIGER LE 404 */}
      <Route path="/dashboard">
        {!user ? <Redirect to="/login" /> : <DashboardPage />}
      </Route>

      <Route path="/home">
        {!user ? <Redirect to="/login" /> : <HomePage />}
      </Route>

      <Route path="/exercises">
        {!user ? <Redirect to="/login" /> : <ExercisesPage />}
      </Route>

      <Route path="/profile">
        {!user ? <Redirect to="/login" /> : <ProfilePage />}
      </Route>

      {/* Route racine - CORRECTION IMPORTANTE */}
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>

      {/* Route 404 - doit être en dernier */}
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </QueryClientProvider>
  );
}
