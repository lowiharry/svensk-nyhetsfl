import Parser from 'rss-parser';
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
const parser = new Parser();

const FEED_URL = 'https://feeds.expressen.se/nyheter/';
const SOURCE_NAME = 'Expressen';

const fetchAndSaveArticles = async () => {
  console.log('Fetching articles from Expressen RSS feed...');

  try {
    const feed = await parser.parseURL(FEED_URL);
    console.log(`Found ${feed.items.length} articles in the feed.`);

    const articlesToUpsert = feed.items.map(item => {
      const { title, link, pubDate, content } = item;

      // Create a summary by stripping HTML tags from the content
      const summary = content ? content.replace(/<[^>]*>?/gm, '') : null;

      return {
        title: title,
        source_url: link,
        published_at: pubDate ? new Date(pubDate) : new Date(),
        source_name: SOURCE_NAME,
        image_url: null,
        summary: summary,
        content: summary, // Using summary for content as well, as full content is not in RSS
        category: 'general', // Default category
      };
    });

    if (articlesToUpsert.length > 0) {
      console.log(`Upserting ${articlesToUpsert.length} articles to Supabase...`);

      const { data, error } = await supabase
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
    console.error('Failed to fetch or process articles:', error);
  }
};

fetchAndSaveArticles();
