import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useFetchNews = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchNews = useCallback(async (showToast = true) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        console.error('Error fetching news:', error);
        if (showToast) {
          toast({
            title: "Error",
            description: "Failed to fetch new articles. Please try again.",
            variant: "destructive"
          });
        }
        return;
      }

      if (showToast) {
        toast({
          title: "Success!",
          description: data.message || "Successfully fetched new articles!"
        });
      }
      
    } catch (error) {
      console.error('Error:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to fetch new articles. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { fetchNews, isLoading };
};