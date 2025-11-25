import axios from "axios";
import Config from "../../../utils/Config";
const BASE_URL = Config.baseUrl;

class FeedbackRequest {
  getHeaders() {
    const token = localStorage.getItem("quick_landlord_token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async submitFeedback(data) {
    try {
      const response = await axios.post(`${BASE_URL}/landlord/landlord_rating`, data, {
        headers: this.getHeaders(),
      });

        return {
          status: true,
          data: response.data.data,
          message:
            response.data.reason || "Feedback submitted successfully",
        };
    } catch (error) {
      console.error("🚨 Feedback Submission Error:", error);
      return {
        status: false,
        data: null,
        message:
          error.response?.data?.reason ||
          error.response?.data?.message ||
          "Failed to submit feedback",
      };
    }
  }
}

const feedback = new FeedbackRequest();
export default feedback;
