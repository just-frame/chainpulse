'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Asset } from '@/types';
import type { Alert } from '@/hooks/useAlerts';

// Data for creating a new alert (uses camelCase for API)
export interface CreateAlertData {
  type: 'price';
  asset: string;
  assetName: string;
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alert: CreateAlertData) => Promise<void>;
  assets: Asset[];
  editingAlert?: Alert | null;
}

export default function AlertModal({ isOpen, onClose, onSave, assets, editingAlert }: AlertModalProps) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track if we've initialized for this modal open
  const hasInitialized = useRef(false);

  // Memoize unique assets to prevent unnecessary re-renders
  const uniqueAssets = useMemo(() => {
    return assets.reduce((acc, asset) => {
      if (!acc.find(a => a.symbol === asset.symbol)) {
        acc.push(asset);
      }
      return acc;
    }, [] as Asset[]);
  }, [assets]);

  // Reset form ONLY when modal opens (not on every uniqueAssets change)
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      if (editingAlert) {
        setSelectedAsset(editingAlert.asset);
        setCondition(editingAlert.condition);
        setThreshold(editingAlert.threshold.toString());
      } else {
        setSelectedAsset(uniqueAssets[0]?.symbol || '');
        setCondition('above');
        setThreshold('');
      }
      setError('');
    } else if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, editingAlert, uniqueAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }

    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    const asset = uniqueAssets.find(a => a.symbol === selectedAsset);
    if (!asset) {
      setError('Invalid asset selected');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type: 'price',
        asset: selectedAsset,
        assetName: asset.name,
        condition,
        threshold: thresholdNum,
        enabled: true,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save alert';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedAssetData = uniqueAssets.find(a => a.symbol === selectedAsset);
  const currentPrice = selectedAssetData?.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl animate-fadeInScale">
        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-60" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-[var(--accent-primary)] opacity-50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-[var(--accent-primary)] opacity-50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-[var(--accent-primary)] opacity-50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-[var(--accent-primary)] opacity-50" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[var(--accent-primary)] animate-pulse" style={{ boxShadow: '0 0 8px var(--accent-primary)' }} />
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              {editingAlert ? 'Edit Alert' : 'New Price Alert'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Asset Selection */}
          <div>
            <label className="data-label block mb-2">
              Target Asset
            </label>
            <div className="relative">
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono focus:border-[var(--accent-primary)] focus:outline-none focus:shadow-[0_0_0_1px_var(--accent-primary),var(--glow-cyan)] transition-all cursor-pointer appearance-none"
              >
                {uniqueAssets.length === 0 ? (
                  <option value="">Add a wallet first</option>
                ) : (
                  uniqueAssets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} — ${asset.price.toFixed(2)}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
            {selectedAssetData && (
              <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-2 font-mono">
                <span className="w-1.5 h-1.5 bg-[var(--accent-green)]" style={{ boxShadow: '0 0 6px var(--accent-green)' }} />
                LIVE: <span className="text-[var(--accent-green)]">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              </p>
            )}
          </div>

          {/* Condition - Cypher Radio Controls */}
          <div>
            <label className="data-label block mb-2">
              Trigger Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Above Button */}
              <label className="cypher-radio">
                <input
                  type="radio"
                  name="condition"
                  value="above"
                  checked={condition === 'above'}
                  onChange={() => setCondition('above')}
                  className="cypher-radio-input"
                />
                <div className="cypher-radio-control cypher-radio-green">
                  <div className="cypher-radio-indicator" />
                  <svg className="cypher-radio-icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="cypher-radio-label">Above</span>
                  {condition === 'above' && <div className="cypher-radio-scanline" />}
                </div>
              </label>

              {/* Below Button */}
              <label className="cypher-radio">
                <input
                  type="radio"
                  name="condition"
                  value="below"
                  checked={condition === 'below'}
                  onChange={() => setCondition('below')}
                  className="cypher-radio-input"
                />
                <div className="cypher-radio-control cypher-radio-red">
                  <div className="cypher-radio-indicator" />
                  <svg className="cypher-radio-icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="cypher-radio-label">Below</span>
                  {condition === 'below' && <div className="cypher-radio-scanline" />}
                </div>
              </label>
            </div>
          </div>

          {/* Threshold */}
          <div>
            <label htmlFor="threshold-input" className="data-label block mb-2">
              Target Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)] font-mono text-sm">
                $
              </span>
              <input
                id="threshold-input"
                type="number"
                step="any"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 pl-7 bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono focus:border-[var(--accent-primary)] focus:outline-none focus:shadow-[0_0_0_1px_var(--accent-primary),var(--glow-cyan)] transition-all"
                style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              />
            </div>
            {currentPrice > 0 && threshold && parseFloat(threshold) > 0 && (
              <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
                <span className="text-[var(--text-secondary)]">{selectedAsset}</span>
                {condition === 'above' ? ' > ' : ' < '}
                <span className="text-[var(--text-primary)]">${parseFloat(threshold).toLocaleString()}</span>
                {' '}
                <span className={condition === 'above' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}>
                  ({condition === 'above' ? '+' : ''}{((parseFloat(threshold) / currentPrice - 1) * 100).toFixed(1)}%)
                </span>
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[var(--accent-red-muted)] border border-[var(--accent-red)]/30">
              <svg className="w-4 h-4 text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[var(--accent-red)] font-mono">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || uniqueAssets.length === 0}
            className="cyber-btn w-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-current animate-pulse" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-current" />
                {editingAlert ? 'Update Alert' : 'Deploy Alert'}
              </span>
            )}
          </button>
        </form>

        {/* Bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-30" />
      </div>
    </div>
  );
}
