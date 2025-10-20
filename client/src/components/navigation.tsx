import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthQuery } from "@/hooks/use-auth";
import { ThemeSettingsMenu } from "@/components/theme-settings-menu";
import { GlobalSearch } from "@/components/ui/global-search";
import logoImage from "@/assets/apaddicto-logo.png";

export function Navigation() {
  const [location] = useLocation();
  const { data: user } = useAuthQuery();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Header for desktop */}
      <header className="bg-card shadow-material-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3" data-testid="link-home">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <img src={logoImage} alt="APAddicto Logo" className="w-10 h-10 object-contain rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-foreground">APAddicto</h1>
                <p className="text-sm text-muted-foreground">Gestion des craving par l'AP</p>
              </div>
            </Link>
            
            {/* Global Search - hidden on mobile */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              {user && <GlobalSearch />}
            </div>
            
            {/* Desktop navigation - hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1", 
                isActive("/") 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )} data-testid="nav-dashboard">
                <span className="material-icons text-sm">home</span>
                Accueil
              </Link>
              <Link to="/exercises" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/exercises") 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )} data-testid="nav-exercises">
                Séances Assignées
              </Link>
              <Link to="/tracking" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/tracking") 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )} data-testid="nav-tracking">
                Suivi
              </Link>
              <Link to="/education" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/education") 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )} data-testid="nav-education">
                Éducation
              </Link>

              {user?.role === 'patient' && (
                <Link to="/library-exercises" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive("/library-exercises") 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )} data-testid="nav-library-exercises">
                  Bibliothèque de Séances
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin" className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive("/admin")
                    ? "bg-destructive text-destructive-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )} data-testid="nav-admin">
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-2">
              {/* Bouton d'urgence craving */}
              <Link to="/emergency-routines" className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 animate-pulse" data-testid="emergency-button">
                <span className="material-icons text-sm">warning</span>
                <span className="hidden sm:inline">SOS Craving</span>
              </Link>
              <ThemeSettingsMenu />
              <Link to="/profile" className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm" data-testid="link-profile">
                <span className="material-icons text-sm">person</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className={cn("grid h-16", user?.role === 'admin' ? 'grid-cols-6' : user?.role === 'patient' ? 'grid-cols-6' : 'grid-cols-5')}>
          <Link to="/" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-home">
            <span className="material-icons text-lg">dashboard</span>
            <span className="text-xs">Accueil</span>
          </Link>
          
          {/* Bouton d'urgence mobile - position proéminente */}
          <Link to="/emergency-routines" className="flex flex-col items-center justify-center space-y-1 bg-red-600 text-white animate-pulse" data-testid="nav-mobile-emergency">
            <span className="material-icons text-lg">warning</span>
            <span className="text-xs font-medium">SOS</span>
          </Link>
          <Link to="/exercises" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/exercises") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-exercises">
            <span className="material-icons text-lg">fitness_center</span>
            <span className="text-xs">Assignées</span>
          </Link>

          <Link to="/tracking" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/tracking") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-tracking">
            <span className="material-icons text-lg">analytics</span>
            <span className="text-xs">Suivi</span>
          </Link>
          <Link to="/education" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/education") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-education">
            <span className="material-icons text-lg">school</span>
            <span className="text-xs">Éducation</span>
          </Link>
          {user?.role === 'patient' && (
            <Link to="/library-exercises" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
              isActive("/library-exercises") ? "text-primary" : "text-muted-foreground hover:text-primary"
            )} data-testid="nav-mobile-library-exercises">
              <span className="material-icons text-lg">local_library</span>
              <span className="text-xs">Bibliothèque</span>
            </Link>
          )}
          <Link to="/profile" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/profile") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-profile">
            <span className="material-icons text-lg">person</span>
            <span className="text-xs">Profil</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
              isActive("/admin") ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            )} data-testid="nav-mobile-admin">
              <span className="material-icons text-lg">admin_panel_settings</span>
              <span className="text-xs">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
