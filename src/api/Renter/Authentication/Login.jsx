import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;
const headers = Config.guestHeaders;

//Todo => Validate login data
export const validateLoginData = (formData) => {
  const errors = {};

  //Todo => Email or phone validation
  if (!formData.emailOrPhone || formData.emailOrPhone.trim().length === 0) {
    errors.emailOrPhone = "Email or phone number is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^233[0-9]{9}$/;
    const input = formData.emailOrPhone.trim();

    if (!emailRegex.test(input) && !phoneRegex.test(input)) {
      errors.emailOrPhone =
        "Please enter a valid email address or Ghana phone number (233XXXXXXXXX)";
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

//Todo => Login renter
export const loginRenter = async (loginData) => {
  try {
    //Todo => Prepare the payload
    const payload = {
      emailOrPhone: loginData.emailOrPhone?.trim(),
      password: loginData.password,
    };

    //Todo => Validate the payload
    const validation = validateLoginData(payload);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const response = await axios.post(`${BASE_URL}/rentor/login`, payload, {
      headers,
      timeout: 30000,
    });

    if (response.data && response.data.data) {
      const { data: responseData } = response.data;
      if (responseData.data && responseData.data.token) {
        localStorage.setItem("quick_renter_token", responseData.data.token);
      }

      return {
        success: true,
        data: response.data,
        user: responseData.data,
        message: responseData.message || "Login successful! Welcome back.",
      };
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Login failed. Please try again.";
      let fieldErrors = {};

      if (data) {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.data && data.data.message) {
          errorMessage = data.data.message;
        }

        if (data.errors) {
          fieldErrors = data.errors;
          if (typeof data.errors === "object") {
            const errorMessages = Object.values(data.errors).flat();
            errorMessage = errorMessages.join(", ");
          }
        }
      }

      //Todo => Handle specific HTTP status codes
      switch (status) {
        case 400:
          errorMessage = data?.message || "Invalid login credentials provided.";
          break;
        case 401:
          errorMessage =
            "Invalid email/phone or password. Please check your credentials.";
          break;
        case 403:
          errorMessage = "Account access denied. Please contact support.";
          break;
        case 404:
          errorMessage =
            "Account not found. Please check your credentials or sign up.";
          break;
        case 422:
          errorMessage =
            data?.message || "Invalid data provided. Please check your input.";
          break;
        case 429:
          errorMessage = "Too many login attempts. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = data?.message || `Login failed with status ${status}`;
      }

      return {
        success: false,
        error: errorMessage,
        fieldErrors,
        status,
      };
    } else if (error.request) {
      return {
        success: false,
        error:
          "Network error. Please check your internet connection and try again.",
      };
    } else if (error.message.includes("Validation failed")) {
      return {
        success: false,
        error: error.message.replace("Validation failed: ", ""),
      };
    } else {
      return {
        success: false,
        error:
          error.message || "An unexpected error occurred. Please try again.",
      };
    }
  }
};

//Todo => Check auth status
export const checkAuthStatus = () => {
  const token = localStorage.getItem("quick_renter_token");
  return !!token;
};

//Todo => Logout renter
export const logoutRenter = () => {
  localStorage.removeItem("quick_renter_token");
  return {
    success: true,
    message: "Logged out successfully",
  };
};

//Todo => Get stored token
export const getStoredToken = () => {
  return localStorage.getItem("quick_renter_token");
};
