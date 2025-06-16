import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;
const headers = Config.guestHeaders;

//Todo => Validate OTP input
export const validateOTP = (otp) => {
  const errors = {};

  if (!otp || otp.trim().length === 0) {
    errors.otp = "Verification code is required";
    return { isValid: false, errors };
  }

  if (otp.length !== 4) {
    errors.otp = "Verification code must be exactly 4 digits";
    return { isValid: false, errors };
  }

  if (!/^\d{4}$/.test(otp)) {
    errors.otp = "Verification code must contain only numbers";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

//Todo => Validate user slug
export const validateUserSlug = (userSlug) => {
  if (!userSlug || userSlug.trim().length === 0) {
    throw new Error("User session expired. Please login again.");
  }

  // Basic UUID format validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userSlug)) {
    throw new Error("Invalid user session. Please login again.");
  }

  return true;
};

//Todo => Validate email
export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    throw new Error("Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }

  return true;
};

//Todo => Verify account with OTP
export const verifyAccount = async (otp, userSlug) => {
  try {
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      throw new Error(Object.values(otpValidation.errors)[0]);
    }
    validateUserSlug(userSlug);

    const payload = {
      otp: otp.trim(),
      user_slug: userSlug.trim(),
    };

    //Todo => Make API call
    const response = await axios.post(
      `${BASE_URL}/rentor/verify/account`,
      payload,
      {
        headers,
        timeout: 30000,
      }
    );

    if (
      response.data?.data?.status_code === "000" &&
      !response.data?.data?.in_error
    ) {
      return {
        success: true,
        data: response.data,
        userData: response.data.data.data,
        message: response.data.data.message || "Account verified successfully!",
        token: response.data.data.data.token,
      };
    }
    const statusCode = response.data?.data?.status_code;
    const reason = response.data?.data?.reason;

    if (statusCode === "999") {
      throw new Error(
        "Your verification code has expired. Please request a new one."
      );
    } else if (statusCode === "004") {
      throw new Error("Invalid verification code. Please check and try again.");
    } else {
      throw new Error(reason || "Verification failed. Please try again.");
    }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Verification failed. Please try again.";

      if (data?.data?.reason) {
        errorMessage = data.data.reason;
      } else if (data?.message) {
        errorMessage = data.message;
      }

      switch (status) {
        case 400:
          errorMessage =
            "Invalid request. Please check your input and try again.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please login again.";
          break;
        case 404:
          errorMessage =
            "Verification service not found. Please contact support.";
          break;
        case 422:
          errorMessage = data?.data?.reason || "Invalid verification code.";
          break;
        case 429:
          errorMessage = "Too many attempts. Please wait before trying again.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = `Verification failed (${status}). Please try again.`;
      }

      return {
        success: false,
        error: errorMessage,
        status,
        data: data || null,
      };
    }

    if (error.request) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        status: null,
        data: null,
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred. Please try again.",
      status: null,
      data: null,
    };
  }
};

//Todo => Resend verification OTP
export const resendVerificationOTP = async (email) => {
  try {
    validateEmail(email);

    const payload = {
      emailOrPhone: email,
    };

    const response = await axios.post(
      `${BASE_URL}/rentor/resend/verificationCode`,
      payload,
      {
        headers,
        timeout: 30000,
      }
    );

    if (
      response.data?.data?.status_code === "000" &&
      !response.data?.data?.in_error
    ) {
      return {
        success: true,
        data: response.data,
        message:
          response.data.data.message || "Verification code sent successfully!",
      };
    }

    const reason = response.data?.data?.reason;
    throw new Error(
      reason || "Failed to resend verification code. Please try again."
    );
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Failed to resend code. Please try again.";

      if (data?.data?.reason) {
        errorMessage = data.data.reason;
      } else if (data?.message) {
        errorMessage = data.message;
      }

      switch (status) {
        case 400:
          errorMessage = "Invalid request. Please try again.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please login again.";
          break;
        case 404:
          errorMessage = "Resend service not found. Please contact support.";
          break;
        case 422:
          errorMessage =
            data?.data?.reason || "Unable to resend code at this time.";
          break;
        case 429:
          errorMessage =
            "Too many resend attempts. Please wait before trying again.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = `Failed to resend code (${status}). Please try again.`;
      }

      return {
        success: false,
        error: errorMessage,
        status,
        data: data || null,
      };
    }

    if (error.request) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        status: null,
        data: null,
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred. Please try again.",
      status: null,
      data: null,
    };
  }
};

export default {
  verifyAccount,
  resendVerificationOTP,
  validateOTP,
  validateUserSlug,
  validateEmail,
};
