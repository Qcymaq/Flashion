import { endpoints, fetchWithAuth } from '../config/api';

export interface BeautyTip {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  full_content: string;
  image: string;
  date: string;
  views: number;
  likes: number;
  category: string;
  tags: string[];
  author: string;
  author_avatar: string;
  read_time: string;
  related_articles: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeautyTipCreate {
  title: string;
  excerpt: string;
  content: string;
  full_content: string;
  image: string;
  category: string;
  tags: string[];
  author: string;
  read_time: string;
  is_published: boolean;
  related_articles: string[];
}

export interface BeautyTipUpdate {
  title?: string;
  excerpt?: string;
  content?: string;
  full_content?: string;
  image?: string;
  category?: string;
  tags?: string[];
  author?: string;
  read_time?: string;
  is_published?: boolean;
  related_articles?: string[];
}

export interface BeautyTipsResponse {
  beautyTips: BeautyTip[];
  total: number;
}

export interface BeautyTipsStats {
  total_count: number;
  published_count: number;
  draft_count: number;
  total_views: number;
  total_likes: number;
  most_viewed: {
    title: string;
    views: number;
  } | null;
}

// Get all beauty tips
export const getBeautyTips = async (
  skip: number = 0,
  limit: number = 10,
  category?: string,
  search?: string,
  publishedOnly: boolean = true
): Promise<BeautyTip[]> => {
  try {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      published_only: publishedOnly.toString(),
    });

    if (category && category !== 'Tất cả') {
      params.append('category', category);
    }

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${endpoints.beautyTips.list}?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch beauty tips');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching beauty tips:', error);
    throw error;
  }
};

// Get a specific beauty tip
export const getBeautyTip = async (id: string): Promise<BeautyTip> => {
  try {
    const response = await fetch(endpoints.beautyTips.detail(id));
    
    if (!response.ok) {
      throw new Error('Failed to fetch beauty tip');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching beauty tip:', error);
    throw error;
  }
};

// Create a new beauty tip (Admin only)
export const createBeautyTip = async (beautyTip: BeautyTipCreate): Promise<BeautyTip> => {
  try {
    const response = await fetchWithAuth(endpoints.beautyTips.create, {
      method: 'POST',
      body: JSON.stringify(beautyTip),
    });

    if (!response.ok) {
      throw new Error('Failed to create beauty tip');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating beauty tip:', error);
    throw error;
  }
};

// Update a beauty tip (Admin only)
export const updateBeautyTip = async (id: string, beautyTip: BeautyTipUpdate): Promise<BeautyTip> => {
  try {
    const response = await fetchWithAuth(endpoints.beautyTips.update(id), {
      method: 'PUT',
      body: JSON.stringify(beautyTip),
    });

    if (!response.ok) {
      throw new Error('Failed to update beauty tip');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating beauty tip:', error);
    throw error;
  }
};

// Delete a beauty tip (Admin only)
export const deleteBeautyTip = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(endpoints.beautyTips.delete(id), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete beauty tip');
    }
  } catch (error) {
    console.error('Error deleting beauty tip:', error);
    throw error;
  }
};

// Toggle publish status (Admin only)
export const togglePublishStatus = async (id: string): Promise<{ message: string; is_published: boolean }> => {
  try {
    const response = await fetchWithAuth(endpoints.beautyTips.togglePublish(id), {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle publish status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling publish status:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(endpoints.beautyTips.categories);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get beauty tips statistics (Admin only)
export const getBeautyTipsStats = async (): Promise<BeautyTipsStats> => {
  try {
    const response = await fetchWithAuth(endpoints.beautyTips.stats);
    
    if (!response.ok) {
      throw new Error('Failed to fetch beauty tips stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching beauty tips stats:', error);
    throw error;
  }
};

// Get comments for a beauty tip
export const getCommentsForTip = async (tipId: string) => {
  const response = await fetch(`${endpoints.beautyTips.list}/${tipId}/comments`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return await response.json();
};

// Add a comment to a beauty tip (authenticated)
export const addCommentToTip = async (tipId: string, content: string, token: string) => {
  const response = await fetch(`${endpoints.beautyTips.list}/${tipId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error('Failed to add comment');
  }
  return await response.json();
};

// Delete a comment (admin only)
export const deleteComment = async (tipId: string, commentId: string, token: string) => {
  const response = await fetch(`${endpoints.beautyTips.list}${tipId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
  return await response.json();
};

// Toggle like/unlike for a beauty tip (authenticated)
export const toggleLikeBeautyTip = async (tipId: string, token: string) => {
  const response = await fetch(`${endpoints.beautyTips.list}/${tipId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }
  return await response.json();
}; 