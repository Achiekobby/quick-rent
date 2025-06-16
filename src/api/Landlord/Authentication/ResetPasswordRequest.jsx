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

//Todo => Request interceptor for enhanced logging
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };

    const logData = {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString(),
      hasPayload: !!config.data,
    };
    console.log("🔐 Landlord Reset Password Request:", logData);

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

    console.log("✅ Landlord Reset Password Response:", {
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

    console.error("❌ Landlord Reset Password Error:", {
      status: error.response?.status,
      statusCode: error.response?.data?.data?.status_code,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      errorType: error.code || "UNKNOWN",
    });

    return Promise.reject(error);
  }
);

/**
 * Todo => Validates landlord password reset data
 * @param {string} password - New password
 * @param {string} landlordSlug - Landlord slug
 * @param {string} otp - OTP code
 * @returns {object} Validation result
 */
export const validateLandlordResetData = (password, landlordSlug, otp) => {
  const errors = {};

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (password.length > 128) {
    errors.password = "Password is too long (maximum 128 characters)";
  }

  if (!landlordSlug || landlordSlug.trim().length === 0) {
    errors.landlordSlug = "Landlord identifier is required";
  }

  if (!otp) {
    errors.otp = "Verification code is required";
  } else if (!/^\d{4}$/.test(otp)) {
    errors.otp = "Verification code must be a 4-digit number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Todo => Resets landlord password using OTP
 * @param {string} password - New password
 * @param {string} landlordSlug - Landlord slug from the forgot password response
 * @param {string} otp - 4-digit OTP code
 * @returns {Promise<object>} API response
 */
export const landlordResetPasswordRequest = async (
  password,
  landlordSlug,
  otp
) => {
  try {
    const validation = validateLandlordResetData(password, landlordSlug, otp);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors);
      const errorMessage = errorMessages[0];
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        errors: validation.errors,
      };
    }

    const payload = {
      password: password,
      landlord_slug: landlordSlug,
      otp: otp,
    };

    console.log("🔐 Landlord Reset Password Attempt:", {
      hasPassword: !!password,
      hasLandlordSlug: !!landlordSlug,
      hasOtp: !!otp,
      timestamp: new Date().toISOString(),
    });

    const response = await apiClient.post("/landlord/resetpassword", payload);
    const apiResponse = response.data.data;

    if (apiResponse.status_code === "000" && !apiResponse.in_error) {
      return {
        success: true,
        data: apiResponse,
        message: apiResponse.message || "Password reset successful",
      };
    } else {
      let errorMessage = apiResponse.reason || "Failed to reset password";

      if (apiResponse.status_code === "999") {
        errorMessage =
          "Verification code has expired. Please request a new one.";
      } else if (apiResponse.status_code === "004") {
        errorMessage = "User account cannot be found. Please try again.";
      }

      return {
        success: false,
        message: errorMessage,
        error: apiResponse.reason,
        statusCode: apiResponse.status_code,
      };
    }
  } catch (error) {
    console.error("❌ Landlord Reset Password Error:", error);

    if (error.response) {
      const errorData = error.response.data?.data;
      let errorMessage =
        errorData?.reason || errorData?.message || "Failed to reset password";

      if (errorData?.status_code === "999") {
        errorMessage =
          "Verification code has expired. Please request a new one.";
      } else if (errorData?.status_code === "004") {
        errorMessage = "User account cannot be found. Please try again.";
      }

      return {
        success: false,
        message: errorMessage,
        error: errorData?.reason,
        status: error.response.status,
        statusCode: errorData?.status_code,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message:
          error.message || "An unexpected error occurred. Please try again.",
        error: error.message,
      };
    }
  }
};

export default landlordResetPasswordRequest;
