import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Radio } from 'lucide-react';

interface Headline {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
}

const HeadlineTicker = () => {
  const { data } = useQuery({
    queryKey: ['headline-ticker'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, source_url, source_name')
        .gt('expiry_at', now)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Headline[];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const headlines = data ?? [];
  if (headlines.length === 0) {
    // Reserve space to prevent layout shift while data loads
    return <div className="w-full bg-yellow-400 border-b" style={{ minHeight: 36 }} aria-hidden />;
  }

  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {headlines.map((h, i) => (
        <Link
          key={`${h.id}-${i}`}
          to={`/article/${encodeURIComponent(h.source_url)}`}
          className="flex items-center gap-2 text-sm whitespace-nowrap hover:text-primary transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-medium">{h.title}</span>
          <span className="text-muted-foreground text-xs">— {h.source_name}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div
      className="w-full bg-white text-foreground border-b overflow-hidden flex items-stretch"
      role="marquee"
      aria-label="Latest Swedish news headlines"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground font-bold text-xs uppercase tracking-wide shrink-0">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        Live
      </div>
      <div className="flex-1 overflow-hidden py-2">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
};

export default HeadlineTicker;