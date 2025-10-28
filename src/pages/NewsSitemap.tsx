import { useEffect } from 'react';

const NewsSitemap = () => {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://bsrmueavzxvxkqvtrxcg.supabase.co/functions/v1/sitemap/news-sitemap.xml');
        const xmlText = await response.text();
        
        // Replace the entire document with the XML
        document.open();
        document.write(xmlText);
        document.close();
      } catch (error) {
        console.error('Error fetching news sitemap:', error);
      }
    };
    
    fetchSitemap();
  }, []);

  return null;
};

export default NewsSitemap;
