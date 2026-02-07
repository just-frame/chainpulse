'use client';

import { useState } from 'react';
import type { Asset } from '@/types';
import { CHAIN_CONFIG } from '@/types';
import { getIconUrl, getPlaceholderIcon } from '@/lib/icons';

interface AssetRowProps {
  asset: Asset;
  index: number;
  totalValue?: number;
  onCreateAlert?: (symbol: string) => void;
}

export default function AssetRow({ asset, index, totalValue, onCreateAlert }: AssetRowProps) {
  const [imgError, setImgError] = useState(false);
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
    <tr
      className="group interactive-row transition-all cursor-pointer animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Rank */}
      <td className="py-5 pr-4 w-12">
        <span className="text-[var(--text-muted)] text-sm font-mono">{index + 1}</span>
      </td>

      {/* Asset */}
      <td className="py-5 pr-6">
        <div className="flex items-center gap-4">
          {/* Icon with subtle glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity"
              style={{ backgroundColor: chainConfig.color }}
            />
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center">
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
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-medium text-[var(--text-primary)] truncate">
              {asset.name}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wide">
                {asset.symbol}
              </span>
              {asset.isStaked && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-medium border border-[var(--accent-green)]/20 whitespace-nowrap">
                  {asset.stakingProtocol || 'Staked'}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-5 pr-6 hidden sm:table-cell">
        <span className="font-mono text-sm text-[var(--text-secondary)]">
          {formatCurrency(asset.price)}
        </span>
      </td>

      {/* Holdings */}
      <td className="py-5 pr-6">
        <div className="flex flex-col">
          <span className="font-mono font-semibold text-[var(--text-primary)]">
            {formatCurrency(asset.value)}
          </span>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {formatBalance(asset.balance, asset.symbol)}
          </span>
          {totalValue && totalValue > 0 && (
            <span className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
              {(asset.value / totalValue * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </td>

      {/* 24h Change */}
      <td className="py-5 pr-6 hidden md:table-cell">
        <div className="flex flex-col items-start gap-1">
          <span
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold
              ${isPositive ? 'price-badge-up' : 'price-badge-down'}
            `}
          >
            <span className="text-[10px]">{isPositive ? '↗' : '↘'}</span>
            {formatPercent(asset.change24h)}
          </span>
          {asset.value > 1 && Math.abs(valueChange24h) >= 0.01 && (
            <span className={`text-[10px] font-mono ${isPositive ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'} opacity-70`}>
              {isPositive ? '+' : ''}{formatCurrency(valueChange24h)}
            </span>
          )}
        </div>
      </td>

      {/* Chain */}
      <td className="py-5 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
            style={{
              backgroundColor: chainConfig.color + '15',
              color: chainConfig.color,
              border: `1px solid ${chainConfig.color}20`,
            }}
          >
            {chainConfig.name}
          </span>
          {onCreateAlert && (
            <button
              onClick={(e) => { e.stopPropagation(); onCreateAlert(asset.symbol); }}
              className="p-1.5 sm:opacity-0 group-hover:opacity-100 hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-all"
              title="Create alert"
              aria-label={`Create alert for ${asset.symbol}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
