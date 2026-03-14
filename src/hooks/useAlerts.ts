import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AlertSettings {
  threshold: number;
  push_enabled: boolean;
  email_enabled: boolean;
}

export interface AlertEntry {
  id: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
  visibility_score: number;
  read: boolean;
  created_at: string;
}

export function useAlerts() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AlertSettings>({ threshold: 70, push_enabled: false, email_enabled: false });
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('alert_settings').select('*').single();
    if (data) {
      setSettings({ threshold: data.threshold, push_enabled: data.push_enabled, email_enabled: data.email_enabled });
    }
  }, [user]);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(50);
    setAlerts((data as AlertEntry[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); fetchAlerts(); }, [fetchSettings, fetchAlerts]);

  const updateSettings = async (newSettings: Partial<AlertSettings>) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    // Upsert
    const { data: existing } = await supabase.from('alert_settings').select('id').single();
    if (existing) {
      await supabase.from('alert_settings').update(merged).eq('user_id', user.id);
    } else {
      await supabase.from('alert_settings').insert({ user_id: user.id, ...merged });
    }
    setSettings(merged);
  };

  const createAlert = async (locationName: string | null, lat: number, lon: number, score: number) => {
    if (!user) return;
    await supabase.from('alerts').insert({
      user_id: user.id,
      location_name: locationName,
      latitude: lat,
      longitude: lon,
      visibility_score: score,
    });
    await fetchAlerts();
  };

  const markRead = async (id: string) => {
    await supabase.from('alerts').update({ read: true }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const clearAlerts = async () => {
    if (!user) return;
    await supabase.from('alerts').delete().eq('user_id', user.id);
    setAlerts([]);
  };

  return { settings, alerts, loading, updateSettings, createAlert, markRead, clearAlerts, refetch: fetchAlerts };
}
