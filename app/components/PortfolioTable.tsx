'use client';

import type { Asset } from '@/types';
import AssetRow from './AssetRow';

interface PortfolioTableProps {
  assets: Asset[];
}

export default function PortfolioTable({ assets }: PortfolioTableProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">
          No assets yet. Add a wallet to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="py-3 pr-4 text-left w-12">#</th>
            <th className="py-3 pr-4 text-left">Asset</th>
            <th className="py-3 pr-4 text-left">Price</th>
            <th className="py-3 pr-4 text-left">Holdings</th>
            <th className="py-3 pr-4 text-left">24h</th>
            <th className="py-3 text-left">Chain</th>
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
