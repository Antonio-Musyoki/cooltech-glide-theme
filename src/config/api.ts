// Configure your external API base URL here
const API_BASE_URL = 'https://test.cooltechrefrigeration.co.ke/api';
// For cPanel PHP backend, this would be something like: https://yourdomain.com/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Products
  products: `${API_BASE_URL}/products`,
  productById: (id: string) => `${API_BASE_URL}/products/${id}`,
  
  // Services
  services: `${API_BASE_URL}/services`,
  serviceById: (id: string) => `${API_BASE_URL}/services/${id}`,
  
  // Quotes
  quotes: `${API_BASE_URL}/quotes`,
  
  // Bookings
  bookings: `${API_BASE_URL}/bookings`,
  
  // Contact
  contact: `${API_BASE_URL}/contact`,
};
