import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Build sitemap XML with only homepage
    const baseUrl = 'https://swedenupdate.com'
    const currentDate = new Date().toISOString().split('T')[0]
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

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
