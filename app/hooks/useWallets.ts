'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const supabase = createClient();

  const fetchWallets = useCallback(async () => {
    if (!user) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching wallets:', error);
    } else {
      setWallets(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const addWallet = async (address: string, chain: string, label?: string) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    console.log('[useWallets] Adding wallet:', { address, chain, userId: user.id });

    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        address: address.toLowerCase(),
        chain,
        label: label || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[useWallets] Error adding wallet:', error);
    } else if (data) {
      console.log('[useWallets] Wallet added successfully:', data);
      setWallets((prev) => [...prev, data]);
    }

    return { data, error };
  };

  const removeWallet = async (id: string) => {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id);

    if (!error) {
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }

    return { error };
  };

  return {
    wallets,
    loading,
    addWallet,
    removeWallet,
    refetch: fetchWallets,
  };
}
