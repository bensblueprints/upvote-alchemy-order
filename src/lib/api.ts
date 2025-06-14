
const API_BASE_URL = 'https://api.buyupvotes.io';

// Note: In a real application, this should be stored securely
// For this MVP, we'll use a placeholder
const API_KEY = 'your_api_key_here';

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

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

export const api = {
  async submitUpvoteOrder(data: UpvoteOrderRequest) {
    const response = await fetch(`${API_BASE_URL}/upvote_order/submit/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getUpvoteOrderStatus(data: OrderStatusRequest) {
    const response = await fetch(`${API_BASE_URL}/upvote_order/status/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async cancelUpvoteOrder(data: OrderStatusRequest) {
    const response = await fetch(`${API_BASE_URL}/upvote_order/cancel/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async submitCommentOrder(data: CommentOrderRequest) {
    const response = await fetch(`${API_BASE_URL}/comment_order/submit/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getCommentOrderStatus(data: OrderStatusRequest) {
    const response = await fetch(`${API_BASE_URL}/comment_order/status/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const SPEED_OPTIONS = [
  { value: 0.0414, label: '1 vote/day' },
  { value: 0.0828, label: '2 votes/day' },
  { value: 0.1242, label: '3 votes/day' },
  { value: 0.1656, label: '4 votes/day' },
  { value: 0.207, label: '5 votes/day' },
  { value: 0.2484, label: '6 votes/day' },
  { value: 12, label: '1 vote/6 minutes' },
  { value: 30, label: '1 vote/2 minutes' },
  { value: 60, label: '1 vote/minute' },
  { value: 120, label: '2 votes/minute' },
  { value: 180, label: '3 votes/minute' },
  { value: 240, label: '4 votes/minute' },
  { value: 300, label: '5 votes/minute' },
];

export const SERVICE_OPTIONS = [
  { value: 1, label: 'Post upvotes' },
  { value: 2, label: 'Post downvotes' },
  { value: 3, label: 'Comment upvotes' },
  { value: 4, label: 'Comment downvotes' },
];
