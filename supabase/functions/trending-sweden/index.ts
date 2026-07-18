import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const res = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=SE', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SwedenUpdateBot/1.0)',
        'Accept': 'application/rss+xml,application/xml',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ topics: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      });
    }

    const xml = await res.text();
    const titles: string[] = [];
    const itemRegex = /<item[^>]*>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && titles.length < 20) {
      titles.push(match[1].replace(/<\/?[^>]+(>|$)/g, '').trim());
    }

    return new Response(JSON.stringify({ topics: titles, updatedAt: new Date().toISOString() }), {
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
