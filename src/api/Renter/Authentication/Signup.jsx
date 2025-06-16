import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;
const headers = Config.guestHeaders;

// * Convert the file to base64
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    //Todo => Validate the file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      reject(
        new Error(
          "Invalid file type. Please upload a JPEG, PNG, or WebP image."
        )
      );
      return;
    }

    // Todo => Validate the file size
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(
        new Error(
          "File size too large. Please upload an image smaller than 4MB."
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      resolve(base64);
    };

    reader.onerror = (error) => {
      reject(new Error("Failed to read file: " + error.message));
    };

    reader.readAsDataURL(file);
  });
};

//Todo => Validate signup data
export const validateSignupData = (formData) => {
  const errors = {};

  if (!formData.full_name || formData.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters long";
  }

  //Todo => Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  //Todo => Phone number validation (Ghana format)
  const phoneRegex = /^233[0-9]{9}$/;
  if (!formData.phone_number) {
    errors.phone_number = "Phone number is required";
  } else if (!phoneRegex.test(formData.phone_number)) {
    errors.phone_number =
      "Please enter a valid Ghana phone number (233XXXXXXXXX)";
  }

  //Todo => Gender validation
  const validGenders = ["Male", "Female", "Prefer not to say"];
  if (!formData.gender) {
    errors.gender = "Gender is required";
  } else if (!validGenders.includes(formData.gender)) {
    errors.gender = "Please select a valid gender option";
  }

  //Todo => Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else {
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      errors.password =
        "Password must contain at least one special character (@$!%*?&)";
    }
  }

  //Todo => Password confirmation validation
  if (!formData.password_confirmation) {
    errors.password_confirmation = "Password confirmation is required";
  } else if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

//Todo => Register a new renter
export const registerRenter = async (userData, avatarFile = null) => {
  try {
    //Todo => Prepare the payload
    const payload = {
      full_name: userData.fullName?.trim(),
      email: userData.email?.trim().toLowerCase(),
      phone_number: userData.phone,
      gender: userData.gender,
      profile_picture: "", // Default to empty string
      password: userData.password,
      password_confirmation: userData.confirmPassword,
    };

    //Todo => Handle avatar upload if provided
    if (avatarFile) {
      try {
        const base64Image = await convertToBase64(avatarFile);
        if (base64Image && !base64Image.startsWith("data:image/")) {
          const fileType = avatarFile.type || "image/png";
          payload.profile_picture = `data:${fileType};base64,${base64Image}`;
        } else {
          payload.profile_picture = base64Image;
        }
      } catch (imageError) {
        throw new Error(`Avatar upload failed: ${imageError.message}`);
      }
    }

    //Todo => Validate the payload
    const validation = validateSignupData({
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
      gender: payload.gender,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    });

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    //Todo => Make the API call
    const response = await axios.post(`${BASE_URL}/rentor/register`, payload, {
      headers,
      timeout: 30000,
    });

    //Todo => Handle successful response
    if (response.data) {
      return {
        success: true,
        data: response.data,
        message:
          response.data.message ||
          "Registration successful! Welcome to Quick Rent.",
      };
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    //Todo => Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "Registration failed. Please try again.";
      let fieldErrors = {};

      if (data) {
        if (data.message) {
          errorMessage = data.message;
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
        case 422:
          errorMessage = "Please check your information and try again.";
          break;
        case 409:
          errorMessage =
            "An account with this email or phone number already exists.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        case 429:
          errorMessage =
            "Too many attempts. Please wait a moment and try again.";
          break;
      }

      return {
        success: false,
        message: errorMessage,
        fieldErrors,
        status,
      };
    } else if (error.request) {
      //Todo => Network error
      return {
        success: false,
        message:
          "Network error. Please check your internet connection and try again.",
      };
    } else {
      //Todo => Other error (validation, etc.)
      return {
        success: false,
        message:
          error.message || "An unexpected error occurred. Please try again.",
      };
    }
  }
};

//Todo => Check if email is available
export const checkEmailAvailability = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/check-email`, {
      email: email.trim().toLowerCase(),
    });

    return response.data.available === true;
  } catch (error) {
    console.warn("Email availability check failed:", error.message);
    return true;
  }
};

//Todo => Check if phone is available
export const checkPhoneAvailability = async (phone) => {
  try {
    const response = await axios.post(`${BASE_URL}/check-phone`, {
      phone_number: phone,
    });

    return response.data.available === true;
  } catch (error) {
    console.warn("Phone availability check failed:", error.message);
    return true;
  }
};

export default {
  registerRenter,
  convertToBase64,
  validateSignupData,
  checkEmailAvailability,
  checkPhoneAvailability,
};
