import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, ExternalLink, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

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

interface NewsCardProps {
  article: Article;
  onOpenComments: (articleId: string) => void;
}

export const NewsCard = ({ article, onOpenComments }: NewsCardProps) => {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>('');
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
  const [localCounts, setLocalCounts] = useState({
    likes: article.likes_count,
    dislikes: article.dislikes_count,
    comments: article.comments_count
  });

  useEffect(() => {
    // Generate or get session ID
    let sid = localStorage.getItem('sweden_update_session');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sweden_update_session', sid);
    }
    setSessionId(sid);

    // Check if user already interacted with this article
    checkUserInteraction(sid);
  }, [article.id]);

  const checkUserInteraction = async (sid: string) => {
    try {
      const { data } = await supabase
        .from('article_interactions')
        .select('interaction_type')
        .eq('article_id', article.id)
        .eq('session_id', sid)
        .single();
      
      if (data) {
        setUserInteraction(data.interaction_type as 'like' | 'dislike');
      }
    } catch (error) {
      // No interaction found, which is fine
    }
  };

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!sessionId) return;

    try {
      if (userInteraction === type) {
        // Remove interaction
        const { error } = await supabase
          .from('article_interactions')
          .delete()
          .eq('article_id', article.id)
          .eq('session_id', sessionId)
          .eq('interaction_type', type);

        if (!error) {
          setUserInteraction(null);
          setLocalCounts(prev => ({
            ...prev,
            likes: type === 'like' ? prev.likes - 1 : prev.likes,
            dislikes: type === 'dislike' ? prev.dislikes - 1 : prev.dislikes
          }));
        }
      } else {
        // Remove existing interaction if any
        if (userInteraction) {
          await supabase
            .from('article_interactions')
            .delete()
            .eq('article_id', article.id)
            .eq('session_id', sessionId);
        }

        // Add new interaction
        const { error } = await supabase
          .from('article_interactions')
          .insert({
            article_id: article.id,
            session_id: sessionId,
            interaction_type: type
          });

        if (!error) {
          setLocalCounts(prev => ({
            ...prev,
            likes: type === 'like' 
              ? prev.likes + (userInteraction === 'dislike' ? 2 : 1)
              : prev.likes - (userInteraction === 'like' ? 1 : 0),
            dislikes: type === 'dislike' 
              ? prev.dislikes + (userInteraction === 'like' ? 2 : 1)
              : prev.dislikes - (userInteraction === 'dislike' ? 1 : 0)
          }));
          setUserInteraction(type);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interaction",
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
              {article.title}
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
            {article.summary}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={userInteraction === 'like' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleInteraction('like')}
              className="flex items-center gap-1 h-9 px-3 text-xs"
            >
              <ThumbsUp className="w-3 h-3" />
              <span className="hidden xs:inline">{localCounts.likes}</span>
            </Button>
            
            <Button
              variant={userInteraction === 'dislike' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleInteraction('dislike')}
              className="flex items-center gap-1 h-9 px-3 text-xs"
            >
              <ThumbsDown className="w-3 h-3" />
              <span className="hidden xs:inline">{localCounts.dislikes}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenComments(article.id)}
              className="flex items-center gap-1 h-9 px-3 text-xs"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="hidden xs:inline">{localCounts.comments}</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-9 px-3 flex-1 sm:flex-initial"
            >
              <Share2 className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Share</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(article.source_url, '_blank')}
              className="flex items-center gap-1 h-9 px-3 flex-1 sm:flex-initial"
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