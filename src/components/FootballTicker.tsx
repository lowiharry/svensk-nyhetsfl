import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  league: string;
  status: string;
  state: 'pre' | 'in' | 'post';
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  startTime: string;
}

const FootballTicker = () => {
  const { data } = useQuery({
    queryKey: ['football-scores'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('football-scores');
      if (error) throw error;
      return (data?.matches ?? []) as Match[];
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const matches = data ?? [];
  if (matches.length === 0) return null;

  const row = (
    <div className="flex shrink-0 items-center gap-6 pr-6">
      {matches.map((m, i) => {
        const live = m.state === 'in';
        const done = m.state === 'post';
        return (
          <div
            key={`${m.id}-${i}`}
            className="flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {m.league}
            </span>
            <span className="font-medium text-foreground">{m.home}</span>
            <span className="tabular-nums font-bold text-foreground">
              {m.state === 'pre' ? 'vs' : `${m.homeScore} - ${m.awayScore}`}
            </span>
            <span className="font-medium text-foreground">{m.away}</span>
            {live && (
              <span className="flex items-center gap-1 text-destructive font-semibold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                {m.status || 'LIVE'}
              </span>
            )}
            {!live && (
              <span
                className={`text-xs ${
                  done ? 'text-muted-foreground' : 'text-primary'
                }`}
              >
                {m.status}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className="w-full border-b bg-muted/30 overflow-hidden"
      role="marquee"
      aria-label="Live football scores"
      style={{ minHeight: 32 }}
    >
      <div className="flex items-center">
        <span className="shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
          ⚽ Scores
        </span>
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
};

export default FootballTicker;