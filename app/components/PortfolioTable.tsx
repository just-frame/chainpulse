'use client';

import { useState, useMemo } from 'react';
import type { Asset } from '@/types';
import { CHAIN_CONFIG, type Chain } from '@/types';
import AssetRow from './AssetRow';
import AssetCard from './AssetCard';
import { AssetRowSkeleton } from './ui/Skeleton';

interface PortfolioTableProps {
  assets: Asset[];
  isLoading?: boolean;
  totalValue?: number;
  onCreateAlert?: (symbol: string) => void;
}

export default function PortfolioTable({ assets, isLoading = false, totalValue, onCreateAlert }: PortfolioTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);

  const availableChains = useMemo(() => {
    const chains = new Set(assets.map(a => a.chain));
    return Array.from(chains).sort();
  }, [assets]);

  const filteredAssets = useMemo(() => {
    let result = assets;
    if (selectedChains.length > 0) {
      result = result.filter(a => selectedChains.includes(a.chain));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.symbol.toLowerCase().includes(query) ||
          asset.chain.toLowerCase().includes(query)
      );
    }
    return result;
  }, [assets, searchQuery, selectedChains]);

  const displayAssets = showAll ? filteredAssets : filteredAssets.slice(0, 8);
  const hasMore = filteredAssets.length > 8;

  // Loading skeletons
  if (isLoading && assets.length === 0) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="md:hidden flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl p-4 animate-shimmer">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[var(--bg-hover)]" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-[var(--bg-hover)] rounded w-24" />
                  <div className="h-3 bg-[var(--bg-hover)] rounded w-32" />
                  <div className="h-6 bg-[var(--bg-hover)] rounded w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 pr-4 text-left w-12">#</th>
                <th className="py-3 pr-6 text-left">Asset</th>
                <th className="py-3 pr-6 text-left">Price</th>
                <th className="py-3 pr-6 text-left">Holdings</th>
                <th className="py-3 pr-6 text-left">24h</th>
                <th className="py-3 text-left hidden lg:table-cell">Chain</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <AssetRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative w-16 h-16 mx-auto mb-5">
          {/* Outer frame */}
          <div className="absolute inset-0 border border-[var(--border)]" />
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-[var(--accent-primary)] opacity-60" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-[var(--accent-primary)] opacity-60" />
          {/* Icon container */}
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-tertiary)]">
            <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-1">No assets found</p>
        <p className="text-[11px] text-[var(--text-muted)] tracking-wide">Add a wallet to start tracking</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      {assets.length > 0 && (
        <div className="relative max-w-sm">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Chain filter chips */}
      {availableChains.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedChains([])}
            className={`px-3 py-1.5 text-xs font-mono tracking-wide transition-all border ${
              selectedChains.length === 0
                ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)]'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]'
            }`}
          >
            ALL
          </button>
          {availableChains.map((chain) => {
            const config = CHAIN_CONFIG[chain];
            const isSelected = selectedChains.includes(chain);
            return (
              <button
                key={chain}
                onClick={() => {
                  setSelectedChains(prev =>
                    isSelected ? prev.filter(c => c !== chain) : [...prev, chain]
                  );
                }}
                className="px-3 py-1.5 text-xs font-mono tracking-wide transition-all border"
                style={{
                  backgroundColor: isSelected ? `${config.color}15` : 'transparent',
                  borderColor: isSelected ? `${config.color}40` : 'var(--border)',
                  color: isSelected ? config.color : 'var(--text-muted)',
                }}
              >
                {config.name}
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
      {filteredAssets.length === 0 && searchQuery && (
        <div className="text-center py-10">
          <p className="text-[var(--text-muted)]">No assets matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[var(--accent-blue)] text-sm mt-2 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Mobile: Cards */}
      {filteredAssets.length > 0 && (
        <div className="md:hidden flex flex-col gap-3">
          {displayAssets.map((asset, index) => (
            <AssetCard
              key={`${asset.symbol}-${asset.chain}-${asset.isStaked}`}
              asset={asset}
              index={index}
              totalValue={totalValue}
              onCreateAlert={onCreateAlert}
            />
          ))}
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="py-3.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)] rounded-2xl hover:bg-[var(--bg-glass)] hover:border-[var(--border-hover)]"
            >
              {showAll ? 'Show less' : `Show all ${filteredAssets.length} assets`}
            </button>
          )}
        </div>
      )}

      {/* Desktop: Table */}
      {filteredAssets.length > 0 && (
        <div className="hidden md:block overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-4 pr-4 text-left w-12">#</th>
                <th className="py-4 pr-6 text-left">Asset</th>
                <th className="py-4 pr-6 text-left hidden sm:table-cell">Price</th>
                <th className="py-4 pr-6 text-left">Holdings</th>
                <th className="py-4 pr-6 text-left hidden md:table-cell">24h</th>
                <th className="py-4 text-left hidden lg:table-cell">Chain</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <AssetRow
                  key={`${asset.symbol}-${asset.chain}-${asset.isStaked}`}
                  asset={asset}
                  index={index}
                  totalValue={totalValue}
                  onCreateAlert={onCreateAlert}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
