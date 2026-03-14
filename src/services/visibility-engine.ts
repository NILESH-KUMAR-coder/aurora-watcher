// Visibility Score Engine
// Combines aurora probability, cloud cover, and darkness to compute a 0-100 score

import type { OvationPoint } from './noaa-api';
import type { WeatherData } from './weather-api';

export interface VisibilityResult {
  score: number;
  auroraProbability: number;
  cloudScore: number;
  darknessScore: number;
  recommendation: string;
}

// Get sun altitude (simplified calculation)
function getSunAltitude(lat: number, lon: number): number {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const hourAngle = ((now.getUTCHours() + lon / 15) % 24 - 12) * 15;

  const latRad = lat * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);
  const haRad = hourAngle * (Math.PI / 180);

  const altitude = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
  );

  return altitude * (180 / Math.PI);
}

// Moon illumination (simplified)
function getMoonIllumination(): number {
  const now = new Date();
  const synodicMonth = 29.53059;
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const daysSince = (now.getTime() - knownNewMoon.getTime()) / 86400000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  return (1 - Math.cos((phase / synodicMonth) * 2 * Math.PI)) / 2 * 100;
}

// Compute darkness score (0-100, higher = darker)
function computeDarknessScore(lat: number, lon: number): number {
  const sunAlt = getSunAltitude(lat, lon);
  const moonIllum = getMoonIllumination();

  let sunScore: number;
  if (sunAlt > 0) sunScore = 0; // daytime
  else if (sunAlt > -6) sunScore = 40; // civil twilight
  else if (sunAlt > -12) sunScore = 70; // nautical twilight
  else if (sunAlt > -18) sunScore = 85; // astronomical twilight
  else sunScore = 100; // full darkness

  const moonPenalty = (moonIllum / 100) * 30;
  return Math.max(0, Math.min(100, sunScore - moonPenalty));
}

// Find nearest OVATION probability for a given lat/lon
function getAuroraProbability(lat: number, lon: number, grid: OvationPoint[]): number {
  if (grid.length === 0) return 0;

  let closest = grid[0];
  let minDist = Infinity;

  for (const pt of grid) {
    const dlat = pt.lat - lat;
    const dlon = pt.lon - lon;
    const dist = dlat * dlat + dlon * dlon;
    if (dist < minDist) {
      minDist = dist;
      closest = pt;
    }
  }

  // Only use if reasonably close (within ~2 degrees)
  if (Math.sqrt(minDist) > 3) return 0;
  return Math.min(100, closest.probability);
}

function getRecommendation(score: number): string {
  if (score >= 80) return 'Excellent conditions! Get your camera ready.';
  if (score >= 60) return 'Good conditions for aurora viewing.';
  if (score >= 40) return 'Moderate chance. Worth checking the sky.';
  if (score >= 20) return 'Low probability. Consider waiting.';
  return 'Poor conditions. Aurora unlikely visible.';
}

export function computeVisibilityScore(
  lat: number,
  lon: number,
  grid: OvationPoint[],
  weather: WeatherData | null
): VisibilityResult {
  const auroraProbability = getAuroraProbability(lat, lon, grid);
  const cloudScore = weather ? Math.max(0, 100 - weather.cloudCover) : 50;
  const darknessScore = computeDarknessScore(lat, lon);

  const score = Math.round(
    0.5 * auroraProbability +
    0.3 * darknessScore +
    0.2 * cloudScore
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    auroraProbability: Math.round(auroraProbability),
    cloudScore: Math.round(cloudScore),
    darknessScore: Math.round(darknessScore),
    recommendation: getRecommendation(score),
  };
}

export { getSunAltitude, getMoonIllumination };
