import { useEffect, useRef, useState, useCallback } from 'react';

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
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshCallback();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCallback]);

  const start = useCallback(() => {
    if (refreshIntervalRef.current || !enabled) return;
    setCountdown(refreshInterval);
    refreshIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Schedule refresh for next tick to avoid setState during render
          setTimeout(() => refresh(), 0);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
  }, [enabled, refreshInterval, refresh]);

  const stop = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(0);
  }, []);

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
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (autoRefresh && enabled) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [autoRefresh, refreshInterval, enabled, start, stop]);

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
