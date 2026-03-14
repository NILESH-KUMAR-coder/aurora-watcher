import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SavedLocation {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export function useSavedLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLocations = useCallback(async () => {
    if (!user) { setLocations([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('saved_locations')
      .select('*')
      .order('created_at', { ascending: false });
    setLocations((data as SavedLocation[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const saveLocation = async (name: string, lat: number, lon: number) => {
    if (!user) return;
    await supabase.from('saved_locations').insert({
      user_id: user.id,
      location_name: name,
      latitude: lat,
      longitude: lon,
    });
    await fetchLocations();
  };

  const deleteLocation = async (id: string) => {
    await supabase.from('saved_locations').delete().eq('id', id);
    await fetchLocations();
  };

  return { locations, loading, saveLocation, deleteLocation, refetch: fetchLocations };
}
