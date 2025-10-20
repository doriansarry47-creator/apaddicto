import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminRoute } from "@/components/admin-route";
import { ThemeProvider } from "@/hooks/use-theme";

// Page Imports
import Dashboard from "@/pages/dashboard";
import Exercises from "@/pages/exercises";
import LibraryExercises from "@/pages/library-exercises";
import ExerciseDetail from "@/pages/exercise-detail";
// Note: Pages supprimées - fonctionnalités intégrées dans /exercises
// import TherapeuticExercises from "@/pages/therapeutic-exercises";
// import RelaxationExercises from "@/pages/relaxation-exercises";
import Tracking from "@/pages/tracking";
import Education from "@/pages/education";
import Library from "@/pages/library";
import ContentReader from "@/pages/content-reader";
import SessionDetail from "@/pages/session-detail";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// New Dedicated Pages
import CravingEntryPage from "@/pages/craving-entry-page";
import BeckAnalysisPage from "@/pages/beck-analysis-page";
import StrategiesPage from "@/pages/strategies-page";
import EmergencyRoutinePage from "@/pages/emergency-routine-page";
import BreathingExercisePage from "@/pages/breathing-exercise-page";
import SessionsPage from "@/pages/sessions-page";

// Admin Page Imports
import AdminDashboard from "@/pages/admin/dashboard";
import ManageExercisesSessions from "@/pages/admin/manage-exercises-sessions";
import ManageContent from "@/pages/admin/manage-content";
import ManageUsers from "@/pages/admin/manage-users";
import ManageMedia from "@/pages/admin/manage-media";
import ProfessionalReports from "@/pages/admin/professional-reports";
import AdminDebug from "@/pages/admin/debug";


function AppContent() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Login} />

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/exercises">
        <ProtectedRoute>
          <Exercises />
        </ProtectedRoute>
      </Route>
      <Route path="/exercise/:id">
        <ProtectedRoute>
          <ExerciseDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/tracking">
        <ProtectedRoute>
          <Tracking />
        </ProtectedRoute>
      </Route>
      {/* Redirections for old routes - functionality integrated into /exercises */}
      <Route path="/therapeutic-exercises">
        <ProtectedRoute>
          <Exercises />
        </ProtectedRoute>
      </Route>
      <Route path="/relaxation-exercises">
        <ProtectedRoute>
          <Exercises />
        </ProtectedRoute>
      </Route>
      <Route path="/education">
        <ProtectedRoute>
          <Education />
        </ProtectedRoute>
      </Route>
      <Route path="/library">
        <ProtectedRoute>
          <Library />
        </ProtectedRoute>
      </Route>
      <Route path="/library-exercises">
        <ProtectedRoute>
          <LibraryExercises />
        </ProtectedRoute>
      </Route>
      <Route path="/content/:contentId">
        <ProtectedRoute>
          <ContentReader />
        </ProtectedRoute>
      </Route>
      <Route path="/session/:sessionId">
        <ProtectedRoute>
          <SessionDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/sessions">
        <ProtectedRoute>
          <SessionsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      {/* New Dedicated Input Pages */}
      <Route path="/craving-entry">
        <ProtectedRoute>
          <CravingEntryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/beck-analysis">
        <ProtectedRoute>
          <BeckAnalysisPage />
        </ProtectedRoute>
      </Route>
      <Route path="/strategies">
        <ProtectedRoute>
          <StrategiesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/emergency-routines">
        <ProtectedRoute>
          <EmergencyRoutinePage />
        </ProtectedRoute>
      </Route>
      <Route path="/breathing/:pattern">
        <ProtectedRoute>
          <BreathingExercisePage />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/manage-exercises-sessions">
        <AdminRoute>
          <ManageExercisesSessions />
        </AdminRoute>
      </Route>
      <Route path="/admin/manage-content">
        <AdminRoute>
          <ManageContent />
        </AdminRoute>
      </Route>
      <Route path="/admin/manage-users">
        <AdminRoute>
          <ManageUsers />
        </AdminRoute>
      </Route>
      <Route path="/admin/professional-reports">
        <AdminRoute>
          <ProfessionalReports />
        </AdminRoute>
      </Route>
      <Route path="/admin/manage-media">
        <AdminRoute>
          <ManageMedia />
        </AdminRoute>
      </Route>
      <Route path="/admin/debug">
        <AdminRoute>
          <AdminDebug />
        </AdminRoute>
      </Route>

      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-roboto">
            <Toaster />
            <SonnerToaster 
              position="top-right" 
              richColors 
              closeButton 
              visibleToasts={5}
              toastOptions={{
                className: 'animate-slide-in-right',
                duration: 4000,
              }}
            />
            <AppContent />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
