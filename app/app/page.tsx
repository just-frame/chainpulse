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

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 max-w-[1800px] mx-auto">

          {/* Left Column - Summary & Controls */}
          <div className="xl:col-span-3 flex flex-col gap-5">
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
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Tracked Wallets
                </span>
                <div className="flex flex-wrap gap-2">
                  {wallets.map((wallet, i) => (
                    <div
                      key={wallet.id || i}
                      className="group flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
                    >
                      <span className="capitalize text-[var(--text-muted)]">{wallet.chain}</span>
                      <span className="text-[var(--border-hover)]"></span>
                      <span className="hidden sm:inline">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                      <span className="sm:hidden">{wallet.address.slice(0, 4)}...{wallet.address.slice(-3)}</span>
                      <button
                        onClick={() => removeWallet(wallet.address, wallet.chain)}
                        className="-mr-1 p-1.5 opacity-0 group-hover:opacity-100 hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 rounded-lg transition-all"
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
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Sign in to save your wallets
                  </p>
                )}
              </div>
            )}

            {/* Desktop Alerts Panel */}
            {showAlertsPanel && (
              <div className="hidden xl:block card p-0 overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Price Alerts</h3>
                  <div className="flex items-center gap-2">
                    {isAuthenticated && alerts.length > 0 && (
                      <button
                        onClick={handleManualCheckAlerts}
                        className="p-2 rounded-lg hover:bg-[var(--bg-glass)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                        className="p-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-all"
                        title="Create alert"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 max-h-[40vh] overflow-y-auto">
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Sign in to create alerts</p>
                    </div>
                  ) : alertsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 mx-auto border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin" />
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
          <div className="xl:col-span-9 flex flex-col gap-5">
            <div className="card p-0 overflow-hidden">
              {/* Tab Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border)]">
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
          </div>
        </div>
      </main>

      {/* Mobile Alerts Panel */}
      {showAlertsPanel && (
        <div className="xl:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAlertsPanel(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-3xl max-h-[85vh] overflow-hidden animate-slideUp border-t border-[var(--border)]">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[var(--bg-tertiary)] rounded-full" />
            </div>

            <div className="px-5 pb-4 flex items-center justify-between border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold">Price Alerts</h3>
              <div className="flex items-center gap-2">
                {isAuthenticated && alerts.length > 0 && (
                  <button
                    onClick={handleManualCheckAlerts}
                    className="p-2.5 rounded-xl hover:bg-[var(--bg-glass)] transition-colors text-[var(--text-secondary)]"
                    title="Check alerts now"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    className="p-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] transition-all"
                    title="Create alert"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setShowAlertsPanel(false)}
                  className="p-2.5 rounded-xl hover:bg-[var(--bg-glass)] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(85vh-100px)]">
              {!isAuthenticated ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-secondary)]">Sign in to create alerts</p>
                </div>
              ) : alertsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 mx-auto border-2 border-[var(--border)] border-t-[var(--text-primary)] rounded-full animate-spin" />
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
        </div>
      )}

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
