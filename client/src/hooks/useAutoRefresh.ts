import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  queryKeys: string[][];
  intervalMs?: number;
  enabled?: boolean;
  onRefresh?: () => void;
}

/**
 * Hook personnalisé pour actualiser automatiquement les données à intervalles réguliers
 */
export function useAutoRefresh({
  queryKeys,
  intervalMs = 30000, // 30 secondes par défaut
  enabled = true,
  onRefresh
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || queryKeys.length === 0) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh des données...');
      
      // Invalider toutes les queries spécifiées avec une approche plus robuste
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
        // Forcer un refetch immédiat pour les données critiques
        queryClient.refetchQueries({ queryKey });
      });
      
      // Invalider aussi les queries partielles correspondantes
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key)) return false;
          
          return queryKeys.some(targetKey => {
            if (targetKey.length === 1 && key.length >= 1) {
              return key[0] === targetKey[0];
            }
            return targetKey.every((part, index) => key[index] === part);
          });
        }
      });
      
      // Callback optionnel
      onRefresh?.();
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [queryClient, queryKeys, intervalMs, enabled, onRefresh]);
}

/**
 * Hook spécialisé pour l'actualisation des données du dashboard
 */
export function useDashboardAutoRefresh(enabled: boolean = true) {
  return useAutoRefresh({
    queryKeys: [
      ["dashboard", "stats"],
      ["/api/cravings"],
      ["exercise-sessions"],
      ["/api/strategies"],
      ["/api/beck-analyses"]
    ],
    intervalMs: 30000, // 30 secondes
    enabled,
    onRefresh: () => {
      console.log('📊 Données du dashboard actualisées');
    }
  });
}

/**
 * Hook spécialisé pour l'actualisation des données de suivi
 */
export function useTrackingAutoRefresh(enabled: boolean = true) {
  return useAutoRefresh({
    queryKeys: [
      ["/api/cravings"],
      ["/api/exercise-sessions"],
      ["/api/strategies"],
      ["/api/beck-analyses"],
      ["/api/dashboard/stats", "cravings"],
      ["/api/dashboard/stats", "userStats"]
    ],
    intervalMs: 20000, // 20 secondes pour les données de suivi
    enabled,
    onRefresh: () => {
      console.log('📈 Données de suivi actualisées');
    }
  });
}

/**
 * Hook spécialisé pour l'actualisation des données admin
 */
export function useAdminAutoRefresh(enabled: boolean = true) {
  return useAutoRefresh({
    queryKeys: [
      ["admin", "dashboard"],
      ["admin", "exercises"],
      ["admin", "sessions"],
      ["admin", "patients"],
      ["admin", "patient-sessions"]
    ],
    intervalMs: 45000, // 45 secondes pour l'admin
    enabled,
    onRefresh: () => {
      console.log('⚙️ Données admin actualisées');
    }
  });
}