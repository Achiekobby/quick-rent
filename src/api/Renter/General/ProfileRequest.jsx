import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

//Todo => Update profile
export const updateProfile = async (data) => {
  try {
    const token = localStorage.getItem("quick_renter_token");
    console.log("token", token);

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${BASE_URL}/rentor/update/profile`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const responseData = response.data?.data;

    if (responseData && !responseData.in_error) {
      return {
        success: true,
        data: responseData.data,
        message:
          responseData.reason ||
          responseData.message ||
          "Profile updated successfully",
      };
    } else {
      return {
        success: false,
        message:
          responseData?.reason ||
          responseData?.message ||
          "Failed to update profile",
        error: responseData,
      };
    }
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.response) {
      const errorData = error.response.data?.data;
      return {
        success: false,
        message:
          errorData?.reason ||
          errorData?.message ||
          error.response.data.message ||
          "Failed to update profile",
        error: error.response.data,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
        error: error.message,
      };
    } else {
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
        error: error.message,
      };
    }
  }
};
