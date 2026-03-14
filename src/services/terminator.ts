// Day/Night terminator calculation for map overlay
// Returns an array of [lat, lon] points representing the terminator line

export function computeTerminatorPoints(): [number, number][] {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );

  // Solar declination
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const decRad = declination * (Math.PI / 180);

  // Current hour angle of the sun
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sunLon = -(utcHours - 12) * 15; // degrees

  const points: [number, number][] = [];

  for (let lon = -180; lon <= 180; lon += 2) {
    const lonRad = ((lon - sunLon) * Math.PI) / 180;
    // Terminator is where sun altitude = 0
    const lat = Math.atan(-Math.cos(lonRad) / Math.tan(decRad)) * (180 / Math.PI);
    points.push([lat, lon]);
  }

  return points;
}

// Generate a polygon for the night side of the earth
export function computeNightPolygon(): [number, number][][] {
  const terminator = computeTerminatorPoints();
  if (terminator.length === 0) return [];

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));

  // Determine which pole is in darkness
  const nightPole: [number, number] = declination >= 0 ? [-90, 0] : [90, 0];

  // Build polygon: terminator line + extend to pole
  const nightSide: [number, number][] = [
    ...terminator,
    [nightPole[0], 180],
    [nightPole[0], -180],
  ];

  return [nightSide];
}
