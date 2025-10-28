import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://bsrmueavzxvxkqvtrxcg.supabase.co/functions/v1/sitemap');
        const xmlText = await response.text();
        
        // Replace the entire document with the XML
        document.open();
        document.write(xmlText);
        document.close();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };
    
    fetchSitemap();
  }, []);

  return null;
};

export default Sitemap;
