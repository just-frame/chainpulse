'use client';

import { useState, useEffect } from 'react';
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
}

export default function AlertModal({ isOpen, onClose, onSave, assets, editingAlert }: AlertModalProps) {
  const [type, setType] = useState<'price' | 'percent_change'>('price');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get unique assets by symbol
  const uniqueAssets = assets.reduce((acc, asset) => {
    if (!acc.find(a => a.symbol === asset.symbol)) {
      acc.push(asset);
    }
    return acc;
  }, [] as Asset[]);

  // Reset form when modal opens/closes or editing alert changes
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

    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }

    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      setError('Please enter a valid threshold');
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
        type,
        asset: selectedAsset,
        assetName: asset.name,
        condition,
        threshold: thresholdNum,
        enabled: true,
      });
      onClose();
    } catch (err) {
      setError('Failed to save alert');
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">
            {editingAlert ? 'Edit Alert' : 'Create Alert'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Alert Type */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Alert Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('price')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  type === 'price'
                    ? 'bg-[var(--accent-blue)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                Price Alert
              </button>
              <button
                type="button"
                onClick={() => setType('percent_change')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  type === 'percent_change'
                    ? 'bg-[var(--accent-blue)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                % Change
              </button>
            </div>
          </div>

          {/* Asset Selection */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Asset
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none transition-colors"
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
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                Current price: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </p>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Condition
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  condition === 'above'
                    ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border border-[var(--accent-green)]/30'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {type === 'price' ? '↑ Goes Above' : '↑ Rises By'}
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  condition === 'below'
                    ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)] border border-[var(--accent-red)]/30'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {type === 'price' ? '↓ Goes Below' : '↓ Drops By'}
              </button>
            </div>
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              {type === 'price' ? 'Price (USD)' : 'Percentage (%)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {type === 'price' ? '$' : '%'}
              </span>
              <input
                type="number"
                step="any"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={type === 'price' ? '100.00' : '10'}
                className="w-full p-3 pl-8 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] font-mono focus:border-[var(--accent-blue)] focus:outline-none transition-colors"
              />
            </div>
            {type === 'price' && currentPrice > 0 && threshold && (
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                {condition === 'above' ? 'Alert when' : 'Alert when'} {selectedAsset}{' '}
                {condition === 'above' ? 'rises above' : 'drops below'} ${parseFloat(threshold).toLocaleString()}
                {' '}({((parseFloat(threshold) / currentPrice - 1) * 100).toFixed(1)}% from current)
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[var(--accent-red)]">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || uniqueAssets.length === 0}
            className="w-full py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : editingAlert ? 'Update Alert' : 'Create Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
