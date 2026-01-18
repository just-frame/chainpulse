'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Asset, Chain, NFT, Domain } from '@/types';

interface PortfolioData {
  address: string;
  chain: Chain;
  assets: Asset[];
  nfts: NFT[];
  domains: Domain[];
  totalValue: number;
  nftCount: number;
  timestamp: number;
}

interface TrackedWallet {
  address: string;
  chain: Chain;
}

interface UsePortfolioReturn {
  assets: Asset[];
  nfts: NFT[];
  domains: Domain[];
  wallets: TrackedWallet[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchPortfolio: (address: string, chain: Chain) => Promise<void>;
  refreshAll: () => Promise<void>;
  removeWallet: (address: string, chain: Chain) => void;
  clearPortfolio: () => void;
}

export function usePortfolio(): UsePortfolioReturn {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [wallets, setWallets] = useState<TrackedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data for a single wallet
  const fetchWalletData = useCallback(async (address: string, chain: Chain): Promise<PortfolioData> => {
    const response = await fetch(
      `/api/portfolio?address=${encodeURIComponent(address)}&chain=${chain}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch portfolio');
    }

    return response.json();
  }, []);

  // Fetch and add a new wallet
  const fetchPortfolio = useCallback(async (address: string, chain: Chain) => {
    // Check if already tracking
    const exists = wallets.some(
      w => w.address.toLowerCase() === address.toLowerCase() && w.chain === chain
    );
    if (exists) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWalletData(address, chain);
      
      // Add wallet to tracked list
      setWallets(prev => [...prev, { address, chain }]);
      
      // Merge assets
      setAssets(prev => {
        const assetMap = new Map<string, Asset>();
        
        for (const asset of prev) {
          const key = `${asset.symbol}-${asset.chain}-${asset.isStaked || false}`;
          assetMap.set(key, { ...asset });
        }
        
        for (const newAsset of data.assets) {
          const key = `${newAsset.symbol}-${newAsset.chain}-${newAsset.isStaked || false}`;
          const existing = assetMap.get(key);
          
          if (existing) {
            existing.balance += newAsset.balance;
            existing.value += newAsset.value;
            if (newAsset.price > 0) {
              existing.price = newAsset.price;
              existing.change24h = newAsset.change24h;
            }
          } else {
            assetMap.set(key, { ...newAsset });
          }
        }
        
        return Array.from(assetMap.values()).sort((a, b) => b.value - a.value);
      });
      
      // Add NFTs (don't merge, just append - each NFT is unique)
      if (data.nfts?.length > 0) {
        setNfts(prev => [...prev, ...data.nfts]);
      }
      
      // Add domains
      if (data.domains?.length > 0) {
        setDomains(prev => [...prev, ...data.domains]);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [wallets, fetchWalletData]);

  // Refresh all tracked wallets
  const refreshAll = useCallback(async () => {
    if (wallets.length === 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all wallets in parallel
      const allData = await Promise.all(
        wallets.map(w => fetchWalletData(w.address, w.chain))
      );
      
      // Aggregate all assets
      const assetMap = new Map<string, Asset>();
      const allNfts: NFT[] = [];
      const allDomains: Domain[] = [];
      
      for (const data of allData) {
        // Assets
        for (const asset of data.assets) {
          const key = `${asset.symbol}-${asset.chain}-${asset.isStaked || false}`;
          const existing = assetMap.get(key);
          
          if (existing) {
            existing.balance += asset.balance;
            existing.value += asset.value;
            if (asset.price > 0) {
              existing.price = asset.price;
              existing.change24h = asset.change24h;
            }
          } else {
            assetMap.set(key, { ...asset });
          }
        }
        
        // NFTs
        if (data.nfts?.length > 0) {
          allNfts.push(...data.nfts);
        }
        
        // Domains
        if (data.domains?.length > 0) {
          allDomains.push(...data.domains);
        }
      }
      
      setAssets(Array.from(assetMap.values()).sort((a, b) => b.value - a.value));
      setNfts(allNfts);
      setDomains(allDomains);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [wallets, fetchWalletData]);

  // Remove a wallet
  const removeWallet = useCallback((address: string, chain: Chain) => {
    setWallets(prev => prev.filter(
      w => !(w.address.toLowerCase() === address.toLowerCase() && w.chain === chain)
    ));
    // Trigger refresh to recalculate
    setTimeout(() => refreshAll(), 100);
  }, [refreshAll]);

  // Clear everything
  const clearPortfolio = useCallback(() => {
    setAssets([]);
    setNfts([]);
    setDomains([]);
    setWallets([]);
    setError(null);
    setLastUpdated(null);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (wallets.length > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshAll();
      }, 30000); // 30 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [wallets.length, refreshAll]);

  return {
    assets,
    nfts,
    domains,
    wallets,
    isLoading,
    error,
    lastUpdated,
    fetchPortfolio,
    refreshAll,
    removeWallet,
    clearPortfolio,
  };
}
