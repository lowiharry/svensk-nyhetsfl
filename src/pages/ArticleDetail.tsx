import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Clock, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { stripHtml } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function ArticleDetail() {
  const { sourceUrl } = useParams();
  const { toast } = useToast();
  
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', sourceUrl],
    queryFn: async () => {
      const decodedUrl = decodeURIComponent(sourceUrl || '');
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('source_url', decodedUrl)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sourceUrl
  });

  const handleShare = async () => {
    if (!article) return;
    
    const shareUrl = `${window.location.origin}/article/${encodeURIComponent(article.source_url)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || '',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground">The article you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <article className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${getSourceColor(article.source_name)} text-white`}>
                {article.source_name}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {article.category}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {stripHtml(article.title)}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Image */}
          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {/* Summary */}
          {article.summary && (
            <div className="text-lg text-muted-foreground border-l-4 border-primary pl-4 py-2">
              {stripHtml(article.summary)}
            </div>
          )}

          {/* Content */}
          {article.content && (
            <div className="prose prose-lg max-w-none">
              {stripHtml(article.content)}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Article
            </Button>
            
            <Button
              onClick={() => window.open(article.source_url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Read Original
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
