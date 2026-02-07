'use client';

import { useState } from 'react';
import { type Asset, type Chain, CHAIN_CONFIG } from '@/types';

interface AllocationBarProps {
  assets: Asset[];
  totalValue: number;
}

interface Segment {
  symbol: string;
  chain: Chain;
  color: string;
  percentage: number;
  displayPercentage: number;
}

export default function AllocationBar({ assets, totalValue }: AllocationBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (assets.length === 0 || totalValue <= 0) return null;

  // Sort by value descending, take top 5
  const sorted = [...assets].sort((a, b) => b.value - a.value);
  const top5 = sorted.slice(0, 5);
  const otherAssets = sorted.slice(5);

  // Build segments
  const segments: Segment[] = top5.map((asset) => {
    const percentage = (asset.value / totalValue) * 100;
    return {
      symbol: asset.symbol,
      chain: asset.chain,
      color: CHAIN_CONFIG[asset.chain]?.color ?? 'var(--text-muted)',
      percentage,
      displayPercentage: percentage,
    };
  });

  // "Other" segment if there are remaining assets
  if (otherAssets.length > 0) {
    const otherValue = otherAssets.reduce((sum, a) => sum + a.value, 0);
    const otherPercentage = (otherValue / totalValue) * 100;
    if (otherPercentage > 0) {
      segments.push({
        symbol: 'Other',
        chain: 'ethereum' as Chain, // unused for color
        color: 'var(--text-muted)',
        percentage: otherPercentage,
        displayPercentage: otherPercentage,
      });
    }
  }

  // Enforce minimum 3% visual width so tiny holdings remain visible
  const MIN_WIDTH = 3;
  const totalRaw = segments.reduce((sum, s) => sum + s.percentage, 0);
  const belowMin = segments.filter((s) => (s.percentage / totalRaw) * 100 < MIN_WIDTH);
  const aboveMin = segments.filter((s) => (s.percentage / totalRaw) * 100 >= MIN_WIDTH);

  // Redistribute: give small segments the minimum, shrink large ones proportionally
  const extraNeeded = belowMin.reduce(
    (sum, s) => sum + (MIN_WIDTH - (s.percentage / totalRaw) * 100),
    0
  );
  const aboveTotal = aboveMin.reduce((sum, s) => sum + (s.percentage / totalRaw) * 100, 0);

  segments.forEach((s) => {
    const normalized = (s.percentage / totalRaw) * 100;
    if (normalized < MIN_WIDTH) {
      s.displayPercentage = MIN_WIDTH;
    } else if (aboveTotal > 0) {
      s.displayPercentage = normalized - (normalized / aboveTotal) * extraNeeded;
    } else {
      s.displayPercentage = normalized;
    }
  });

  return (
    <div className="animate-fadeIn">
      {/* Label */}
      <span className="text-caption mb-3 block">Allocation</span>

      {/* Stacked bar */}
      <div className="relative">
        <div
          className="flex w-full overflow-hidden"
          style={{ height: 8, borderRadius: 2, background: 'var(--bg-tertiary)' }}
        >
          {segments.map((seg, i) => (
            <div
              key={seg.symbol}
              className="relative h-full transition-opacity duration-150"
              style={{
                width: `${seg.displayPercentage}%`,
                backgroundColor: seg.color,
                opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(i)}
              onTouchEnd={() => setHoveredIndex(null)}
            />
          ))}
        </div>

        {/* Tooltip */}
        {hoveredIndex !== null && segments[hoveredIndex] && (
          <div
            className="absolute -top-9 px-2.5 py-1 text-xs font-mono whitespace-nowrap pointer-events-none"
            style={{
              left: `${segments
                .slice(0, hoveredIndex)
                .reduce((sum, s) => sum + s.displayPercentage, 0) +
                segments[hoveredIndex].displayPercentage / 2}%`,
              transform: 'translateX(-50%)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {segments[hoveredIndex].symbol}: {segments[hoveredIndex].percentage.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {segments.map((seg) => (
          <div key={seg.symbol} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2"
              style={{ backgroundColor: seg.color, borderRadius: 1 }}
            />
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {seg.symbol}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {seg.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
