-- Add AI enrichment columns to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS ai_summary text,
ADD COLUMN IF NOT EXISTS ai_context text,
ADD COLUMN IF NOT EXISTS ai_timeline text,
ADD COLUMN IF NOT EXISTS ai_analysis text,
ADD COLUMN IF NOT EXISTS ai_what_we_know text,
ADD COLUMN IF NOT EXISTS ai_enriched_at timestamp with time zone;