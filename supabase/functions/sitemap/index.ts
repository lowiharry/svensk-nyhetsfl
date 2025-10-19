import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch all articles
    const { data: articles, error } = await supabaseClient
      .from('articles')
      .select('source_url, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      throw error
    }

    // Build sitemap XML
    const baseUrl = 'https://swedenupdate.com'
    const currentDate = new Date().toISOString().split('T')[0]
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`

    // Add article URLs
    if (articles && articles.length > 0) {
      for (const article of articles) {
        const lastmod = article.updated_at 
          ? new Date(article.updated_at).toISOString().split('T')[0]
          : currentDate
        
        sitemap += `  <url>
    <loc>${baseUrl}/article/${encodeURIComponent(article.source_url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
      }
    }

    sitemap += `</urlset>`

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
      status: 200
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      'Error generating sitemap',
      { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      }
    )
  }
})
