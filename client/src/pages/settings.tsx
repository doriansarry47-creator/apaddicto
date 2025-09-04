import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSettings } from "@shared/schema";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Globe, 
  Palette, 
  Download, 
  Shield, 
  HelpCircle, 
  Clock,
  User,
  Trash2
} from "lucide-react";

export default function Settings() {
  const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      return await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  });

  // Initialize local settings when data loads
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleReminderTimeChange = (index: number, time: string) => {
    const currentTimes = Array.isArray(localSettings.reminderTimes) 
      ? [...localSettings.reminderTimes] 
      : ['09:00', '14:00', '19:00'];
    
    currentTimes[index] = time;
    handleSettingChange('reminderTimes', currentTimes);
  };

  const addReminderTime = () => {
    const currentTimes = Array.isArray(localSettings.reminderTimes) 
      ? [...localSettings.reminderTimes] 
      : ['09:00', '14:00', '19:00'];
    
    if (currentTimes.length < 6) {
      currentTimes.push('12:00');
      handleSettingChange('reminderTimes', currentTimes);
    }
  };

  const removeReminderTime = (index: number) => {
    const currentTimes = Array.isArray(localSettings.reminderTimes) 
      ? [...localSettings.reminderTimes] 
      : ['09:00', '14:00', '19:00'];
    
    if (currentTimes.length > 1) {
      currentTimes.splice(index, 1);
      handleSettingChange('reminderTimes', currentTimes);
    }
  };

  const handleExportData = async () => {
    try {
      // Export user data
      const statsResponse = await fetch('/api/stats?days=365');
      const journalResponse = await fetch('/api/journal?limit=1000');
      const cravingsResponse = await fetch('/api/cravings?limit=1000');
      const sessionsResponse = await fetch('/api/exercise-sessions?limit=1000');

      const exportData = {
        exportDate: new Date().toISOString(),
        stats: await statsResponse.json(),
        journal: await journalResponse.json(),
        cravings: await cravingsResponse.json(),
        sessions: await sessionsResponse.json(),
        settings: settings
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calmcare-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter vos données.",
        variant: "destructive",
      });
    }
  };

  const reminderTimes = Array.isArray(localSettings.reminderTimes) 
    ? localSettings.reminderTimes 
    : ['09:00', '14:00', '19:00'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader />
        <div className="max-w-md mx-auto bg-white min-h-screen pb-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen pb-24">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800" data-testid="text-settings-title">
            Paramètres
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Personnalisez votre expérience CalmCare
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Nom d'utilisateur</Label>
                  <p className="text-sm text-gray-600">user@example.com</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-edit-profile">
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-5 w-5 mr-2" />
                Notifications et Rappels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable Reminders */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminder-enabled" className="text-sm font-medium">
                    Activer les rappels
                  </Label>
                  <p className="text-xs text-gray-600">
                    Recevoir des notifications pour vos exercices
                  </p>
                </div>
                <Switch
                  id="reminder-enabled"
                  checked={localSettings.reminderEnabled ?? true}
                  onCheckedChange={(checked) => handleSettingChange('reminderEnabled', checked)}
                  data-testid="switch-reminder-enabled"
                />
              </div>

              {/* Reminder Times */}
              {localSettings.reminderEnabled && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Heures de rappel</Label>
                  {reminderTimes.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        data-testid={`input-reminder-time-${index}`}
                      />
                      {reminderTimes.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReminderTime(index)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-remove-reminder-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {reminderTimes.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addReminderTime}
                      className="w-full"
                      data-testid="button-add-reminder"
                    >
                      + Ajouter un rappel
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Palette className="h-5 w-5 mr-2" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Langue
                </Label>
                <Select 
                  value={localSettings.language || 'fr'} 
                  onValueChange={(value) => handleSettingChange('language', value)}
                >
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thème</Label>
                <Select 
                  value={localSettings.theme || 'light'} 
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2" />
                Données et Confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full justify-start"
                  data-testid="button-export-data"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter mes données
                </Button>
                
                <Separator />
                
                <div className="text-xs text-gray-600 space-y-2">
                  <p>
                    <strong>Confidentialité:</strong> Vos données sont stockées localement et ne sont pas partagées sans votre consentement explicite.
                  </p>
                  <p>
                    <strong>Usage thérapeutique:</strong> Les données exportées peuvent être partagées avec votre thérapeute pour un suivi personnalisé.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <HelpCircle className="h-5 w-5 mr-2" />
                Aide et Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-help-guide"
              >
                Guide d'utilisation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-contact-support"
              >
                Contacter le support
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-emergency-contacts"
              >
                Contacts d'urgence
              </Button>
              
              <Separator />
              
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>CalmCare v1.0.0</p>
                <p>Application thérapeutique pour la gestion des cravings</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Information */}
          <Card className="border-therapeutic-danger">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-therapeutic-danger font-semibold text-sm">
                  En cas d'urgence
                </div>
                <div className="text-xs text-gray-600">
                  Si vous ressentez des pensées suicidaires ou une détresse intense, contactez immédiatement:
                </div>
                <div className="text-sm font-medium">
                  🇫🇷 3114 (gratuit, 24h/24)
                </div>
                <div className="text-xs text-gray-600">
                  Numéro national français de prévention du suicide
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
