'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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

// Helper to create wallet key
const getWalletKey = (address: string, chain: string) => `${address.toLowerCase()}-${chain}`;

export function usePortfolio(): UsePortfolioReturn {
  const { user, loading: authLoading } = useAuth();
  const { 
    wallets: savedWallets, 
    loading: walletsLoading, 
    addWallet: dbAddWallet, 
    removeWallet: dbRemoveWallet 
  } = useWallets();
  
  // Store data per wallet - use object instead of Map for better React compatibility
  const [walletData, setWalletData] = useState<Record<string, WalletData>>({});
  const [localWallets, setLocalWallets] = useState<TrackedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedSavedWallets = useRef(false);
  const hasLoadedLocalWallets = useRef(false);
  
  // Load from localStorage AFTER mount (avoids hydration mismatch)
  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem('vault_wallets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocalWallets(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading wallets from localStorage:', e);
    }
  }, []);

  // Get current wallet list
  const wallets: TrackedWallet[] = user 
    ? savedWallets.map(w => ({ id: w.id, address: w.address, chain: w.chain as Chain }))
    : localWallets;

  // Aggregate data from all wallets using useMemo
  const { assets, nfts, domains } = useMemo(() => {
    const assetMap = new Map<string, Asset>();
    const allNfts: NFT[] = [];
    const allDomains: Domain[] = [];
    
    Object.values(walletData).forEach((data) => {
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
  }, [walletData]);

  // Fetch portfolio data for a single wallet (with timeout)
  const fetchWalletData = useCallback(async (address: string, chain: Chain): Promise<WalletData> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(
        `/api/portfolio?address=${encodeURIComponent(address)}&chain=${chain}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const data = await response.json();
      return {
        assets: data.assets || [],
        nfts: data.nfts || [],
        domains: data.domains || [],
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('[usePortfolio] Request timed out for', address);
        return { assets: [], nfts: [], domains: [] };
      }
      throw err;
    }
  }, []);

  // Track which wallets we're currently adding to prevent duplicates
  const addingWallets = useRef<Set<string>>(new Set());

  // Add a new wallet
  const addWallet = useCallback(async (address: string, chain: Chain) => {
    const walletKey = getWalletKey(address, chain);
    
    // Check if already adding
    if (addingWallets.current.has(walletKey)) {
      console.log('[usePortfolio] Already adding wallet:', walletKey);
      return;
    }

    // Check if wallet already exists in current wallets list
    const alreadyTracked = wallets.some(
      w => w.address.toLowerCase() === address.toLowerCase() && w.chain === chain
    );
    if (alreadyTracked) {
      console.log('[usePortfolio] Wallet already tracked:', walletKey);
      // Still fetch/refresh data for this wallet if not in walletData
      if (!walletData[walletKey]) {
        try {
          const data = await fetchWalletData(address, chain);
          setWalletData(prev => ({ ...prev, [walletKey]: data }));
          setLastUpdated(new Date());
        } catch (err) {
          console.error('[usePortfolio] Error refreshing wallet:', err);
        }
      }
      return;
    }

    console.log('[usePortfolio] Adding wallet:', { address, chain, isAuthenticated: !!user });
    addingWallets.current.add(walletKey);
    
    // Mark as loaded if user is authenticated (prevents effect from running)
    if (user) {
      hasLoadedSavedWallets.current = true;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch data first
      const data = await fetchWalletData(address, chain);
      console.log('[usePortfolio] Fetched data:', { 
        assets: data.assets.length, 
        nfts: data.nfts.length,
        domains: data.domains.length 
      });
      
      // Store the data
      setWalletData(prev => {
        const updated = { ...prev, [walletKey]: data };
        console.log('[usePortfolio] Wallet data stored, total wallets:', Object.keys(updated).length);
        return updated;
      });
      
      // Add to wallet list (DB or local)
      if (user) {
        const { error: dbError } = await dbAddWallet(address, chain);
        if (dbError) {
          console.error('[usePortfolio] DB error (data still kept):', dbError);
        } else {
          console.log('[usePortfolio] Wallet saved to Supabase');
        }
      } else {
        setLocalWallets(prev => {
          // Prevent duplicates in local list too
          if (prev.some(w => w.address.toLowerCase() === address.toLowerCase() && w.chain === chain)) {
            return prev;
          }
          const updated = [...prev, { address, chain }];
          // Save to localStorage for anonymous users
          try {
            localStorage.setItem('vault_wallets', JSON.stringify(updated));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          return updated;
        });
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[usePortfolio] Error adding wallet:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      addingWallets.current.delete(walletKey);
      setIsLoading(false);
    }
  }, [user, wallets, walletData, dbAddWallet, fetchWalletData]);

  // Remove a wallet
  const removeWallet = useCallback(async (address: string, chain: Chain) => {
    const walletKey = getWalletKey(address, chain);
    const wallet = wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase() && w.chain === chain
    );
    
    // Remove from data
    setWalletData(prev => {
      const { [walletKey]: removed, ...rest } = prev;
      return rest;
    });
    
    // Remove from wallet list
    if (user && wallet?.id) {
      await dbRemoveWallet(wallet.id);
    } else {
      setLocalWallets(prev => {
        const updated = prev.filter(
          w => !(w.address.toLowerCase() === address.toLowerCase() && w.chain === chain)
        );
        // Update localStorage for anonymous users
        try {
          localStorage.setItem('vault_wallets', JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }
        return updated;
      });
    }
    
    setLastUpdated(new Date());
  }, [wallets, user, dbRemoveWallet]);

  // Use ref for isLoading check to avoid stale closure
  const isLoadingRef = useRef(false);
  
  // Keep ref in sync with state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Refresh all wallets
  const refreshAll = useCallback(async () => {
    // Don't refresh if no wallets or already loading (use ref to get current value)
    if (wallets.length === 0 || isLoadingRef.current) {
      return;
    }
    
    console.log('[usePortfolio] Refreshing', wallets.length, 'wallets');
    setIsLoading(true);
    setError(null);

    try {
      const newData: Record<string, WalletData> = {};
      
      await Promise.all(
        wallets.map(async (w) => {
          const walletKey = getWalletKey(w.address, w.chain);
          try {
            const data = await fetchWalletData(w.address, w.chain);
            newData[walletKey] = data;
          } catch (err) {
            console.error('[usePortfolio] Error fetching wallet:', walletKey, err);
            // Keep existing data for this wallet on error
          }
        })
      );
      
      // Only update if we got data
      if (Object.keys(newData).length > 0) {
        setWalletData(prev => {
          // Merge new data with existing (in case some wallets failed)
          return { ...prev, ...newData };
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [wallets, fetchWalletData]);

  // Load saved wallets on login (only once, after auth is ready)
  useEffect(() => {
    // Wait for auth AND wallets to finish loading
    if (authLoading || walletsLoading) {
      return;
    }
    
    if (user && savedWallets.length > 0 && !hasLoadedSavedWallets.current) {
      hasLoadedSavedWallets.current = true;
      
      const loadAll = async () => {
        setIsLoading(true);
        try {
          const newData: Record<string, WalletData> = {};
          
          await Promise.all(
            savedWallets.map(async (w) => {
              const walletKey = getWalletKey(w.address, w.chain);
              console.log('[usePortfolio] Fetching saved wallet:', walletKey);
              const data = await fetchWalletData(w.address, w.chain as Chain);
              console.log('[usePortfolio] Got data for', walletKey, '- assets:', data.assets.length, 'nfts:', data.nfts.length, 'domains:', data.domains.length);
              newData[walletKey] = data;
            })
          );
          
          // Log total aggregated data
          let totalAssets = 0;
          let totalDomains = 0;
          Object.values(newData).forEach(d => {
            totalAssets += d.assets.length;
            totalDomains += d.domains.length;
          });
          console.log('[usePortfolio] Loaded saved wallets:', Object.keys(newData).length, '- total assets:', totalAssets, 'domains:', totalDomains);
          setWalletData(newData);
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
  }, [authLoading, user, savedWallets, walletsLoading, fetchWalletData]);

  // Load local wallets for anonymous users (from localStorage)
  useEffect(() => {
    // Wait for mount (localStorage loaded) and auth check
    if (!hasMounted || authLoading) return;
    
    // Only load for anonymous users with local wallets
    if (!user && localWallets.length > 0 && !hasLoadedLocalWallets.current) {
      hasLoadedLocalWallets.current = true;
      
      const loadLocalWallets = async () => {
        setIsLoading(true);
        try {
          const newData: Record<string, WalletData> = {};
          
          await Promise.all(
            localWallets.map(async (w) => {
              const walletKey = getWalletKey(w.address, w.chain);
              const data = await fetchWalletData(w.address, w.chain);
              newData[walletKey] = data;
            })
          );
          
          console.log('[usePortfolio] Loaded local wallets:', Object.keys(newData).length);
          setWalletData(newData);
          setLastUpdated(new Date());
        } catch (err) {
          console.error('[usePortfolio] Error loading local wallets:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadLocalWallets();
    }
  }, [hasMounted, authLoading, user, localWallets, fetchWalletData]);

  // Track previous user to detect sign out
  const prevUserRef = useRef<typeof user>(undefined);
  
  // Reset on logout - clear portfolio when user signs out
  useEffect(() => {
    if (!authLoading) {
      // Detect sign out: was logged in, now not
      if (prevUserRef.current && !user) {
        console.log('[usePortfolio] User signed out, clearing data');
        setWalletData({});
        setLastUpdated(null);
        setError(null);
        hasLoadedSavedWallets.current = false;
        // Clear the interval too
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
      // Detect sign in: wasn't logged in, now is
      if (!prevUserRef.current && user) {
        console.log('[usePortfolio] User signed in, resetting flags to reload from Supabase');
        hasLoadedLocalWallets.current = false;
        hasLoadedSavedWallets.current = false; // Reset so saved wallets will load
        // Clear anonymous wallet data - will reload from Supabase
        setWalletData({});
      }
      prevUserRef.current = user;
    }
  }, [user, authLoading]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (wallets.length > 0) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      // Set up new interval - refreshAll will check isLoadingRef internally
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
    isLoading: isLoading || walletsLoading || authLoading,
    error,
    lastUpdated,
    isAuthenticated: !!user,
    addWallet,
    removeWallet,
    refreshAll,
  };
}
