import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Product, Service } from '@/data/products';

// Collection names
const COLLECTIONS = {
  products: 'products',
  services: 'services',
  quotes: 'quotes',
  bookings: 'bookings',
  contacts: 'contacts',
};

// Generic response type
interface FirebaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: Timestamp | null): string => {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate().toISOString();
};

// ==================== PRODUCTS ====================
export const productsFirebase = {
  getAll: async (): Promise<FirebaseResponse<Product[]>> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.products));
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      return { success: true, data: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: 'Failed to fetch products' };
    }
  },

  getById: async (id: string): Promise<FirebaseResponse<Product>> => {
    try {
      const docRef = doc(db, COLLECTIONS.products, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { success: false, error: 'Product not found' };
      }
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Product };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, error: 'Failed to fetch product' };
    }
  },

  create: async (product: Omit<Product, 'id'>): Promise<FirebaseResponse<Product>> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.products), {
        ...product,
        createdAt: serverTimestamp(),
      });
      return { success: true, data: { id: docRef.id, ...product } as Product };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: 'Failed to create product' };
    }
  },

  update: async (id: string, data: Partial<Product>): Promise<FirebaseResponse<Product>> => {
    try {
      const docRef = doc(db, COLLECTIONS.products, id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
      return { success: true, data: { id, ...data } as Product };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: 'Failed to update product' };
    }
  },

  delete: async (id: string): Promise<FirebaseResponse<void>> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.products, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: 'Failed to delete product' };
    }
  },

  uploadImage: async (file: File): Promise<FirebaseResponse<{ url: string }>> => {
    try {
      const timestamp = Date.now();
      const fileName = `products/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { success: true, data: { url } };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: 'Failed to upload image' };
    }
  },
};

// ==================== SERVICES ====================
export const servicesFirebase = {
  getAll: async (): Promise<FirebaseResponse<Service[]>> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.services));
      const services = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      return { success: true, data: services };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { success: false, error: 'Failed to fetch services' };
    }
  },

  getById: async (id: string): Promise<FirebaseResponse<Service>> => {
    try {
      const docRef = doc(db, COLLECTIONS.services, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { success: false, error: 'Service not found' };
      }
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Service };
    } catch (error) {
      console.error('Error fetching service:', error);
      return { success: false, error: 'Failed to fetch service' };
    }
  },
};

// ==================== QUOTES ====================
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

export interface QuoteRecord extends QuoteRequest {
  id: string;
  status: 'pending' | 'contacted' | 'quoted' | 'closed';
  createdAt: string;
}

export const quotesFirebase = {
  submit: async (data: QuoteRequest): Promise<FirebaseResponse<{ id: string }>> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.quotes), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return { success: true, data: { id: docRef.id } };
    } catch (error) {
      console.error('Error submitting quote:', error);
      return { success: false, error: 'Failed to submit quote request' };
    }
  },

  getAll: async (): Promise<FirebaseResponse<QuoteRecord[]>> => {
    try {
      const q = query(collection(db, COLLECTIONS.quotes), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const quotes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
        };
      }) as QuoteRecord[];
      return { success: true, data: quotes };
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return { success: false, error: 'Failed to fetch quotes' };
    }
  },

  updateStatus: async (id: string, status: QuoteRecord['status']): Promise<FirebaseResponse<void>> => {
    try {
      const docRef = doc(db, COLLECTIONS.quotes, id);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error('Error updating quote status:', error);
      return { success: false, error: 'Failed to update status' };
    }
  },

  delete: async (id: string): Promise<FirebaseResponse<void>> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.quotes, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting quote:', error);
      return { success: false, error: 'Failed to delete quote' };
    }
  },
};

// ==================== BOOKINGS ====================
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

export interface BookingRecord extends BookingRequest {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export const bookingsFirebase = {
  submit: async (data: BookingRequest): Promise<FirebaseResponse<{ id: string }>> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.bookings), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return { success: true, data: { id: docRef.id } };
    } catch (error) {
      console.error('Error submitting booking:', error);
      return { success: false, error: 'Failed to submit booking' };
    }
  },

  getAll: async (): Promise<FirebaseResponse<BookingRecord[]>> => {
    try {
      const q = query(collection(db, COLLECTIONS.bookings), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
        };
      }) as BookingRecord[];
      return { success: true, data: bookings };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: 'Failed to fetch bookings' };
    }
  },

  updateStatus: async (id: string, status: BookingRecord['status']): Promise<FirebaseResponse<void>> => {
    try {
      const docRef = doc(db, COLLECTIONS.bookings, id);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error: 'Failed to update status' };
    }
  },

  delete: async (id: string): Promise<FirebaseResponse<void>> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.bookings, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting booking:', error);
      return { success: false, error: 'Failed to delete booking' };
    }
  },
};

// ==================== CONTACTS ====================
export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactRecord extends ContactRequest {
  id: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export const contactsFirebase = {
  submit: async (data: ContactRequest): Promise<FirebaseResponse<{ id: string }>> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.contacts), {
        ...data,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      return { success: true, data: { id: docRef.id } };
    } catch (error) {
      console.error('Error submitting contact:', error);
      return { success: false, error: 'Failed to submit message' };
    }
  },

  getAll: async (): Promise<FirebaseResponse<ContactRecord[]>> => {
    try {
      const q = query(collection(db, COLLECTIONS.contacts), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const contacts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
        };
      }) as ContactRecord[];
      return { success: true, data: contacts };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return { success: false, error: 'Failed to fetch contacts' };
    }
  },

  updateStatus: async (id: string, status: ContactRecord['status']): Promise<FirebaseResponse<void>> => {
    try {
      const docRef = doc(db, COLLECTIONS.contacts, id);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error('Error updating contact status:', error);
      return { success: false, error: 'Failed to update status' };
    }
  },

  delete: async (id: string): Promise<FirebaseResponse<void>> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.contacts, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: 'Failed to delete contact' };
    }
  },
};

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  totalProducts: number;
  pendingQuotes: number;
  pendingBookings: number;
  unreadContacts: number;
  recentQuotes: QuoteRecord[];
  recentBookings: BookingRecord[];
}

export const dashboardFirebase = {
  getStats: async (): Promise<FirebaseResponse<DashboardStats>> => {
    try {
      // Get all data
      const [productsRes, quotesRes, bookingsRes, contactsRes] = await Promise.all([
        productsFirebase.getAll(),
        quotesFirebase.getAll(),
        bookingsFirebase.getAll(),
        contactsFirebase.getAll(),
      ]);

      const products = productsRes.data || [];
      const quotes = quotesRes.data || [];
      const bookings = bookingsRes.data || [];
      const contacts = contactsRes.data || [];

      const stats: DashboardStats = {
        totalProducts: products.length,
        pendingQuotes: quotes.filter(q => q.status === 'pending').length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        unreadContacts: contacts.filter(c => c.status === 'unread').length,
        recentQuotes: quotes.slice(0, 5),
        recentBookings: bookings.slice(0, 5),
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: 'Failed to fetch dashboard stats' };
    }
  },
};
