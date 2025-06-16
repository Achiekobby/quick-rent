import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

//Todo => Configure axios defaults
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

//Todo => Convert file to base64
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    //Todo => Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      reject(
        new Error(
          "Invalid file type. Please upload a JPEG, PNG, or WebP image."
        )
      );
      return;
    }

    //Todo => Validate file size (4MB max)
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

//Todo => Validate landlord signup data
export const validateLandlordSignupData = (formData) => {
  const errors = {};

  //Todo => Full name validation
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

  //Todo => Gender validation (keeping this for backward compatibility)
  if (formData.gender) {
    const validGenders = ["Male", "Female", "Prefer not to say"];
    if (!validGenders.includes(formData.gender)) {
      errors.gender = "Please select a valid gender option";
    }
  }

  //Todo => Business name validation
  if (!formData.business_name || formData.business_name.trim().length < 2) {
    errors.business_name = "Business name must be at least 2 characters long";
  }

  //Todo => Business type validation
  const validBusinessTypes = [
    "Individual Property Owner",
    "Real Estate Company",
    "Property Management Company",
    "Investment Company",
    "Individual",
    "Other",
  ];
  if (!formData.business_type) {
    errors.business_type = "Business type is required";
  } else if (!validBusinessTypes.includes(formData.business_type)) {
    errors.business_type = "Please select a valid business type";
  }

  //Todo => Ghana region validation
  const ghanaRegions = [
    "Greater Accra",
    "Ashanti",
    "Western",
    "Central",
    "Eastern",
    "Northern",
    "Upper East",
    "Upper West",
    "Volta",
    "Brong-Ahafo",
    "Western North",
    "Ahafo",
    "Bono East",
    "Oti",
    "North East",
    "Savannah",
  ];
  if (!formData.region) {
    errors.region = "Region is required";
  } else if (!ghanaRegions.includes(formData.region)) {
    errors.region = "Please select a valid Ghana region";
  }

  //Todo => Location validation (city or custom location)
  if (!formData.location || formData.location.trim().length < 2) {
    errors.location = "Location is required";
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

  //Todo =>    Password confirmation validation
  if (!formData.password_confirmation) {
    errors.password_confirmation = "Password confirmation is required";
  } else if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = "Passwords do not match";
  }

  //Todo => Terms acceptance validation (keeping for backward compatibility)
  if (formData.accept_terms !== undefined && !formData.accept_terms) {
    errors.accept_terms = "You must accept the terms and conditions";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

//Todo => Register a new landlord
export const registerLandlord = async (userData, businessLogoFile = null) => {
  try {
    //Todo => Prepare the payload according to the API specification
    const payload = {
      full_name: userData.fullName?.trim(),
      email: userData.email?.trim().toLowerCase(),
      phone_number: userData.phone,
      business_name: userData.businessName?.trim(),
      business_type: userData.businessType,
      location: userData.location?.trim() || userData.city?.trim(),
      region: userData.region,
      password: userData.password,
      password_confirmation: userData.confirmPassword,
    };

    //Todo => Add optional business registration number if provided
    if (userData.businessRegistration?.trim()) {
      payload.business_registration_number =
        userData.businessRegistration.trim();
    }

    //Todo => Handle business logo upload if provided
    if (businessLogoFile) {
      try {
        const base64Image = await convertToBase64(businessLogoFile);
        if (base64Image) {
          payload.business_logo = base64Image;
        }
      } catch (imageError) {
        throw new Error(`Business logo upload failed: ${imageError.message}`);
      }
    }

    //Todo => Validate the payload
    const validation = validateLandlordSignupData({
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
      business_name: payload.business_name,
      business_type: payload.business_type,
      region: payload.region,
      location: payload.location,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    });

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(", ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    //Todo => Make the actual API call
    const response = await apiClient.post("/landlord/register", payload);
    const apiResponse = response.data.data;

    //Todo => Check the response structure for success
    if (apiResponse.status_code === "001" && !apiResponse.in_error) {
      return {
        success: true,
        data: response.data,
        message:
          apiResponse.reason ||
          apiResponse.message ||
          "Registration successful! Please check your email to verify your account.",
      };
    } else {
      //Todo => API returned an error in the response body
      throw new Error(
        apiResponse.reason || apiResponse.message || "Registration failed"
      );
    }
  } catch (error) {
    console.error("Registration error:", error);

    //Todo => Handle axios errors
    if (error.response) {
      const { status, data } = error.response;

      if (status === 422) {
        //Todo => Validation errors from the server
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
          error: errorMessages || "Validation failed",
        };
      } else if (status === 409) {
        //Todo => Conflict errors (email/phone already exists)
        return {
          success: false,
          error: data.message || "Email or phone number already exists",
        };
      } else if (status >= 500) {
        //Todo => Server errors
        return {
          success: false,
          error: "Server error. Please try again later.",
        };
      } else {
        //Todo => Other client errors
        return {
          success: false,
          error: data.message || "Registration failed. Please try again.",
        };
      }
    } else if (error.request) {
      //Todo => Network error - request was made but no response received
      return {
        success: false,
        error:
          "Network error. Please check your internet connection and try again.",
      };
    } else if (error.code === "ECONNABORTED") {
      //Todo => Request timeout
      return {
        success: false,
        error: "Request timeout. Please try again.",
      };
    }

    //Todo => Handle validation errors
    if (error.message.includes("Validation failed")) {
      return {
        success: false,
        error: error.message.replace("Validation failed: ", ""),
      };
    }

    //Todo => Handle business logo upload errors
    if (error.message.includes("Business logo upload failed")) {
      return {
        success: false,
        error: error.message,
      };
    }

    //Todo => Return the actual error message
    return {
      success: false,
      error: error.message || "Registration failed. Please try again.",
    };
  }
};

//Todo => Check email availability (placeholder - no API endpoint available)
export const checkEmailAvailability = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    available: true,
    message: "Email availability check not implemented",
  };
};

