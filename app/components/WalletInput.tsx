'use client';

import { useState, useEffect } from 'react';
import type { Chain } from '@/types';
import { CHAIN_CONFIG } from '@/types';

interface WalletInputProps {
  onAdd: (address: string, chain: Chain) => void;
}

const WORKING_CHAINS: Chain[] = [
  'hyperliquid', 'solana', 'ethereum', 'bitcoin',
  'xrp', 'dogecoin', 'zcash', 'cardano', 'litecoin', 'tron'
];
const COMING_SOON_CHAINS: Chain[] = [];

function detectChains(address: string): Chain[] {
  const trimmed = address.trim();
  if (!trimmed) return [];

  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return ['ethereum', 'hyperliquid'];
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return ['solana'];
  }
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return ['bitcoin'];
  }
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return ['bitcoin'];
  }
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(trimmed)) {
    return ['bitcoin'];
  }
  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(trimmed)) {
    return ['xrp'];
  }
  if (/^[DA][1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    return ['dogecoin'];
  }
  if (/^t[13][a-zA-Z0-9]{33}$/.test(trimmed)) {
    return ['zcash'];
  }
  if (/^zs1[a-z0-9]{75,}$/.test(trimmed)) {
    return ['zcash'];
  }
  if (/^u1[a-z0-9]{100,}$/.test(trimmed)) {
    return ['zcash'];
  }
  if (/^addr1[a-z0-9]{50,}$/.test(trimmed)) {
    return ['cardano'];
  }
  if (/^stake1[a-z0-9]{50,}$/.test(trimmed)) {
    return ['cardano'];
  }
  if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(trimmed)) {
    return ['litecoin'];
  }
  if (/^ltc1[a-z0-9]{39,59}$/.test(trimmed)) {
    return ['litecoin'];
  }
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    return ['tron'];
  }
  return [];
}

export default function WalletInput({ onAdd }: WalletInputProps) {
  const [address, setAddress] = useState('');
  const [detectedChains, setDetectedChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chains = detectChains(address);
    setDetectedChains(chains);

    if (chains.length === 1) {
      setSelectedChain(chains[0]);
    } else if (chains.length > 1) {
      const workingChain = chains.find(c => WORKING_CHAINS.includes(c));
      setSelectedChain(workingChain || null);
    } else {
      setSelectedChain(null);
    }
    setError(null);
  }, [address]);

  const isChainSupported = selectedChain && WORKING_CHAINS.includes(selectedChain);
  const isComingSoon = selectedChain && COMING_SOON_CHAINS.includes(selectedChain);
  const hasMultipleChains = detectedChains.length > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !selectedChain) return;

    if (!isChainSupported) {
      setError(`${CHAIN_CONFIG[selectedChain].name} support coming soon`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onAdd(address.trim(), selectedChain);
      setAddress('');
      setDetectedChains([]);
      setSelectedChain(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            Add Wallet
          </h3>
        </div>

        {/* Input + Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste any wallet address..."
              className={`input w-full font-mono text-sm ${hasMultipleChains ? 'pr-4' : 'pr-28'}`}
            />
            {!hasMultipleChains && selectedChain && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span
                  className={`
                    text-[10px] px-2.5 py-1 rounded-full font-medium
                    ${isChainSupported
                      ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border)]'
                    }
                  `}
                >
                  {CHAIN_CONFIG[selectedChain].name}
                  {isComingSoon && ' (soon)'}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!address.trim() || !selectedChain || isLoading}
            className="btn btn-primary whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding...
              </span>
            ) : (
              'Track Wallet'
            )}
          </button>
        </div>

        {/* Chain selector for ambiguous addresses */}
        {hasMultipleChains && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-[var(--text-muted)]">Select chain:</span>
            {detectedChains.map((chain) => {
              const supported = WORKING_CHAINS.includes(chain);
              const isSelected = selectedChain === chain;
              return (
                <button
                  key={chain}
                  type="button"
                  onClick={() => setSelectedChain(chain)}
                  className={`
                    text-xs px-3 py-1.5 rounded-full transition-all font-medium
                    ${isSelected
                      ? supported
                        ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] ring-1 ring-[var(--text-muted)]'
                      : supported
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border)]'
                    }
                  `}
                >
                  {CHAIN_CONFIG[chain].name}
                </button>
              );
            })}
          </div>
        )}

        {/* Status message */}
        {error ? (
          <p className="text-xs text-[var(--accent-red)] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Auto-detects chain from address format
          </p>
        )}
      </div>
    </form>
  );
}
