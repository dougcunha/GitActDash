import { useEffect, useState, useCallback } from 'react';

interface Options {
  interval?: number;
  enabled?: boolean;
}

export default function useAutoRefresh(
  refreshCallback: () => Promise<void>,
  { interval = 30, enabled = true }: Options = {}
) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(interval);
  const [countdown, setCountdown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshCallback();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCallback]);

  const toggleAutoRefresh = useCallback(() => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
  }, [autoRefresh]);

  const manualRefresh = useCallback(() => {
    refresh();
    if (autoRefresh) {
      setCountdown(refreshInterval);
    }
  }, [refresh, autoRefresh, refreshInterval]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh && enabled) {
      setCountdown(refreshInterval);
      intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Schedule refresh for next tick to avoid setState during render
            setTimeout(() => refresh(), 0);
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, enabled, refresh]);

  return {
    autoRefresh,
    toggleAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    countdown,
    isRefreshing,
    manualRefresh,
  };
}
