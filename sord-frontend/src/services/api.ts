/**
 * API Service
 * Comunicação centralizada com backend
 */

import { API_URL } from '../config/env';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = false,
  } = options;

  const token = localStorage.getItem('token');
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth && token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Erro ${response.status}`);
  }

  return data;
}

// AUTH
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    planName?: string;
  }) => apiCall('/auth/register', {
    method: 'POST',
    body: userData,
  }),

  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  getProfile: () =>
    apiCall('/auth/profile', {
      method: 'GET',
      requiresAuth: true,
    }),
};

// PLANS
export const plansAPI = {
  getAll: () => apiCall('/plans', { method: 'GET' }),

  getById: (planId: string) =>
    apiCall(`/plans/${planId}`, { method: 'GET' }),

  getByName: (planName: string) =>
    apiCall(`/plans/name/${planName}`, { method: 'GET' }),
};

// PAYMENTS
export const paymentsAPI = {
  create: (paymentData: {
    orderId: string;
    amount: number;
    token: string;
    paymentMethodId: string;
    installments: number;
    email: string;
    description: string;
    metadata?: any;
  }) =>
    apiCall('/payments', {
      method: 'POST',
      body: paymentData,
      requiresAuth: true,
    }),

  getStatus: (paymentId: string) =>
    apiCall(`/payments/${paymentId}`, {
      method: 'GET',
      requiresAuth: true,
    }),

  list: (filters?: { status?: string; limit?: number; offset?: number }) =>
    apiCall('/payments', {
      method: 'GET',
      requiresAuth: true,
      ...(filters && { body: filters }),
    }),
};

// CLIENTS
export const clientsAPI = {
  getAll: () =>
    apiCall('/clients', {
      method: 'GET',
      requiresAuth: true,
    }),

  create: (clientData: any) =>
    apiCall('/clients', {
      method: 'POST',
      body: clientData,
      requiresAuth: true,
    }),

  update: (clientId: string, clientData: any) =>
    apiCall(`/clients/${clientId}`, {
      method: 'PUT',
      body: clientData,
      requiresAuth: true,
    }),

  delete: (clientId: string) =>
    apiCall(`/clients/${clientId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};
