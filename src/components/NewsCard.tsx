import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, ExternalLink, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { stripHtml } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
}

interface NewsCardProps {
  article: Article;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const { toast } = useToast();
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [optimisticCounts, setOptimisticCounts] = useState({
    likes: article.likes_count || 0,
    dislikes: article.dislikes_count || 0
  });

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  // Check user's current reaction on mount
  useEffect(() => {
    const checkUserReaction = async () => {
      const sessionId = getSessionId();
      const { data } = await supabase
        .from('article_interactions')
        .select('interaction_type')
        .eq('article_id', article.id)
        .eq('session_id', sessionId)
        .maybeSingle();
      
      if (data) {
        setUserReaction(data.interaction_type as 'like' | 'dislike');
      }
    };

    checkUserReaction();
  }, [article.id]);

  // Update optimistic counts when article data changes
  useEffect(() => {
    setOptimisticCounts({
      likes: article.likes_count || 0,
      dislikes: article.dislikes_count || 0
    });
  }, [article.likes_count, article.dislikes_count]);

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    const sessionId = getSessionId();
    
    // Optimistic update
    const wasCurrentReaction = userReaction === reactionType;
    const newReaction = wasCurrentReaction ? null : reactionType;
    
    // Calculate optimistic counts
    let newLikes = optimisticCounts.likes;
    let newDislikes = optimisticCounts.dislikes;
    
    // Remove old reaction count
    if (userReaction === 'like') newLikes--;
    if (userReaction === 'dislike') newDislikes--;
    
    // Add new reaction count
    if (newReaction === 'like') newLikes++;
    if (newReaction === 'dislike') newDislikes++;
    
    // Update UI immediately
    setUserReaction(newReaction);
    setOptimisticCounts({ likes: newLikes, dislikes: newDislikes });

    try {
      // Remove existing reaction first
      if (userReaction) {
        await supabase
          .from('article_interactions')
          .delete()
          .eq('article_id', article.id)
          .eq('session_id', sessionId);
      }
      
      // Add new reaction if not removing
      if (newReaction) {
        await supabase
          .from('article_interactions')
          .insert({
            article_id: article.id,
            session_id: sessionId,
            interaction_type: newReaction
          });
      }
    } catch (error) {
      // Revert optimistic update on error
      setUserReaction(userReaction);
      setOptimisticCounts({
        likes: article.likes_count || 0,
        dislikes: article.dislikes_count || 0
      });
      
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || '',
          url: article.source_url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(article.source_url);
        toast({
          title: "Copied!",
          description: "Article link copied to clipboard"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  const getSourceColor = (source: string) => {
    const colors = {
      'Aftonbladet': 'bg-red-500',
      'Expressen': 'bg-blue-500',
      'Dagens Nyheter': 'bg-gray-700',
      'Svenska Dagbladet': 'bg-blue-600',
      'Göteborgs-Posten': 'bg-green-600',
      'SVT': 'bg-blue-700'
    };
    return colors[source as keyof typeof colors] || 'bg-primary';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${getSourceColor(article.source_name)} text-white text-xs px-2 py-1`}>
                {article.source_name}
              </Badge>
              <Badge variant="outline" className="capitalize text-xs px-2 py-1">
                {article.category}
              </Badge>
            </div>
            <h3 className="font-bold text-base sm:text-lg leading-tight mb-2 line-clamp-2">
              {stripHtml(article.title)}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {article.summary && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
            {stripHtml(article.summary)}
          </p>
        )}
        
        <div className="flex items-center justify-between gap-2 mt-auto">
          {/* Reaction buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant={userReaction === 'like' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleReaction('like')}
              className="h-8 px-2 text-xs"
            >
              <ThumbsUp className={`w-3 h-3 mr-1 ${userReaction === 'like' ? 'fill-current' : ''}`} />
              {optimisticCounts.likes > 0 && optimisticCounts.likes}
            </Button>
            
            <Button
              variant={userReaction === 'dislike' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleReaction('dislike')}
              className="h-8 px-2 text-xs"
            >
              <ThumbsDown className={`w-3 h-3 mr-1 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
              {optimisticCounts.dislikes > 0 && optimisticCounts.dislikes}
            </Button>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-9 px-3"
            >
              <Share2 className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Share</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(article.source_url, '_blank')}
              className="flex items-center gap-1 h-9 px-3"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="text-xs">Read More</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};