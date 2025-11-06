-- Add expiry_at column to articles table
ALTER TABLE public.articles 
ADD COLUMN expiry_at TIMESTAMP WITH TIME ZONE;

-- Set expiry_at for existing articles (30 days after published_at)
UPDATE public.articles 
SET expiry_at = published_at + INTERVAL '30 days'
WHERE expiry_at IS NULL;

-- Create index for efficient expiry queries
CREATE INDEX idx_articles_expiry_at ON public.articles(expiry_at);

-- Create a function to automatically set expiry_at on insert
CREATE OR REPLACE FUNCTION public.set_article_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_at IS NULL THEN
    NEW.expiry_at = NEW.published_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expiry_at
CREATE TRIGGER set_article_expiry_trigger
BEFORE INSERT ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_article_expiry();