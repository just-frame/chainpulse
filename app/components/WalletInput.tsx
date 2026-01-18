'use client';

import { useState, useEffect } from 'react';
import type { Chain } from '@/types';
import { CHAIN_CONFIG } from '@/types';

interface WalletInputProps {
  onAdd: (address: string, chain: Chain) => void;
}

// Chains that actually have API integration working
const WORKING_CHAINS: Chain[] = ['hyperliquid', 'solana'];
const COMING_SOON_CHAINS: Chain[] = ['ethereum', 'bitcoin'];

// Detect chain from address format
function detectChain(address: string): Chain | null {
  const trimmed = address.trim();
  
  if (!trimmed) return null;
  
  // Ethereum/EVM addresses: 0x followed by 40 hex chars
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return 'hyperliquid'; // Default EVM to Hyperliquid for now
  }
  
  // Solana addresses: Base58, 32-44 chars, no 0/O/I/l
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return 'solana';
  }
  
  // Bitcoin addresses
  // Legacy (P2PKH): starts with 1
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return 'bitcoin';
  }
  // SegWit (P2SH): starts with 3
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return 'bitcoin';
  }
  // Native SegWit (Bech32): starts with bc1
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(trimmed)) {
    return 'bitcoin';
  }
  
  return null;
}

export default function WalletInput({ onAdd }: WalletInputProps) {
  const [address, setAddress] = useState('');
  const [detectedChain, setDetectedChain] = useState<Chain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect chain when address changes
  useEffect(() => {
    const detected = detectChain(address);
    setDetectedChain(detected);
    setError(null);
  }, [address]);

  const isChainSupported = detectedChain && WORKING_CHAINS.includes(detectedChain);
  const isComingSoon = detectedChain && COMING_SOON_CHAINS.includes(detectedChain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !detectedChain) return;

    if (!isChainSupported) {
      setError(`${CHAIN_CONFIG[detectedChain].name} support coming soon!`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onAdd(address.trim(), detectedChain);
      setAddress('');
      setDetectedChain(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          Add Wallet
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Address input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste any wallet address..."
              className="input w-full font-mono text-sm pr-24"
            />
            {/* Detected chain badge */}
            {detectedChain && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isChainSupported
                      ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                  }`}
                >
                  {CHAIN_CONFIG[detectedChain].name}
                  {isComingSoon && ' ⏳'}
                </span>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!address.trim() || !detectedChain || isLoading}
            className="btn btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
              'Add Wallet'
            )}
          </button>
        </div>

        {/* Error/info message */}
        {error ? (
          <p className="text-xs text-[var(--accent-red)]">{error}</p>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Auto-detects chain • Hyperliquid & Solana ready • ETH, BTC coming soon
          </p>
        )}
      </div>
    </form>
  );
}
