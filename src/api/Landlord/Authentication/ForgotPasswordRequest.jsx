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
    console.log("🔐 Landlord Forgot Password Request:", logData);

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

    console.log("✅ Landlord Forgot Password Response:", {
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

    console.error("❌ Landlord Forgot Password Error:", {
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
 * Todo => Validates landlord contact information (email or phone)
 * @param {string} emailOrPhone - Email or phone number
 * @returns {object} Validation result
 */
export const validateLandlordContact = (emailOrPhone) => {
  const errors = {};

  if (!emailOrPhone || emailOrPhone.trim().length === 0) {
    errors.emailOrPhone = "Email or phone number is required";
  } else {
    const input = emailOrPhone.trim();
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const ghanaPhoneRegex = /^233[0-9]{9}$/;

    const isEmail = emailRegex.test(input);
    const isGhanaPhone = ghanaPhoneRegex.test(input);

    if (!isEmail && !isGhanaPhone) {
      if (input.includes("@")) {
        errors.emailOrPhone = "Please enter a valid email address";
      } else if (input.startsWith("233") || input.startsWith("0")) {
        errors.emailOrPhone =
          "Please enter a valid Ghana phone number (233XXXXXXXXX)";
      } else {
        errors.emailOrPhone =
          "Please enter a valid email address or Ghana phone number";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Todo => Sends forgot password request for landlord
 * @param {string} emailOrPhone - Email or phone number
 * @returns {Promise<object>} API response
 */
export const landlordForgotPasswordRequest = async (emailOrPhone) => {
  try {
    const validation = validateLandlordContact(emailOrPhone);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
    const formattedContact = emailOrPhone.trim();
    const payload = {
      emailOrPhone: formattedContact,
    };

    console.log("🔐 Landlord Forgot Password Attempt:", {
      contactType: formattedContact.includes("@") ? "email" : "phone",
      timestamp: new Date().toISOString(),
    });
    const response = await apiClient.post(
      "/landlord/email/resetpassword",
      payload
    );
    const apiResponse = response.data.data;

    if (apiResponse.status_code === "000" && !apiResponse.in_error) {
      return {
        success: true,
        data: apiResponse,
        message: apiResponse.message || "OTP sent successfully",
        landlordData: apiResponse.data,
      };
    } else {
      return {
        success: false,
        message: apiResponse.reason || "Failed to send reset code",
        error: apiResponse.reason,
        statusCode: apiResponse.status_code,
      };
    }
  } catch (error) {
    console.error("❌ Landlord Forgot Password Error:", error);

    if (error.response) {
      const errorData = error.response.data?.data;
      const errorMessage =
        errorData?.reason || errorData?.message || "Failed to send reset code";

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
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

export default landlordForgotPasswordRequest;
