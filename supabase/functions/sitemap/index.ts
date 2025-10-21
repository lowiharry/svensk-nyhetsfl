import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const baseUrl = 'https://swedenupdate.com'
    
    // Handle news sitemap (last 48 hours)
    if (pathname.includes('news-sitemap.xml')) {
      const twoDaysAgo = new Date()
      twoDaysAgo.setHours(twoDaysAgo.getHours() - 48)
      
      const { data: recentArticles, error } = await supabaseClient
        .from('articles')
        .select('title, source_url, published_at, updated_at, category')
        .gte('published_at', twoDaysAgo.toISOString())
        .order('published_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching recent articles:', error)
        throw error
      }
      
      const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${(recentArticles || []).map(article => {
    const encodedUrl = encodeURIComponent(article.source_url)
    const pubDate = new Date(article.published_at).toISOString()
    
    return `<url>
    <loc>${baseUrl}/article/${encodedUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>Sweden Update</news:name>
        <news:language>sv</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
      ${article.category ? `<news:keywords>${article.category}</news:keywords>` : ''}
    </news:news>
  </url>`
  }).join('\n  ')}
</urlset>`
      
      return new Response(newsSitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=1800'
        },
        status: 200
      })
    }

    // Handle main sitemap
    const { data: articles, error } = await supabaseClient
      .from('articles')
      .select('source_url, published_at, updated_at, category')
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching articles:', error)
      throw error
    }
    
    // Get unique categories
    const categories = [...new Set(articles?.map(a => a.category).filter(Boolean))] as string[]
    
    const currentDate = new Date().toISOString()
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  ${categories.map(category => `<url>
    <loc>${baseUrl}/category/${encodeURIComponent(category)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n  ')}
  ${(articles || []).map(article => {
    const encodedUrl = encodeURIComponent(article.source_url)
    const lastmod = new Date(article.updated_at || article.published_at).toISOString()
    const pubDate = new Date(article.published_at)
    const hoursSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60)
    const priority = hoursSincePublished < 24 ? '0.8' : '0.6'
    
    return `<url>
    <loc>${baseUrl}/article/${encodedUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n  ')}
</urlset>`

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
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
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      }
    )
  }
})
