// Configure your external API base URL here
// For cPanel PHP backend, update this to your domain
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cooltechrefrigeration.co.ke/api';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Products
  products: `${API_BASE_URL}/admin/products.php`,
  productById: (id: string) => `${API_BASE_URL}/admin/products.php?id=${id}`,
  
  // Services (using products API with category filter)
  services: `${API_BASE_URL}/admin/products.php?category=services`,
  serviceById: (id: string) => `${API_BASE_URL}/admin/products.php?id=${id}`,
  
  // Quotes
  quotes: `${API_BASE_URL}/quotes.php`,
  
  // Bookings
  bookings: `${API_BASE_URL}/bookings.php`,
  
  // Contact
  contact: `${API_BASE_URL}/contact.php`,
  
  // Admin endpoints
  admin: {
    auth: `${API_BASE_URL}/admin/auth.php`,
    dashboard: `${API_BASE_URL}/admin/dashboard.php`,
    products: `${API_BASE_URL}/admin/products.php`,
    quotes: `${API_BASE_URL}/admin/quotes.php`,
    bookings: `${API_BASE_URL}/admin/bookings.php`,
    contacts: `${API_BASE_URL}/admin/contacts.php`,
    upload: `${API_BASE_URL}/admin/upload.php`,
  }
};
