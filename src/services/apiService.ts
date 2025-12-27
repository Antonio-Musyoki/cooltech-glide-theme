import { API_ENDPOINTS } from '@/config/api';
import { Product, Service } from '@/data/products';

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Quote request payload
export interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  requestType: 'product' | 'service' | 'both';
  products?: string[];
  services?: string[];
  message: string;
}

// Booking request payload
export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  serviceLocation: 'residential' | 'commercial' | 'industrial';
  address: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
}

// Contact form payload
export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Products API
export const productsApi = {
  getAll: () => apiRequest<Product[]>(API_ENDPOINTS.products),
  getById: (id: string) => apiRequest<Product>(API_ENDPOINTS.productById(id)),
};

// Services API
export const servicesApi = {
  getAll: () => apiRequest<Service[]>(API_ENDPOINTS.services),
  getById: (id: string) => apiRequest<Service>(API_ENDPOINTS.serviceById(id)),
};

// Quotes API
export const quotesApi = {
  submit: (data: QuoteRequest) =>
    apiRequest<{ id: string }>(API_ENDPOINTS.quotes, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Bookings API
export const bookingsApi = {
  submit: (data: BookingRequest) =>
    apiRequest<{ id: string }>(API_ENDPOINTS.bookings, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Contact API
export const contactApi = {
  submit: (data: ContactRequest) =>
    apiRequest<{ id: string }>(API_ENDPOINTS.contact, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
