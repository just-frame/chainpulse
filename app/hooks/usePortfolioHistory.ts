'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimeRange } from '@/components/TimeRangeSelector';

interface SnapshotPoint {
  timestamp: string;
  value: number;
}

interface PortfolioHistory {
  range: TimeRange;
  dataPoints: SnapshotPoint[];
  startValue: number;
  endValue: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
}

interface UsePortfolioHistoryReturn {
  history: PortfolioHistory | null;
  isLoading: boolean;
  error: string | null;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  refetch: () => Promise<void>;
}

export function usePortfolioHistory(
  isAuthenticated: boolean,
  currentValue: number
): UsePortfolioHistoryReturn {
  const [history, setHistory] = useState<PortfolioHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1W');

  const fetchHistory = useCallback(async () => {
    // Only fetch history for authenticated users (anonymous users have no snapshots)
    if (!isAuthenticated) {
      // For anonymous users, show a "flat line" at current value
      setHistory({
        range: selectedRange,
        dataPoints: currentValue > 0 
          ? [
              { timestamp: new Date().toISOString(), value: currentValue },
              { timestamp: new Date().toISOString(), value: currentValue },
            ]
          : [],
        startValue: currentValue,
        endValue: currentValue,
        change: 0,
        changePercent: 0,
        high: currentValue,
        low: currentValue,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio/history?range=${selectedRange}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, that's fine
          setHistory(null);
          return;
        }
        throw new Error('Failed to fetch history');
      }

      const data: PortfolioHistory = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('[usePortfolioHistory] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedRange, currentValue]);

  // Fetch when range changes or auth status changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    selectedRange,
    setSelectedRange,
    refetch: fetchHistory,
  };
}
