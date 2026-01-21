'use client';

import type { Asset } from '@/types';
import AssetRow from './AssetRow';
import { AssetRowSkeleton } from './ui/Skeleton';

interface PortfolioTableProps {
  assets: Asset[];
  isLoading?: boolean;
}

export default function PortfolioTable({ assets, isLoading = false }: PortfolioTableProps) {
  // Show skeletons while loading
  if (isLoading && assets.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-3 pr-4 text-left w-12">#</th>
              <th className="py-3 pr-4 text-left">Asset</th>
              <th className="py-3 pr-4 text-left hidden sm:table-cell">Price</th>
              <th className="py-3 pr-4 text-left">Holdings</th>
              <th className="py-3 pr-4 text-left hidden md:table-cell">24h</th>
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
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No assets found</p>
        <p className="text-sm mt-1">Add a wallet to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="py-3 pr-4 text-left w-12">#</th>
            <th className="py-3 pr-4 text-left">Asset</th>
            <th className="py-3 pr-4 text-left hidden sm:table-cell">Price</th>
            <th className="py-3 pr-4 text-left">Holdings</th>
            <th className="py-3 pr-4 text-left hidden md:table-cell">24h</th>
            <th className="py-3 text-left hidden lg:table-cell">Chain</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <AssetRow key={`${asset.symbol}-${asset.chain}-${asset.isStaked}`} asset={asset} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
