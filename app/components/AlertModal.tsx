'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Asset } from '@/types';
import type { Alert } from '@/hooks/useAlerts';

// Data for creating a new alert (uses camelCase for API)
export interface CreateAlertData {
  type: 'price' | 'percent_change';
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
  existingAlerts?: Alert[];
}

export default function AlertModal({ isOpen, onClose, onSave, assets, editingAlert, existingAlerts = [] }: AlertModalProps) {
  const [type, setType] = useState<'price' | 'percent_change'>('price');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get unique assets by symbol - memoize to prevent infinite loops
  const uniqueAssets = useMemo(() => {
    return assets.reduce((acc, asset) => {
      if (!acc.find(a => a.symbol === asset.symbol)) {
        acc.push(asset);
      }
      return acc;
    }, [] as Asset[]);
  }, [assets]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingAlert) {
        setType(editingAlert.type);
        setSelectedAsset(editingAlert.asset);
        setCondition(editingAlert.condition);
        setThreshold(editingAlert.threshold.toString());
      } else {
        setType('price');
        setSelectedAsset(uniqueAssets[0]?.symbol || '');
        setCondition('above');
        setThreshold('');
      }
      setError('');
    }
  }, [isOpen, editingAlert, uniqueAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('[AlertModal] Submit clicked, threshold:', threshold);

    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }

    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      setError('Please enter a valid target price');
      return;
    }

    const asset = uniqueAssets.find(a => a.symbol === selectedAsset);
    if (!asset) {
      setError('Invalid asset selected');
      return;
    }

    // Check for duplicate alert (same asset, type, condition, threshold)
    if (!editingAlert) {
      const isDuplicate = existingAlerts.some(
        a => a.asset === selectedAsset && 
             a.type === type && 
             a.condition === condition && 
             a.threshold === thresholdNum
      );
      if (isDuplicate) {
        setError('You already have an identical alert for this asset');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      console.log('[AlertModal] Saving alert...');
      await onSave({
        type,
        asset: selectedAsset,
        assetName: asset.name,
        condition,
        threshold: thresholdNum,
        enabled: true,
      });
      console.log('[AlertModal] Alert saved successfully');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save alert';
      setError(message);
      console.error('[AlertModal] Error saving alert:', err);
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"
        onClick={onClose}
      />
      
      {/* Modal - z-10 ensures it's above backdrop */}
      <div className="relative z-10 w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold">
            {editingAlert ? 'Edit Alert' : 'Create Price Alert'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert Type - Large Segmented Control */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              Alert Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('price')}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-base font-medium transition-all border-2
                  ${type === 'price'
                    ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)] text-[var(--accent-blue)]'
                    : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Price Alert</span>
                <span className="text-xs opacity-70">When price hits target</span>
              </button>
              <button
                type="button"
                onClick={() => setType('percent_change')}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-base font-medium transition-all border-2
                  ${type === 'percent_change'
                    ? 'bg-[var(--accent-blue)]/10 border-[var(--accent-blue)] text-[var(--accent-blue)]'
                    : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                <span>% Change</span>
                <span className="text-xs opacity-70">When price moves X%</span>
              </button>
            </div>
          </div>

          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              Select Asset
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full p-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-base focus:border-[var(--accent-blue)] focus:outline-none transition-colors cursor-pointer"
            >
              {uniqueAssets.length === 0 ? (
                <option value="">Add a wallet first</option>
              ) : (
                uniqueAssets.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol}) — ${asset.price.toFixed(2)}
                  </option>
                ))
              )}
            </select>
            {selectedAssetData && (
              <p className="text-sm text-[var(--text-muted)] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                Current price: <span className="font-mono font-medium text-[var(--text-primary)]">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              </p>
            )}
          </div>

          {/* Condition - Large Buttons */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              Alert Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`
                  flex items-center justify-center gap-3 p-4 rounded-xl text-base font-semibold transition-all border-2
                  ${condition === 'above'
                    ? 'bg-[var(--accent-green)]/15 border-[var(--accent-green)] text-[var(--accent-green)]'
                    : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {type === 'price' ? 'Goes Above' : 'Rises By'}
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`
                  flex items-center justify-center gap-3 p-4 rounded-xl text-base font-semibold transition-all border-2
                  ${condition === 'below'
                    ? 'bg-[var(--accent-red)]/15 border-[var(--accent-red)] text-[var(--accent-red)]'
                    : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {type === 'price' ? 'Goes Below' : 'Drops By'}
              </button>
            </div>
          </div>

          {/* Threshold */}
          <div>
            <label htmlFor="alert-threshold" className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              {type === 'price' ? 'Target Price (USD)' : 'Percentage Change (%)'}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] text-lg font-mono">
                {type === 'price' ? '$' : ''}
              </span>
              <input
                id="alert-threshold"
                name="threshold"
                type="number"
                min="0"
                step="0.01"
                value={threshold}
                onChange={(e) => {
                  console.log('[AlertModal] Input changed:', e.target.value);
                  setThreshold(e.target.value);
                }}
                onKeyDown={(e) => {
                  console.log('[AlertModal] Key pressed:', e.key);
                }}
                placeholder={type === 'price' ? '150.00' : '10'}
                className="flex-1 p-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-lg font-mono focus:border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {type === 'percent_change' && (
                <span className="text-[var(--text-muted)] text-lg font-mono">%</span>
              )}
            </div>
            {type === 'price' && currentPrice > 0 && threshold && parseFloat(threshold) > 0 && (
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Alert when <span className="text-[var(--text-primary)] font-medium">{selectedAsset}</span>
                {condition === 'above' ? ' rises above ' : ' drops below '}
                <span className="text-[var(--text-primary)] font-mono">${parseFloat(threshold).toLocaleString()}</span>
                {' '}
                <span className={`font-medium ${condition === 'above' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                  ({condition === 'above' ? '+' : ''}{((parseFloat(threshold) / currentPrice - 1) * 100).toFixed(1)}% from current)
                </span>
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 rounded-lg">
              <svg className="w-5 h-5 text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[var(--accent-red)]">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || uniqueAssets.length === 0}
            className="w-full py-4 px-6 bg-white text-black rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : editingAlert ? 'Update Alert' : '🔔 Create Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
