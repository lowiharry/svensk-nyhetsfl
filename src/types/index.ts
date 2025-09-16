export interface Article {
  id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string;
  published_at: string;
  category: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
}
