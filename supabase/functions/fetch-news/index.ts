import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Translate a Swedish article to English using Lovable AI (Gemini).
// All three fields are translated in a single request via JSON output.
async function translateArticle(article: any, apiKey: string): Promise<any> {
  const title = (article.title ?? '').toString()
  const summary = (article.summary ?? '').toString()
  const content = (article.content ?? '').toString()

  if (!title && !summary && !content) return article

  const payload = {
    model: 'google/gemini-2.5-flash',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional Swedish-to-English news translator. ' +
          'Translate the provided fields from Swedish to natural, fluent English. ' +
          'Preserve meaning, names, numbers, and quotations exactly. Do not add commentary, ' +
          'do not summarize, do not omit content. If a field is already in English, return it unchanged. ' +
          'Return ONLY a JSON object with keys "title", "summary", "content" — all strings.',
      },
      {
        role: 'user',
        content: JSON.stringify({ title, summary, content }),
      },
    ],
    response_format: { type: 'json_object' },
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error('Lovable AI translation error:', response.status, errText)
      if (response.status === 429) {
        // Back off briefly on rate limit and let caller retry next cycle
        await delay(2000)
      }
      return article // Return original on error
    }

    const data = await response.json()
    const raw = data?.choices?.[0]?.message?.content ?? ''
    let parsed: any = {}
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch (_e) {
      // Try to extract JSON object from the response
      const match = typeof raw === 'string' ? raw.match(/\{[\s\S]*\}/) : null
      parsed = match ? JSON.parse(match[0]) : {}
    }

    return {
      ...article,
      title: (parsed.title || title).toString().trim(),
      summary: (parsed.summary || summary).toString().trim(),
      content: (parsed.content || content).toString().trim(),
    }
  } catch (error) {
    console.error('Lovable AI translation exception:', error)
    return article
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
      
      // Translate articles to English - process sequentially to avoid rate limits
      console.log('Starting translation to English (sequential to avoid rate limits)...')
      const translatedArticles = []
      
      for (let i = 0; i < uniqueArticles.length; i++) {
        console.log(`Translating article ${i + 1}/${uniqueArticles.length}`)
        const translated = await translateArticle(uniqueArticles[i], deeplApiKey)
        translatedArticles.push(translated)
        
        // Add delay between articles
        if (i < uniqueArticles.length - 1) {
          await delay(1000)
        }
      }
      
      console.log(`Successfully translated ${translatedArticles.length} articles`)
      
      // Detect which articles are new (not yet in DB) so we only auto-post once
      const candidateUrls = translatedArticles.map((a: any) => a.source_url)
      const { data: existingRows } = await supabaseClient
        .from('articles')
        .select('source_url')
        .in('source_url', candidateUrls)
      const existingUrlSet = new Set((existingRows || []).map((r: any) => r.source_url))
      const newArticles = translatedArticles.filter((a: any) => !existingUrlSet.has(a.source_url))
      console.log(`New articles to auto-post to Facebook: ${newArticles.length}`)

      const { data, error } = await supabaseClient
        .from('articles')
        .upsert(translatedArticles, { onConflict: 'source_url' })

      if (error) {
        console.error('Error upserting articles:', error)
        throw error
      }

      console.log(`Successfully upserted ${translatedArticles.length} translated articles`)

      // Auto-post new articles to Facebook in the background
      const autoPostToFacebook = async () => {
        for (const article of newArticles) {
          try {
            const link = `https://swedenupdate.com/article/${encodeURIComponent(article.source_url)}`
            const { error: fbError } = await supabaseClient.functions.invoke('share-to-facebook', {
              body: {
                title: article.title,
                link,
                imageUrl: article.image_url || null,
              },
            })
            if (fbError) {
              console.error(`Facebook post failed for ${article.source_url}:`, fbError)
            } else {
              console.log(`Posted to Facebook: ${article.source_url}`)
            }
          } catch (err) {
            console.error(`Error posting to Facebook for ${article.source_url}:`, err)
          }
          // Delay between posts to respect Facebook rate limits
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
        console.log('Facebook auto-post batch complete')
      }
      EdgeRuntime.waitUntil(autoPostToFacebook())
      
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
