import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, ExternalLink, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { stripHtml } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const { toast } = useToast();
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(null);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  const handleInteraction = async (interactionType: 'like' | 'dislike') => {
    if (interaction) return;

    const sessionId = getSessionId();
    setInteraction(interactionType);

    const { error } = await supabase.from('article_interactions').insert([
      { article_id: article.id, session_id: sessionId, interaction_type: interactionType },
    ]);

    if (error) {
      console.error('Error recording interaction:', error);
      toast({
        title: "Error",
        description: "Failed to record interaction",
        variant: "destructive"
      });
      setInteraction(null);
    } else {
      toast({
        title: "Thanks for your feedback!",
        description: `You've ${interactionType}d this article.`
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
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Button variant={interaction === 'like' ? 'secondary' : 'outline'} size="sm" className="h-9 px-3" onClick={() => handleInteraction('like')} disabled={!!interaction}>
              <ThumbsUp className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Like</span>
              <span className="text-xs ml-1">{article.likes_count}</span>
            </Button>
            <Button variant={interaction === 'dislike' ? 'secondary' : 'outline'} size="sm" className="h-9 px-3" onClick={() => handleInteraction('dislike')} disabled={!!interaction}>
              <ThumbsDown className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Dislike</span>
              <span className="text-xs ml-1">{article.dislikes_count}</span>
            </Button>
          </div>
          <div className="flex items-center justify-end gap-2">
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