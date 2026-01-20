'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface SavedWallet {
  id: string;
  address: string;
  chain: string;
  label: string | null;
  created_at: string;
}

export function useWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  const fetchWallets = useCallback(async () => {
    if (!user) {
      setWallets([]);
      setLoading(false);
      return;
    }

    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });

    // Only update if this is the latest fetch
    if (fetchId !== fetchIdRef.current) {
      console.log('[useWallets] Stale fetch ignored');
      return;
    }

    if (error) {
      console.error('[useWallets] Error fetching wallets:', error);
    } else {
      console.log('[useWallets] Fetched wallets:', data?.length || 0);
      setWallets(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const addWallet = useCallback(async (address: string, chain: string, label?: string) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    // DON'T lowercase - Solana/crypto addresses are case-sensitive!
    const trimmedAddress = address.trim();
    
    // Check if wallet already exists in local state (case-insensitive check for duplicates)
    const existing = wallets.find(
      w => w.address.toLowerCase() === trimmedAddress.toLowerCase() && w.chain === chain
    );
    if (existing) {
      console.log('[useWallets] Wallet already exists locally:', existing.id);
      return { data: existing, error: null };
    }

    console.log('[useWallets] Adding wallet:', { address: trimmedAddress, chain, userId: user.id });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        address: trimmedAddress, // Keep original case!
        chain,
        label: label || null,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate (409 Conflict) - fetch existing wallet instead
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        console.log('[useWallets] Wallet already exists in DB, fetching...');
        const { data: existingData } = await supabase
          .from('wallets')
          .select('*')
          .ilike('address', trimmedAddress) // Case-insensitive search
          .eq('chain', chain)
          .single();
        
        if (existingData) {
          setWallets((prev) => {
            if (prev.some(w => w.id === existingData.id)) return prev;
            return [...prev, existingData];
          });
          return { data: existingData, error: null };
        }
      }
      console.error('[useWallets] Error adding wallet:', error);
    } else if (data) {
      console.log('[useWallets] Wallet added successfully:', data);
      setWallets((prev) => {
        if (prev.some(w => w.id === data.id)) return prev;
        return [...prev, data];
      });
    }

    return { data, error };
  }, [user, wallets]);

  const removeWallet = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id);

    if (!error) {
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }

    return { error };
  }, []);

  return {
    wallets,
    loading,
    addWallet,
    removeWallet,
    refetch: fetchWallets,
  };
}
