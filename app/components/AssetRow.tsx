'use client';

import { useState } from 'react';
import type { Asset } from '@/types';
import { CHAIN_CONFIG } from '@/types';
import { getIconUrl, getPlaceholderIcon } from '@/lib/icons';

interface AssetRowProps {
  asset: Asset;
  index: number;
}

export default function AssetRow({ asset, index }: AssetRowProps) {
  const [imgError, setImgError] = useState(false);
  const isPositive = asset.change24h >= 0;
  const chainConfig = CHAIN_CONFIG[asset.chain];
  
  // Icon priority: asset.icon (from Helius) > CoinGecko > placeholder
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

  // Calculate 24h value change
  const valueChange24h = asset.value * (asset.change24h / 100);

  return (
    <tr
      className="group hover:bg-[var(--bg-hover)] transition-colors cursor-pointer animate-fadeIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Rank */}
      <td className="py-4 pr-4 w-12">
        <span className="text-[var(--text-muted)] text-sm">{index + 1}</span>
      </td>

      {/* Asset */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--bg-tertiary)] shrink-0">
            {iconUrl && !imgError ? (
              <img
                src={iconUrl}
                alt={asset.symbol}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <img
                src={fallbackIcon}
                alt={asset.symbol}
                width={32}
                height={32}
                className="w-full h-full"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{asset.name}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[var(--text-muted)] text-xs uppercase">
                {asset.symbol}
              </span>
              {asset.isStaked && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-medium whitespace-nowrap">
                  {asset.stakingProtocol ? `⚡ ${asset.stakingProtocol}` : '⚡ STAKED'}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Price - hidden on mobile */}
      <td className="py-4 pr-4 hidden sm:table-cell">
        <span className="font-mono text-sm">
          {formatCurrency(asset.price)}
        </span>
      </td>

      {/* Holdings - combined balance + value */}
      <td className="py-4 pr-4">
        <div className="flex flex-col">
          <span className="font-mono font-medium text-sm sm:text-base">
            {formatCurrency(asset.value)}
          </span>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {formatBalance(asset.balance, asset.symbol)}
          </span>
        </div>
      </td>

      {/* 24h Change - Enhanced display */}
      <td className="py-4 pr-4 hidden md:table-cell">
        <div className="flex flex-col items-start gap-0.5">
          {/* Percentage with background pill */}
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-mono font-medium
              ${isPositive 
                ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]' 
                : 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]'
              }
            `}
          >
            {/* Arrow icon */}
            <svg 
              className="w-3 h-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2.5}
            >
              {isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              )}
            </svg>
            {formatPercent(asset.change24h)}
          </span>
          {/* Dollar amount change */}
          {asset.value > 1 && Math.abs(valueChange24h) >= 0.01 && (
            <span className={`text-[10px] font-mono ${isPositive ? 'text-[var(--accent-green)]/70' : 'text-[var(--accent-red)]/70'}`}>
              {isPositive ? '+' : ''}{formatCurrency(valueChange24h)}
            </span>
          )}
        </div>
      </td>

      {/* Chain - hidden on smaller screens */}
      <td className="py-4 hidden lg:table-cell">
        <span
          className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
          style={{
            backgroundColor: chainConfig.color + '15',
            color: chainConfig.color,
          }}
        >
          {chainConfig.name}
        </span>
      </td>
    </tr>
  );
}
