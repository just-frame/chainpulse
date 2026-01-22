'use client';

import { useState } from 'react';
import type { NFT } from '@/types';
import { NFTCardSkeleton } from './ui/Skeleton';

interface NFTGridProps {
  nfts: NFT[];
  isLoading?: boolean;
}

export default function NFTGrid({ nfts, isLoading = false }: NFTGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [showReceived, setShowReceived] = useState(false);
  
  // Show skeletons while loading
  if (isLoading && nfts.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  // Categorize NFTs by how they were acquired
  const ownedNfts = nfts.filter(nft => {
    const type = nft.acquisitionType;
    const price = nft.purchasePrice;
    return type === 'minted' || type === 'purchased' || (price !== undefined && price > 0);
  });
  
  const receivedNfts = nfts.filter(nft => {
    const type = nft.acquisitionType;
    const price = nft.purchasePrice;
    return (price === 0 || price === undefined) && (type === 'received' || type === 'unknown' || type === undefined);
  });
  
  const filteredNfts = showReceived ? nfts : ownedNfts;
  const displayNfts = showAll ? filteredNfts : filteredNfts.slice(0, 12);
  const hasMore = filteredNfts.length > 12;

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>No NFTs found</p>
        <p className="text-sm mt-1">Add a wallet with NFTs to see them here</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter toggle */}
      {receivedNfts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[var(--border)]">
          <div className="text-sm text-[var(--text-secondary)]">
            {showReceived 
              ? `Showing all ${nfts.length} NFTs`
              : `Showing ${ownedNfts.length} owned NFTs`
            }
            {!showReceived && ownedNfts.length > 0 && (
              <span className="text-[var(--text-muted)] hidden sm:inline"> (minted or purchased)</span>
            )}
          </div>
          <button
            onClick={() => setShowReceived(!showReceived)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
              ${showReceived 
                ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border border-[var(--accent-green)]/30' 
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-muted)]'
              }
            `}
          >
            <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${showReceived ? 'border-[var(--accent-green)] bg-[var(--accent-green)]' : 'border-[var(--text-muted)]'}`}>
              {showReceived && (
                <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            Show received ({receivedNfts.length})
          </button>
        </div>
      )}
      
      {filteredNfts.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p>No owned NFTs found</p>
          {receivedNfts.length > 0 && (
            <button
              onClick={() => setShowReceived(true)}
              className="text-sm mt-2 text-[var(--accent-green)] hover:underline"
            >
              Show {receivedNfts.length} received/airdrops
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {displayNfts.map((nft, index) => (
              <NFTCard key={nft.mint} nft={nft} index={index} />
            ))}
          </div>
          
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)] rounded-lg hover:bg-[var(--bg-hover)]"
            >
              {showAll ? 'Show less' : `Show all ${filteredNfts.length} NFTs`}
            </button>
          )}
        </>
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

  const getAcquisitionBadge = () => {
    const type = nft.acquisitionType;
    const price = nft.purchasePrice;
    
    if (type === 'minted' || (price !== undefined && price > 0 && type !== 'purchased')) {
      return { label: 'Minted', color: 'text-purple-400 bg-purple-500/20' };
    }
    if (type === 'purchased' || (price !== undefined && price > 0)) {
      return { label: 'Bought', color: 'text-blue-400 bg-blue-500/20' };
    }
    if (type === 'received' || price === 0) {
      return { label: 'Received', color: 'text-[var(--text-muted)] bg-[var(--bg-tertiary)]' };
    }
    return null;
  };
  
  const badge = getAcquisitionBadge();
  
  return (
    <div 
      className="group relative bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--border)] hover:border-[var(--text-muted)] transition-all animate-fadeIn"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Top badges row */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
        {badge && (
          <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${badge.color}`}>
            {badge.label}
          </span>
        )}
        
        {nft.purchasePrice !== undefined && nft.purchasePrice > 0 && (
          <span className="text-[10px] font-mono text-[var(--accent-green)] px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm">
            {formatPrice(nft.purchasePrice)}
          </span>
        )}
      </div>
      
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
