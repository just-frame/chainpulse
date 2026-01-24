'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAlerts, type Alert, type AlertCheckResult } from '@/hooks/useAlerts';
import { useToast } from '@/components/ui/Toast';
import type { Chain } from '@/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('assets');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const { addToast } = useToast();
  const lastCheckRef = useRef<string>('');

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
    lastCheckResult,
    createAlert,
    deleteAlert,
    toggleAlert,
    checkAlerts,
  } = useAlerts();

  useEffect(() => {
    if (lastCheckResult && lastCheckResult.triggered > 0 && lastCheckResult.triggeredAlerts) {
      const resultKey = lastCheckResult.triggeredIds.join(',');
      if (resultKey !== lastCheckRef.current) {
        lastCheckRef.current = resultKey;

        for (const alert of lastCheckResult.triggeredAlerts) {
          const arrow = alert.condition === 'above' ? '' : '';
          const verb = alert.condition === 'above' ? 'went above' : 'dropped below';
          const threshold = alert.type === 'price'
            ? `$${alert.threshold.toLocaleString()}`
            : `${alert.threshold}%`;

          addToast(
            `${arrow} ${alert.assetName || alert.asset} ${verb} ${threshold}!`,
            alert.condition === 'above' ? 'success' : 'warning',
            8000
          );
        }
        setShowAlertsPanel(true);
      }
    }
  }, [lastCheckResult, addToast]);

  const handleManualCheckAlerts = useCallback(async () => {
    const result = await checkAlerts();
    if (result && result.triggered === 0) {
      addToast('All alerts checked - no conditions met yet', 'info', 3000);
    }
  }, [checkAlerts, addToast]);

  const handleRefreshWithAlertCheck = useCallback(async () => {
    await refreshAll();
    if (isAuthenticated && alerts.filter(a => a.enabled).length > 0) {
      setTimeout(() => {
        checkAlerts();
      }, 1000);
    }
  }, [refreshAll, isAuthenticated, alerts, checkAlerts]);

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

  const activeAlertsCount = alerts.filter(a => a.enabled).length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header
        onAlertsClick={() => setShowAlertsPanel(!showAlertsPanel)}
        alertsCount={activeAlertsCount}
      />

      <main className="w-full px-5 sm:px-8 lg:px-12 xl:px-20 py-10 sm:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14 max-w-[1920px] mx-auto">

          {/* Left Column - Summary & Controls */}
          <div className="xl:col-span-3 flex flex-col gap-8">
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

            {/* Error */}
            {error && (
              <div className="card bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-red)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
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
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-caption">
                    Watching
                  </span>
                  <span className="text-sm text-[var(--text-muted)] font-mono">
                    {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {wallets.map((wallet, i) => (
                    <div
                      key={wallet.id || i}
                      className="group flex items-center justify-between gap-4 py-3 px-4 -mx-4 rounded-lg hover:bg-[var(--bg-glass)] transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] shrink-0" />
                        <span className="font-mono text-[var(--text-primary)] text-sm truncate">
                          <span className="hidden sm:inline">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                          <span className="sm:hidden">{wallet.address.slice(0, 4)}...{wallet.address.slice(-3)}</span>
                        </span>
                        <span className="text-sm text-[var(--text-muted)] capitalize shrink-0">{wallet.chain}</span>
                      </div>
                      <button
                        onClick={() => removeWallet(wallet.address, wallet.chain)}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center sm:opacity-0 group-hover:opacity-100 hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 rounded-lg transition-all shrink-0"
                        title="Remove wallet"
                        aria-label="Remove wallet"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {!isAuthenticated && (
                  <p className="text-sm text-[var(--text-muted)] flex items-center gap-3 mt-5 pt-5 border-t border-[var(--border)]">
                    <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Sign in to save wallets across devices
                  </p>
                )}
              </div>
            )}

            {/* Desktop Alerts Panel - Inline in sidebar */}
            {showAlertsPanel && (
              <div className="hidden xl:block card p-0 overflow-hidden animate-fadeIn">
                {/* Header with accent */}
                <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50" />
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-primary)]" style={{ boxShadow: '0 0 6px var(--accent-primary)' }} />
                    <h3 className="text-xs font-semibold tracking-wider uppercase">Price Alerts</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAuthenticated && alerts.length > 0 && (
                      <button
                        onClick={handleManualCheckAlerts}
                        className="p-2 hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
                        title="Check alerts now"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </button>
                    )}
                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          setEditingAlert(null);
                          setShowAlertModal(true);
                        }}
                        className="p-2 bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all"
                        title="Create alert"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setShowAlertsPanel(false)}
                      className="p-2 hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-1"
                      title="Close"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-5 max-h-[40vh] overflow-y-auto">
                  {!isAuthenticated ? (
                    <div className="text-center py-10">
                      <div className="w-14 h-14 mx-auto mb-4 bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="square" strokeLinejoin="miter" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-1">Authentication Required</p>
                      <p className="text-[10px] text-[var(--text-muted)] tracking-wide">Sign in to create alerts</p>
                    </div>
                  ) : alertsLoading ? (
                    <div className="text-center py-10">
                      <div className="w-6 h-6 mx-auto border-2 border-[var(--border)] border-t-[var(--accent-primary)] animate-spin" />
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

            {/* Footer note */}
            <p className="text-center text-[var(--text-muted)] text-[11px] px-4 xl:mt-auto">
              Auto-refreshes every 30s
            </p>
          </div>

          {/* Right Column - Holdings */}
          <div className="xl:col-span-9 flex flex-col gap-8">
            <div className="card p-0 overflow-hidden">
              {/* Tab Header */}
              <div className="px-8 sm:px-10 py-6 border-b border-[var(--border)]">
                <div className="flex items-center justify-between gap-4">
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
                    <div className="flex items-center gap-3 shrink-0">
                      {lastUpdated && (
                        <span className="text-[var(--text-muted)] text-xs font-mono hidden sm:block">
                          {formatLastUpdated(lastUpdated)}
                        </span>
                      )}
                      <button
                        onClick={handleRefreshWithAlertCheck}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl hover:bg-[var(--bg-glass)] border border-transparent hover:border-[var(--border)] transition-all disabled:opacity-50"
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
              </div>

              {/* Tab Content */}
              <div className="p-8 sm:p-10">
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
          </div>
        </div>
      </main>

      {/* Alerts Slide Panel - Works on all screen sizes */}
      <div
        className={`
          fixed inset-0 z-50 xl:hidden
          transition-opacity duration-300 ease-out
          ${showAlertsPanel ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Backdrop with blur */}
        <div
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300
            ${showAlertsPanel ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setShowAlertsPanel(false)}
        />

        {/* Slide-in Panel from Right */}
        <div
          className={`
            absolute top-0 right-0 bottom-0 w-full max-w-md
            bg-[var(--bg-primary)] border-l border-[var(--border)]
            shadow-[-8px_0_32px_rgba(0,0,0,0.5)]
            transform transition-transform duration-300 ease-out
            ${showAlertsPanel ? 'translate-x-0' : 'translate-x-full'}
            flex flex-col
          `}
        >
          {/* Accent line on left edge */}
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--accent-primary)] to-transparent opacity-40" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[var(--accent-primary)] animate-pulse" style={{ boxShadow: '0 0 8px var(--accent-primary)' }} />
              <h3 className="text-sm font-semibold tracking-wider uppercase">Price Alerts</h3>
              {alerts.filter(a => a.enabled).length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide bg-[var(--accent-green-muted)] text-[var(--accent-green)] border border-[var(--accent-green)]/30">
                  {alerts.filter(a => a.enabled).length} ACTIVE
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAlertsPanel(false)}
              className="p-3 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Close alerts panel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Bar */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border)] shrink-0">
              <button
                onClick={() => {
                  setEditingAlert(null);
                  setShowAlertModal(true);
                }}
                className="flex-1 cyber-btn flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Alert
              </button>
              {alerts.length > 0 && (
                <button
                  onClick={handleManualCheckAlerts}
                  className="p-3 border border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] transition-all text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                  title="Check alerts now"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {!isAuthenticated ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-5 bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-1">Authentication Required</p>
                <p className="text-[10px] text-[var(--text-muted)] tracking-wide">Sign in to create price alerts</p>
              </div>
            ) : alertsLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 mx-auto border-2 border-[var(--border)] border-t-[var(--accent-primary)] animate-spin" />
                <p className="text-xs text-[var(--text-muted)] mt-4 tracking-wide">Loading alerts...</p>
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

          {/* Footer hint */}
          <div className="px-6 py-4 border-t border-[var(--border)] shrink-0">
            <p className="text-[10px] text-[var(--text-muted)] tracking-wide text-center">
              Alerts checked every 30 seconds
            </p>
          </div>
        </div>
      </div>

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
      />
    </div>
  );
}
