'use client';

import { useState, useEffect } from 'react';
import type { Chain } from '@/types';
import { CHAIN_CONFIG } from '@/types';

interface WalletInputProps {
  onAdd: (address: string, chain: Chain) => void;
}

// Chains that actually have API integration working
const WORKING_CHAINS: Chain[] = [
  'hyperliquid', 'solana', 'ethereum', 'bitcoin', 
  'xrp', 'dogecoin', 'zcash', 'cardano', 'litecoin', 'tron'
];
const COMING_SOON_CHAINS: Chain[] = [];

// Detect possible chains from address format
function detectChains(address: string): Chain[] {
  const trimmed = address.trim();
  
  if (!trimmed) return [];
  
  // Ethereum/EVM addresses: 0x followed by 40 hex chars
  // Could be Ethereum OR Hyperliquid
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return ['ethereum', 'hyperliquid'];
  }
  
  // Solana addresses: Base58, 32-44 chars, no 0/O/I/l
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return ['solana'];
  }
  
  // Bitcoin addresses
  // Legacy (P2PKH): starts with 1
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return ['bitcoin'];
  }
  // SegWit (P2SH): starts with 3
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) {
    return ['bitcoin'];
  }
  // Native SegWit (Bech32): starts with bc1
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(trimmed)) {
    return ['bitcoin'];
  }
  
  // XRP addresses: starts with 'r', 25-35 chars
  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(trimmed)) {
    return ['xrp'];
  }
  
  // Dogecoin addresses: starts with 'D' or 'A', 34 chars
  if (/^[DA][1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    return ['dogecoin'];
  }
  
  // Zcash transparent addresses: t1 or t3
  if (/^t[13][a-zA-Z0-9]{33}$/.test(trimmed)) {
    return ['zcash'];
  }
  
  // Zcash shielded Sapling addresses: zs1
  if (/^zs1[a-z0-9]{75,}$/.test(trimmed)) {
    return ['zcash'];
  }
  
  // Zcash unified addresses: u1
  if (/^u1[a-z0-9]{100,}$/.test(trimmed)) {
    return ['zcash'];
  }
  
  // Cardano Shelley addresses: addr1
  if (/^addr1[a-z0-9]{50,}$/.test(trimmed)) {
    return ['cardano'];
  }
  
  // Cardano stake addresses: stake1
  if (/^stake1[a-z0-9]{50,}$/.test(trimmed)) {
    return ['cardano'];
  }
  
  // Litecoin addresses: L (P2PKH), M (P2SH), or ltc1 (SegWit)
  if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(trimmed)) {
    return ['litecoin'];
  }
  if (/^ltc1[a-z0-9]{39,59}$/.test(trimmed)) {
    return ['litecoin'];
  }
  
  // Tron addresses: starts with T
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

  // Auto-detect chains when address changes
  useEffect(() => {
    const chains = detectChains(address);
    setDetectedChains(chains);
    
    // Auto-select if only one chain detected
    if (chains.length === 1) {
      setSelectedChain(chains[0]);
    } else if (chains.length > 1) {
      // Multiple chains - default to first working one or null
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
      setError(`${CHAIN_CONFIG[selectedChain].name} support coming soon!`);
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
              className={`input w-full font-mono text-sm ${hasMultipleChains ? 'pr-4' : 'pr-24'}`}
            />
            {/* Single chain badge (when not ambiguous) */}
            {!hasMultipleChains && selectedChain && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isChainSupported
                      ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                  }`}
                >
                  {CHAIN_CONFIG[selectedChain].name}
                  {isComingSoon && ' ⏳'}
                </span>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!address.trim() || !selectedChain || isLoading}
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

        {/* Chain selector when address is ambiguous (0x = ETH or Hyperliquid) */}
        {hasMultipleChains && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-[var(--text-muted)]">Select chain:</span>
            <div className="flex gap-2">
              {detectedChains.map((chain) => {
                const supported = WORKING_CHAINS.includes(chain);
                const isSelected = selectedChain === chain;
                return (
                  <button
                    key={chain}
                    type="button"
                    onClick={() => setSelectedChain(chain)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      isSelected
                        ? supported
                          ? 'bg-[var(--accent-green)] text-black font-medium'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] ring-1 ring-[var(--text-muted)]'
                        : supported
                          ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent-green)]/20'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                    }`}
                  >
                    {CHAIN_CONFIG[chain].name}
                    {!supported && ' ⏳'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error/info message */}
        {error ? (
          <p className="text-xs text-[var(--accent-red)]">{error}</p>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Auto-detects chain • BTC, ETH, SOL, XRP, DOGE, ZEC & more
          </p>
        )}
      </div>
    </form>
  );
}
