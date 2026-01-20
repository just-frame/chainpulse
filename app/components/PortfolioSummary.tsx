'use client';

import { useState, useEffect, useCallback } from 'react';
import Sparkline from './Sparkline';
import TimeRangeSelector, { type TimeRange } from './TimeRangeSelector';

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

interface PortfolioSummaryProps {
  totalValue: number;
  change24h: number;
  change24hPercent: number;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

export default function PortfolioSummary({
  totalValue,
  change24h,
  change24hPercent,
  isLoading = false,
  isAuthenticated = false,
}: PortfolioSummaryProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1W');
  const [history, setHistory] = useState<PortfolioHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch history when range changes
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      // For anonymous users, no historical data
      setHistory(null);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/portfolio/history?range=${selectedRange}`);
      if (response.ok) {
        const data: PortfolioHistory = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('[PortfolioSummary] Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated, selectedRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Determine which change values to show based on history vs fallback
  const displayChange = history?.change ?? change24h;
  const displayChangePercent = history?.changePercent ?? change24hPercent;
  const isPositive = displayChange >= 0;

  // Time label based on selected range
  const timeLabel = selectedRange === '1D' ? '24h' 
    : selectedRange === '1W' ? '7d'
    : selectedRange === '1M' ? '30d'
    : selectedRange === '3M' ? '3mo'
    : selectedRange === 'YTD' ? 'YTD'
    : selectedRange === '1Y' ? '1y'
    : 'all';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  // Show skeleton while loading
  if (isLoading && totalValue === 0) {
    return (
      <div className="card">
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-[var(--text-muted)] text-sm uppercase tracking-wider">
            Total Portfolio Value
          </span>
          <div className="h-12 w-48 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          <div className="w-full max-w-md h-16 bg-[var(--bg-tertiary)] rounded animate-pulse mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col items-center gap-3 py-4">
        {/* Header with title */}
        <span className="text-[var(--text-muted)] text-sm uppercase tracking-wider">
          Total Portfolio Value
        </span>
        
        {/* Main value */}
        <span className="text-5xl font-semibold font-mono tracking-tight">
          {formatCurrency(totalValue)}
        </span>
        
        {/* Change indicator */}
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-mono ${
              isPositive ? 'price-up' : 'price-down'
            }`}
          >
            {formatPercent(displayChangePercent)}
          </span>
          <span className="text-[var(--text-muted)] text-sm">
            ({isPositive ? '+' : ''}{formatCurrency(displayChange)}) {timeLabel}
          </span>
        </div>

        {/* Sparkline */}
        {isAuthenticated && (
          <div className="w-full max-w-lg mt-2">
            {historyLoading ? (
              <div className="h-16 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            ) : history && history.dataPoints.length > 1 ? (
              <Sparkline
                data={history.dataPoints}
                isPositive={isPositive}
                height={64}
              />
            ) : (
              <div className="h-16 flex items-center justify-center text-[var(--text-muted)] text-xs">
                {totalValue > 0 
                  ? 'Building history... Check back in an hour'
                  : 'Add wallets to start tracking'}
              </div>
            )}
          </div>
        )}

        {/* Time range selector */}
        {isAuthenticated && (
          <div className="mt-2">
            <TimeRangeSelector
              selected={selectedRange}
              onChange={setSelectedRange}
              disabled={historyLoading}
            />
          </div>
        )}

        {/* Anonymous user hint */}
        {!isAuthenticated && totalValue > 0 && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Sign in to track portfolio history & performance
          </p>
        )}
      </div>
    </div>
  );
}
