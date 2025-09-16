import { Article } from '@/types';

const NEWS_API_URL = "https://swedenupdate-242495171302.europe-west1.run.app";

interface FetchNewsParams {
  searchQuery?: string;
  selectedCategory?: string;
}

export const fetchNews = async ({ searchQuery = '', selectedCategory = 'all' }: FetchNewsParams): Promise<Article[]> => {
  try {
    const url = new URL(NEWS_API_URL);
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }
    if (selectedCategory && selectedCategory !== 'all') {
      url.searchParams.append('category', selectedCategory);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Article[];
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};
