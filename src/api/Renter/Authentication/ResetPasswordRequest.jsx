import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

//Todo => Reset password request
export const resetPasswordRequest = async (userSlug, otp, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/rentor/resetpassword`, {
      user_slug: userSlug,
      otp: otp,
      password: password,
    });

    //Todo => Check if the response indicates success
    if (
      response.data?.data?.status_code === "000" &&
      !response.data?.data?.in_error
    ) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.data.message || "Password reset successful",
      };
    } else {
      return {
        success: false,
        message: response.data?.data?.reason || "Failed to reset password",
        error: response.data?.data?.reason,
      };
    }
  } catch (error) {
    //Todo =>  Handle different types of errors
    if (error.response) {
      const errorMessage =
        error.response.data?.data?.reason ||
        error.response.data?.message ||
        "Failed to reset password";
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        status: error.response.status,
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
        message: "An unexpected error occurred. Please try again.",
        error: error.message,
      };
    }
  }
};

export default resetPasswordRequest;
