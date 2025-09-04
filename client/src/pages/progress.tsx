import MobileHeader from "@/components/layout/mobile-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ProgressCard from "@/components/progress-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { WEEKDAYS } from "@/lib/constants";

export default function Progress() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/stats?days=${selectedPeriod}`);
      return response.json();
    }
  });

  // Fetch craving stats
  const { data: cravingStats, isLoading: cravingStatsLoading } = useQuery({
    queryKey: ['/api/cravings/stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/cravings/stats?days=${selectedPeriod}`);
      return response.json();
    }
  });

  const periodOptions = [
    { value: 7, label: "7 jours" },
    { value: 30, label: "30 jours" },
    { value: 90, label: "3 mois" },
  ];

  // Generate chart data for the selected period
  const generateChartData = () => {
    if (!stats?.dailyActivity) return [];
    
    const data = [];
    const today = new Date();
    
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = stats.dailyActivity.find((d: any) => d.date === dateString);
      const cravingData = cravingStats?.find((d: any) => d.date === dateString);
      
      data.push({
        date: dateString,
        dayName: selectedPeriod <= 7 ? WEEKDAYS[date.getDay()] : date.getDate().toString(),
        sessions: dayData?.sessions || 0,
        minutes: dayData?.minutes || 0,
        cravings: cravingData?.count || 0,
        avgIntensity: cravingData?.avgIntensity || 0,
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  const maxSessions = Math.max(...chartData.map(d => d.sessions), 1);
  const maxCravings = Math.max(...chartData.map(d => d.cravings), 1);

  // Calculate completion rate
  const completionRate = stats?.totalSessions > 0 
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
    : 0;

  // Calculate average session duration
  const avgSessionDuration = stats?.totalSessions > 0 
    ? Math.round(stats.totalMinutes / stats.totalSessions) 
    : 0;

  const isLoading = statsLoading || cravingStatsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto bg-white min-h-screen pb-24">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-4" data-testid="text-progress-title">
            Vos progrès
          </h1>
          
          {/* Period Selector */}
          <div className="flex space-x-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(option.value)}
                data-testid={`button-period-${option.value}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <ProgressCard
                value={stats?.totalSessions || 0}
                label="Exercices réalisés"
                icon="dumbbell"
                className="bg-gradient-to-br from-therapeutic-calm to-secondary-600"
                testId="card-total-sessions"
              />
              <ProgressCard
                value={stats?.totalMinutes || 0}
                label="Minutes actives"
                icon="clock"
                className="bg-gradient-to-br from-primary-500 to-primary-700"
                testId="card-total-minutes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ProgressCard
                value={completionRate}
                label="Taux de réussite (%)"
                icon="check-circle"
                className="bg-gradient-to-br from-green-500 to-green-700"
                testId="card-completion-rate"
              />
              <ProgressCard
                value={avgSessionDuration}
                label="Durée moy. (min)"
                icon="timer"
                className="bg-gradient-to-br from-accent-500 to-accent-600"
                testId="card-avg-duration"
              />
            </div>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Activité quotidienne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Exercise Sessions Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Exercices par jour</h4>
                    <div className="flex items-end justify-between h-20" data-testid="chart-daily-sessions">
                      {chartData.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-primary-400 rounded-t w-6"
                            style={{ 
                              height: `${(day.sessions / maxSessions) * 60}px`,
                              minHeight: day.sessions > 0 ? '4px' : '2px'
                            }}
                            data-testid={`bar-sessions-${index}`}
                            title={`${day.sessions} sessions`}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {day.dayName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cravings Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cravings par jour</h4>
                    <div className="flex items-end justify-between h-16" data-testid="chart-daily-cravings">
                      {chartData.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-red-300 rounded-t w-6"
                            style={{ 
                              height: `${(day.cravings / maxCravings) * 40}px`,
                              minHeight: day.cravings > 0 ? '3px' : '1px'
                            }}
                            data-testid={`bar-cravings-${index}`}
                            title={`${day.cravings} cravings`}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {day.dayName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="insights-section">
                  {stats?.totalSessions > 0 ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Excellente régularité!
                          </p>
                          <p className="text-xs text-gray-600">
                            Vous avez effectué {stats.totalSessions} exercice{stats.totalSessions > 1 ? 's' : ''} 
                            dans les {selectedPeriod} derniers jours.
                          </p>
                        </div>
                      </div>
                      
                      {completionRate >= 80 && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Très bon taux de réussite
                            </p>
                            <p className="text-xs text-gray-600">
                              {completionRate}% de vos exercices sont terminés complètement.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {avgSessionDuration >= 5 && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Sessions de qualité
                            </p>
                            <p className="text-xs text-gray-600">
                              Durée moyenne de {avgSessionDuration} minutes par session.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">
                        Commencez votre premier exercice pour voir vos statistiques ici.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Daily goal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Objectif quotidien</p>
                      <p className="text-xs text-gray-600">1 exercice par jour</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600" data-testid="text-daily-goal">
                        {Math.round((stats?.totalSessions || 0) / Math.max(selectedPeriod, 1) * 7)}/7
                      </p>
                      <p className="text-xs text-gray-600">cette semaine</p>
                    </div>
                  </div>
                  
                  {/* Weekly goal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Objectif hebdomadaire</p>
                      <p className="text-xs text-gray-600">150 minutes d'activité</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary-600" data-testid="text-weekly-goal">
                        {stats?.totalMinutes || 0}/150
                      </p>
                      <p className="text-xs text-gray-600">minutes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
