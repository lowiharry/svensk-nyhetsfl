import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // World News API configuration
    const WORLD_NEWS_API_KEY = '8d0886c7630047fea8bba6e51df9d21e'
    const WORLD_NEWS_API_URL = 'https://api.worldnewsapi.com/search-news'

    console.log('Starting news fetch...')

    // Fetch latest news from multiple categories
    const searchQueries = [
      { text: 'breaking news', language: 'en', number: 25 },
      { text: 'politics', language: 'en', number: 15 },
      { text: 'technology', language: 'en', number: 15 },
      { text: 'business', language: 'en', number: 15 },
      { text: 'health', language: 'en', number: 10 },
      { text: 'sports', language: 'en', number: 10 },
      { text: 'science', language: 'en', number: 10 }
    ]

    const allArticles = []

    for (const query of searchQueries) {
      try {
        const params = new URLSearchParams({
          text: query.text,
          language: query.language,
          number: query.number.toString(),
          'sort-by': 'publish-time',
          'sort-direction': 'DESC'
        })

        const response = await fetch(`${WORLD_NEWS_API_URL}?${params}`, {
          headers: {
            'x-api-key': WORLD_NEWS_API_KEY,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error(`World News API error for "${query.text}":`, response.status, response.statusText)
          continue
        }

        const data = await response.json()
        console.log(`Found ${data.news?.length || 0} articles for "${query.text}"`)

        if (data.news && data.news.length > 0) {
          const processedArticles = data.news.map((article: any) => ({
            title: article.title,
            source_url: article.url,
            published_at: new Date(article.publish_date),
            source_name: 'World News API',
            image_url: article.image || null,
            summary: article.summary || article.text?.substring(0, 300) + '...' || null,
            content: article.text || article.summary || null,
            category: article.category || 'general',
          }))

          allArticles.push(...processedArticles)
        }

        // Add a small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error fetching from World News API for "${query.text}":`, error)
      }
    }

    console.log(`Total articles fetched: ${allArticles.length}`)

    if (allArticles.length > 0) {
      const { data, error } = await supabaseClient
        .from('articles')
        .upsert(allArticles, { onConflict: 'source_url' })

      if (error) {
        console.error('Error upserting articles:', error)
        throw error
      }

      console.log(`Successfully upserted ${allArticles.length} articles`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully fetched and saved ${allArticles.length} articles`,
          articles_count: allArticles.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new articles to save',
          articles_count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

  } catch (error) {
    console.error('Error in fetch-news function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})