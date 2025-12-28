const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

export const registerUser = jest.fn();
export const loginUser = jest.fn();
export const getProfile = jest.fn();
export const getPlans = jest.fn();
export const createPayment = jest.fn();
export const getPayments = jest.fn();
