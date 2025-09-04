import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Activity, TrendingUp, Calendar, AlertCircle, Heart } from 'lucide-react';
import { useState } from 'react';

interface Patient {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PatientCraving {
  id: string;
  intensity: number;
  trigger?: string;
  emotions?: string;
  automaticThoughts?: string;
  behaviors?: string;
  timestamp: string;
}

interface PatientSession {
  id: string;
  exerciseId: string;
  duration: number;
  completed: boolean;
  timestamp: string;
}

interface PatientStats {
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  totalCravings: number;
  avgIntensity: number;
  dailyActivity: { date: string; sessions: number; minutes: number; cravings: number }[];
}

export default function Admin() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ['/api/admin/patients'],
  });

  const { data: patientCravings } = useQuery<PatientCraving[]>({
    queryKey: ['/api/admin/patients', selectedPatient, 'cravings'],
    enabled: !!selectedPatient,
  });

  const { data: patientSessions } = useQuery<PatientSession[]>({
    queryKey: ['/api/admin/patients', selectedPatient, 'sessions'],
    enabled: !!selectedPatient,
  });

  const { data: patientStats } = useQuery<PatientStats>({
    queryKey: ['/api/admin/patients', selectedPatient, 'stats'],
    enabled: !!selectedPatient,
  });

  if (patientsLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Administration - Suivi des Patients</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des patients */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Patients assignés</span>
            </CardTitle>
            <CardDescription>
              {patients?.length || 0} patient(s) sous votre supervision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {patients?.map((patient: Patient) => (
                  <Card 
                    key={patient.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                      selectedPatient === patient.id ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                    data-testid={`patient-card-${patient.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{patient.username}</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                      <Badge variant="outline">{patient.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inscrit le {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </Card>
                ))}
                {(!patients || patients.length === 0) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucun patient assigné pour le moment.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Détails du patient sélectionné */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="cravings">Cravings</TabsTrigger>
                <TabsTrigger value="sessions">Exercices</TabsTrigger>
                <TabsTrigger value="progress">Progrès</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-2xl font-bold">{patientStats?.totalCravings || 0}</p>
                          <p className="text-xs text-muted-foreground">Cravings</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-2xl font-bold">{patientStats?.avgIntensity || 0}</p>
                          <p className="text-xs text-muted-foreground">Intensité moy.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{patientStats?.totalSessions || 0}</p>
                          <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{patientStats?.totalMinutes || 0}</p>
                          <p className="text-xs text-muted-foreground">Minutes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cravings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Journal des Cravings</CardTitle>
                    <CardDescription>Historique détaillé des cravings du patient</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {patientCravings?.map((craving: PatientCraving) => (
                          <Card key={craving.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge 
                                variant={craving.intensity >= 8 ? "destructive" : craving.intensity >= 5 ? "default" : "secondary"}
                                data-testid={`craving-intensity-${craving.id}`}
                              >
                                Intensité {craving.intensity}/10
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(craving.timestamp).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            
                            {craving.trigger && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-muted-foreground">Situation déclencheur:</p>
                                <p className="text-sm">{craving.trigger}</p>
                              </div>
                            )}
                            
                            {craving.emotions && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-muted-foreground">Émotions:</p>
                                <p className="text-sm">{craving.emotions}</p>
                              </div>
                            )}
                            
                            {craving.automaticThoughts && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-muted-foreground">Pensées automatiques:</p>
                                <p className="text-sm">{craving.automaticThoughts}</p>
                              </div>
                            )}
                            
                            {craving.behaviors && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Comportements:</p>
                                <p className="text-sm">{craving.behaviors}</p>
                              </div>
                            )}
                          </Card>
                        ))}
                        {(!patientCravings || patientCravings.length === 0) && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Aucun craving enregistré pour ce patient.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions d'exercices</CardTitle>
                    <CardDescription>Historique des exercices pratiqués</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {patientSessions?.map((session: PatientSession) => (
                          <Card key={session.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{session.exerciseId}</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.duration} minutes • {session.completed ? 'Terminé' : 'Incomplet'}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={session.completed ? "default" : "secondary"}>
                                  {session.completed ? 'Terminé' : 'Incomplet'}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(session.timestamp).toLocaleString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                        {(!patientSessions || patientSessions.length === 0) && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Aucune session d'exercice enregistrée pour ce patient.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution du patient</CardTitle>
                    <CardDescription>Activité quotidienne et tendances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patientStats?.dailyActivity?.map((day) => (
                        <Card key={day.date} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{new Date(day.date).toLocaleDateString('fr-FR')}</p>
                              <p className="text-sm text-muted-foreground">
                                {day.sessions} session(s) • {day.minutes} min • {day.cravings} craving(s)
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Badge variant="outline">{day.sessions} exercices</Badge>
                              <Badge variant="outline">{day.cravings} cravings</Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {(!patientStats?.dailyActivity || patientStats.dailyActivity.length === 0) && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Aucune activité enregistrée pour ce patient sur la période sélectionnée.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Sélectionner un patient</h3>
                <p className="text-muted-foreground">
                  Choisissez un patient dans la liste pour voir ses détails
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}