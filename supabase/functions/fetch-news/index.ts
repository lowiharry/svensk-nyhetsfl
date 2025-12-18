import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to translate text to English using DeepL API
async function translateToEnglish(text: string, apiKey: string): Promise<string> {
  if (!text || text.trim() === '') return text
  
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: 'EN',
      }),
    })

    if (!response.ok) {
      console.error('DeepL Translation API error:', response.status)
      return text // Return original on error
    }

    const data = await response.json()
    const translatedText = data.translations?.[0]?.text?.trim()
    return translatedText || text
  } catch (error) {
    console.error('DeepL Translation error:', error)
    return text // Return original on error
  }
}

// Function to translate an article object
async function translateArticle(article: any, apiKey: string): Promise<any> {
  const [translatedTitle, translatedSummary, translatedContent] = await Promise.all([
    translateToEnglish(article.title, apiKey),
    translateToEnglish(article.summary, apiKey),
    translateToEnglish(article.content, apiKey),
  ])

  return {
    ...article,
    title: translatedTitle,
    summary: translatedSummary,
    content: translatedContent,
  }
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

    const deeplApiKey = Deno.env.get('DEEPL_API_KEY')
    if (!deeplApiKey) {
      console.error('DEEPL_API_KEY not configured')
      throw new Error('Translation service not configured')
    }

    // Swedish news sources RSS feeds
    const swedishNewsSources = [
      { name: 'SVT Nyheter', url: 'https://www.svt.se/nyheter/rss.xml', category: 'general' },
      { name: 'Dagens Nyheter', url: 'https://www.dn.se/rss/', category: 'general' },
      { name: 'Aftonbladet', url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/', category: 'general' },
      { name: 'Expressen', url: 'https://feeds.expressen.se/nyheter/', category: 'general' },
      { name: 'Svenska Dagbladet', url: 'https://www.svd.se/feed/articles.rss', category: 'general' },
      { name: 'SVT Sport', url: 'https://www.svt.se/sport/rss.xml', category: 'sports' },
      { name: 'DN Ekonomi', url: 'https://www.dn.se/ekonomi/rss/', category: 'business' }
    ]

    console.log('Starting Swedish news fetch with English translation...')

    const allArticles = []

    // Function to parse RSS feed
    const parseRSSFeed = async (rssUrl: string, sourceName: string, category: string) => {
      try {
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'NewsAggregator/1.0'
          }
        })

        if (!response.ok) {
          console.error(`RSS fetch error for ${sourceName}:`, response.status, response.statusText)
          return []
        }

        const xmlText = await response.text()
        
        // Simple XML parsing for RSS items
        const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
        
        const articles = itemMatches.slice(0, 10).map((itemXml: string) => {
          const titleMatch = itemXml.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i)
          const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>/i)
          const pubDateMatch = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i)
          const descriptionMatch = itemXml.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i)
          const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/i)

          const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim()
          const url = linkMatch?.[1]?.trim() || ''
          const pubDate = pubDateMatch?.[1]?.trim() || ''
          const description = (descriptionMatch?.[1] || descriptionMatch?.[2] || '').trim().replace(/<[^>]*>/g, '')
          const imageUrl = enclosureMatch?.[1] || null

          if (!title || !url) return null

          const publishedAt = pubDate ? new Date(pubDate) : new Date()
          const expiryAt = new Date(publishedAt)
          expiryAt.setDate(expiryAt.getDate() + 30)

          return {
            title: title,
            source_url: url,
            published_at: publishedAt.toISOString(),
            expiry_at: expiryAt.toISOString(),
            source_name: sourceName,
            image_url: imageUrl,
            summary: description.substring(0, 300) + (description.length > 300 ? '...' : ''),
            content: description,
            category: category,
          }
        }).filter(Boolean)

        console.log(`Found ${articles.length} articles from ${sourceName}`)
        return articles

      } catch (error) {
        console.error(`Error parsing RSS from ${sourceName}:`, error)
        return []
      }
    }

    // Fetch from all Swedish news sources
    for (const source of swedishNewsSources) {
      const articles = await parseRSSFeed(source.url, source.name, source.category)
      allArticles.push(...articles)
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log(`Total articles fetched: ${allArticles.length}`)

    if (allArticles.length > 0) {
      // Remove duplicates by source_url to prevent database conflicts
      const uniqueArticles = allArticles.filter((article, index, self) => 
        article && index === self.findIndex(a => a && a.source_url === article.source_url)
      )
      
      console.log(`Unique articles after deduplication: ${uniqueArticles.length}`)
      
      // Translate articles to English (process in batches of 5 to avoid rate limits)
      console.log('Starting translation to English...')
      const translatedArticles = []
      const batchSize = 5
      
      for (let i = 0; i < uniqueArticles.length; i += batchSize) {
        const batch = uniqueArticles.slice(i, i + batchSize)
        console.log(`Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniqueArticles.length / batchSize)}`)
        
        const translatedBatch = await Promise.all(
          batch.map(article => translateArticle(article, deeplApiKey))
        )
        translatedArticles.push(...translatedBatch)
        
        // Add delay between batches to avoid rate limits
        if (i + batchSize < uniqueArticles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      console.log(`Successfully translated ${translatedArticles.length} articles`)
      
      const { data, error } = await supabaseClient
        .from('articles')
        .upsert(translatedArticles, { onConflict: 'source_url' })

      if (error) {
        console.error('Error upserting articles:', error)
        throw error
      }

      console.log(`Successfully upserted ${translatedArticles.length} translated articles`)
      
      // Enrich new articles in the background with rate limiting
      const enrichArticles = async () => {
        try {
          // Find articles that haven't been enriched yet - limit to 5 at a time
          const { data: unenrichedArticles, error: queryError } = await supabaseClient
            .from('articles')
            .select('id')
            .is('ai_enriched_at', null)
            .limit(5)

          if (queryError) {
            console.error('Error querying unenriched articles:', queryError)
            return
          }

          if (!unenrichedArticles || unenrichedArticles.length === 0) {
            console.log('No articles to enrich')
            return
          }

          console.log(`Starting sequential enrichment for ${unenrichedArticles.length} articles`)

          // Enrich each article sequentially with delay to avoid rate limits
          for (const article of unenrichedArticles) {
            try {
              console.log(`Enriching article ${article.id}...`)
              const { error } = await supabaseClient.functions.invoke('enrich-article', {
                body: { articleId: article.id }
              })
              
              if (error) {
                console.error(`Failed to enrich article ${article.id}:`, error)
              } else {
                console.log(`Successfully enriched article ${article.id}`)
              }
              
              // Wait 3 seconds between requests to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 3000))
            } catch (err) {
              console.error(`Error enriching article ${article.id}:`, err)
            }
          }
          
          console.log('Enrichment batch complete')
        } catch (error) {
          console.error('Error in enrichment process:', error)
        }
      }

      // Start enrichment in background
      EdgeRuntime.waitUntil(enrichArticles())

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully fetched, translated, and saved ${translatedArticles.length} articles`,
          articles_count: translatedArticles.length
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
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
