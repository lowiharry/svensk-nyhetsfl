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
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getSourceColor(article.source_name)} text-white`}>
                {article.source_name}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {article.category}
              </Badge>
            </div>
            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </div>
          </div>
          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {article.summary && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {article.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={userInteraction === 'like' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleInteraction('like')}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="w-4 h-4" />
              {localCounts.likes}
            </Button>
            
            <Button
              variant={userInteraction === 'dislike' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleInteraction('dislike')}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="w-4 h-4" />
              {localCounts.dislikes}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenComments(article.id)}
              className="flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              {localCounts.comments}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(article.source_url, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Read More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};