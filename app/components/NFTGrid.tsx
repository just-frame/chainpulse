'use client';

import { useState } from 'react';
import type { NFT } from '@/types';

interface NFTGridProps {
  nfts: NFT[];
}

export default function NFTGrid({ nfts }: NFTGridProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (nfts.length === 0) return null;
  
  const displayNfts = showAll ? nfts : nfts.slice(0, 8);
  const hasMore = nfts.length > 8;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">
          NFTs
          <span className="ml-2 text-sm text-[var(--text-muted)]">
            ({nfts.length})
          </span>
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {displayNfts.map((nft, index) => (
          <NFTCard key={nft.mint} nft={nft} index={index} />
        ))}
      </div>
      
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-hover)]"
        >
          Show all {nfts.length} NFTs
        </button>
      )}
    </div>
  );
}

function NFTCard({ nft, index }: { nft: NFT; index: number }) {
  const [imgError, setImgError] = useState(false);
  
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
    <div 
      className="group relative bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--border-primary)] hover:border-[var(--border-hover)] transition-all animate-fadeIn"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Purchase price badge */}
      {nft.purchasePrice !== undefined && (
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm">
          <span className={`text-[10px] font-mono ${nft.purchasePrice === 0 ? 'text-[var(--text-muted)]' : 'text-[var(--accent-green)]'}`}>
            {formatPrice(nft.purchasePrice)}
          </span>
        </div>
      )}
      
      {/* Image */}
      <div className="aspect-square bg-[var(--bg-tertiary)] overflow-hidden">
        {nft.imageUrl && !imgError ? (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-medium truncate" title={nft.name}>
          {nft.name}
        </p>
        <div className="flex items-center justify-between gap-1">
          {nft.collection ? (
            <p className="text-[10px] text-[var(--text-muted)] truncate flex-1" title={nft.collection}>
              {nft.collection}
            </p>
          ) : (
            <span />
          )}
          {nft.purchaseDate && (
            <p className="text-[10px] text-[var(--text-muted)] shrink-0">
              {formatDate(nft.purchaseDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
