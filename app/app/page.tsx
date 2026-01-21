'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PortfolioSummary from '@/components/PortfolioSummary';
import PortfolioTable from '@/components/PortfolioTable';
import WalletInput from '@/components/WalletInput';
import NFTGrid from '@/components/NFTGrid';
import DomainList from '@/components/DomainList';
import TabNav from '@/components/TabNav';
import AlertModal, { CreateAlertData } from '@/components/AlertModal';
import AlertsList from '@/components/AlertsList';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAlerts, type Alert } from '@/hooks/useAlerts';
import type { Chain } from '@/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('assets');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  
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

  const {
    alerts,
    loading: alertsLoading,
    createAlert,
    deleteAlert,
    toggleAlert,
  } = useAlerts();

  // Calculate portfolio totals
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const weightedChange = totalValue > 0
    ? assets.reduce((sum, asset) => sum + (asset.value / totalValue) * asset.change24h, 0)
    : 0;
  const change24hValue = totalValue * (weightedChange / 100);

  const handleAddWallet = async (address: string, chain: Chain) => {
    await addWallet(address, chain);
  };

  const handleSaveAlert = async (alertData: CreateAlertData) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to create alerts');
    }
    await createAlert(alertData);
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setShowAlertModal(true);
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

  // Count enabled alerts
  const activeAlertsCount = alerts.filter(a => a.enabled).length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header 
        onAlertsClick={() => setShowAlertsPanel(!showAlertsPanel)}
        alertsCount={activeAlertsCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            {/* Portfolio Summary */}
            <PortfolioSummary
              totalValue={totalValue}
              change24h={change24hValue}
              change24hPercent={weightedChange}
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
            />

            {/* Add Wallet */}
            <WalletInput onAdd={handleAddWallet} />

            {/* Error message */}
            {error && (
              <div className="card bg-[var(--accent-red)]/10 border-[var(--accent-red)]/20 p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--accent-red)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-[var(--accent-red)] text-sm font-medium">Something went wrong</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{error}</p>
                    <button 
                      onClick={refreshAll}
                      className="text-xs text-[var(--accent-blue)] hover:underline mt-2"
                    >
                      Try again
                    </button>
                  </div>
                </div>
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
                      <span className="hidden sm:inline">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                      <span className="sm:hidden">{wallet.address.slice(0, 4)}...{wallet.address.slice(-3)}</span>
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
                
                {!isAuthenticated && wallets.length > 0 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="text-yellow-500">⚠</span> Sign in to save your wallets
                  </p>
                )}
              </div>
            )}

            {/* Holdings Card with Tabs */}
            <div className="card p-0 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabNav
                  tabs={[
                    { id: 'assets', label: 'Assets', count: assets.length },
                    { id: 'nfts', label: 'NFTs', count: nfts.length },
                    { id: 'domains', label: 'Domains', count: domains.length },
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                
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
              
              <div className="p-4 sm:p-6">
                {activeTab === 'assets' && (
                  <PortfolioTable assets={assets} isLoading={isLoading} />
                )}
                {activeTab === 'nfts' && (
                  <NFTGrid nfts={nfts} isLoading={isLoading} />
                )}
                {activeTab === 'domains' && (
                  <DomainList domains={domains} isLoading={isLoading} />
                )}
              </div>
            </div>

            <p className="text-center text-[var(--text-muted)] text-xs px-4">
              Auto-refreshes every 30s • Data from CoinGecko, DeFiLlama & Helius
          </p>
        </div>

          {/* Alerts Panel (Desktop sidebar / Mobile slide-up) */}
          {showAlertsPanel && (
            <div className="lg:w-80 card p-0 overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold">Price Alerts</h3>
                <div className="flex items-center gap-2">
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setEditingAlert(null);
                        setShowAlertModal(true);
                      }}
                      className="p-2 rounded-lg bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/80 transition-colors"
                      title="Create alert"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setShowAlertsPanel(false)}
                    className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors lg:hidden"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4 max-h-96 lg:max-h-[60vh] overflow-y-auto">
                {!isAuthenticated ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm">Sign in to create alerts</p>
                  </div>
                ) : alertsLoading ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <p className="text-sm">Loading alerts...</p>
                  </div>
                ) : (
                  <AlertsList
                    alerts={alerts}
                    onToggle={toggleAlert}
                    onDelete={deleteAlert}
                    onEdit={handleEditAlert}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false);
          setEditingAlert(null);
        }}
        onSave={handleSaveAlert}
        assets={assets}
        editingAlert={editingAlert}
        existingAlerts={alerts}
      />
    </div>
  );
}
