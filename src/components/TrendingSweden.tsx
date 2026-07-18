import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp } from 'lucide-react';

const TrendingSweden = () => {
  const { data } = useQuery({
    queryKey: ['trending-sweden'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('trending-sweden');
      if (error) throw error;
      return (data?.topics ?? []) as string[];
    },
    refetchInterval: 5 * 60_000,
    staleTime: 60_000,
  });

  const topics = data ?? [];
  if (topics.length === 0) {
    return <div className="w-full border-b bg-muted/40" style={{ minHeight: 32 }} aria-hidden />;
  }

  const row = (
    <div className="flex shrink-0 items-center gap-6 pr-6">
      {topics.map((topic, i) => (
        <div key={`${topic}-${i}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="font-semibold text-foreground">{topic}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="w-full border-b bg-muted/40 overflow-hidden"
      style={{ minHeight: 32 }}
      role="marquee"
      aria-label="Trending in Sweden"
    >
      <div className="flex items-center">
        <span className="shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground flex items-center gap-1 relative z-10">
          <TrendingUp className="w-3 h-3" />
          Trending in Sweden
        </span>
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
};

export default TrendingSweden;
