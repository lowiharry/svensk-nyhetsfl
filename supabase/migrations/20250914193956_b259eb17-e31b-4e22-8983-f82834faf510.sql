-- Create news articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT DEFAULT 'general',
  likes_count BIGINT DEFAULT 0,
  dislikes_count BIGINT DEFAULT 0,
  comments_count BIGINT DEFAULT 0
);

-- Create article interactions table (for anonymous users)
CREATE TABLE public.article_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Browser session identifier
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, session_id, interaction_type)
);

-- Create comments table (for anonymous users)
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  likes_count BIGINT DEFAULT 0,
  is_moderated BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_source ON public.articles(source_name);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_interactions_article ON public.article_interactions(article_id);
CREATE INDEX idx_comments_article ON public.comments(article_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- Enable Row Level Security (allow public access since no auth)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Articles are viewable by everyone" 
ON public.articles FOR SELECT USING (true);

CREATE POLICY "Everyone can create interactions" 
ON public.article_interactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can view interactions" 
ON public.article_interactions FOR SELECT USING (true);

CREATE POLICY "Everyone can create comments" 
ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can view comments" 
ON public.comments FOR SELECT USING (true);

-- Function to update article counts
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
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_article_interaction_counts
  AFTER INSERT OR DELETE ON public.article_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_article_counts();

CREATE TRIGGER update_article_comment_counts
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_article_counts();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();