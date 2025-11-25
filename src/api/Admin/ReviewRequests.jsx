import axios from "axios";
import Config from "../..//utils/Config";
const BASE_URL = `${Config.baseUrl}/admin`;

class ReviewRequests {
  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async getReviews() {
    try {
      const response = await axios.get(`${BASE_URL}/reviews/get_all_reviews`, {
        headers: this.getHeaders(),
      });
      return {
        status: true,
        data: response.data?.data,
        message: response.data?.message || "Reviews fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to get reviews",
      };
    }
  }

  async getReview(reviewSlug) {
    try {
      const response = await axios.get(
        `${BASE_URL}/reviews/get_single_review/${reviewSlug}`,
        { headers: this.getHeaders() }
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Review fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to get review",
      };
    }
  }

  async updateReviewStatus(reviewSlug, status) {
    try {
      // status should be "true" for approve or "false" for reject
      const payload = { status };
      const response = await axios.put(
        `${BASE_URL}/reviews/update_review/${reviewSlug}`,
        payload,
        { headers: this.getHeaders() }
      );
      return {
        status: true,
        data: response.data?.data || response.data,
        message: response.data?.message || "Review status updated successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to update review status",
      };
    }
  }

  async deleteReview(reviewSlug) {
    try {
      const response = await axios.delete(
        `${BASE_URL}/reviews/delete_review/${reviewSlug}`,
        { headers: this.getHeaders() }
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Review deleted successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to delete review",
      };
    }
  }

  async getPendingReviewCount() {
    try {
      const response = await axios.get(
        `${BASE_URL}/reviews/get_pending_review_count`,
        { headers: this.getHeaders() }
      );
      return {
        status: true,
        data: response.data.data,
        message:
          response.data.message || "Pending review count fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to get pending review count",
      };
    }
  }
}

const reviewRequests = new ReviewRequests();
export default reviewRequests;
