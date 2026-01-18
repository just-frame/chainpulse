'use client';

import type { Domain } from '@/types';

interface DomainListProps {
  domains: Domain[];
}

export default function DomainList({ domains }: DomainListProps) {
  if (domains.length === 0) return null;
  
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

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-3">
        Domains
        <span className="ml-2 text-sm text-[var(--text-muted)]">
          ({domains.length})
        </span>
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {domains.map((domain, index) => (
          <div
            key={domain.mint}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm font-mono animate-fadeIn hover:border-[var(--accent-green)] transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-[var(--accent-green)]">●</span>
            <span>{domain.name}</span>
            {(domain.purchasePrice !== undefined || domain.purchaseDate) && (
              <span className="text-xs text-[var(--text-muted)] border-l border-[var(--border-primary)] pl-2 flex items-center gap-1.5">
                {domain.purchasePrice !== undefined && (
                  <span className="text-[var(--accent-green)]">{formatPrice(domain.purchasePrice)}</span>
                )}
                {domain.purchaseDate && (
                  <span>• {formatDate(domain.purchaseDate)}</span>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
