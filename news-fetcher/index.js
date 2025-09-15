import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from the local .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const worldNewsApiKey = process.env.WORLD_NEWS_API_KEY;

if (!supabaseUrl || !supabaseKey || !worldNewsApiKey) {
  console.error('Supabase URL, service key, or World News API key not found. Make sure you have a .env file in the news-fetcher directory with all the required keys.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = 'https://api.worldnewsapi.com/top-news?source-country=se';

const fetchAndSaveArticles = async () => {
  console.log('Starting news fetch from World News API...');

  try {
    const response = await fetch(API_URL, {
      headers: {
        'x-api-key': worldNewsApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.top_news[0]?.news || [];

    console.log(`Found ${articles.length} articles from the World News API.`);

    const articlesToUpsert = articles
      .map(article => {
        if (!article.title || !article.url) {
          return null;
        }
        return {
          title: article.title,
          source_url: article.url,
          published_at: article.publish_date ? new Date(article.publish_date) : new Date(),
          source_name: article.source_country, // The API returns the country code 'se'
          image_url: null, // As per user request
          summary: article.summary,
          content: article.summary, // Using summary for content
          category: 'general',
        };
      })
      .filter(Boolean);

    if (articlesToUpsert.length > 0) {
      console.log(`Upserting ${articlesToUpsert.length} articles to Supabase...`);

      const { error } = await supabase
        .from('articles')
        .upsert(articlesToUpsert, { onConflict: 'source_url' });

      if (error) {
        console.error('Error upserting articles:', error);
      } else {
        console.log('Successfully upserted articles.');
      }
    } else {
      console.log('No new articles to save.');
    }

  } catch (error) {
    console.error('Failed to fetch or process articles from World News API:', error);
  }

  console.log('News fetch cycle complete.');
};

// Fetch articles immediately on start, then every minute
fetchAndSaveArticles();
setInterval(fetchAndSaveArticles, 60000);
