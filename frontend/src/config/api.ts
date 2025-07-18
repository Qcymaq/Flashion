const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const endpoints = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
    updateProfile: `${API_BASE_URL}/auth/update-profile`,
    upgradeRequest: `${API_BASE_URL}/auth/membership/upgrade-request`,
    upgradeRequestStatus: `${API_BASE_URL}/auth/membership/upgrade-request/status`,
  },
  products: {
    list: `${API_BASE_URL}/products`,
    detail: (id: string) => `${API_BASE_URL}/products/${id}`,
    create: `${API_BASE_URL}/products`,
    update: (id: string) => `${API_BASE_URL}/products/${id}`,
    delete: (id: string) => `${API_BASE_URL}/products/${id}`,
  },
  cart: {
    get: `${API_BASE_URL}/cart`,
    add: `${API_BASE_URL}/cart/items`,
    update: (itemId: string) => `${API_BASE_URL}/cart/items/${itemId}`,
    remove: (itemId: string) => `${API_BASE_URL}/cart/items/${itemId}`,
    clear: `${API_BASE_URL}/cart`,
  },
  orders: {
    list: `${API_BASE_URL}/orders`,
    create: `${API_BASE_URL}/orders`,
    detail: (id: string) => `${API_BASE_URL}/orders/${id}`,
    get: (id: string) => `${API_BASE_URL}/orders/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/orders/${id}/status`,
    cancel: (id: string) => `${API_BASE_URL}/orders/${id}/cancel`,
    delete: (id: string) => `${API_BASE_URL}/orders/${id}`,
  },
  reviews: {
    create: `${API_BASE_URL}/reviews`,
    getProductReviews: (productId: string) => `${API_BASE_URL}/reviews/product/${productId}`,
    getProductStats: (productId: string) => `${API_BASE_URL}/reviews/product/${productId}/stats`,
    update: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
    delete: (reviewId: string) => `${API_BASE_URL}/reviews/${reviewId}`,
    getUserReviews: `${API_BASE_URL}/reviews/user/me`,
  },
  upload: {
    image: `${API_BASE_URL}/upload/image`,
    images: (productId: string) => `${API_BASE_URL}/upload/images/${productId}`,
  },
  admin: {
    users: `${API_BASE_URL}/admin/users`,
    products: `${API_BASE_URL}/admin/products`,
    createProduct: `${API_BASE_URL}/admin/products`,
    updateProduct: (id: string) => `${API_BASE_URL}/admin/products/${id}`,
    deleteProduct: (id: string) => `${API_BASE_URL}/admin/products/${id}`,
    stats: `${API_BASE_URL}/admin/stats`,
    resetRevenue: `${API_BASE_URL}/admin/stats/reset-revenue`,
    recentOrders: `${API_BASE_URL}/admin/orders/recent`,
    archivedOrders: `${API_BASE_URL}/admin/orders/archived`,
    topProducts: `${API_BASE_URL}/admin/products/top`,
    payments: `${API_BASE_URL}/admin/payments`,
    membershipRequests: (status?: string) => `${API_BASE_URL}/admin/memberships${status ? `?status=${status}` : ''}`,
    approveMembershipRequest: (id: string) => `${API_BASE_URL}/admin/memberships/requests/${id}/approve`,
    denyMembershipRequest: (id: string) => `${API_BASE_URL}/admin/memberships/requests/${id}/deny`,
    createTestRequest: `${API_BASE_URL}/admin/memberships/requests/test`,
  },
  beautyTips: {
    list: `${API_BASE_URL}/beauty-tips`,
    detail: (id: string) => `${API_BASE_URL}/beauty-tips/${id}`,
    create: `${API_BASE_URL}/beauty-tips`,
    update: (id: string) => `${API_BASE_URL}/beauty-tips/${id}`,
    delete: (id: string) => `${API_BASE_URL}/beauty-tips/${id}`,
    togglePublish: (id: string) => `${API_BASE_URL}/beauty-tips/${id}/toggle-publish`,
    categories: `${API_BASE_URL}/beauty-tips/categories/list`,
    stats: `${API_BASE_URL}/beauty-tips/stats/overview`,
  },
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }
  
  // Only add Content-Type header if it's not a FormData request
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      throw error;
    }
    console.error('API request failed:', error);
    throw new Error('Failed to make API request');
  }
};

export default API_BASE_URL; 