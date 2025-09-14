-- Fix security linter warnings by setting search_path for functions

-- Update the update_article_counts function with proper search_path
CREATE OR REPLACE FUNCTION public.update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'article_interactions' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.interaction_type = 'like' THEN
        UPDATE public.articles 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.article_id;
      ELSIF NEW.interaction_type = 'dislike' THEN
        UPDATE public.articles 
        SET dislikes_count = dislikes_count + 1 
        WHERE id = NEW.article_id;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.interaction_type = 'like' THEN
        UPDATE public.articles 
        SET likes_count = GREATEST(0, likes_count - 1) 
        WHERE id = OLD.article_id;
      ELSIF OLD.interaction_type = 'dislike' THEN
        UPDATE public.articles 
        SET dislikes_count = GREATEST(0, dislikes_count - 1) 
        WHERE id = OLD.article_id;
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.articles 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.articles 
      SET comments_count = GREATEST(0, comments_count - 1) 
      WHERE id = OLD.article_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update the update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;