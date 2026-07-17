import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning, CloudFog } from 'lucide-react';

interface CityWeather {
  city: string;
  temp: number;
  code: number;
}

const CITIES = [
  { name: 'Stockholm', lat: 59.33, lon: 18.07 },
  { name: 'Gothenburg', lat: 57.71, lon: 11.97 },
  { name: 'Malmö', lat: 55.60, lon: 13.00 },
  { name: 'Uppsala', lat: 59.86, lon: 17.64 },
  { name: 'Umeå', lat: 63.83, lon: 20.26 },
  { name: 'Kiruna', lat: 67.86, lon: 20.23 },
];

function iconFor(code: number) {
  if ([0, 1].includes(code)) return <Sun className="w-4 h-4 text-yellow-500" aria-hidden />;
  if ([2, 3].includes(code)) return <Cloud className="w-4 h-4 text-slate-400" aria-hidden />;
  if ([45, 48].includes(code)) return <CloudFog className="w-4 h-4 text-slate-400" aria-hidden />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-500" aria-hidden />;
  if (code >= 71 && code <= 77) return <CloudSnow className="w-4 h-4 text-sky-300" aria-hidden />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-4 h-4 text-blue-500" aria-hidden />;
  if (code >= 95) return <CloudLightning className="w-4 h-4 text-amber-500" aria-hidden />;
  return <Cloud className="w-4 h-4 text-slate-400" aria-hidden />;
}

const WeatherBanner = () => {
  const [data, setData] = useState<CityWeather[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const results = await Promise.all(
          CITIES.map(async (c) => {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&timezone=Europe%2FStockholm`
            );
            const j = await res.json();
            return {
              city: c.name,
              temp: Math.round(j?.current?.temperature_2m ?? 0),
              code: j?.current?.weather_code ?? 3,
            } as CityWeather;
          })
        );
        if (!cancelled) setData(results);
      } catch {
        /* ignore */
      }
    }
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div
      className="w-full border-b bg-gradient-to-r from-primary/5 via-background to-secondary/5"
      style={{ minHeight: 36 }}
      aria-label="Current weather across Sweden"
    >
      <div className="container mx-auto flex items-center gap-4 overflow-x-auto whitespace-nowrap px-2 sm:px-4 py-1.5 text-xs sm:text-sm">
        <span className="font-semibold text-muted-foreground shrink-0">🇸🇪 Weather</span>
        {data.length === 0 && (
          <span className="text-muted-foreground">Loading…</span>
        )}
        {data.map((w) => (
          <span key={w.city} className="flex items-center gap-1.5 shrink-0">
            {iconFor(w.code)}
            <span className="font-medium">{w.city}</span>
            <span className="text-muted-foreground">{w.temp}°C</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default WeatherBanner;