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
    // Always show exact amount to the cent
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: number, symbol: string) => {
    // Only use M for millions, otherwise show full number
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M ${symbol}`;
    }
    // Show full number with commas, appropriate decimal places
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
          {/* Icon */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--bg-tertiary)]">
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
          <div className="flex flex-col">
            <span className="font-medium">{asset.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] text-xs uppercase">
                {asset.symbol}
              </span>
              {asset.isStaked && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)]">
                  STAKED
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-4 pr-4">
        <span className="font-mono text-sm">
          {formatCurrency(asset.price)}
        </span>
      </td>

      {/* Holdings - combined balance + value */}
      <td className="py-4 pr-4">
        <div className="flex flex-col">
          <span className="font-mono font-medium">
            {formatCurrency(asset.value)}
          </span>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {formatBalance(asset.balance, asset.symbol)}
          </span>
        </div>
      </td>

      {/* 24h Change */}
      <td className="py-4 pr-4">
        <span
          className={`font-mono text-sm ${
            isPositive ? 'price-up' : 'price-down'
          }`}
        >
          {formatPercent(asset.change24h)}
        </span>
      </td>

      {/* Chain */}
      <td className="py-4">
        <span
          className="text-xs px-2 py-1 rounded-full"
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
