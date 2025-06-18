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
            // First, update with external_order_id
            await supabase
              .from('upvote_orders')
              .update({ 
                external_order_id: apiResponseData.data.order_number,
                status: 'submitted_to_api'
              })
              .eq('id', parseInt(localOrderId));

            // Immediately check status to get current state
            try {
              const statusResult = await this.getUpvoteOrderStatus({ 
                order_number: apiResponseData.data.order_number 
              });
              
              if (statusResult.success && statusResult.data) {
                // Update with actual status and votes delivered
                await supabase
                  .from('upvote_orders')
                  .update({
                    status: statusResult.data.status,
                    votes_delivered: statusResult.data.votes_delivered || 0,
                    last_status_check: new Date().toISOString()
                  })
                  .eq('id', parseInt(localOrderId));
              }
            } catch (statusError) {
              console.warn('Failed to get initial status, but order was submitted successfully:', statusError);
              // Don't fail the entire submission if status check fails
            }
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
          
          // Call the automatic refund function (non-admin)
          const { data: refundResult, error: refundError } = await supabase
            .rpc('auto_refund_failed_order', { target_order_id: parseInt(localOrderId) });
          
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
      console.log('Getting order status via Netlify function for order:', data.order_number);

      // Use Netlify function to avoid CORS issues
      const functionUrl = '/.netlify/functions/check-order-status';
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
        throw new Error(responseData.message || 'Failed to get order status via serverless function');
      }

      return {
        success: true,
        data: responseData.data
      };
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Netlify function not available (likely local development). Status checking requires deployment.');
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

  async updateOrderStatus(orderId: number): Promise<{ updated: boolean; status?: string; votes_delivered?: number; message?: string }> {
    try {
      console.log(`🔄 Updating status for order ${orderId}...`);
      
      // First get the order details from our database
      const { data: order, error: orderError } = await supabase
        .from('upvote_orders')
        .select('id, external_order_id, status, last_status_check, votes_delivered')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('❌ Failed to fetch order:', orderError);
        return { updated: false, message: `Failed to fetch order data` };
      }

      console.log(`📋 Order ${orderId} current status: "${order.status}", external_order_id: "${order.external_order_id}"`);

      // Only update orders that have external_order_id - NO AUTO-RESUBMISSION
      if (!order.external_order_id) {
        console.log(`⏳ Order ${orderId} has no external_order_id - skipping status update`);
        return { updated: false, message: `Order has no tracking ID yet` };
      }

      // Minimal rate limiting: only prevent spam (30 seconds)
      if (order.last_status_check) {
        const lastCheck = new Date(order.last_status_check);
        const now = new Date();
        const secondsSinceLastCheck = (now.getTime() - lastCheck.getTime()) / 1000;
        
        if (secondsSinceLastCheck < 30) {
          console.log(`⏰ Rate limited: Only ${secondsSinceLastCheck.toFixed(1)} seconds since last check`);
          return { updated: false, message: `Status checked ${secondsSinceLastCheck.toFixed(0)}s ago` };
        }
      }

      console.log(`🌐 Checking API status for order ${orderId} with external ID: ${order.external_order_id}`);

      // Check status from BuyUpvotes.io API
      const statusResult = await this.getUpvoteOrderStatus({ order_number: order.external_order_id });
      
      console.log(`📡 API Response:`, statusResult);
      
      if (statusResult.success && statusResult.data) {
        const apiStatus = statusResult.data;
        console.log(`📊 API returned status: "${apiStatus.status}", votes: ${apiStatus.votes_delivered}/${apiStatus.vote_quantity}`);
        
        // Update our database with the latest status
        const { error: updateError } = await supabase
          .from('upvote_orders')
          .update({
            status: apiStatus.status,
            votes_delivered: apiStatus.votes_delivered || 0,
            last_status_check: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('❌ Failed to update order status in database:', updateError);
          return { updated: false, message: `Database update failed: ${updateError.message}` };
        }

        console.log(`✅ Order ${orderId} updated successfully: ${order.status} → ${apiStatus.status}`);
        return {
          updated: true,
          status: apiStatus.status,
          votes_delivered: apiStatus.votes_delivered || 0,
          message: `Status updated to ${apiStatus.status}`
        };
      } else {
        console.log(`❌ API call failed or returned no data:`, statusResult);
        return { updated: false, message: `API error: ${statusResult.message || 'No data returned'}` };
      }

    } catch (error: any) {
      console.error('❌ Failed to update order status:', error);
      
      // Update last_status_check even if failed to prevent too frequent retries
      await supabase
        .from('upvote_orders')
        .update({ last_status_check: new Date().toISOString() })
        .eq('id', orderId);
      
      return { updated: false, message: `Error: ${error.message}` };
    }
  },

  // Bulk status update for multiple orders
  async updateMultipleOrderStatuses(orderIds: number[]): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    // Process orders in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < orderIds.length; i += batchSize) {
      const batch = orderIds.slice(i, i + batchSize);
      
      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(orderId => this.updateOrderStatus(orderId))
      );

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.updated) {
          updated++;
        } else {
          failed++;
        }
      });

      // Small delay between batches to be respectful to the API
      if (i + batchSize < orderIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { updated, failed };
  },

  // Test function to manually check a specific order status
  async testOrderStatus(externalOrderId: string): Promise<any> {
    try {
      console.log('Testing status check for external order ID:', externalOrderId);
      
      const result = await this.getUpvoteOrderStatus({ order_number: externalOrderId });
      console.log('Status check result:', result);
      
      return result;
    } catch (error) {
      console.error('Status check test failed:', error);
      throw error;
    }
  },

  // Comment order functions
  async submitCommentOrderBulk(orders: { link: string; content: string }[]): Promise<{ 
    successful: number; 
    failed: number; 
    results: Array<{ success: boolean; orderId?: number; error?: string }> 
  }> {
    const results: Array<{ success: boolean; orderId?: number; error?: string }> = [];
    let successful = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        // Use the existing database function
        const { data, error } = await supabase.rpc('place_comment_order', {
          order_link: order.link,
          order_content: order.content
        });

        if (error) {
          results.push({ success: false, error: error.message });
          failed++;
        } else if (data && data.length > 0) {
          const result = data[0];
          if (result.error_message) {
            results.push({ success: false, error: result.error_message });
            failed++;
          } else {
            // Submit to external API
            try {
              const apiResponse = await this.submitCommentOrder({ 
                link: order.link, 
                content: order.content 
              });

              if (apiResponse.success && apiResponse.data?.order_number) {
                // Update the local order with external ID
                await supabase
                  .from('comment_orders')
                  .update({ 
                    external_order_id: apiResponse.data.order_number,
                    status: 'submitted_to_api'
                  })
                  .eq('id', result.order_id);

                results.push({ success: true, orderId: result.order_id });
                successful++;
              } else {
                results.push({ success: false, error: 'External API submission failed' });
                failed++;
              }
            } catch (apiError: any) {
              console.error('External API error:', apiError);
              results.push({ success: false, error: apiError.message });
              failed++;
            }
          }
        }
      } catch (error: any) {
        results.push({ success: false, error: error.message });
        failed++;
      }
    }

    return { successful, failed, results };
  },

  async updateCommentOrderStatus(orderId: number): Promise<{ updated: boolean; status?: string; message?: string }> {
    try {
      console.log(`🔄 Updating comment order status for order ${orderId}...`);
      
      // First get the order details from our database
      const { data: order, error: orderError } = await supabase
        .from('comment_orders')
        .select('id, external_order_id, status, last_status_check')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('❌ Failed to fetch comment order:', orderError);
        return { updated: false, message: `Failed to fetch order data` };
      }

      console.log(`📋 Comment order ${orderId} current status: "${order.status}", external_order_id: "${order.external_order_id}"`);

      // Only update orders that have external_order_id
      if (!order.external_order_id) {
        console.log(`⏳ Comment order ${orderId} has no external_order_id - skipping status update`);
        return { updated: false, message: `Order has no tracking ID yet` };
      }

      // Minimal rate limiting: only prevent spam (30 seconds)
      if (order.last_status_check) {
        const lastCheck = new Date(order.last_status_check);
        const now = new Date();
        const secondsSinceLastCheck = (now.getTime() - lastCheck.getTime()) / 1000;
        
        if (secondsSinceLastCheck < 30) {
          console.log(`⏰ Rate limited: Only ${secondsSinceLastCheck.toFixed(1)} seconds since last check`);
          return { updated: false, message: `Status checked ${secondsSinceLastCheck.toFixed(0)}s ago` };
        }
      }

      console.log(`🌐 Checking API status for comment order ${orderId} with external ID: ${order.external_order_id}`);

      // Check status from BuyUpvotes.io API
      const statusResult = await this.getCommentOrderStatus({ order_number: order.external_order_id });
      
      console.log(`📡 API Response:`, statusResult);
      
      if (statusResult.success && statusResult.data) {
        const apiStatus = statusResult.data;
        console.log(`📊 API returned status: "${apiStatus.status}"`);
        
        // Update our database with the latest status
        const { error: updateError } = await supabase
          .from('comment_orders')
          .update({
            status: apiStatus.status,
            last_status_check: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('❌ Failed to update comment order status in database:', updateError);
          return { updated: false, message: `Database update failed: ${updateError.message}` };
        }

        console.log(`✅ Comment order ${orderId} updated successfully: ${order.status} → ${apiStatus.status}`);
        return {
          updated: true,
          status: apiStatus.status,
          message: `Status updated to ${apiStatus.status}`
        };
      } else {
        console.log(`❌ API call failed or returned no data:`, statusResult);
        return { updated: false, message: `API error: ${statusResult.message || 'No data returned'}` };
      }

    } catch (error: any) {
      console.error('❌ Failed to update comment order status:', error);
      
      // Update last_status_check even if failed to prevent too frequent retries
      await supabase
        .from('comment_orders')
        .update({ last_status_check: new Date().toISOString() })
        .eq('id', orderId);
      
      return { updated: false, message: `Error: ${error.message}` };
    }
  },
};
