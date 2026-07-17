// Live football scores from ESPN public scoreboard API
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const LEAGUES: { slug: string; label: string }[] = [
  { slug: 'swe.1', label: 'Allsvenskan' },
  { slug: 'eng.1', label: 'Premier League' },
  { slug: 'esp.1', label: 'La Liga' },
  { slug: 'ita.1', label: 'Serie A' },
  { slug: 'ger.1', label: 'Bundesliga' },
  { slug: 'fra.1', label: 'Ligue 1' },
  { slug: 'uefa.champions', label: 'UCL' },
  { slug: 'uefa.europa', label: 'UEL' },
];

interface Match {
  id: string;
  league: string;
  status: string; // e.g. "LIVE 55'", "FT", "19:00"
  state: 'pre' | 'in' | 'post';
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  startTime: string;
}

async function fetchLeague(slug: string, label: string): Promise<Match[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const events = Array.isArray(json?.events) ? json.events : [];
    const matches: Match[] = [];
    for (const ev of events) {
      const comp = ev?.competitions?.[0];
      if (!comp) continue;
      const home = comp.competitors?.find((c: any) => c.homeAway === 'home');
      const away = comp.competitors?.find((c: any) => c.homeAway === 'away');
      if (!home || !away) continue;
      const state = ev?.status?.type?.state ?? 'pre';
      const short = ev?.status?.type?.shortDetail ?? '';
      matches.push({
        id: String(ev.id),
        league: label,
        status: short,
        state,
        home: home.team?.shortDisplayName ?? home.team?.abbreviation ?? '?',
        away: away.team?.shortDisplayName ?? away.team?.abbreviation ?? '?',
        homeScore: home.score ?? '0',
        awayScore: away.score ?? '0',
        startTime: ev?.date ?? '',
      });
    }
    return matches;
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const results = await Promise.all(LEAGUES.map((l) => fetchLeague(l.slug, l.label)));
  const all = results.flat();
  // Sort: live first, then upcoming (soonest), then finished
  const order = (s: string) => (s === 'in' ? 0 : s === 'pre' ? 1 : 2);
  all.sort((a, b) => {
    const d = order(a.state) - order(b.state);
    if (d !== 0) return d;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });
  return new Response(JSON.stringify({ matches: all, updatedAt: new Date().toISOString() }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
  });
});