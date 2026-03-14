// Open-Meteo weather API service for cloud cover and atmospheric conditions

export interface WeatherData {
  cloudCover: number; // 0-100
  temperature: number;
  visibility: number;
  humidity: number;
  precipitation: number;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=cloud_cover,temperature_2m,visibility,relative_humidity_2m,precipitation`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data?.current) return null;

    return {
      cloudCover: data.current.cloud_cover ?? 50,
      temperature: data.current.temperature_2m ?? 0,
      visibility: data.current.visibility ?? 10000,
      humidity: data.current.relative_humidity_2m ?? 50,
      precipitation: data.current.precipitation ?? 0,
    };
  } catch (e) {
    console.error('Failed to fetch weather:', e);
    return null;
  }
}
