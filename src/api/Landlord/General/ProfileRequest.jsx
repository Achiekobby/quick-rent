import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

//Todo => Configure axios instance with enhanced security and performance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 30000,
  withCredentials: false,
});

//Todo => Request interceptor for enhanced logging and dynamic token handling
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };

    // Get token fresh from localStorage on each request
    const token = localStorage.getItem("quick_landlord_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove Authorization header if no token
      delete config.headers.Authorization;
    }

    const logData = {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString(),
      hasPayload: !!config.data,
      hasToken: !!token,
    };
    console.log("🔐 Landlord Profile Request:", logData);

    return config;
  },
  (error) => {
    console.error("🚨 Request Error:", error);
    return Promise.reject(error);
  }
);

//Todo => Response interceptor for enhanced error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;

    console.log("✅ Landlord Profile Response:", {
      status: response.status,
      statusCode: response.data?.data?.status_code,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      success: !response.data?.data?.in_error,
    });

    return response;
  },
  (error) => {
    const duration = error.config?.metadata
      ? new Date() - error.config.metadata.startTime
      : "unknown";

    console.error("❌ Landlord Profile Error:", {
      status: error.response?.status,
      statusCode: error.response?.data?.data?.status_code,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      errorType: error.code || "UNKNOWN",
    });

    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      console.warn("🚨 Unauthorized request - token may be invalid or expired");
      // Optionally clear invalid token
      localStorage.removeItem("quick_landlord_token");
      localStorage.removeItem("quick_landlord_token_expiry");

      // Redirect to login if needed
      if (window.location.pathname !== "/landlord-login") {
        window.location.href = "/landlord-login";
      }
    }

    return Promise.reject(error);
  }
);

//Todo => Update landlord profile
export const updateLandlordProfile = async (data) => {
  try {
    // Token is now handled by the request interceptor
    //Todo => Prepare payload according to the specified format
    const payload = {
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number,
      business_name: data.business_name,
      business_type: data.business_type,
      location: data.location,
      region: data.region,
      business_registration_number: data.business_registration_number,
    };

    //Todo => Add Ghana Card number if provided
    if (data.ghana_card_number) {
      payload.ghana_card_number = data.ghana_card_number;
    }

    //Todo => Add business_logo only if provided (it's optional)
    if (data.business_logo) {
      payload.business_logo = data.business_logo;
    }

    //Todo => Add verification documents if provided (only when is_active !== 1)
    if (data.selfie_picture) {
      payload.selfie_picture = data.selfie_picture;
    }
    if (data.ghana_card_front) {
      payload.ghana_card_front = data.ghana_card_front;
    }
    if (data.ghana_card_back) {
      payload.ghana_card_back = data.ghana_card_back;
    }

    console.log("Landlord profile update payload:", payload);

    const response = await apiClient.post("/landlord/update/profile", payload);

    const responseData = response.data?.data;

    if (
      responseData &&
      !responseData.in_error &&
      responseData.status_code === "000"
    ) {
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
    console.error("Landlord profile update error:", error);

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

//Todo => Change landlord password
export const changeLandlordPassword = async (data) => {
  try {
    // Token is now handled by the request interceptor
    //Todo => Prepare payload according to the specified format
    const payload = {
      old_password: data.currentPassword,
      password: data.newPassword,
      password_confirmation: data.confirmPassword,
    };

    console.log("Landlord password change payload:", {
      ...payload,
      old_password: "***hidden***",
      password: "***hidden***",
      password_confirmation: "***hidden***",
    });

    const response = await apiClient.post("/landlord/change/password", payload);

    const responseData = response.data?.data;

    if (
      responseData &&
      !responseData.in_error &&
      responseData.status_code === "000"
    ) {
      return {
        success: true,
        data: responseData.data,
        message:
          responseData.reason ||
          responseData.message ||
          "Password changed successfully",
      };
    } else {
      return {
        success: false,
        message:
          responseData?.reason ||
          responseData?.message ||
          "Failed to change password",
        error: responseData,
      };
    }
  } catch (error) {
    console.error("Landlord password change error:", error);

    if (error.response) {
      const errorData = error.response.data;

      //Todo => Handle validation errors from the API
      if (
        errorData?.message === "The password is incorrect." &&
        errorData?.errors?.old_password
      ) {
        return {
          success: false,
          message: "The current password is incorrect.",
          error: errorData,
          statusCode: error.response.status,
          validationErrors: errorData.errors,
        };
      }

      return {
        success: false,
        message: errorData?.message || "Failed to change password",
        error: errorData,
        statusCode: error.response.status,
        validationErrors: errorData?.errors,
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

export const refreshUserData = async (landlord_slug) => {
  try {
    const response = await apiClient.get(
      `/landlord/refresh/user_data/${landlord_slug}`
    );
    return response.data?.data;
  } catch (error) {
    return error?.response?.data?.reason || null;
  }
};

export default {
  updateLandlordProfile,
  changeLandlordPassword,
  refreshUserData,
};
