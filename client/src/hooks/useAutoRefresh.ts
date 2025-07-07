import { useEffect, useRef, useState } from 'react';

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

  const refresh = async () => {
    setIsRefreshing(true);
    await refreshCallback();
    setIsRefreshing(false);
  };

  const start = () => {
    if (refreshIntervalRef.current || !enabled) return;
    setCountdown(refreshInterval);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refresh();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(0);
  };

  const toggleAutoRefresh = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
  };

  const manualRefresh = () => {
    refresh();
    if (autoRefresh) {
      setCountdown(refreshInterval);
    }
  };

  useEffect(() => {
    return () => stop();
  }, []);

  useEffect(() => {
    if (autoRefresh && enabled) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [autoRefresh, refreshInterval, enabled]);

  useEffect(() => {
    if (autoRefresh && countdown <= 0 && enabled) {
      refresh();
    }
  }, [countdown]);

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
