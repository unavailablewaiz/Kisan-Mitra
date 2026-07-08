export const API_BASE_URL = 'https://kisan-india-backend.vercel.app';

export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products/products`,
  CUSTOMER_LOGIN: `${API_BASE_URL}/api/customers/login`,
  CUSTOMER_SIGNUP: `${API_BASE_URL}/api/customers/signup`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  CUSTOMER_ORDERS: (mobile: string) => `${API_BASE_URL}/api/orders/customer/${mobile}`,
};