import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

// Create API client without static Authorization header
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Add request interceptor to dynamically include token
apiClient.interceptors.request.use(
  (config) => {
    // Get token fresh from localStorage on each request
    const token = localStorage.getItem("quick_landlord_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove Authorization header if no token
      delete config.headers.Authorization;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token-related errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      console.warn("🚨 Unauthorized request - token may be invalid or expired");
      localStorage.removeItem("quick_landlord_token");
      localStorage.removeItem("quick_landlord_token_expiry");
      
      if (window.location.pathname !== "/landlord-login") {
        window.location.href = "/landlord-login";
      }
    }
    
    return Promise.reject(error);
  }
);

export const createProperty = async (data) => {
  try {
    const response = await apiClient.post("/landlord/properties/store", data);
    return response?.data;
  } catch (error) {
    console.error("🚨 Property Creation Error:", error);
    throw error;
  }
};

export const updateProperty = async (slug, data) => {
  try {
    const response = await apiClient.put(`/landlord/properties/${slug}`, data);
    return response?.data;
  } catch (error) {
    console.error("🚨 Property Update Error:", error);
    throw error;
  }
};

export const getAllProperties = async () => {
  try {
    const response = await apiClient.get("/landlord/properties");
    return response?.data;
  } catch (error) {
    console.error("🚨 Property Fetching Error:", error);
    throw error;
  }
};

export const getPropertyById = async (slug) => {
  try {
    const response = await apiClient.get(`/properties/${slug}`);
    return response?.data;
  } catch (error) {
    console.error("🚨 Property Fetching Error:", error);
    throw error;
  }
};

export const deleteProperty = async (slug) => {
  try {
    const response = await apiClient.delete(`/landlord/properties/${slug}`);
    return response?.data;
  } catch (error) {
    console.error("🚨 Property Deletion Error:", error);
    throw error;
  }
};
