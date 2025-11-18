import Config from "../../../utils/Config";
import axios from "axios";
const BASE_URL = Config.baseUrl;

export const getWishlist = async () => {
  const response = await axios.get(`${BASE_URL}/rentor/wishlist`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_renter_token")}`,
    },
  });
  return response.data;
};

export const storeWishlistItem = async (payload) => {
  const response = await axios.post(
    `${BASE_URL}/rentor/wishlist`,
    { property_slug: payload },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("quick_renter_token")}`,
      },
    }
  );
  return response.data;
};

export const removeWishlistItem = async (slug) => {
  const response = await axios.delete(`${BASE_URL}/rentor/wishlist/${slug}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_renter_token")}`,
    },
  });
  return response.data;
};
