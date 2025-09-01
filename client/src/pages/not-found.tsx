// pages/NotFoundPage.tsx
import { useLocation } from "wouter";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mt-2">
          La page que vous cherchez n'existe pas.
        </p>
        <div className="mt-6 space-x-4">
          <button
            onClick={() => setLocation("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Retour au tableau de bord
          </button>
          <button
            onClick={() => setLocation("/login")}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
