
-- Featured News Schedule table
CREATE TABLE public.featured_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  slot_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_at)
);

CREATE INDEX idx_featured_schedule_slot_at ON public.featured_schedule (slot_at DESC);
CREATE INDEX idx_featured_schedule_status ON public.featured_schedule (status);
CREATE INDEX idx_featured_schedule_article_id ON public.featured_schedule (article_id);

-- Grants (public read; writes only via service role / edge function)
GRANT SELECT ON public.featured_schedule TO anon;
GRANT SELECT ON public.featured_schedule TO authenticated;
GRANT ALL ON public.featured_schedule TO service_role;

ALTER TABLE public.featured_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured schedule is viewable by everyone"
  ON public.featured_schedule FOR SELECT
  USING (true);

-- updated_at trigger (reuse existing function)
CREATE TRIGGER trg_featured_schedule_updated_at
  BEFORE UPDATE ON public.featured_schedule
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for seamless homepage transitions
ALTER PUBLICATION supabase_realtime ADD TABLE public.featured_schedule;

-- Ensure pg_cron + pg_net for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
