'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PortfolioSummary from '@/components/PortfolioSummary';
import PortfolioTable from '@/components/PortfolioTable';
import WalletInput from '@/components/WalletInput';
import NFTGrid from '@/components/NFTGrid';
import DomainList from '@/components/DomainList';
import TabNav from '@/components/TabNav';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { Chain } from '@/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('assets');
  const { 
    assets,
    nfts,
    domains,
    wallets,
    isLoading, 
    error, 
    lastUpdated,
    isAuthenticated,
    addWallet,
    refreshAll,
    removeWallet,
  } = usePortfolio();

  // Calculate portfolio totals
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const weightedChange = totalValue > 0
    ? assets.reduce((sum, asset) => sum + (asset.value / totalValue) * asset.change24h, 0)
    : 0;
  const change24hValue = totalValue * (weightedChange / 100);

  const handleAddWallet = async (address: string, chain: Chain) => {
    await addWallet(address, chain);
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Portfolio Summary */}
          <PortfolioSummary
            totalValue={totalValue}
            change24h={change24hValue}
            change24hPercent={weightedChange}
          />

          {/* Add Wallet */}
          <WalletInput onAdd={handleAddWallet} />

          {/* Error message */}
          {error && (
            <div className="card bg-[var(--accent-red)]/10 border-[var(--accent-red)]/20">
              <p className="text-[var(--accent-red)] text-sm">{error}</p>
            </div>
          )}

          {/* Tracked Wallets */}
          {wallets.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {wallets.map((wallet, i) => (
                  <div
                    key={wallet.id || i}
                    className="group flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <span className="capitalize">{wallet.chain}</span>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                    <button
                      onClick={() => removeWallet(wallet.address, wallet.chain)}
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-[var(--accent-red)] transition-all"
                      title="Remove wallet"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Sign in hint for anonymous users */}
              {!isAuthenticated && wallets.length > 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                  <span className="text-yellow-500">⚠</span> Sign in to save your wallets
                </p>
              )}
            </div>
          )}

          {/* Holdings Card with Tabs */}
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tabs */}
              <TabNav
                tabs={[
                  { id: 'assets', label: 'Assets', count: assets.length },
                  { id: 'nfts', label: 'NFTs', count: nfts.length },
                  { id: 'domains', label: 'Domains', count: domains.length },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              {/* Refresh button + last updated */}
              {wallets.length > 0 && (
                <div className="flex items-center gap-3">
                  {lastUpdated && (
                    <span className="text-[var(--text-muted)] text-xs">
                      Updated {formatLastUpdated(lastUpdated)}
                    </span>
                  )}
                  <button
                    onClick={refreshAll}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-[var(--text-secondary)] ${isLoading ? 'animate-spin' : ''}`}
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {/* Assets Tab */}
              {activeTab === 'assets' && (
                <PortfolioTable assets={assets} />
              )}
              
              {/* NFTs Tab */}
              {activeTab === 'nfts' && (
                <NFTGrid nfts={nfts} />
              )}
              
              {/* Domains Tab */}
              {activeTab === 'domains' && (
                <DomainList domains={domains} />
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[var(--text-muted)] text-xs">
            Auto-refreshes every 30s • Data from CoinGecko, DeFiLlama & Helius
          </p>
        </div>
      </main>
    </div>
  );
}
