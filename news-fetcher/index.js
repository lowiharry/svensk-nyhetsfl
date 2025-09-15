import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from the local .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or service key not found. Make sure you have a .env file in the news-fetcher directory with all the required keys.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const parser = new Parser();

// List of news sources to fetch from.
// Note: Many Swedish news sites block automated access to their RSS feeds.
// This script will attempt to fetch from all sources, but some may fail.
const NEWS_SOURCES = [
  { name: 'Expressen', url: 'https://feeds.expressen.se/nyheter/' },
  { name: 'The Local', url: 'http://www.thelocal.se/RSS/theLocal.xml' },
  // The following sources are from the user's main branch, but are likely to be blocked by robots.txt
  // { name: 'SVT Nyheter', url: 'https://www.svt.se/nyheter/rss.xml' },
  // { name: 'Dagens Nyheter', url: 'https://www.dn.se/rss/' },
  // { name: 'Svenska Dagbladet', url: 'https://www.svd.se/rss.xml' }
];

const fetchFromSource = async (source) => {
  console.log(`Fetching articles from ${source.name}...`);
  try {
    const feed = await parser.parseURL(source.url);
    console.log(`Found ${feed.items.length} articles from ${source.name}`);

    return feed.items
      .map(item => {
        const { title, link, pubDate, content, contentSnippet } = item;
        if (!title || !link) {
          return null;
        }
        const summary = content ? content.replace(/<[^>]*>?/gm, '') : contentSnippet || null;
        return {
          title: title,
          source_url: link,
          published_at: pubDate ? new Date(pubDate) : new Date(),
          source_name: source.name,
          image_url: null,
          summary: summary,
          content: summary,
          category: 'general',
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error(`Failed to fetch from ${source.name}:`, error.message);
    return [];
  }
};

const fetchAndSaveArticles = async () => {
  console.log('Fetching latest news from all sources...');

  const allArticles = [];

  // Fetch from all sources in parallel
  const fetchPromises = NEWS_SOURCES.map(source => fetchFromSource(source));
  const results = await Promise.all(fetchPromises);

  // Combine all articles
  results.forEach(articles => allArticles.push(...articles));

  if (allArticles.length > 0) {
    console.log(`Upserting ${allArticles.length} articles to Supabase...`);

    const { error } = await supabase
      .from('articles')
      .upsert(allArticles, { onConflict: 'source_url' });

    if (error) {
      console.error('Error upserting articles:', error);
    } else {
      console.log(`Successfully upserted articles from ${NEWS_SOURCES.length} sources.`);
    }
  } else {
    console.log('No new articles to save.');
  }

  console.log('News fetch cycle complete.');
};

// Fetch articles immediately on start, then every minute
fetchAndSaveArticles();
setInterval(fetchAndSaveArticles, 60000);
