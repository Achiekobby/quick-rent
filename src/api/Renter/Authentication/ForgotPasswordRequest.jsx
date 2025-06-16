import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = Config.baseUrl;

//Todo => Forgot password request
export const forgotPasswordRequest = async (emailOrPhone) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/rentor/email/resetpassword`,
      {
        emailOrPhone: emailOrPhone,
      }
    );

    if (
      response.data?.data?.status_code === "000" &&
      !response.data?.data?.in_error
    ) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.data.message || "OTP sent successfully",
      };
    } else {
      return {
        success: false,
        message: response.data?.data?.reason || "Failed to send reset code",
        error: response.data?.data?.reason,
      };
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.data?.reason ||
        error.response.data?.message ||
        "Failed to send reset code";
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

export default forgotPasswordRequest;
