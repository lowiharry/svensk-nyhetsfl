import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Quote {
  symbol: string;
  name: string;
  price: number | null;
  change: number;
  changePercent: number;
  currency: string;
}

const StockTicker = () => {
  const { data } = useQuery({
    queryKey: ['stock-ticker'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stock-ticker');
      if (error) throw error;
      return (data?.quotes ?? []) as Quote[];
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const quotes = (data ?? []).filter((q) => q.price != null);
  if (quotes.length === 0) {
    return <div className="w-full border-y bg-muted/40" style={{ minHeight: 32 }} aria-hidden />;
  }

  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {quotes.map((q, i) => {
        const up = q.change >= 0;
        return (
          <div key={`${q.symbol}-${i}`} className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="font-semibold text-foreground">{q.symbol}</span>
            <span className="text-foreground tabular-nums">
              {q.price!.toFixed(2)} {q.currency}
            </span>
            <span
              className={`flex items-center gap-0.5 tabular-nums ${
                up ? 'text-[hsl(var(--success))]' : 'text-destructive'
              }`}
            >
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {up ? '+' : ''}
              {q.changePercent.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className="w-full border-y bg-muted/40 overflow-hidden"
      style={{ minHeight: 32 }}
      role="marquee"
      aria-label="Live Swedish stock trades"
    >
      <div className="flex w-max animate-marquee [animation-direction:reverse] hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
};

export default StockTicker;