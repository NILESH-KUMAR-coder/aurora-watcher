// Hook for polling NOAA space weather data every 60 seconds

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchMagData, fetchPlasmaData, fetchKpIndex, fetchOvationGrid, fetchAlerts,
  detectAuroraTrigger, detectSubstormPrecursor,
  type MagData, type PlasmaData, type KpIndexEntry, type OvationPoint, type SpaceWeatherAlert
} from '@/services/noaa-api';

interface SpaceWeatherState {
  mag: MagData | null;
  plasma: PlasmaData | null;
  kpIndex: KpIndexEntry | null;
  ovationGrid: OvationPoint[];
  alerts: SpaceWeatherAlert[];
  auroraTriggered: boolean;
  substormWarning: boolean;
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL = 60_000;

export function useSpaceWeather() {
  const [state, setState] = useState<SpaceWeatherState>({
    mag: null, plasma: null, kpIndex: null, ovationGrid: [], alerts: [],
    auroraTriggered: false, substormWarning: false, lastUpdated: null,
    loading: true, error: null,
  });

  const bzHistoryRef = useRef<number[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [mag, plasma, kpIndex, ovationGrid, alerts] = await Promise.all([
        fetchMagData(), fetchPlasmaData(), fetchKpIndex(), fetchOvationGrid(), fetchAlerts(),
      ]);

      if (mag) {
        bzHistoryRef.current = [...bzHistoryRef.current.slice(-19), mag.bz];
      }

      const auroraTriggered = mag && plasma
        ? detectAuroraTrigger(mag.bz, plasma.speed)
        : false;

      const substormWarning = detectSubstormPrecursor(bzHistoryRef.current);

      setState({
        mag, plasma, kpIndex, ovationGrid, alerts,
        auroraTriggered, substormWarning,
        lastUpdated: new Date(), loading: false, error: null,
      });
    } catch (e) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch space weather data' }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
