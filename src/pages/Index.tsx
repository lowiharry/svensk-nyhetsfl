import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { NewsCard } from '@/components/NewsCard';
import { FetchNewsButton } from '@/components/FetchNewsButton';
import { BackToTop } from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useFetchNews } from '@/hooks/use-fetch-news';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string;
  published_at: string;
  category: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const { fetchNews } = useFetchNews();

  const ARTICLES_PER_PAGE = 20;

  // Auto-fetch news every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews(false); // Don't show toast for automatic fetch
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchNews]);

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1);
    setAllArticles([]);
  }, [searchQuery, selectedCategory]);

  // Fetch articles - only non-expired ones
  const { data: articles = [], isLoading, isFetching } = useQuery({
    queryKey: ['articles', searchQuery, selectedCategory, page],
    queryFn: async () => {
      const now = new Date().toISOString();
      const offset = (page - 1) * ARTICLES_PER_PAGE;
      
      let query = supabase
        .from('articles')
        .select('*')
        .gt('expiry_at', now)
        .order('published_at', { ascending: false })
        .range(offset, offset + ARTICLES_PER_PAGE - 1);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching articles:', error);
        return [];
      }
      
      return data as Article[];
    },
    refetchInterval: page === 1 ? 1000 : false, // Only auto-refresh first page
  });

  // Update all articles when new data arrives
  useEffect(() => {
    if (articles.length > 0) {
      if (page === 1) {
        setAllArticles(articles);
      } else {
        setAllArticles(prev => [...prev, ...articles]);
      }
    }
  }, [articles, page]);

  const hasMoreArticles = articles.length === ARTICLES_PER_PAGE;

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleOpenComments = (articleId: string) => {
    // TODO: Implement comments modal/drawer
    console.log('Open comments for article:', articleId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sweden Update - Latest Swedish News</title>
        <meta name="description" content="Your trusted source for Swedish news aggregation. Get the latest updates from Aftonbladet, Expressen, DN, SvD, GP, and SVT." />
        <link rel="canonical" href="https://swedenupdate.com/" />
      </Helmet>
      <Header
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Updates</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {allArticles.length} articles loaded
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <FetchNewsButton />
          </div>
        </div>

        {/* Search/Filter Results */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                {searchQuery && (
                  <p className="text-sm">
                    Searching for: <span className="font-semibold">"{searchQuery}"</span>
                  </p>
                )}
                {selectedCategory !== 'all' && (
                  <p className="text-sm">
                    Category: <span className="font-semibold capitalize">{selectedCategory}</span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && allArticles.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading latest Swedish news...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && allArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">📰</div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter criteria"
                : "Check back soon for the latest news"
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Show all articles
              </Button>
            )}
          </div>
        )}

        {/* News Grid */}
        {allArticles.length > 0 && (
          <>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {allArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreArticles && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="min-w-[200px]"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 py-8 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span>🇸🇪</span>
                <span className="font-semibold">Sweden Update</span>
                <span>🇸🇪</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Your trusted source for Swedish news aggregation
              </p>
              <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </nav>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Sweden Update. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
      
      <BackToTop />
    </div>
  );
};

export default Index;