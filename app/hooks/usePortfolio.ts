'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Asset, Chain, NFT, Domain } from '@/types';
import { useAuth } from './useAuth';
import { useWallets } from './useWallets';

interface WalletData {
  assets: Asset[];
  nfts: NFT[];
  domains: Domain[];
}

interface TrackedWallet {
  id?: string;
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
  isAuthenticated: boolean;
  addWallet: (address: string, chain: Chain) => Promise<void>;
  removeWallet: (address: string, chain: Chain) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const { 
    wallets: savedWallets, 
    loading: walletsLoading, 
    addWallet: dbAddWallet, 
    removeWallet: dbRemoveWallet 
  } = useWallets();
  
  // Store data per wallet to avoid race conditions
  const [walletDataMap, setWalletDataMap] = useState<Map<string, WalletData>>(new Map());
  const [localWallets, setLocalWallets] = useState<TrackedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedSavedWallets = useRef(false);

  // Get current wallet list
  const wallets: TrackedWallet[] = user 
    ? savedWallets.map(w => ({ id: w.id, address: w.address, chain: w.chain as Chain }))
    : localWallets;

  // Aggregate data from all wallets
  const aggregatedData = useCallback(() => {
    const assetMap = new Map<string, Asset>();
    const allNfts: NFT[] = [];
    const allDomains: Domain[] = [];
    
    walletDataMap.forEach((data) => {
      // Merge assets
      for (const asset of data.assets) {
        const key = `${asset.symbol}-${asset.chain}-${asset.isStaked || false}`;
        const existing = assetMap.get(key);
        if (existing) {
          existing.balance += asset.balance;
          existing.value += asset.value;
        } else {
          assetMap.set(key, { ...asset });
        }
      }
      // Collect NFTs & domains
      allNfts.push(...data.nfts);
      allDomains.push(...data.domains);
    });
    
    return {
      assets: Array.from(assetMap.values()).sort((a, b) => b.value - a.value),
      nfts: allNfts,
      domains: allDomains,
    };
  }, [walletDataMap]);

  const { assets, nfts, domains } = aggregatedData();

  // Fetch portfolio data for a single wallet
  const fetchWalletData = async (address: string, chain: Chain): Promise<WalletData> => {
    const response = await fetch(
      `/api/portfolio?address=${encodeURIComponent(address)}&chain=${chain}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    const data = await response.json();
    return {
      assets: data.assets || [],
      nfts: data.nfts || [],
      domains: data.domains || [],
    };
  };

  // Add a new wallet
  const addWallet = useCallback(async (address: string, chain: Chain) => {
    const walletKey = `${address.toLowerCase()}-${chain}`;
    
    // Check if already exists
    if (walletDataMap.has(walletKey)) {
      console.log('[usePortfolio] Wallet already exists:', walletKey);
      return;
    }

    console.log('[usePortfolio] Adding wallet:', { address, chain, isAuthenticated: !!user });
    setIsLoading(true);
    setError(null);

    try {
      // Fetch data first
      const data = await fetchWalletData(address, chain);
      console.log('[usePortfolio] Fetched data:', { assets: data.assets.length, nfts: data.nfts.length });
      
      // Store the data BEFORE adding to DB (so it persists regardless of DB result)
      setWalletDataMap(prev => {
        const newMap = new Map(prev);
        newMap.set(walletKey, data);
        console.log('[usePortfolio] Data map updated, size:', newMap.size);
        return newMap;
      });
      
      // Add to wallet list (DB or local)
      if (user) {
        const { error: dbError } = await dbAddWallet(address, chain);
        if (dbError) {
          console.error('[usePortfolio] DB error (data still kept locally):', dbError);
        }
      } else {
        setLocalWallets(prev => [...prev, { address, chain }]);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[usePortfolio] Error adding wallet:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [walletDataMap, user, dbAddWallet]);

  // Remove a wallet
  const removeWallet = useCallback(async (address: string, chain: Chain) => {
    const walletKey = `${address.toLowerCase()}-${chain}`;
    const wallet = wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase() && w.chain === chain
    );
    
    // Remove from data map
    setWalletDataMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(walletKey);
      return newMap;
    });
    
    // Remove from wallet list
    if (user && wallet?.id) {
      await dbRemoveWallet(wallet.id);
    } else {
      setLocalWallets(prev => prev.filter(
        w => !(w.address.toLowerCase() === address.toLowerCase() && w.chain === chain)
      ));
    }
    
    setLastUpdated(new Date());
  }, [wallets, user, dbRemoveWallet]);

  // Refresh all wallets
  const refreshAll = useCallback(async () => {
    if (wallets.length === 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const newDataMap = new Map<string, WalletData>();
      
      await Promise.all(
        wallets.map(async (w) => {
          const walletKey = `${w.address.toLowerCase()}-${w.chain}`;
          const data = await fetchWalletData(w.address, w.chain);
          newDataMap.set(walletKey, data);
        })
      );
      
      setWalletDataMap(newDataMap);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [wallets]);

  // Load saved wallets on login (only once)
  useEffect(() => {
    console.log('[usePortfolio] Effect check:', { 
      user: !!user, 
      savedWalletsCount: savedWallets.length, 
      walletsLoading, 
      hasLoaded: hasLoadedSavedWallets.current 
    });
    
    if (user && savedWallets.length > 0 && !walletsLoading && !hasLoadedSavedWallets.current) {
      hasLoadedSavedWallets.current = true;
      console.log('[usePortfolio] Loading saved wallets from Supabase...');
      
      const loadAll = async () => {
        setIsLoading(true);
        try {
          const newDataMap = new Map<string, WalletData>();
          
          await Promise.all(
            savedWallets.map(async (w) => {
              const walletKey = `${w.address.toLowerCase()}-${w.chain}`;
              console.log('[usePortfolio] Fetching saved wallet:', walletKey);
              const data = await fetchWalletData(w.address, w.chain as Chain);
              newDataMap.set(walletKey, data);
            })
          );
          
          console.log('[usePortfolio] Loaded all saved wallets, count:', newDataMap.size);
          setWalletDataMap(prev => {
            // Merge with any existing data (from manual adds during loading)
            const merged = new Map(prev);
            newDataMap.forEach((v, k) => merged.set(k, v));
            return merged;
          });
          setLastUpdated(new Date());
        } catch (err) {
          console.error('[usePortfolio] Error loading saved wallets:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadAll();
    }
  }, [user, savedWallets, walletsLoading]);

  // Reset flag on logout
  useEffect(() => {
    if (!user) {
      hasLoadedSavedWallets.current = false;
      setWalletDataMap(new Map());
    }
  }, [user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (wallets.length > 0) {
      refreshIntervalRef.current = setInterval(refreshAll, 30000);
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
    isLoading: isLoading || walletsLoading,
    error,
    lastUpdated,
    isAuthenticated: !!user,
    addWallet,
    removeWallet,
    refreshAll,
  };
}
