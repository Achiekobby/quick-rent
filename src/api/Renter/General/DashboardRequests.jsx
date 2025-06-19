import Config from "../../../utils/Config";
import axios from "axios";
const BASE_URL = Config.baseUrl;

export const getAllProperties = async () => {
  const response = await axios.get(`${BASE_URL}/properties/mixedProperties`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getEveryProperty = async () => {
  const response = await axios.get(`${BASE_URL}/properties/allProperties`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const showPropertyDetails = async (slug) => {
  const response = await axios.get(`${BASE_URL}/properties/${slug}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
