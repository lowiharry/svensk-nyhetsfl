-- Step 1: Drop the old, incorrect unique constraint.
-- The original constraint allowed a user to have both a "like" and a "dislike" for the same article.
-- We assume the auto-generated name for the constraint. If this fails, the name needs to be looked up.
ALTER TABLE public.article_interactions
DROP CONSTRAINT IF EXISTS article_interactions_article_id_session_id_interaction_type_key;

-- Step 2: Add the new, correct unique constraint.
-- This ensures that a session can only have one type of interaction per article.
ALTER TABLE public.article_interactions
ADD CONSTRAINT article_interactions_article_id_session_id_key
UNIQUE (article_id, session_id);


-- Step 3: Create an RPC function to handle all reaction logic.
-- This function simplifies the client-side code by handling inserts, deletes (toggling), and updates (switching).
CREATE OR REPLACE FUNCTION public.handle_article_reaction(
  p_article_id UUID,
  p_session_id TEXT,
  p_reaction_type TEXT
)
RETURNS void AS $$
DECLARE
  existing_reaction TEXT;
BEGIN
  -- Check for an existing reaction for this article/session combination.
  SELECT interaction_type INTO existing_reaction
  FROM public.article_interactions
  WHERE article_id = p_article_id AND session_id = p_session_id;

  -- If a reaction already exists:
  IF FOUND THEN
    -- If the new reaction is the same as the old one, it's a "toggle off", so we delete the record.
    IF existing_reaction = p_reaction_type THEN
      DELETE FROM public.article_interactions
      WHERE article_id = p_article_id AND session_id = p_session_id;
    -- If the new reaction is different, it's a "switch", so we update the record.
    ELSE
      UPDATE public.article_interactions
      SET interaction_type = p_reaction_type, created_at = now()
      WHERE article_id = p_article_id AND session_id = p_session_id;
    END IF;
  -- If no reaction exists, it's a new one, so we insert it.
  ELSE
    INSERT INTO public.article_interactions (article_id, session_id, interaction_type)
    VALUES (p_article_id, p_session_id, p_reaction_type);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Step 4: Update the trigger function to handle UPDATEs on interactions.
-- This is crucial for when a user switches their reaction from "like" to "dislike" or vice-versa.
CREATE OR REPLACE FUNCTION public.update_article_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Handling article_interactions table changes
  IF TG_TABLE_NAME = 'article_interactions' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.interaction_type = 'like' THEN
        UPDATE public.articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
      ELSIF NEW.interaction_type = 'dislike' THEN
        UPDATE public.articles SET dislikes_count = dislikes_count + 1 WHERE id = NEW.article_id;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.interaction_type = 'like' THEN
        UPDATE public.articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.article_id;
      ELSIF OLD.interaction_type = 'dislike' THEN
        UPDATE public.articles SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.article_id;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      -- When a reaction is switched from "like" to "dislike"
      IF OLD.interaction_type = 'like' AND NEW.interaction_type = 'dislike' THEN
        UPDATE public.articles
        SET likes_count = GREATEST(0, likes_count - 1),
            dislikes_count = dislikes_count + 1
        WHERE id = NEW.article_id;
      -- When a reaction is switched from "dislike" to "like"
      ELSIF OLD.interaction_type = 'dislike' AND NEW.interaction_type = 'like' THEN
        UPDATE public.articles
        SET dislikes_count = GREATEST(0, dislikes_count - 1),
            likes_count = likes_count + 1
        WHERE id = NEW.article_id;
      END IF;
    END IF;

  -- Handling comments table changes (existing functionality)
  ELSIF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.articles SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.article_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Step 5: Recreate the trigger to fire on UPDATE as well.
-- We must drop the old trigger first before creating a new one with the same name.
DROP TRIGGER IF EXISTS update_article_interaction_counts ON public.article_interactions;

CREATE TRIGGER update_article_interaction_counts
  AFTER INSERT OR DELETE OR UPDATE ON public.article_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_article_counts();
