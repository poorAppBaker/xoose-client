// hooks/useFirebaseData.ts
import { useEffect, useState } from 'react';
import realtimeService from '@/services/realtimeService';

// Generic hook for real-time data
export function useRealtimeData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = realtimeService.listen<T>(path, (newData) => {
      setData(newData);
      setLoading(false);
    });

    return unsubscribe;
  }, [path]);

  return { data, loading, error, setData };
}

// Hook for real-time collection data
export function useRealtimeCollection<T>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = realtimeService.listenToCollection<T>(path, (newData) => {
      setData(newData);
      setLoading(false);
    });

    return unsubscribe;
  }, [path]);

  return { data, loading, error, setData };
}

// Specific hooks for your app

// Hook for worksites
export function useWorksites() {
  return useRealtimeCollection<any>('worksites');
}

// Hook for worksite tasks
export function useWorksiteTasks(worksiteId: string) {
  return useRealtimeCollection<any>(`worksites/${worksiteId}/tasks`);
}

// Hook for messages
export function useMessages(worksiteId: string) {
  return useRealtimeCollection<any>(`worksites/${worksiteId}/messages`);
}

// Hook for user notifications
export function useUserNotifications(userId: string) {
  return useRealtimeCollection<any>(`users/${userId}/notifications`);
}

// Hook for a specific worksite
export function useWorksite(worksiteId: string) {
  return useRealtimeData<any>(`worksites/${worksiteId}`);
}