//Todo => Check phone availability (placeholder - no API endpoint available)
export const checkPhoneAvailability = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    available: true,
    message: "Phone availability check not implemented",
  };
};

//Todo => Get Ghana regions and major cities
export const getGhanaRegionsAndCities = () => {
  return {
    "Greater Accra": [
      "Accra",
      "Tema",
      "Kasoa",
      "Madina",
      "Adenta",
      "Teshie",
      "Nungua",
      "Other",
    ],
    Ashanti: [
      "Kumasi",
      "Obuasi",
      "Ejisu",
      "Mampong",
      "Konongo",
      "Bekwai",
      "Other",
    ],
    Western: [
      "Sekondi-Takoradi",
      "Tarkwa",
      "Axim",
      "Half Assini",
      "Prestea",
      "Other",
    ],
    Central: [
      "Cape Coast",
      "Elmina",
      "Winneba",
      "Kasoa",
      "Swedru",
      "Agona Swedru",
      "Other",
    ],
    Eastern: ["Koforidua", "Akosombo", "Nkawkaw", "Mpraeso", "Begoro", "Other"],
    Northern: ["Tamale", "Yendi", "Savelugu", "Gushegu", "Karaga", "Other"],
    "Upper East": ["Bolgatanga", "Navrongo", "Bawku", "Zebilla", "Other"],
    "Upper West": ["Wa", "Lawra", "Jirapa", "Tumu", "Other"],
    Volta: ["Ho", "Hohoe", "Keta", "Aflao", "Denu", "Other"],
    "Brong-Ahafo": [
      "Sunyani",
      "Techiman",
      "Berekum",
      "Dormaa Ahenkro",
      "Other",
    ],
    "Western North": ["Sefwi Wiawso", "Bibiani", "Juaboso", "Other"],
    Ahafo: ["Goaso", "Hwidiem", "Bechem", "Other"],
    "Bono East": ["Techiman", "Atebubu", "Kintampo", "Other"],
    Oti: ["Dambai", "Nkwanta", "Kadjebi", "Other"],
    "North East": ["Nalerigu", "Gambaga", "Walewale", "Other"],
    Savannah: ["Damongo", "Bole", "Salaga", "Other"],
  };
};
