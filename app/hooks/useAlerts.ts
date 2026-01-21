'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Alert {
  id: string;
  type: 'price' | 'percent_change';
  asset: string;
  asset_name: string;
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
  last_triggered: string | null;
  created_at: string;
}

export function useAlerts() {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      console.error('[useAlerts] Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchAlerts();
    }
  }, [authLoading, fetchAlerts]);

  const createAlert = useCallback(async (alertData: {
    type: 'price' | 'percent_change';
    asset: string;
    assetName: string;
    condition: 'above' | 'below';
    threshold: number;
    enabled: boolean;
  }) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create alert');
      }

      const newAlert = await response.json();
      setAlerts((prev) => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('[useAlerts] Error creating alert:', err);
      throw err;
    }
  }, []);

  const updateAlert = useCallback(async (alertId: string, updates: Partial<Alert>) => {
    try {
      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update alert');
      }

      const updatedAlert = await response.json();
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updatedAlert : a)));
      return updatedAlert;
    } catch (err) {
      console.error('[useAlerts] Error updating alert:', err);
      throw err;
    }
  }, []);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete alert');
      }

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('[useAlerts] Error deleting alert:', err);
      throw err;
    }
  }, []);

  const toggleAlert = useCallback(async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      await updateAlert(alertId, { enabled: !alert.enabled });
    }
  }, [alerts, updateAlert]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    refetch: fetchAlerts,
  };
}
