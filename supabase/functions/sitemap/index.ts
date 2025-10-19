import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Helper to format date to YYYY-MM-DD
const toISODate = (dateString: string) => new Date(dateString).toISOString().split('T')[0];

serve(async (_req) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response('Missing Supabase environment variables', { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch all articles, selecting only the id and the last update time
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, updated_at')
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const baseUrl = 'https://swedenupdate.com';

    // Start the sitemap with the homepage
    const sitemapEntries = [
      `<url><loc>${baseUrl}/</loc><lastmod>${toISODate(new Date().toISOString())}</lastmod><priority>1.0</priority></url>`
    ];

    // Add an entry for each article
    articles.forEach(article => {
      sitemapEntries.push(
        `<url><loc>${baseUrl}/article/${article.id}</loc><lastmod>${toISODate(article.updated_at)}</lastmod><priority>0.8</priority></url>`
      );
    });

    // Combine all entries into a single XML string
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('')}
</urlset>`;

    // Return the sitemap with the correct content type
    return new Response(sitemap, {
      headers: { 'Content-Type': 'application/xml' },
    });

  } catch (err) {
    console.error(err);
    return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
  }
});