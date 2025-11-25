import axios from "axios";
import Config from "../../utils/Config";
const BASE_URL = `${Config.baseUrl}/admin`;

class FeedbackRequests {
  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
      },
    };
  }
  async getFeedbacks() {
    try {
      const response = await axios.get(
        `${BASE_URL}/get_landlord_reviews`,
        this.getHeaders()
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Feedbacks fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.reason || "Failed to get feedbacks",
      };
    }
  }
}
const feedbackRequests = new FeedbackRequests();
export default feedbackRequests;
