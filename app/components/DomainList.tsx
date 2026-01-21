'use client';

import type { Domain } from '@/types';
import { DomainCardSkeleton } from './ui/Skeleton';

interface DomainListProps {
  domains: Domain[];
  isLoading?: boolean;
}

export default function DomainList({ domains, isLoading = false }: DomainListProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    if (price < 0.01) return `${price.toFixed(4)} SOL`;
    if (price < 1) return `${price.toFixed(3)} SOL`;
    return `${price.toFixed(2)} SOL`;
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Show skeletons while loading
  if (isLoading && domains.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <DomainCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <p>No domains found</p>
        <p className="text-sm mt-1">Add a wallet with .sol or .eth domains</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {domains.map((domain, index) => (
        <div
          key={domain.mint}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg animate-fadeIn hover:border-[var(--accent-green)] transition-colors"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[var(--accent-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-mono font-medium truncate">{domain.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {domain.name.endsWith('.sol') ? 'Solana Name Service' : 'Ethereum Name Service'}
              </p>
            </div>
          </div>
          
          <div className="text-left sm:text-right pl-13 sm:pl-0">
            {domain.purchasePrice !== undefined && (
              <p className={`font-mono text-sm ${domain.purchasePrice === 0 ? 'text-[var(--text-muted)]' : 'text-[var(--accent-green)]'}`}>
                {formatPrice(domain.purchasePrice)}
              </p>
            )}
            {domain.purchaseDate && (
              <p className="text-xs text-[var(--text-muted)]">
                {formatDate(domain.purchaseDate)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
