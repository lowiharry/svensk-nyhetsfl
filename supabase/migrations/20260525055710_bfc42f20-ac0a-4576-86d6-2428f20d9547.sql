CREATE OR REPLACE FUNCTION public.set_article_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.expiry_at IS NULL THEN
    NEW.expiry_at = NEW.published_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$function$;

UPDATE public.articles
SET expiry_at = published_at + INTERVAL '30 days';