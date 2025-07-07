import { fetchWithAuth } from '../config/api';
import { endpoints } from '../config/api';

export interface Review {
  _id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  verified_purchases: number;
}

export interface CreateReviewData {
  product_id: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

// Create a new review
export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  const response = await fetchWithAuth(endpoints.reviews.create, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create review');
  }

  return response.json();
};

// Get reviews for a product
export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'created_at',
  sortOrder: string = 'desc'
): Promise<Review[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const response = await fetch(`${endpoints.reviews.getProductReviews(productId)}?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch reviews');
  }

  return response.json();
};

// Get review statistics for a product
export const getProductReviewStats = async (productId: string): Promise<ReviewStats> => {
  const response = await fetch(endpoints.reviews.getProductStats(productId), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch review stats');
  }

  return response.json();
};

// Update a review
export const updateReview = async (reviewId: string, reviewData: UpdateReviewData): Promise<Review> => {
  const response = await fetchWithAuth(endpoints.reviews.update(reviewId), {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update review');
  }

  return response.json();
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const response = await fetchWithAuth(endpoints.reviews.delete(reviewId), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete review');
  }
};

// Get user's reviews
export const getUserReviews = async (page: number = 1, limit: number = 10): Promise<Review[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetchWithAuth(`${endpoints.reviews.getUserReviews}?${params}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch user reviews');
  }

  return response.json();
}; 