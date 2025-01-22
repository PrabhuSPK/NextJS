// src/config/apiConfig.js

const API_BASE_URL = "http://127.0.0.1:8000/api";

const apiEndpoints = {
  users: `${API_BASE_URL}/user/`,
  products: `${API_BASE_URL}/products/`,
  orders: `${API_BASE_URL}/orders/`, // Add more as needed
};

export default apiEndpoints;
