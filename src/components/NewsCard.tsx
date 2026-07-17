import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, ExternalLink, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { stripHtml } from '@/lib/utils';
import { Link } from 'react-router-dom';
import swedenFlag from '@/assets/article-fallback.jpg';

const SEO_ALT_TAGS = [
  "Latest Sweden news update",
  "Breaking news in Sweden today",
  "Sweden Update live headline image",
  "Current events in Sweden photo",
  "Swedish news article image",
  "News photo from Sweden Update website"
];

const getRandomAltTag = () => {
  return SEO_ALT_TAGS[Math.floor(Math.random() * SEO_ALT_TAGS.length)];
};
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

interface NewsCardProps {
  article: Article;
}

const NewsCardComponent = ({ article }: NewsCardProps) => {
  const { toast } = useToast();

  const articleUrl = `/article/${encodeURIComponent(article.source_url)}`;
  // Stable alt tag per article (avoid layout/hydration churn from Math.random on each render)
  const altTag = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < article.id.length; i++) hash = (hash * 31 + article.id.charCodeAt(i)) | 0;
    return SEO_ALT_TAGS[Math.abs(hash) % SEO_ALT_TAGS.length];
  }, [article.id]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${articleUrl}`;
    
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
      // Fallback to clipboard
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

  const getSourceBadgeClasses = (source: string) => {
    const styles = {
      'Aftonbladet': 'bg-red-500 text-secondary-foreground',
      'Expressen': 'bg-blue-500 text-secondary-foreground',
      'Dagens Nyheter': 'bg-gray-700 text-primary-foreground',
      'Svenska Dagbladet': 'bg-blue-600 text-primary-foreground',
      'Göteborgs-Posten': 'bg-green-600 text-secondary-foreground',
      'SVT': 'bg-blue-700 text-primary-foreground'
    };
    return styles[source as keyof typeof styles] || 'bg-primary text-primary-foreground';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <Link
          to={articleUrl}
          aria-label={`Read article: ${stripHtml(article.title)}`}
          className="flex justify-between items-start gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${getSourceBadgeClasses(article.source_name)} text-xs px-2 py-1`}>
                {article.source_name}
              </Badge>
              <Badge variant="outline" className="capitalize text-xs px-2 py-1">
                {article.category}
              </Badge>
            </div>
            <h3 className="font-bold text-base sm:text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {stripHtml(article.title)}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <img 
            src={article.image_url || swedenFlag} 
            alt={`${altTag} - ${article.title}`}
            width={96}
            height={96}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0 bg-muted"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = swedenFlag;
            }}
          />
        </Link>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {article.summary && (
          <Link to={articleUrl} className="flex-1 mb-4">
            <p className="text-muted-foreground text-sm line-clamp-3 hover:text-foreground transition-colors">
              {stripHtml(article.summary)}
            </p>
          </Link>
        )}
        
        <div className="flex items-center justify-end gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-9 px-3"
          >
            <Share2 className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline text-xs">Share</span>
          </Button>
          
          <Link to={articleUrl}>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1 h-9 px-3"
            >
              <span className="text-xs">View Article</span>
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(article.source_url, '_blank')}
            className="flex items-center gap-1 h-9 px-3"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const NewsCard = memo(NewsCardComponent);