// Fetch live Swedish stock quotes (OMXS30 selection) from Yahoo Finance
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SYMBOLS = [
  'VOLV-B.ST','ERIC-B.ST','HM-B.ST','ATCO-A.ST','SEB-A.ST',
  'SWED-A.ST','SHB-A.ST','SAND.ST','ASSA-B.ST','INVE-B.ST',
  'TELIA.ST','ABB.ST','ALFA.ST','SKF-B.ST','ESSITY-B.ST',
  'BOL.ST','EVO.ST','GETI-B.ST','NDA-SE.ST','SCA-B.ST',
  '^OMXS30'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(SYMBOLS.join(','))}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SwedenUpdateBot/1.0)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    const json = await res.json();
    const quotes = (json?.quoteResponse?.result ?? []).map((q: any) => ({
      symbol: (q.symbol ?? '').replace('.ST','').replace('^',''),
      name: q.shortName ?? q.longName ?? q.symbol,
      price: q.regularMarketPrice ?? null,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      currency: q.currency ?? 'SEK',
    }));
    return new Response(JSON.stringify({ quotes, updatedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), quotes: [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});