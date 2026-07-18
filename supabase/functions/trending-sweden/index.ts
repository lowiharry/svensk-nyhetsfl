import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use yesterday's date (today's data may not be available yet)
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');

    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/sv.wikipedia/all-access/${yyyy}/${mm}/${dd}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SwedenUpdateBot/1.0 (https://swedenupdate.com; swedenupdatenews@gmail.com)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ topics: [], error: `upstream ${res.status}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      });
    }

    const json = await res.json();
    const articles: Array<{ article: string }> = json?.items?.[0]?.articles ?? [];
    const skip = new Set(['Huvudsida', 'Special:Search', '-']);
    const topics = articles
      .map((a) => a.article)
      .filter((t) => t && !t.startsWith('Special:') && !t.startsWith('Wikipedia:') && !skip.has(t))
      .slice(0, 20)
      .map((t) => t.replace(/_/g, ' '));

    return new Response(JSON.stringify({ topics, updatedAt: new Date().toISOString() }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ topics: [], error: (e as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }
});
