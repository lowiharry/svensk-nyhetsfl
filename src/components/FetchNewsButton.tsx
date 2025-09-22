import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useFetchNews } from '@/hooks/use-fetch-news';

export const FetchNewsButton = () => {
  const { fetchNews, isLoading } = useFetchNews();

  const handleFetchNews = () => {
    fetchNews(true); // Show toast for manual fetch
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleFetchNews}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      Fetch Latest News
    </Button>
  );
};