import axios from 'axios';

const getApiKey = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ CRITICAL: OPENROUTER_API_KEY not defined!');
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }
  
  return apiKey;
};

// Optimized axios client with better performance settings
const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://finbot-g7un.onrender.com' || 'http://localhost:5000',
    'X-Title': 'FinBot Personal Finance Assistant'
  },
  timeout: 90000, // 90 seconds for complete response
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  // Add connection pooling for faster requests
  httpAgent: null,
  httpsAgent: null
});

// Minimal request interceptor - less overhead
openRouterClient.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${getApiKey()}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Minimal response interceptor
openRouterClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    return Promise.reject(error);
  }
);

export default openRouterClient;