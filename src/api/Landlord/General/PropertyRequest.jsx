import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Authorization": `Bearer ${localStorage.getItem("quick_landlord_token")}`,
  },
  timeout: 30000,
  withCredentials: false,
});

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
