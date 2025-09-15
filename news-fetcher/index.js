import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from the local .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or service key not found. Make sure you have a .env file in the news-fetcher directory with VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// World News API configuration
const WORLD_NEWS_API_KEY = '8d0886c7630047fea8bba6e51df9d21e';
const WORLD_NEWS_API_URL = 'https://api.worldnewsapi.com/search-news';

const fetchFromWorldNewsAPI = async () => {
  try {
    // Fetch latest news from multiple languages and sources
    const searchQueries = [
      { text: 'breaking news', language: 'en', number: 25 },
      { text: 'politics', language: 'en', number: 15 },
      { text: 'technology', language: 'en', number: 15 },
      { text: 'business', language: 'en', number: 15 },
      { text: 'health', language: 'en', number: 10 },
      { text: 'sports', language: 'en', number: 10 },
      { text: 'science', language: 'en', number: 10 }
    ];

    const allArticles = [];

    for (const query of searchQueries) {
      try {
        const params = new URLSearchParams({
          text: query.text,
          language: query.language,
          number: query.number.toString(),
          'sort-by': 'publish-time',
          'sort-direction': 'DESC'
        });

        const response = await fetch(`${WORLD_NEWS_API_URL}?${params}`, {
          headers: {
            'x-api-key': WORLD_NEWS_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`World News API error for "${query.text}":`, response.status, response.statusText);
          continue;
        }

        const data = await response.json();
        console.log(`Found ${data.news?.length || 0} articles for "${query.text}"`);

        if (data.news && data.news.length > 0) {
          const processedArticles = data.news.map(article => ({
            title: article.title,
            source_url: article.url,
            published_at: new Date(article.publish_date),
            source_name: 'World News API',
            image_url: article.image || null,
            summary: article.summary || article.text?.substring(0, 300) + '...' || null,
            content: article.text || article.summary || null,
            category: article.category || 'general',
          }));

          allArticles.push(...processedArticles);
        }

        // Add a small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error fetching from World News API for "${query.text}":`, error);
      }
    }

    return allArticles;

  } catch (error) {
    console.error('Failed to fetch from World News API:', error);
    return [];
  }
};

const fetchAndSaveArticles = async () => {
  console.log('Fetching latest news from World News API...');

  const allArticles = await fetchFromWorldNewsAPI();

  if (allArticles.length > 0) {
    console.log(`Upserting ${allArticles.length} articles to Supabase...`);

    const { data, error } = await supabase
      .from('articles')
      .upsert(allArticles, { onConflict: 'source_url' });

    if (error) {
      console.error('Error upserting articles:', error);
    } else {
      console.log(`Successfully upserted ${allArticles.length} articles from World News API.`);
    }
  } else {
    console.log('No new articles to save.');
  }
};

// Fetch articles immediately on start, then every 5 minutes
fetchAndSaveArticles();
setInterval(fetchAndSaveArticles, 300000); // 5 minutes to respect API rate limits
