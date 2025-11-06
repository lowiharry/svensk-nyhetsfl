-- Fix security warning: Set immutable search_path for the function
CREATE OR REPLACE FUNCTION public.set_article_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_at IS NULL THEN
    NEW.expiry_at = NEW.published_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;