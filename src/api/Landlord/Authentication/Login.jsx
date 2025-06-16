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

//Todo => Request interceptor for enhanced logging and security
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };

    const logData = {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString(),
      hasPayload: !!config.data,
    };
    console.log("🔐 Landlord Login Request:", logData);

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

    console.log("✅ Landlord Login Response:", {
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

    console.error("❌ Landlord Login Error:", {
      status: error.response?.status,
      statusCode: error.response?.data?.data?.status_code,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      errorType: error.code || "UNKNOWN",
    });

    return Promise.reject(error);
  }
);

//Todo => Enhanced input validation with comprehensive checks
export const validateLandlordLoginData = (formData) => {
  const errors = {};
  const warnings = [];

  if (!formData.emailOrPhone || formData.emailOrPhone.trim().length === 0) {
    errors.emailOrPhone = "Email or phone number is required";
  } else {
    const input = formData.emailOrPhone.trim();
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

    if (input.startsWith("0") && input.length === 10) {
      warnings.push("Tip: Ghana phone numbers should start with 233, not 0");
    }
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else {
    const password = formData.password;
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (password.length > 128) {
      errors.password = "Password is too long (maximum 128 characters)";
    }

    if (password.toLowerCase().includes("password")) {
      warnings.push(
        "Consider using a stronger password that doesn't contain 'password'"
      );
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    inputType: formData.emailOrPhone?.includes("@") ? "email" : "phone",
  };
};

//Todo => Smart contact detection and formatting
const detectAndFormatContact = (input) => {
  const trimmed = input.trim();

  if (trimmed.includes("@")) {
    return {
      type: "email",
      formatted: trimmed.toLowerCase(),
      display: trimmed,
    };
  }

  if (trimmed.startsWith("233")) {
    return {
      type: "phone",
      formatted: trimmed,
      display: `+${trimmed.slice(0, 3)} ${trimmed.slice(3, 5)} ${trimmed.slice(
        5,
        8
      )} ${trimmed.slice(8)}`,
    };
  }

  if (trimmed.startsWith("0") && trimmed.length === 10) {
    const formatted = "233" + trimmed.slice(1);
    return {
      type: "phone",
      formatted,
      display: `+233 ${trimmed.slice(1, 3)} ${trimmed.slice(
        3,
        6
      )} ${trimmed.slice(6)}`,
    };
  }

  return {
    type: "unknown",
    formatted: trimmed,
    display: trimmed,
  };
};

//Todo => Main landlord login function with comprehensive error handling
export const loginLandlord = async (loginData) => {
  try {
    const validation = validateLandlordLoginData(loginData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const contactInfo = detectAndFormatContact(loginData.emailOrPhone);

    const payload = {
      emailOrPhone: contactInfo.formatted,
      password: loginData.password,
    };

    console.log("🔐 Landlord Login Attempt:", {
      contactType: contactInfo.type,
      contactDisplay: contactInfo.display,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 50) + "...",
    });

    const response = await apiClient.post("/landlord/login", payload);
    const apiResponse = response.data.data;

    if (apiResponse.status_code === "000" && !apiResponse.in_error) {
      const landlordData = apiResponse.data;

      if (landlordData.token) {
        localStorage.setItem("quick_landlord_token", landlordData.token);

        const tokenExpiry = new Date();
        tokenExpiry.setFullYear(tokenExpiry.getFullYear() + 1);
        localStorage.setItem(
          "quick_landlord_token_expiry",
          tokenExpiry.toISOString()
        );
      }

      console.log("🎉 Landlord Login Success:", {
        landlordId: landlordData.id,
        businessName: landlordData.business_name,
        isVerified: landlordData.is_verified === 1,
        isActive: landlordData.is_active === 1,
        hasBusinessLogo: !!landlordData.business_logo,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: response.data,
        user: {
          ...landlordData,
          user_type: "landlord",
          displayName: landlordData.full_name,
          businessDisplayName: landlordData.business_name,
          isBusinessVerified: landlordData.is_verified === 1,
          isAccountActive: landlordData.is_active === 1,
          hasCompletedProfile: !!(
            landlordData.business_name && landlordData.business_type
          ),
          contactMethod: contactInfo.type,
          formattedContact: contactInfo.display,
        },
        message:
          apiResponse.reason ||
          "Welcome back! Access granted to your property management dashboard.",
        metadata: {
          loginTime: new Date().toISOString(),
          contactType: contactInfo.type,
          requiresVerification: landlordData.is_verified === 0,
          requiresActivation: landlordData.is_active === 0,
        },
      };
    } else {
      const errorMessage =
        apiResponse.reason || apiResponse.message || "Login failed";

      console.warn("⚠️ Landlord Login Failed:", {
        statusCode: apiResponse.status_code,
        reason: apiResponse.reason,
        inError: apiResponse.in_error,
        timestamp: new Date().toISOString(),
      });

      let userFriendlyMessage = errorMessage;

      switch (apiResponse.status_code) {
        case "999":
          if (errorMessage.toLowerCase().includes("password")) {
            userFriendlyMessage =
              "Incorrect password. Please check your password and try again.";
          } else if (
            errorMessage.toLowerCase().includes("not found") ||
            errorMessage.toLowerCase().includes("does not exist")
          ) {
            userFriendlyMessage = `No landlord account found with this ${contactInfo.type}. Please check your ${contactInfo.type} or register a new account.`;
          } else {
            userFriendlyMessage = errorMessage;
          }
          break;
        case "004":
          userFriendlyMessage =
            "Account not found. Please check your credentials or register a new account.";
          break;
        case "003":
          userFriendlyMessage =
            "Account is not verified. Please check your email for verification instructions.";
          break;
        case "002":
          userFriendlyMessage =
            "Account is suspended. Please contact support for assistance.";
          break;
        default:
          userFriendlyMessage = errorMessage;
      }

      throw new Error(userFriendlyMessage);
    }
  } catch (error) {
    console.error("🚨 Landlord Login Error:", error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return {
            success: false,
            error: "Invalid request. Please check your input and try again.",
            errorCode: "INVALID_REQUEST",
          };
        case 401:
          return {
            success: false,
            error:
              "Invalid credentials. Please check your email/phone and password.",
            errorCode: "INVALID_CREDENTIALS",
          };
        case 403:
          return {
            success: false,
            error:
              "Access denied. Your account may be suspended or restricted.",
            errorCode: "ACCESS_DENIED",
          };
        case 404:
          return {
            success: false,
            error:
              "Login service is currently unavailable. Please try again later.",
            errorCode: "SERVICE_UNAVAILABLE",
          };
        case 422: {
          const validationErrors = data.errors || {};
          const errorMessages = Object.entries(validationErrors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          return {
            success: false,
            error: errorMessages || "Please check your input and try again.",
            errorCode: "VALIDATION_ERROR",
          };
        }
        case 429:
          return {
            success: false,
            error:
              "Too many login attempts. Please wait a few minutes before trying again.",
            errorCode: "RATE_LIMITED",
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            success: false,
            error: "Server error. Please try again in a few moments.",
            errorCode: "SERVER_ERROR",
          };
        default:
          return {
            success: false,
            error:
              data?.message ||
              "An unexpected error occurred. Please try again.",
            errorCode: "UNKNOWN_ERROR",
          };
      }
    } else if (error.request) {
      return {
        success: false,
        error:
          "Network error. Please check your internet connection and try again.",
        errorCode: "NETWORK_ERROR",
      };
    } else if (error.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Request timeout. Please check your connection and try again.",
        errorCode: "TIMEOUT_ERROR",
      };
    }

    if (error.message.includes("Validation failed")) {
      return {
        success: false,
        error: error.message.replace("Validation failed: ", ""),
        errorCode: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      error: error.message || "Login failed. Please try again.",
      errorCode: "UNKNOWN_ERROR",
    };
  }
};

//Todo => Enhanced authentication status checking
export const checkLandlordAuthStatus = () => {
  const token = localStorage.getItem("quick_landlord_token");
  const tokenExpiry = localStorage.getItem("quick_landlord_token_expiry");

  if (!token) return { isAuthenticated: false, reason: "NO_TOKEN" };

  if (tokenExpiry) {
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();

    if (now >= expiryDate) {
      localStorage.removeItem("quick_landlord_token");
      localStorage.removeItem("quick_landlord_token_expiry");
      return { isAuthenticated: false, reason: "TOKEN_EXPIRED" };
    }
  }

  return {
    isAuthenticated: true,
    token,
    expiresAt: tokenExpiry ? new Date(tokenExpiry) : null,
  };
};

//Todo => Enhanced logout with cleanup
export const logoutLandlord = () => {
  try {
    const keysToRemove = [
      "quick_landlord_token",
      "quick_landlord_token_expiry",
      "landlord_preferences",
      "landlord_session_data",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log("👋 Landlord Logout:", {
      timestamp: new Date().toISOString(),
      success: true,
    });

    return {
      success: true,
      message: "Logged out successfully. Thank you for using Quick Rent!",
    };
  } catch (error) {
    console.error("🚨 Logout Error:", error);
    return {
      success: false,
      error: "Error during logout. Please clear your browser data manually.",
    };
  }
};

//Todo => Get stored token with validation
export const getStoredLandlordToken = () => {
  const authStatus = checkLandlordAuthStatus();
  return authStatus.isAuthenticated ? authStatus.token : null;
};

//Todo => Utility function to get user info from token (basic JWT parsing)
export const getLandlordInfoFromToken = (token = null) => {
  try {
    const tokenToUse = token || getStoredLandlordToken();
    if (!tokenToUse) return null;

    const payload = tokenToUse.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return {
      userId: decoded.sub,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: new Date(decoded.exp * 1000),
      audience: decoded.aud,
    };
  } catch (error) {
    console.warn("Token parsing failed:", error);
    return null;
  }
};

//Todo => Legacy function name for backward compatibility
export const validateLoginData = validateLandlordLoginData;
