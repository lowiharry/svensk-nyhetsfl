import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Clock, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { stripHtml } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ArticleDetail() {
  const { sourceUrl } = useParams();
  const { toast } = useToast();
  
  const { data: article, isLoading, refetch } = useQuery({
    queryKey: ['article', sourceUrl],
    queryFn: async () => {
      const decodedUrl = decodeURIComponent(sourceUrl || '');
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('source_url', decodedUrl)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sourceUrl
  });

  const [isEnriching, setIsEnriching] = useState(false);

  // Check if article is expired
  const isExpired = article && new Date(article.expiry_at) <= new Date();

  const handleEnrich = async () => {
    if (!article) return;
    
    setIsEnriching(true);
    try {
      const { error } = await supabase.functions.invoke('enrich-article', {
        body: { articleId: article.id }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to enrich article",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Article enriched with AI analysis"
        });
        refetch();
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      toast({
        title: "Error",
        description: "Failed to enrich article",
        variant: "destructive"
      });
    } finally {
      setIsEnriching(false);
    }
  };

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

  // Handle expired articles with 410 Gone
  if (isExpired) {
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
            <div className="mb-4 text-6xl">⏰</div>
            <h1 className="text-2xl font-bold mb-4">Article Expired</h1>
            <p className="text-muted-foreground mb-2">
              This article was published more than 30 days ago and has been removed from our archive.
            </p>
            <p className="text-sm text-muted-foreground">
              HTTP 410 Gone - Content intentionally removed
            </p>
          </div>
        </div>
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

  const canonicalUrl = `https://swedenupdate.com/article/${encodeURIComponent(sourceUrl)}`;
  const articleTitle = `${article.title} - Sweden Update`;
  const articleDescription = article.summary || article.title;

  // Schema.org structured data for Article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": articleDescription,
    "image": article.image_url || undefined,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": article.source_name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sweden Update",
      "logo": {
        "@type": "ImageObject",
        "url": "https://swedenupdate.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://swedenupdate.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": article.category || "News",
        "item": `https://swedenupdate.com/?category=${article.category || 'general'}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{articleTitle}</title>
        <meta name="description" content={articleDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={articleDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <meta property="article:published_time" content={article.published_at} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={articleDescription} />
        {article.image_url && <meta name="twitter:image" content={article.image_url} />}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/?category=${article.category || 'general'}`}>
                  {article.category || 'News'}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{stripHtml(article.title).substring(0, 50)}...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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

          {/* AI Enrichments */}
          {article.ai_enriched_at ? (
            <div className="space-y-6 border-t pt-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">AI Analysis</h2>
                <span className="text-sm text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(article.ai_enriched_at), { addSuffix: true })}
                </span>
              </div>

              {article.ai_summary && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Summary</h3>
                  <p className="text-muted-foreground">{article.ai_summary}</p>
                </div>
              )}

              {article.ai_context && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Context</h3>
                  <p className="text-muted-foreground">{article.ai_context}</p>
                </div>
              )}

              {article.ai_timeline && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Timeline</h3>
                  <div className="text-muted-foreground whitespace-pre-wrap">{article.ai_timeline}</div>
                </div>
              )}

              {article.ai_analysis && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Analysis</h3>
                  <p className="text-muted-foreground">{article.ai_analysis}</p>
                </div>
              )}

              {article.ai_what_we_know && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">What We Know Now</h3>
                  <div className="text-muted-foreground whitespace-pre-wrap">{article.ai_what_we_know}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-6 mt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Get AI-powered analysis including summary, context, timeline, and insights
              </p>
              <Button
                onClick={handleEnrich}
                disabled={isEnriching}
                variant="outline"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  'Generate AI Analysis'
                )}
              </Button>
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
