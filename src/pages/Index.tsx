import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { NewsCard } from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string;
  published_at: string;
  category: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
}

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch articles
  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['articles', searchQuery, selectedCategory, refreshKey],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

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
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
    toast({
      title: "Refreshed",
      description: "News feed updated successfully"
    });
  };

  const handleOpenComments = (articleId: string) => {
    // TODO: Implement comments modal/drawer
    console.log('Open comments for article:', articleId);
    toast({
      title: "Comments",
      description: "Comments feature coming soon!"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Updates</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {articles.length} articles loaded
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
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
        {isLoading && articles.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading latest Swedish news...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && articles.length === 0 && (
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
        {articles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onOpenComments={handleOpenComments}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 py-8 border-t text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span>🇸🇪</span>
            <span>Sweden Update</span>
            <span>🇸🇪</span>
          </div>
          <p>Your trusted source for Swedish news aggregation</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;