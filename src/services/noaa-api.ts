// NOAA Space Weather Prediction Center API service
// Fetches live space weather data from public NOAA endpoints

const NOAA_BASE = 'https://services.swpc.noaa.gov';

export interface MagData {
  timestamp: string;
  bx: number;
  by: number;
  bz: number;
}

export interface PlasmaData {
  timestamp: string;
  speed: number;
  density: number;
  temperature: number;
}

export interface KpIndexEntry {
  timestamp: string;
  kpValue: number;
  kpText: string;
}

export interface OvationPoint {
  lat: number;
  lon: number;
  probability: number;
}

export interface SpaceWeatherAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

export interface SpaceWeatherState {
  mag: MagData | null;
  plasma: PlasmaData | null;
  kpIndex: KpIndexEntry | null;
  ovationGrid: OvationPoint[];
  alerts: SpaceWeatherAlert[];
  auroraTriggered: boolean;
  substormWarning: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

// Parse magnetic field data (IMF Bx, By, Bz)
export async function fetchMagData(): Promise<MagData | null> {
  try {
    const res = await fetch(`${NOAA_BASE}/products/solar-wind/mag-1-day.json`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) return null;

    const latest = data[data.length - 1];
    return {
      timestamp: latest[0],
      bx: parseFloat(latest[1]) || 0,
      by: parseFloat(latest[2]) || 0,
      bz: parseFloat(latest[3]) || 0,
    };
  } catch (e) {
    console.error('Failed to fetch MAG data:', e);
    return null;
  }
}

// Parse solar wind plasma data
export async function fetchPlasmaData(): Promise<PlasmaData | null> {
  try {
    const res = await fetch(`${NOAA_BASE}/products/solar-wind/plasma-1-day.json`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) return null;

    const latest = data[data.length - 1];
    return {
      timestamp: latest[0],
      density: parseFloat(latest[1]) || 0,
      speed: parseFloat(latest[2]) || 0,
      temperature: parseFloat(latest[3]) || 0,
    };
  } catch (e) {
    console.error('Failed to fetch plasma data:', e);
    return null;
  }
}

// Fetch KP index
export async function fetchKpIndex(): Promise<KpIndexEntry | null> {
  try {
    const res = await fetch(`${NOAA_BASE}/products/noaa-planetary-k-index.json`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) return null;

    const latest = data[data.length - 1];
    return {
      timestamp: latest[0],
      kpValue: parseFloat(latest[1]) || 0,
      kpText: latest[2] || '',
    };
  } catch (e) {
    console.error('Failed to fetch KP index:', e);
    return null;
  }
}

// Fetch OVATION aurora probability grid
export async function fetchOvationGrid(): Promise<OvationPoint[]> {
  try {
    const res = await fetch(`${NOAA_BASE}/json/ovation_aurora_latest.json`);
    const data = await res.json();
    if (!data?.coordinates) return [];

    return data.coordinates
      .filter((c: number[]) => c[2] > 2) // filter low probability
      .map((c: number[]) => ({
        lon: c[0] > 180 ? c[0] - 360 : c[0],
        lat: c[1],
        probability: c[2],
      }));
  } catch (e) {
    console.error('Failed to fetch OVATION grid:', e);
    return [];
  }
}

// Fetch space weather alerts
export async function fetchAlerts(): Promise<SpaceWeatherAlert[]> {
  try {
    const res = await fetch(`${NOAA_BASE}/products/alerts.json`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, 5).map((a: any) => ({
      product_id: a.product_id || '',
      issue_datetime: a.issue_datetime || '',
      message: a.message || '',
    }));
  } catch (e) {
    console.error('Failed to fetch alerts:', e);
    return [];
  }
}

// Aurora trigger detection
export function detectAuroraTrigger(bz: number, speed: number): boolean {
  return bz < -7 && speed > 500;
}

// Substorm precursor detection (rapid Bz drop)
export function detectSubstormPrecursor(bzHistory: number[]): boolean {
  if (bzHistory.length < 3) return false;
  const recent = bzHistory.slice(-3);
  const drop = recent[0] - recent[recent.length - 1];
  return drop > 10;
}
