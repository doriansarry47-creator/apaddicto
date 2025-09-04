import { Home, Dumbbell, Book, TrendingUp, Settings, Users } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Accueil", testId: "nav-home" },
  { path: "/exercises", icon: Dumbbell, label: "Exercices", testId: "nav-exercises" },
  { path: "/journal", icon: Book, label: "Journal", testId: "nav-journal" },
  { path: "/progress", icon: TrendingUp, label: "Progrès", testId: "nav-progress" },
  { path: "/admin", icon: Users, label: "Admin", testId: "nav-admin" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map(({ path, icon: Icon, label, testId }) => {
            const isActive = location === path;
            return (
              <Link key={path} href={path}>
                <button
                  className={cn(
                    "flex flex-col items-center py-2 px-3 transition-colors",
                    isActive
                      ? "text-primary-600"
                      : "text-gray-400 hover:text-primary-600"
                  )}
                  data-testid={testId}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className={cn(
                    "text-xs",
                    isActive && "font-medium"
                  )}>
                    {label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
