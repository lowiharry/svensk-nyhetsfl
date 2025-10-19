import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { stripHtml } from '@/lib/utils';

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();

  const fetchArticle = async (articleId: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
  });

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

  const pageTitle = article ? `${stripHtml(article.title)} | Sweden Update` : 'Sweden Update';
  const pageDescription = article ? stripHtml(article.summary) : "Loading article from Sweden Update.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      {/* A simplified header that doesn't need all the filter/search props */}
      <Header onSearch={() => {}} onCategoryFilter={() => {}} selectedCategory="" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading article...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground">The article you are looking for does not exist or has been moved.</p>
          </div>
        )}

        {article && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-t-lg mb-6"
                  loading="lazy"
                />
              )}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`${getSourceColor(article.source_name)} text-white`}>
                  {article.source_name}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {article.category}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold leading-tight">{stripHtml(article.title)}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(article.published_at), 'MMMM d, yyyy HH:mm')}</span>
                </div>
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                    Read Original <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-lg">
              {/* Using summary as a fallback if full content is not available */}
              <p>{stripHtml(article.content || article.summary)}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ArticlePage;