import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'https://api.buyupvotes.io';

async function getApiKeyFromSettings(): Promise<string> {
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_BUYUPVOTES_API_KEY || '6ca5f0ce27d54d5a84d6cb91bb55d0f2';
  if (!apiKey) {
    throw new Error('API key not configured. Please check your environment variables.');
  }
  return apiKey;
}

export interface UpvoteOrderRequest {
  link: string;
  quantity: number;
  service: 1 | 2 | 3 | 4; // 1: Post upvotes, 2: Post downvotes, 3: Comment upvotes, 4: Comment downvotes
  speed: number;
}

export interface CommentOrderRequest {
  link: string;
  content: string;
}

export interface OrderStatusRequest {
  order_number: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface OrderStatus {
  order_number: string;
  service: string;
  status: string;
  vote_quantity: number;
  votes_delivered: number;
}

export const SERVICE_OPTIONS = [
  { value: 1, label: 'Post Upvotes' },
  { value: 2, label: 'Post Downvotes' },
  { value: 3, label: 'Comment Upvotes' },
  { value: 4, label: 'Comment Downvotes' },
];

export const SPEED_OPTIONS = [
  { value: 0.1656, label: 'Standard (24-48 hours)' },
  { value: 0.3312, label: 'Express (12-24 hours)' },
  { value: 0.6624, label: 'Rush (6-12 hours)' },
];

export const api = {
  async submitUpvoteOrder(data: UpvoteOrderRequest): Promise<ApiResponse<{ order_number: string }>> {
    try {
      const { data: result, error } = await supabase.rpc('place_upvote_order', {
        order_link: data.link,
        order_quantity: data.quantity,
        order_service: data.service,
        order_speed: data.speed,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!result || result[0]?.error_message) {
        throw new Error(result[0]?.error_message || 'Failed to submit order');
      }

      return {
        success: true,
        data: { order_number: result[0].order_id.toString() }
      };
    } catch (error: any) {
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to submit order');
    }
  },

  async getUpvoteOrderStatus(data: OrderStatusRequest): Promise<ApiResponse<OrderStatus>> {
    try {
      const API_KEY = await getApiKeyFromSettings();
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      };
      console.log('Getting order status from:', `${API_BASE_URL}/upvote_order/status/`);
      console.log('Order data:', data);

      const response = await fetch(`${API_BASE_URL}/upvote_order/status/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to get order status');
      }

      return responseData;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to the API server. Please check your internet connection.');
      }
      throw new Error(error.message || 'Failed to get order status');
    }
  },

  async cancelUpvoteOrder(data: OrderStatusRequest): Promise<ApiResponse<void>> {
    try {
      const API_KEY = await getApiKeyFromSettings();
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      };
      console.log('Canceling order at:', `${API_BASE_URL}/upvote_order/cancel/`);
      console.log('Order data:', data);

      const response = await fetch(`${API_BASE_URL}/upvote_order/cancel/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to cancel order');
      }

      return responseData;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to the API server. Please check your internet connection.');
      }
      throw new Error(error.message || 'Failed to cancel order');
    }
  },

  async submitCommentOrder(data: CommentOrderRequest): Promise<ApiResponse<{ order_number: string }>> {
    try {
      const API_KEY = await getApiKeyFromSettings();
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      };
      console.log('Submitting comment order to:', `${API_BASE_URL}/comment_order/submit/`);
      console.log('Order data:', data);

      const response = await fetch(`${API_BASE_URL}/comment_order/submit/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit comment order');
      }

      return responseData;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to the API server. Please check your internet connection.');
      }
      throw new Error(error.message || 'Failed to submit comment order');
    }
  },

  async getCommentOrderStatus(data: OrderStatusRequest): Promise<ApiResponse<{ status: string }>> {
    try {
      const API_KEY = await getApiKeyFromSettings();
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      };
      console.log('Getting comment order status from:', `${API_BASE_URL}/comment_order/status/`);
      console.log('Order data:', data);

      const response = await fetch(`${API_BASE_URL}/comment_order/status/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to get comment order status');
      }

      return responseData;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to the API server. Please check your internet connection.');
      }
      throw new Error(error.message || 'Failed to get comment order status');
    }
  },

  // Test function to verify API integration
  async testApiConnection() {
    try {
      const testData = {
        link: 'https://www.reddit.com/r/test/comments/test123',
        quantity: 5,
        service: 1 as const,
        speed: 180,
      };

      console.log('Testing API connection...');
      console.log('Sending test data:', testData);

      const response = await this.submitUpvoteOrder(testData);
      console.log('API Response:', response);

      return {
        success: true,
        response,
      };
    } catch (error: any) {
      console.error('API Test Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
