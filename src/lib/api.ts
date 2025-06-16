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

export interface OrderSubmissionResult {
  order_number: string;
  external_order_number?: string;
  note?: string;
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
  // Slow delivery options (votes per day)
  { value: 0.0414, label: 'Super Slow (1 vote/day)' },
  { value: 0.0828, label: 'Very Slow (2 votes/day)' },
  { value: 0.1242, label: 'Slow (3 votes/day)' },
  { value: 0.1656, label: 'Moderate (4 votes/day)' },
  { value: 0.207, label: 'Medium (5 votes/day)' },
  { value: 0.2484, label: 'Regular (6 votes/day)' },
  
  // Fast delivery options (votes per minute)
  { value: 12, label: 'Steady (1 vote/6 minutes)' },
  { value: 30, label: 'Quick (1 vote/2 minutes)' },
  { value: 60, label: 'Fast (1 vote/minute)' },
  { value: 120, label: 'Very Fast (2 votes/minute)' },
  { value: 180, label: 'Rapid (3 votes/minute)' },
  { value: 240, label: 'Super Fast (4 votes/minute)' },
  { value: 300, label: 'Lightning (5 votes/minute)' },
];

export const api = {
  async submitUpvoteOrder(data: UpvoteOrderRequest): Promise<ApiResponse<OrderSubmissionResult>> {
    try {
      // First, store the order locally and deduct balance
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

      const localOrderId = result[0].order_id.toString();

      // Now submit to BuyUpvotes.io API for actual fulfillment via Netlify function
      try {
        console.log('Submitting upvote order via Netlify function...');
        console.log('Order data:', data);

        // Use Netlify function instead of direct API call to avoid CORS
        const functionUrl = '/.netlify/functions/submit-upvote-order';
        const apiResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        console.log('Netlify function response status:', apiResponse.status);
        const apiResponseData = await apiResponse.json();
        console.log('Netlify function response data:', apiResponseData);

        if (!apiResponse.ok || !apiResponseData.success) {
          throw new Error(apiResponseData.message || 'Failed to submit order via serverless function');
        }

        // Update the local order with the external order number
        if (apiResponseData.data?.order_number) {
          try {
            await supabase
              .from('upvote_orders')
              .update({ 
                external_order_id: apiResponseData.data.order_number,
                status: 'submitted_to_api'
              })
              .eq('id', parseInt(localOrderId));
          } catch (updateError) {
            console.warn('Failed to update local order with external ID:', updateError);
            // Continue anyway - the order was submitted successfully
          }
        }

        return {
          success: true,
          data: { 
            order_number: localOrderId,
            external_order_number: apiResponseData.data?.order_number 
          }
        };

      } catch (apiError: any) {
        console.error('Order submission error:', apiError);
        
        // Check if it's a function not found error (local development)
        if (apiError.name === 'TypeError' && apiError.message === 'Failed to fetch') {
          console.warn('Netlify function not available (likely local development). Order stored locally for admin processing.');
          
          // Mark the local order for manual processing
          try {
            await supabase
              .from('upvote_orders')
              .update({ 
                status: 'pending_api_submission',
                error_message: 'Netlify function not available - requires deployment'
              })
              .eq('id', parseInt(localOrderId));
          } catch (updateError) {
            console.warn('Failed to update order status:', updateError);
          }

          // Return success with a note about manual processing
          return {
            success: true,
            data: { 
              order_number: localOrderId,
              note: 'Order stored locally - deploy to Netlify for automatic processing'
            }
          };
        }
        
        // For other API errors, automatically refund the customer
        try {
          console.log('API submission failed, automatically refunding order...');
          
          // Call the refund function
          const { data: refundResult, error: refundError } = await supabase
            .rpc('refund_order', { target_order_id: parseInt(localOrderId) });
          
          if (refundError) {
            console.error('Refund failed:', refundError);
            // Still mark the order as failed even if refund fails
            await supabase
              .from('upvote_orders')
              .update({ 
                status: 'api_submission_failed',
                error_message: `API submission failed: ${apiError.message}. Refund attempt failed: ${refundError.message}`
              })
              .eq('id', parseInt(localOrderId));
          } else {
            console.log('Refund result:', refundResult);
            // Mark the order as cancelled and refunded
            await supabase
              .from('upvote_orders')
              .update({ 
                status: 'Cancelled',
                error_message: `API submission failed: ${apiError.message}. Customer automatically refunded.`
              })
              .eq('id', parseInt(localOrderId));
          }
        } catch (updateError) {
          console.warn('Failed to process refund or update order status:', updateError);
        }

        throw new Error(`Order failed and customer has been automatically refunded: ${apiError.message}`);
      }

    } catch (error: any) {
      console.error('Order submission error:', error);
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
      console.log('Submitting comment order via Netlify function...');
      console.log('Order data:', data);

      // Use Netlify function instead of direct API call to avoid CORS
      const functionUrl = '/.netlify/functions/submit-comment-order';
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Netlify function response status:', response.status);
      const responseData = await response.json();
      console.log('Netlify function response data:', responseData);

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to submit comment order');
      }

      return {
        success: true,
        data: { order_number: responseData.data?.order_number || 'unknown' }
      };

    } catch (error: any) {
      console.error('Comment order error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Netlify function not available. Please deploy to production or check your network connection.');
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
