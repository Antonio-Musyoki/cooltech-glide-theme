import { supabase } from '@/integrations/supabase/client';

// Generic response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  in_stock: boolean | null;
  featured: boolean | null;
  specifications: any;
  created_at: string;
  updated_at: string;
}

// Quote types
export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_type?: string;
  message?: string;
}

export interface QuoteRecord extends QuoteRequest {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Booking types
export interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  service_type?: string;
  preferred_date?: string;
  preferred_time?: string;
  address?: string;
  message?: string;
}

export interface BookingRecord extends BookingRequest {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Contact types
export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactRecord extends ContactRequest {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Dashboard stats
export interface DashboardStats {
  totalProducts: number;
  pendingQuotes: number;
  pendingBookings: number;
  unreadContacts: number;
  recentQuotes: QuoteRecord[];
  recentBookings: BookingRecord[];
}

// Products API
export const productsApi = {
  getAll: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: false, error: 'Product not found' };
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return { success: false, error: error.message };
    }
  },

  create: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product as any)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  uploadImage: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return { success: true, data: { url: publicUrl } };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  },
};

// Quotes API
export const quotesApi = {
  submit: async (quote: QuoteRequest): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert(quote)
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, data: { id: data.id } };
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      return { success: false, error: error.message };
    }
  },

  getAll: async (): Promise<ApiResponse<QuoteRecord[]>> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      return { success: false, error: error.message };
    }
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<QuoteRecord>> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating quote:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      return { success: false, error: error.message };
    }
  },
};

// Bookings API
export const bookingsApi = {
  submit: async (booking: BookingRequest): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, data: { id: data.id } };
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      return { success: false, error: error.message };
    }
  },

  getAll: async (): Promise<ApiResponse<BookingRecord[]>> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: error.message };
    }
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<BookingRecord>> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating booking:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      return { success: false, error: error.message };
    }
  },
};

// Contacts API
export const contactsApi = {
  submit: async (contact: ContactRequest): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, data: { id: data.id } };
    } catch (error: any) {
      console.error('Error submitting contact:', error);
      return { success: false, error: error.message };
    }
  },

  getAll: async (): Promise<ApiResponse<ContactRecord[]>> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      return { success: false, error: error.message };
    }
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<ContactRecord>> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating contact:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      return { success: false, error: error.message };
    }
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      // Fetch all counts in parallel
      const [productsRes, quotesRes, bookingsRes, contactsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
      ]);

      const quotes = quotesRes.data || [];
      const bookings = bookingsRes.data || [];

      return {
        success: true,
        data: {
          totalProducts: productsRes.count || 0,
          pendingQuotes: quotes.filter(q => q.status === 'pending').length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          unreadContacts: contactsRes.count || 0,
          recentQuotes: quotes.slice(0, 5) as QuoteRecord[],
          recentBookings: bookings.slice(0, 5) as BookingRecord[],
        },
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message };
    }
  },
};
