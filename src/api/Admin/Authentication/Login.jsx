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
    console.log("🔐 Admin Login Request:", logData);

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

    console.log("✅ Admin Login Response:", {
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

    console.error("❌ Admin Login Error:", {
      status: error.response?.status,
      statusCode: error.response?.data?.data?.status_code,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      errorType: error.code || "UNKNOWN",
    });

    return Promise.reject(error);
  }
);

//Todo => Validate admin login data
export const validateAdminLoginData = (formData) => {
  const errors = {};

  //Todo => Email validation (admin only uses email)
  if (!formData.emailOrPhone || formData.emailOrPhone.trim().length === 0) {
    errors.emailOrPhone = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const input = formData.emailOrPhone.trim();

    if (!emailRegex.test(input)) {
      errors.emailOrPhone = "Please enter a valid email address";
    }
  }

  //Todo => Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

//Todo => Enhanced admin login function
export const loginAdmin = async (loginData) => {
  try {
    //Todo => Prepare the payload
    const payload = {
      emailOrPhone: loginData.emailOrPhone?.trim(),
      password: loginData.password,
    };

    //Todo => Validate the payload
    const validation = validateAdminLoginData(payload);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    console.log("🔐 Admin Login Attempt:", {
      email: payload.emailOrPhone,
      timestamp: new Date().toISOString(),
      endpoint: "/admin/login",
    });

    //Todo => Make the API call
    const response = await apiClient.post("/admin/login", payload);

    //Todo => Handle successful response
    if (response.data && response.data.data) {
      const { data: responseData } = response.data;
      
      // Check if the response indicates success
      if (!responseData.in_error && responseData.status_code === "000") {
        const adminData = responseData.data;
        
        console.log("🎉 Admin Login Success:", {
          adminId: adminData?.id,
          email: adminData?.email,
          fullName: adminData?.full_name,
          userType: adminData?.user_type,
          timestamp: new Date().toISOString(),
        });

        //Todo => Store admin token if provided
        if (adminData && adminData.token) {
          localStorage.setItem("quick_admin_token", adminData.token);
          localStorage.setItem("quick_admin_user", JSON.stringify(adminData));
        }

        return {
          success: true,
          data: response.data,
          user: adminData,
          message: responseData.message || "Admin login successful! Welcome back.",
          token: adminData?.token,
        };
      } else {
        // Handle API-level errors (in_error: true)
        const errorMessage = responseData.reason || responseData.message || "Admin login failed";
        return {
          success: false,
          error: errorMessage,
          errorCode: responseData.status_code,
        };
      }
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("❌ Admin Login Error:", error);

    //Todo => Handle API response errors
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Admin login failed. Please try again.";

      console.error("🚨 Admin Login API Error:", {
        status,
        statusCode: data?.data?.status_code,
        message: data?.message,
        timestamp: new Date().toISOString(),
      });

      //Todo => Extract error message from response
      if (data) {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.data && data.data.message) {
          errorMessage = data.data.message;
          console.log("🚨 Admin Login API Error:", errorMessage);
        }
      }

      //Todo => Handle specific HTTP status codes
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
            error: "Invalid email or password. Please check your credentials.",
            errorCode: "INVALID_CREDENTIALS",
          };
        case 403:
          return {
            success: false,
            error: "Access denied. Admin account may be suspended.",
            errorCode: "ACCESS_DENIED",
          };
        case 404:
          return {
            success: false,
            error: "Admin login service is currently unavailable.",
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
            error: "Too many login attempts. Please wait before trying again.",
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
            error: data?.message || "An unexpected error occurred. Please try again.",
            errorCode: "UNKNOWN_ERROR",
          };
      }
    } else if (error.request) {
      return {
        success: false,
        error: "Network error. Please check your internet connection and try again.",
        errorCode: "NETWORK_ERROR",
      };
    } else if (error.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Request timeout. Please check your connection and try again.",
        errorCode: "TIMEOUT_ERROR",
      };
    }

    //Todo => Handle validation errors
    if (error.message.includes("Validation failed")) {
      return {
        success: false,
        error: error.message.replace("Validation failed: ", ""),
        errorCode: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      error: error.message || "Admin login failed. Please try again.",
      errorCode: "UNKNOWN_ERROR",
    };
  }
};

//Todo => Check admin authentication status
export const checkAdminAuthStatus = () => {
  const token = localStorage.getItem("quick_admin_token");
  const tokenExpiry = localStorage.getItem("quick_admin_token_expiry");

  if (!token) return { isAuthenticated: false, reason: "NO_TOKEN" };

  if (tokenExpiry) {
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();

    if (now >= expiryDate) {
      localStorage.removeItem("quick_admin_token");
      localStorage.removeItem("quick_admin_token_expiry");
      return { isAuthenticated: false, reason: "TOKEN_EXPIRED" };
    }
  }

  return {
    isAuthenticated: true,
    token,
    expiresAt: tokenExpiry ? new Date(tokenExpiry) : null,
  };
};

//Todo => Admin logout with cleanup
export const logoutAdmin = () => {
  localStorage.removeItem("quick_admin_token");
  localStorage.removeItem("quick_admin_token_expiry");
  
  console.log("👋 Admin Logout:", {
    timestamp: new Date().toISOString(),
    message: "Admin session cleared successfully",
  });

  return {
    success: true,
    message: "Logged out successfully",
  };
}; 