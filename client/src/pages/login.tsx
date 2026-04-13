import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation, useRegisterMutation, useAuthQuery } from "@/hooks/use-auth";
import { Instagram } from "lucide-react";

// Google Icon SVG Component
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: user, isLoading } = useAuthQuery();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "patient",
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  // Check for Google auth error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "google_failed") {
      toast({
        title: "Erreur Google",
        description: "La connexion via Google a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    } else if (error === "google_not_configured") {
      toast({
        title: "Google non configuré",
        description: "La connexion Google n'est pas encore activée. Contactez l'administrateur.",
        variant: "destructive",
      });
    }
  }, []);

  // ✅ Redirection uniquement si l'utilisateur est connecté
  useEffect(() => {
    if (user && !isLoading) {
      const timer = setTimeout(() => {
        setLocation("/");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync(loginForm);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre espace thérapeutique",
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Vérifiez vos identifiants",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerMutation.mutateAsync(registerForm);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Vérifiez vos informations",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the Google OAuth endpoint
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">APAddicto</h1>
          <p className="text-gray-600">Votre parcours de bien-être commence ici</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accès à votre espace</CardTitle>
            <CardDescription>
              Connectez-vous ou créez votre compte pour accéder à vos exercices et contenus personnalisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Bouton Google - visible sur toutes les tabs */}
            <div className="mb-5">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 py-5 text-sm font-medium text-gray-700 shadow-sm"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                <span>Continuer avec Google</span>
              </Button>
              
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-medium">ou</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>

              {/* ✅ FORMULAIRE DE CONNEXION */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                  </Button>
                  
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const email = loginForm.email;
                        if (!email) {
                          toast({
                            title: "Email requis",
                            description: "Veuillez saisir votre email avant de demander votre mot de passe.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        fetch("/api/auth/forgot-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email })
                        })
                        .then(response => response.json())
                        .then(data => {
                          toast({
                            title: "Email envoyé",
                            description: data.message || "Votre mot de passe a été envoyé par email.",
                          });
                        })
                        .catch(() => {
                          toast({
                            title: "Erreur",
                            description: "Impossible d'envoyer l'email. Veuillez réessayer.",
                            variant: "destructive",
                          });
                        });
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </TabsContent>

              {/* ✅ FORMULAIRE D'INSCRIPTION */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName">Prénom</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName">Nom</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        value={registerForm.lastName}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Rôle (patient ou admin)</Label>
                    <Input
                      id="register-role"
                      type="text"
                      value={registerForm.role}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, role: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Création..." : "Créer mon compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ✅ LIEN INSTAGRAM */}
        <div className="mt-6 text-center">
          <a
            href="https://instagram.com/apaperigueux"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Instagram size={20} />
            <span>Suivez-nous sur Instagram @apaperigueux</span>
          </a>
        </div>
      </div>
    </div>
  );
}
