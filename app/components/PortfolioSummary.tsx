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

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
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

  const displayChange = history?.change ?? change24h;
  const displayChangePercent = history?.changePercent ?? change24hPercent;
  const isPositive = displayChange >= 0;

  const timeLabel = selectedRange === '1D' ? '24h'
    : selectedRange === '1W' ? '7d'
    : selectedRange === '1M' ? '30d'
    : selectedRange === '3M' ? '3mo'
    : selectedRange === 'YTD' ? 'YTD'
    : selectedRange === '1Y' ? '1y'
    : 'all';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 100000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
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

  // Loading skeleton
  if (isLoading && totalValue === 0) {
    return (
      <div className="card card-elevated card-spacious">
        <div className="flex flex-col gap-6">
          {/* Label skeleton */}
          <div className="h-4 w-36 rounded bg-[var(--bg-tertiary)] animate-shimmer" />

          {/* Value skeleton */}
          <div className="h-16 w-72 rounded-lg bg-[var(--bg-tertiary)] animate-shimmer" />

          {/* Change skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-28 rounded-lg bg-[var(--bg-tertiary)] animate-shimmer" />
            <div className="h-6 w-24 rounded bg-[var(--bg-tertiary)] animate-shimmer" />
          </div>

          {/* Chart skeleton */}
          <div className="h-20 w-full rounded-lg bg-[var(--bg-tertiary)] animate-shimmer mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="card card-elevated card-spacious animate-fadeIn">
      <div className="flex flex-col gap-4">
        {/* Label */}
        <span className="text-caption">
          Total Portfolio Value
        </span>

        {/* Main value with premium styling */}
        <div className="relative py-2">
          <span className="text-display-xl font-mono tracking-tighter text-[var(--text-primary)]">
            {formatCurrency(totalValue)}
          </span>
          {/* Subtle glow effect under value */}
          <div
            className="absolute -bottom-1 left-0 right-1/4 h-px opacity-25"
            style={{
              background: `linear-gradient(90deg, ${isPositive ? 'var(--accent-green)' : 'var(--accent-red)'} 0%, transparent 100%)`
            }}
          />
        </div>

        {/* Change indicators */}
        <div className="flex flex-wrap items-center gap-4 mt-1">
          {/* Percentage badge */}
          <span
            className={`
              inline-flex items-center px-4 py-2 rounded-lg text-lg font-mono font-semibold
              ${isPositive ? 'price-badge-up' : 'price-badge-down'}
            `}
          >
            <span className="mr-1.5">{isPositive ? '↗' : '↘'}</span>
            {formatPercent(displayChangePercent)}
          </span>

          {/* Dollar change */}
          <span className="text-base text-[var(--text-muted)] font-mono">
            {isPositive ? '+' : ''}{formatCurrency(displayChange)}
            <span className="ml-2 text-sm opacity-70">{timeLabel}</span>
          </span>
        </div>

        {/* Sparkline chart */}
        {isAuthenticated && (
          <div className="mt-6">
            {historyLoading ? (
              <div className="h-20 w-full rounded-lg bg-[var(--bg-tertiary)] animate-shimmer" />
            ) : history && history.dataPoints.length > 1 ? (
              <div className="relative">
                <Sparkline
                  data={history.dataPoints}
                  isPositive={isPositive}
                  height={80}
                />
                {/* High/Low indicators */}
                {history.high !== history.low && (
                  <div className="flex justify-between mt-3 text-[11px] font-mono text-[var(--text-muted)]">
                    <span>L: {formatCurrency(history.low)}</span>
                    <span>H: {formatCurrency(history.high)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center border border-dashed border-[var(--border)] rounded-lg">
                <span className="text-sm text-[var(--text-muted)]">
                  {totalValue > 0
                    ? 'Building history... Check back soon'
                    : 'Add wallets to start tracking'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Time range selector */}
        {isAuthenticated && (
          <div className="mt-5">
            <TimeRangeSelector
              selected={selectedRange}
              onChange={setSelectedRange}
              disabled={historyLoading}
            />
          </div>
        )}

        {/* Sign in prompt */}
        {!isAuthenticated && totalValue > 0 && (
          <p className="text-sm text-[var(--text-muted)] mt-6 flex items-center gap-2">
            <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sign in to track portfolio history
          </p>
        )}
      </div>
    </div>
  );
}
