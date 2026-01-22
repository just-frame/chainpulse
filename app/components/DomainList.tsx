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
    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3">
      {domains.map((domain, index) => (
        <div
          key={domain.mint}
          className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-xl animate-fadeIn hover:border-[var(--accent-primary)]/50 transition-all"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>

          {/* Domain info */}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-base font-medium truncate">{domain.name}</p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: domain.name.endsWith('.sol') ? '#9945FF15' : '#627EEA15',
                  color: domain.name.endsWith('.sol') ? '#9945FF' : '#627EEA',
                }}
              >
                {domain.name.endsWith('.sol') ? 'Solana' : 'Ethereum'}
              </span>
              {domain.purchaseDate && (
                <span>{formatDate(domain.purchaseDate)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
