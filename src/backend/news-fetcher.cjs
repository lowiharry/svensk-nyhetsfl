const fs = require('fs');

// Since this is a .cjs file, we need to use dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const WORLD_NEWS_API_KEY = '8d0886c7630047fea8bba6e51df9d21e';
const WORLD_NEWS_API_URL = `https://api.worldnewsapi.com/search-news?source-countries=se&api-key=${WORLD_NEWS_API_KEY}`;
const OUTPUT_PATH = 'public/articles.json';

const RSS_FEEDS = [
  { name: 'Expressen', url: 'https://feeds.expressen.se/nyheter/', category: 'general' },
  { name: 'Dagens Nyheter', url: 'https://www.dn.se/rss/', category: 'general' },
  { name: 'Svenska Dagbladet', url: 'https://www.svd.se/feed/articles.rss', category: 'general' },
  { name: 'Göteborgs-Posten', url: 'http://info.gp.se/feed', category: 'general' },
  { name: 'SVT Nyheter', url: 'https://www.svt.se/rss.xml', category: 'general' },
];

const fetchNews = async () => {
  let allArticles = [];

  // Fetch from World News API
  try {
    console.log('Fetching news from World News API...');
    const response = await fetch(WORLD_NEWS_API_URL);
    const data = await response.json();

    if (data.news) {
      const articles = data.news.map((article) => ({
        id: article.id,
        title: article.title,
        summary: article.text,
        image_url: article.image,
        source_name: article.source_country,
        source_url: article.url,
        published_at: article.publish_date,
        category: 'general',
        likes_count: 0,
        dislikes_count: 0,
        comments_count: 0,
      }));
      allArticles.push(...articles);
    } else {
      console.log('No news found in the World News API response.');
    }
  } catch (error) {
    console.error('Error fetching or writing news from World News API:', error);
  }

  // Fetch from RSS feeds
  const Parser = require('rss-parser');
  const parser = new Parser();

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching feed: ${feed.name}`);
      const parsedFeed = await parser.parseURL(feed.url);

      if (parsedFeed.items) {
        const articles = parsedFeed.items.map((item) => ({
          id: item.guid || item.link,
          title: item.title,
          summary: item.contentSnippet?.substring(0, 280) || item.content?.substring(0, 280) || null,
          image_url: item.enclosure?.url || null,
          source_name: feed.name,
          source_url: item.link,
          published_at: item.isoDate,
          category: feed.category,
          likes_count: 0,
          dislikes_count: 0,
          comments_count: 0,
        }));
        allArticles.push(...articles);
      } else {
        console.log(`No items found for ${feed.name}`);
      }
    } catch (error) {
      console.error(`Failed to fetch or process feed ${feed.name}:`, error);
    }
  }

  // Remove duplicates and sort by date
  const uniqueArticles = Array.from(new Map(allArticles.map(item => [item['source_url'], item])).values());
  uniqueArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));


  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueArticles, null, 2));
  console.log(`Successfully fetched and wrote ${uniqueArticles.length} articles to ${OUTPUT_PATH}`);
};

fetchNews();
