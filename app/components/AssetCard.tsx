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
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
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
      className={`
        relative group
        bg-[var(--bg-secondary)] border border-[var(--border)]
        rounded-2xl p-4
        transition-all duration-200 ease-out
        hover:border-[var(--border-hover)] hover:bg-[var(--bg-tertiary)]
        cursor-pointer
        animate-fadeIn
      `}
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Accent line indicator on hover */}
      <div
        className={`
          absolute left-0 top-4 bottom-4 w-[3px] rounded-full
          transition-all duration-200
          ${expanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        style={{ backgroundColor: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}
      />

      {/* Main content */}
      <div className="flex items-start gap-4 pl-2">
        {/* Token icon with glow effect */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-lg opacity-20"
            style={{ backgroundColor: chainConfig.color }}
          />
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center">
            {iconUrl && !imgError ? (
              <img
                src={iconUrl}
                alt={asset.symbol}
                width={44}
                height={44}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <img
                src={fallbackIcon}
                alt={asset.symbol}
                width={44}
                height={44}
                className="w-full h-full"
              />
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Symbol + Badge + Change */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)] text-base">
                {asset.symbol}
              </span>
              {asset.isStaked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-medium border border-[var(--accent-green)]/20">
                  {asset.stakingProtocol || 'Staked'}
                </span>
              )}
            </div>
            <span
              className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold
                ${isPositive ? 'price-badge-up' : 'price-badge-down'}
              `}
            >
              <span className="text-[10px]">{isPositive ? '↗' : '↘'}</span>
              {formatPercent(asset.change24h)}
            </span>
          </div>

          {/* Row 2: Name */}
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {asset.name}
          </p>

          {/* Row 3: Holdings value + balance */}
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-mono font-semibold text-lg text-[var(--text-primary)]">
              {formatCurrency(asset.value)}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {formatBalance(asset.balance, asset.symbol)}
            </span>
          </div>

          {/* Row 4: Chain + Expand indicator */}
          <div className="flex items-center justify-between mt-3">
            <span
              className="text-[10px] px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: chainConfig.color + '15',
                color: chainConfig.color,
                border: `1px solid ${chainConfig.color}20`,
              }}
            >
              {chainConfig.name}
            </span>
            <div
              className={`
                w-6 h-6 rounded-full flex items-center justify-center
                bg-[var(--bg-tertiary)] transition-transform duration-200
                ${expanded ? 'rotate-180' : ''}
              `}
            >
              <svg
                className="w-3.5 h-3.5 text-[var(--text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3 pl-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[var(--text-muted)] text-xs">Price</span>
              <span className="font-mono font-medium">{formatCurrency(asset.price)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[var(--text-muted)] text-xs">24h Change</span>
              <span className={`font-mono font-medium ${isPositive ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                {isPositive ? '+' : ''}{formatCurrency(valueChange24h)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
