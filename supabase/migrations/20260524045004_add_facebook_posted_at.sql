-- Add facebook_posted_at column to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS facebook_posted_at timestamp with time zone;