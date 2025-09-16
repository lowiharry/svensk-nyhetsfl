const http = require('http');
const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/app/.env' });

const parser = new Parser();

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const hostname = '127.0.0.1';
const port = 3001;

const cron = require('node-cron');

const feeds = [
  { name: 'Expressen', url: 'https://feeds.expressen.se/nyheter/', category: 'general' },
  { name: 'Dagens Nyheter', url: 'https://www.dn.se/rss/', category: 'general' },
  { name: 'Svenska Dagbladet', url: 'https://www.svd.se/feed/articles.rss', category: 'general' },
  { name: 'Göteborgs-Posten', url: 'http://info.gp.se/feed', category: 'general' },
  { name: 'SVT Nyheter', url: 'https://www.svt.se/rss.xml', category: 'general' },
];

const fetchAndStoreArticles = async () => {
  console.log('Starting article fetch cycle...');

  for (const feed of feeds) {
    try {
      console.log(`Fetching feed: ${feed.name}`);
      const parsedFeed = await parser.parseURL(feed.url);

      if (!parsedFeed.items) {
        console.log(`No items found for ${feed.name}`);
        continue;
      }

      for (const item of parsedFeed.items) {
        if (!item.title || !item.link || !item.isoDate) {
          console.warn('Skipping item due to missing data:', item);
          continue;
        }

        const articleToInsert = {
          title: item.title,
          summary: item.contentSnippet?.substring(0, 280) || item.content?.substring(0, 280) || null,
          content: item.content || null,
          image_url: item.enclosure?.url || null,
          source_name: feed.name,
          source_url: item.link,
          published_at: new Date(item.isoDate),
          category: feed.category,
        };

        const { error: insertError } = await supabase
          .from('articles')
          .insert(articleToInsert);

        if (insertError) {
          console.error(`Error inserting article for ${feed.name}:`, insertError);
        } else {
          console.log(`Successfully inserted: ${item.title}`);
          existing_urls.add(item.link);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch or process feed ${feed.name}:`, error);
    }
  }
  console.log('Article fetch cycle finished.');
};

// Schedule the task to run every 5 seconds
cron.schedule('*/5 * * * * *', () => {
  console.log('Running scheduled article fetch...');
  fetchAndStoreArticles();
});

console.log('News fetcher service started. Scheduled to run every 5 seconds.');
// Initial fetch on start
fetchAndStoreArticles();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
