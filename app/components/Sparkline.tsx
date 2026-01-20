'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface SparklineProps {
  data: { timestamp: string; value: number }[];
  isPositive: boolean;
  width?: number | string;
  height?: number;
  showGradient?: boolean;
}

export default function Sparkline({
  data,
  isPositive,
  width = '100%',
  height = 60,
  showGradient = true,
}: SparklineProps) {
  // Memoize the chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Return a flat line if no data
      return [{ value: 0 }, { value: 0 }];
    }
    return data.map(d => ({ value: d.value }));
  }, [data]);

  // Calculate domain for better visual (5% padding)
  const domain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 10;
    return [min - padding, max + padding];
  }, [chartData]);

  const strokeColor = isPositive 
    ? 'var(--accent-green)' 
    : 'var(--accent-red)';
  
  const gradientId = isPositive ? 'sparklineGradientUp' : 'sparklineGradientDown';

  if (chartData.length < 2) {
    // Not enough data for a chart
    return (
      <div 
        style={{ width, height }}
        className="flex items-center justify-center text-[var(--text-muted)] text-xs"
      >
        No history
      </div>
    );
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={strokeColor}
                stopOpacity={showGradient ? 0.3 : 0}
              />
              <stop
                offset="100%"
                stopColor={strokeColor}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <YAxis domain={domain} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Mini sparkline for asset rows (even smaller)
 */
export function MiniSparkline({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  const chartData = useMemo(() => {
    return data.map(value => ({ value }));
  }, [data]);

  const strokeColor = isPositive 
    ? 'var(--accent-green)' 
    : 'var(--accent-red)';

  if (data.length < 2) return null;

  return (
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1}
            fill="transparent"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
