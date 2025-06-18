const axios = require('axios');

const handler = async (event, context) => {
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed. Only POST requests are supported.' 
      }),
    };
  }

  try {
    console.log('💬 Comment Status Check Function Called');
    console.log('Request body:', event.body);

    const requestData = JSON.parse(event.body);
    console.log('Parsed request data:', requestData);

    if (!requestData.order_number) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Missing order_number parameter'
        }),
      };
    }

    // Get API key from environment variables
    const API_KEY = process.env.BUYUPVOTES_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ Missing BUYUPVOTES_API_KEY environment variable');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Server configuration error: API key not found'
        }),
      };
    }

    console.log('🔑 Using API key (first 8 chars):', API_KEY.substring(0, 8) + '...');

    // Make request to BuyUpvotes.io comment status API
    const apiUrl = 'https://buyupvotes.io/api/comment_order/status/';
    console.log('🌐 Making request to:', apiUrl);
    console.log('📋 Request payload:', requestData);

    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ API Response Status:', response.status);
    console.log('📡 API Response Data:', response.data);

    // Return the API response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: response.data
      }),
    };

  } catch (error) {
    console.error('❌ Error in comment status check:', error);

    let errorMessage = 'Failed to check comment order status';
    let statusCode = 500;

    if (error.response) {
      // API returned an error response
      console.error('API Error Response:', error.response.status, error.response.data);
      errorMessage = error.response.data?.message || `API Error: ${error.response.status}`;
      statusCode = error.response.status;
    } else if (error.request) {
      // No response received
      console.error('No response received:', error.request);
      errorMessage = 'No response from API server';
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('Request timeout');
      errorMessage = 'Request timeout - API server took too long to respond';
    } else {
      // Other error
      console.error('Request setup error:', error.message);
      errorMessage = `Request error: ${error.message}`;
    }

    return {
      statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: errorMessage,
        error: error.message
      }),
    };
  }
};

module.exports = { handler }; 