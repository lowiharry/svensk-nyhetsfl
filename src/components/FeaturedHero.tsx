import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, Share2, Facebook, Twitter, Radio } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { stripHtml } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
const HERO_FALLBACK_AVIF_URL = '/og-image.avif';
const HERO_FALLBACK_WEBP_URL = '/og-image.webp';

type Article = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string;
  published_at: string;
  category: string;
};

type FeaturedRow = {
  id: string;
  slot_at: string;
  status: 'scheduled' | 'active' | 'expired';
  article: Article | null;
};

async function fetchScheduledFeatured(): Promise<FeaturedRow[]> {
  const nowIso = new Date().toISOString();
  // All scheduled slots for today (past + upcoming), earliest slot first
  const { data, error } = await supabase
    .from('featured_schedule')
    .select('id, slot_at, status, article:articles(id,title,summary,content,image_url,source_name,source_url,published_at,category)')
    .order('slot_at', { ascending: true });
  if (error) {
    console.error('featured fetch error', error);
  }
  const rows = ((data ?? []) as unknown as FeaturedRow[]).filter((r) => r.article);
  if (rows.length > 0) return rows;

  // Fallback: most recent active articles (no schedule yet)
  const { data: fallback } = await supabase
    .from('articles')
    .select('id,title,summary,content,image_url,source_name,source_url,published_at,category')
    .gt('expiry_at', nowIso)
    .not('image_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(10);
  const arts = (fallback ?? []) as Article[];
  return arts.map((art) => ({
    id: `fallback-${art.id}`,
    slot_at: art.published_at,
    status: 'active' as const,
    article: art,
  }));
}

const statusStyles: Record<FeaturedRow['status'], string> = {
  scheduled: 'bg-amber-700 text-white',
  active: 'bg-emerald-700 text-white',
  expired: 'bg-neutral-600 text-white',
};

export const FeaturedHero = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, forceTick] = useState(0);

  const { data: rows, isLoading } = useQuery({
    queryKey: ['featured-scheduled-list'],
    queryFn: fetchScheduledFeatured,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const [index, setIndex] = useState(0);

  // Cycle through scheduled articles every 3s
  useEffect(() => {
    if (!rows || rows.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % rows.length);
    }, 3000);
    return () => clearInterval(t);
  }, [rows]);

  // Keep index in bounds when list length changes
  useEffect(() => {
    if (rows && index >= rows.length) setIndex(0);
  }, [rows, index]);

  // Realtime: swap the hero the instant scheduler updates a row.
  useEffect(() => {
    const channel = supabase
      .channel('featured_schedule_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'featured_schedule' },
        () => qc.invalidateQueries({ queryKey: ['featured-scheduled-list'] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // Re-render every 30s so "x minutes ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const current = rows && rows.length > 0 ? rows[Math.min(index, rows.length - 1)] : null;
  const article = current?.article ?? null;
  const status = current?.status ?? 'active';
  const slotAt = current?.slot_at ?? null;

  const articleUrl = article ? `/article/${encodeURIComponent(article.source_url)}` : '#';
  const shareUrl = useMemo(
    () => (article ? `${window.location.origin}${articleUrl}` : ''),
    [article, articleUrl],
  );

  const summary = useMemo(() => {
    if (!article) return '';
    const raw = stripHtml(article.summary || article.content || '').replace(/\s+/g, ' ').trim();
    if (raw.length <= 150) return raw;
    return raw.slice(0, 147).trimEnd() + '…';
  }, [article]);

  const handleNativeShare = async () => {
    if (!article) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: summary, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Copied!', description: 'Article link copied to clipboard' });
      } catch {
        toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' });
      }
    }
  };

  const isReady = !isLoading && article;
  const isUsingFallbackImage = !article?.image_url;
  const imageUrl = article?.image_url || HERO_FALLBACK_WEBP_URL;
  const title = article?.title || 'Sweden Update: Latest Swedish News';
  const cleanTitle = article ? stripHtml(article.title) : '';
  const heroAlt = article
    ? `Photo accompanying the featured Sweden Update story: ${cleanTitle}`
    : 'Sweden Update featured news banner';

  return (
    <section
      aria-label="Featured news"
      className="relative w-full overflow-hidden bg-gradient-to-b from-muted/40 to-background"
    >
      {isReady && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: summary,
            image: article.image_url ? [article.image_url] : undefined,
            datePublished: article.published_at,
            articleSection: article.category,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': shareUrl || articleUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Sweden Update',
            },
            isBasedOn: article.source_url,
            author: { '@type': 'Organization', name: article.source_name },
          })}</script>
        </Helmet>
      )}

      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px]" style={{ aspectRatio: '16 / 9' }}>
        <picture className="absolute inset-0 block h-full w-full">
          {isUsingFallbackImage && <source srcSet={HERO_FALLBACK_AVIF_URL} type="image/avif" />}
          {isUsingFallbackImage && <source srcSet={HERO_FALLBACK_WEBP_URL} type="image/webp" />}
          <img
            src={imageUrl}
            alt={heroAlt}
            className="h-full w-full object-cover"
            width="1200"
            height="675"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sizes="100vw"
            onError={(e) => { e.currentTarget.src = HERO_FALLBACK_WEBP_URL; }}
          />
        </picture>
        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

        {!isReady && (
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-10 lg:p-14">
            <div className="container mx-auto max-w-5xl">
              <Badge className="mb-3 bg-primary/95 text-primary-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold px-2.5 py-1 shadow-lg">
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                Featured
              </Badge>
              <h2 className="text-white font-extrabold leading-tight tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl max-w-4xl drop-shadow-lg">
                {title}
              </h2>
              <p className="mt-3 sm:mt-4 text-white text-sm sm:text-base md:text-lg max-w-3xl drop-shadow-lg">
                Breaking news Sweden, live updates, politics, economy, weather and major Swedish headlines.
              </p>
            </div>
          </div>
        )}

        {isReady && (
          <>
            {/* Top-left status/schedule badges */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary/95 text-primary-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold px-2.5 py-1 shadow-lg">
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                Featured
              </Badge>
              <Badge className={`${statusStyles[status]} text-[10px] sm:text-xs uppercase tracking-wider font-semibold px-2.5 py-1 shadow-lg backdrop-blur-sm`}>
                {status}
              </Badge>
              {slotAt && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-black/70 text-white border-white/20 text-xs backdrop-blur-sm">
                  Slot {format(new Date(slotAt), 'HH:mm')}
                </Badge>
              )}
            </div>

            {/* Content overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-10 lg:p-14">
              <div className="container mx-auto max-w-5xl">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="capitalize text-xs sm:text-sm px-2.5 py-0.5">
                    {article.category}
                  </Badge>
                  <span className="text-white text-xs sm:text-sm flex items-center gap-1 drop-shadow">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                  </span>
                  <span className="text-white text-xs sm:text-sm hidden sm:inline drop-shadow">
                    • Source: <span className="font-medium text-white">{article.source_name}</span>
                  </span>
                </div>

                <h2 className="text-white font-extrabold leading-tight tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl max-w-4xl drop-shadow-lg line-clamp-3">
                  {stripHtml(article.title)}
                </h2>

                {summary && (
                  <p className="mt-3 sm:mt-4 text-white text-sm sm:text-base md:text-lg max-w-3xl line-clamp-2 sm:line-clamp-3 drop-shadow-lg">
                    {summary}
                  </p>
                )}

                <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Link to={articleUrl}>
                    <Button size="lg" className="font-semibold shadow-lg">
                      Read full article
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => window.open(article.source_url, '_blank', 'noopener,noreferrer')}
                    className="font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Original source</span>
                    <span className="sm:hidden">Source</span>
                  </Button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Share article: ${cleanTitle}`}
                      onClick={handleNativeShare}
                      className="text-white hover:bg-white/15 h-10 w-10"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <a
                      aria-label={`Share on Facebook: ${cleanTitle}`}
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-md text-white hover:bg-white/15 transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a
                      aria-label={`Share on Twitter: ${cleanTitle}`}
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-md text-white hover:bg-white/15 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedHero;