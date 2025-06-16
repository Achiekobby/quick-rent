import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

// Configure axios defaults for landlord verification
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// * Validate OTP input
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

// * Validate user slug
export const validateUserSlug = (userSlug) => {
  if (!userSlug || userSlug.trim().length === 0) {
    throw new Error("User session expired. Please login again.");
  }

  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userSlug)) {
    throw new Error("Invalid user session. Please login again.");
  }

  return true;
};

// * Validate email
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

// * Verify landlord account with OTP
export const verifyLandlordAccount = async (otp, landlordSlug) => {
  try {
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      throw new Error(Object.values(otpValidation.errors)[0]);
    }
    
    // Validate landlord slug (same validation as user slug)
    validateUserSlug(landlordSlug);

    const payload = {
      otp: otp.trim(),
      landlord_slug: landlordSlug.trim() // Use landlord_slug as per API spec
    };

    console.log("🏢 Landlord Verification Request:", { 
      endpoint: '/landlord/verify/account',
      payload: { ...payload, otp: '****' } // Hide OTP in logs
    });

    // Make API call to landlord verification endpoint
    const response = await apiClient.post('/landlord/verify/account', payload);

    console.log("🏢 Landlord Verification Response:", {
      status_code: response.data?.data?.status_code,
      in_error: response.data?.data?.in_error,
      reason: response.data?.data?.reason
    });

    // Check for successful response structure (status_code "000" for success)
    if (response.data?.data?.status_code === "000" && !response.data?.data?.in_error) {
      const landlordData = response.data.data.data;
      
      return {
        success: true,
        data: response.data,
        userData: {
          id: landlordData.id,
          user_slug: landlordData.landlord_slug, // Map landlord_slug to user_slug for consistency
          landlord_slug: landlordData.landlord_slug,
          full_name: landlordData.full_name,
          email: landlordData.email,
          phone_number: landlordData.phone_number,
          user_type: landlordData.user_type,
          business_logo: landlordData.business_logo,
          business_name: landlordData.business_name,
          business_type: landlordData.business_type,
          business_registration_number: landlordData.business_registration_number,
          location: landlordData.location,
          region: landlordData.region,
          is_active: landlordData.is_active,
          is_verified: landlordData.is_verified,
          verification_channel: landlordData.verification_channel,
          verified_at: landlordData.verified_at,
          token: landlordData.token,
        },
        message: response.data.data.reason || response.data.data.message || "Landlord account verified successfully! Welcome to your property management dashboard.",
        token: landlordData.token
      };
    }
    
    const statusCode = response.data?.data?.status_code;
    const reason = response.data?.data?.reason;
    
    // Handle specific error codes
    if (statusCode === "004") {
      if (reason?.toLowerCase().includes("user account cannot be found")) {
        throw new Error("Landlord account not found. Please ensure you're using the correct verification link.");
      } else if (reason?.toLowerCase().includes("otp")) {
        throw new Error("Invalid or expired verification code. Please check your email for the latest code.");
      } else {
        throw new Error("Verification failed. Please check your code and try again.");
      }
    } else if (statusCode === "999") {
      throw new Error("Your verification code has expired. Please request a new one.");
    } else if (statusCode === "003") {
      throw new Error("Account is already verified. You can proceed to login.");
    } else {
      throw new Error(reason || "Verification failed. Please try again.");
    }

  } catch (error) {
    console.error("🚨 Landlord verification error:", error);

    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Verification failed. Please try again.";

      // Handle API error responses
      if (data?.data?.reason) {
        errorMessage = data.data.reason;
      } else if (data?.message) {
        errorMessage = data.message;
      }

      // Enhanced error handling based on HTTP status codes
      switch (status) {
        case 400:
          errorMessage = "Invalid verification request. Please check your input and try again.";
          break;
        case 401:
          errorMessage = "Unauthorized access. Please login again and retry verification.";
          break;
        case 404:
          errorMessage = "Landlord verification service not found. Please contact support.";
          break;
        case 422:
          errorMessage = data?.data?.reason || "Invalid verification data provided.";
          break;
        case 429:
          errorMessage = "Too many verification attempts. Please wait 5 minutes before trying again.";
          break;
        case 500:
          errorMessage = "Server error occurred. Our team has been notified. Please try again later.";
          break;
        case 503:
          errorMessage = "Verification service temporarily unavailable. Please try again in a few minutes.";
          break;
        default:
          errorMessage = data?.data?.reason || `Verification failed with error ${status}. Please try again.`;
      }

      return {
        success: false,
        error: errorMessage,
        status,
        data: data || null
      };
    }

    if (error.request) {
      return {
        success: false,
        error: "Network connection failed. Please check your internet connection and try again.",
        status: null,
        data: null
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred during verification. Please try again.",
      status: null,
      data: null
    };
  }
};

// * Resend landlord verification OTP
export const resendLandlordVerificationOTP = async (emailOrPhone) => {
  try {
    // Validate input - could be email or phone
    if (!emailOrPhone || emailOrPhone.trim().length === 0) {
      throw new Error("Email or phone number is required");
    }

    const input = emailOrPhone.trim();
    
    // Check if it's an email or phone number for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^233[0-9]{9}$/;
    
    if (!emailRegex.test(input) && !phoneRegex.test(input)) {
      throw new Error("Please enter a valid email address or Ghana phone number (233XXXXXXXXX)");
    }

    const payload = {
      emailOrPhone: input
    };

    // Mask sensitive data in logs
    const maskedInput = emailRegex.test(input) 
      ? input.replace(/(.{3}).*(@.*)/, '$1***$2') // Mask email
      : input.replace(/(.{6})(.*)/, '$1***'); // Mask phone

    console.log("🏢 Landlord Resend OTP Request:", { 
      endpoint: '/landlord/resend/verificationCode',
      emailOrPhone: maskedInput,
      inputType: emailRegex.test(input) ? 'email' : 'phone'
    });

    const response = await apiClient.post('/landlord/resend/verificationCode', payload);

    console.log("🏢 Landlord Resend OTP Response:", {
      status_code: response.data?.data?.status_code,
      in_error: response.data?.data?.in_error,
      reason: response.data?.data?.reason
    });

    // Check for successful response (status_code "000" for success)
    if (response.data?.data?.status_code === "000" && !response.data?.data?.in_error) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      const successMessage = isEmail 
        ? "New verification code sent to your email! Please check your inbox."
        : "New verification code sent to your phone! Please check your SMS.";
        
      return {
        success: true,
        data: response.data,
        message: response.data.data.reason || response.data.data.message || successMessage
      };
    }

    const statusCode = response.data?.data?.status_code;
    const reason = response.data?.data?.reason;
    
    // Handle specific error codes
    if (statusCode === "004") {
      if (reason?.toLowerCase().includes("rentor cannot be found") || reason?.toLowerCase().includes("landlord cannot be found")) {
        throw new Error("Landlord account not found. Please ensure you're using the correct email address or phone number.");
      } else {
        throw new Error("Unable to send verification code. Please check your email/phone and try again.");
      }
    } else if (statusCode === "429") {
      throw new Error("Too many resend attempts. Please wait 5 minutes before requesting another code.");
    } else {
      throw new Error(reason || "Failed to resend verification code. Please try again.");
    }

  } catch (error) {
    console.error("🚨 Resend landlord verification error:", error);

    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Failed to resend verification code. Please try again.";

      // Handle API error responses
      if (data?.data?.reason) {
        errorMessage = data.data.reason;
      } else if (data?.message) {
        errorMessage = data.message;
      }

      // Enhanced error handling based on HTTP status codes
      switch (status) {
        case 400:
          errorMessage = "Invalid resend request. Please check your email address and try again.";
          break;
        case 401:
          errorMessage = "Unauthorized access. Please login again and retry.";
          break;
        case 404:
          errorMessage = "Landlord resend service not found. Please contact support.";
          break;
        case 422:
          errorMessage = data?.data?.reason || "Unable to resend code. Please check your email address or phone number.";
          break;
        case 429:
          errorMessage = "Too many resend attempts. Please wait 5 minutes before trying again.";
          break;
        case 500:
          errorMessage = "Server error occurred. Our team has been notified. Please try again later.";
          break;
        case 503:
          errorMessage = "Email service temporarily unavailable. Please try again in a few minutes.";
          break;
        default:
          errorMessage = data?.data?.reason || `Failed to resend code with error ${status}. Please try again.`;
      }

      return {
        success: false,
        error: errorMessage,
        status,
        data: data || null
      };
    }

    if (error.request) {
      return {
        success: false,
        error: "Network connection failed. Please check your internet connection and try again.",
        status: null,
        data: null
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred while resending code. Please try again.",
      status: null,
      data: null
    };
  }
};

export default {
  verifyLandlordAccount,
  resendLandlordVerificationOTP,
  validateOTP,
  validateUserSlug,
  validateEmail
}; 