'use client';

import { useState } from 'react';
import type { Asset } from '@/types';
import { CHAIN_CONFIG } from '@/types';
import { getIconUrl, getPlaceholderIcon } from '@/lib/icons';

interface AssetCardProps {
  asset: Asset;
  index: number;
}

export default function AssetCard({ asset, index }: AssetCardProps) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isPositive = asset.change24h >= 0;
  const chainConfig = CHAIN_CONFIG[asset.chain];

  const coinGeckoIcon = getIconUrl(asset.symbol);
  const iconUrl = asset.icon || coinGeckoIcon;
  const fallbackIcon = getPlaceholderIcon(asset.symbol, chainConfig.color);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: number, symbol: string) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M ${symbol}`;
    }
    const decimals = balance < 1 ? 6 : balance < 100 ? 4 : 2;
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(balance);
    return `${formatted} ${symbol}`;
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  const valueChange24h = asset.value * (asset.change24h / 100);

  return (
    <div
      className="bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-xl p-4 animate-fadeIn hover:border-[var(--border-hover)] transition-all cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Main card content */}
      <div className="flex items-start gap-3">
        {/* Token icon */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[var(--bg-tertiary)] shrink-0">
          {iconUrl && !imgError ? (
            <img
              src={iconUrl}
              alt={asset.symbol}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <img
              src={fallbackIcon}
              alt={asset.symbol}
              width={40}
              height={40}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Symbol + Change */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)]">
                {asset.symbol}
              </span>
              {asset.isStaked && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-medium">
                  {asset.stakingProtocol ? `⚡ ${asset.stakingProtocol}` : '⚡'}
                </span>
              )}
            </div>
            <span
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium
                ${isPositive
                  ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                  : 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]'
                }
              `}
            >
              <svg
                className="w-2.5 h-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                {isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                )}
              </svg>
              {formatPercent(asset.change24h)}
            </span>
          </div>

          {/* Row 2: Name */}
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {asset.name}
          </p>

          {/* Row 3: Holdings */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-mono font-semibold text-base">
              {formatCurrency(asset.value)}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {formatBalance(asset.balance, asset.symbol)}
            </span>
          </div>

          {/* Row 4: Chain badge */}
          <div className="flex items-center justify-between mt-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: chainConfig.color + '15',
                color: chainConfig.color,
              }}
            >
              {chainConfig.name}
            </span>
            <svg
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Price</span>
            <span className="font-mono">{formatCurrency(asset.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">24h Change</span>
            <span className={`font-mono ${isPositive ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
              {isPositive ? '+' : ''}{formatCurrency(valueChange24h)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Balance</span>
            <span className="font-mono">{formatBalance(asset.balance, asset.symbol)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
