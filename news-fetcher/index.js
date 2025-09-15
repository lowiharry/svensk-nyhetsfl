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

const FEEDS = [
  { name: 'Expressen', url: 'https://feeds.expressen.se/nyheter/' },
  { name: 'The Local', url: 'http://www.thelocal.se/RSS/theLocal.xml' }
];

const fetchAndSaveArticles = async () => {
  console.log('Starting news fetch cycle...');

  for (const feedSource of FEEDS) {
    console.log(`Fetching articles from ${feedSource.name}...`);

    try {
      const feed = await parser.parseURL(feedSource.url);
      console.log(`Found ${feed.items.length} articles in the ${feedSource.name} feed.`);

      const articlesToUpsert = feed.items.map(item => {
        const { title, link, pubDate, content } = item;

        // Create a summary by stripping HTML tags from the content
        const summary = content ? content.replace(/<[^>]*>?/gm, '') : null;

        return {
          title: title,
          source_url: link,
          published_at: pubDate ? new Date(pubDate) : new Date(),
          source_name: feedSource.name,
          image_url: null,
          summary: summary,
          content: summary,
          category: 'general',
        };
      });

      if (articlesToUpsert.length > 0) {
        console.log(`Upserting ${articlesToUpsert.length} articles from ${feedSource.name} to Supabase...`);

        const { data, error } = await supabase
          .from('articles')
          .upsert(articlesToUpsert, { onConflict: 'source_url' });

        if (error) {
          console.error(`Error upserting articles from ${feedSource.name}:`, error);
        } else {
          console.log(`Successfully upserted articles from ${feedSource.name}.`);
        }
      } else {
        console.log(`No new articles to save from ${feedSource.name}.`);
      }

    } catch (error) {
      console.error(`Failed to fetch or process articles from ${feedSource.name}:`, error);
    }
  }
  console.log('News fetch cycle complete.');
};

// Fetch articles immediately on start, then every minute
fetchAndSaveArticles();
setInterval(fetchAndSaveArticles, 60000);
