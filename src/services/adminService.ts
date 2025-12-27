import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';

// Admin auth endpoints
export const ADMIN_ENDPOINTS = {
  login: `${API_BASE_URL}/admin/login`,
  logout: `${API_BASE_URL}/admin/logout`,
  session: `${API_BASE_URL}/admin/session`,
  
  // Products management
  products: `${API_BASE_URL}/admin/products`,
  productById: (id: string) => `${API_BASE_URL}/admin/products/${id}`,
  uploadImage: `${API_BASE_URL}/admin/upload`,
  
  // Quotes management
  quotes: `${API_BASE_URL}/admin/quotes`,
  quoteById: (id: string) => `${API_BASE_URL}/admin/quotes/${id}`,
  
  // Bookings management
  bookings: `${API_BASE_URL}/admin/bookings`,
  bookingById: (id: string) => `${API_BASE_URL}/admin/bookings/${id}`,
  
  // Contacts management
  contacts: `${API_BASE_URL}/admin/contacts`,
  contactById: (id: string) => `${API_BASE_URL}/admin/contacts/${id}`,
  
  // Services management
  services: `${API_BASE_URL}/admin/services`,
  serviceById: (id: string) => `${API_BASE_URL}/admin/services/${id}`,
  
  // Dashboard stats
  dashboard: `${API_BASE_URL}/admin/dashboard`,
};

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager';
}

export interface DashboardStats {
  totalProducts: number;
  pendingQuotes: number;
  pendingBookings: number;
  unreadContacts: number;
  recentQuotes: QuoteRecord[];
  recentBookings: BookingRecord[];
}

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  price: number | null;
  description: string;
  image: string;
  isQuoteOnly: boolean;
  tags: string[];
  createdAt: string;
}

export interface QuoteRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  requestType: 'product' | 'service' | 'both';
  products: string[];
  services: string[];
  message: string;
  status: 'pending' | 'contacted' | 'quoted' | 'closed';
  createdAt: string;
}

export interface BookingRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceLocation: string;
  address: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ContactRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Get auth token from session storage
function getAuthToken(): string | null {
  return sessionStorage.getItem('admin_token');
}

// Generic fetch wrapper with auth
async function adminRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (response.status === 401) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
      return { success: false, error: 'Session expired' };
    }

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
    console.error('Admin API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API
export const adminAuthApi = {
  login: async (username: string, password: string) => {
    const result = await adminRequest<{ token: string; user: AdminUser }>(
      ADMIN_ENDPOINTS.login,
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
    
    if (result.success && result.data) {
      sessionStorage.setItem('admin_token', result.data.token);
      sessionStorage.setItem('admin_user', JSON.stringify(result.data.user));
    }
    
    return result;
  },
  
  logout: async () => {
    await adminRequest(ADMIN_ENDPOINTS.logout, { method: 'POST' });
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
  },
  
  getSession: (): AdminUser | null => {
    const user = sessionStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

// Dashboard API
export const adminDashboardApi = {
  getStats: () => adminRequest<DashboardStats>(ADMIN_ENDPOINTS.dashboard),
};

// Products API
export const adminProductsApi = {
  getAll: () => adminRequest<ProductRecord[]>(ADMIN_ENDPOINTS.products),
  getById: (id: string) => adminRequest<ProductRecord>(ADMIN_ENDPOINTS.productById(id)),
  create: (data: Partial<ProductRecord>) =>
    adminRequest<ProductRecord>(ADMIN_ENDPOINTS.products, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ProductRecord>) =>
    adminRequest<ProductRecord>(ADMIN_ENDPOINTS.productById(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminRequest<void>(ADMIN_ENDPOINTS.productById(id), { method: 'DELETE' }),
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const response = await fetch(ADMIN_ENDPOINTS.uploadImage, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    if (!response.ok) {
      return { success: false, error: 'Upload failed' };
    }
    
    const data = await response.json();
    return { success: true, data };
  },
};

// Quotes API
export const adminQuotesApi = {
  getAll: () => adminRequest<QuoteRecord[]>(ADMIN_ENDPOINTS.quotes),
  getById: (id: string) => adminRequest<QuoteRecord>(ADMIN_ENDPOINTS.quoteById(id)),
  updateStatus: (id: string, status: QuoteRecord['status']) =>
    adminRequest<QuoteRecord>(ADMIN_ENDPOINTS.quoteById(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    adminRequest<void>(ADMIN_ENDPOINTS.quoteById(id), { method: 'DELETE' }),
};

// Bookings API
export const adminBookingsApi = {
  getAll: () => adminRequest<BookingRecord[]>(ADMIN_ENDPOINTS.bookings),
  getById: (id: string) => adminRequest<BookingRecord>(ADMIN_ENDPOINTS.bookingById(id)),
  updateStatus: (id: string, status: BookingRecord['status']) =>
    adminRequest<BookingRecord>(ADMIN_ENDPOINTS.bookingById(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    adminRequest<void>(ADMIN_ENDPOINTS.bookingById(id), { method: 'DELETE' }),
};

// Contacts API
export const adminContactsApi = {
  getAll: () => adminRequest<ContactRecord[]>(ADMIN_ENDPOINTS.contacts),
  getById: (id: string) => adminRequest<ContactRecord>(ADMIN_ENDPOINTS.contactById(id)),
  updateStatus: (id: string, status: ContactRecord['status']) =>
    adminRequest<ContactRecord>(ADMIN_ENDPOINTS.contactById(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    adminRequest<void>(ADMIN_ENDPOINTS.contactById(id), { method: 'DELETE' }),
};

// Services API
export const adminServicesApi = {
  getAll: () => adminRequest<any[]>(ADMIN_ENDPOINTS.services),
  create: (data: any) =>
    adminRequest<any>(ADMIN_ENDPOINTS.services, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    adminRequest<any>(ADMIN_ENDPOINTS.serviceById(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminRequest<void>(ADMIN_ENDPOINTS.serviceById(id), { method: 'DELETE' }),
};
