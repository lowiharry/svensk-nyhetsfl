// Fetch live Swedish stock quotes (OMXS30 selection) from Yahoo Finance
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SYMBOLS = [
  'VOLV-B.ST','ERIC-B.ST','HM-B.ST','ATCO-A.ST','SEB-A.ST',
  'SWED-A.ST','SHB-A.ST','SAND.ST','ASSA-B.ST','INVE-B.ST',
  'TELIA.ST','ABB.ST','ALFA.ST','SKF-B.ST','ESSITY-B.ST',
  'BOL.ST','EVO.ST','GETI-B.ST','NDA-SE.ST','SCA-B.ST',
  '^OMXS30'
];

async function fetchQuote(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.chart?.result?.[0];
    if (!r) return null;
    const meta = r.meta ?? {};
    const price = meta.regularMarketPrice ?? null;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const change = price != null && prev != null ? price - prev : 0;
    const changePercent = price != null && prev ? (change / prev) * 100 : 0;
    return {
      symbol: symbol.replace('.ST', '').replace('^', ''),
      name: meta.shortName ?? meta.symbol ?? symbol,
      price,
      change,
      changePercent,
      currency: meta.currency ?? 'SEK',
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const results = await Promise.all(SYMBOLS.map(fetchQuote));
  const quotes = results.filter((q) => q && q.price != null);
  return new Response(JSON.stringify({ quotes, updatedAt: new Date().toISOString() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
  });
});