import axios from "axios";
import Config from "../../utils/Config";

const BASE_URL = `${Config.baseUrl}/admin/reviews`;

class ReviewRequests {
  constructor() {
    // Headers are now generated dynamically for each request
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  /**
   * Get all reviews for moderation
   * @param {object} filters - Optional filters (status, rating, date_from, date_to)
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Reviews fetched successfully",
   *   "data": {
   *     "reviews": [
   *       {
   *         "id": 1,
   *         "review_id": "REV-001",
   *         "landlord_id": 123,
   *         "landlord_name": "John Doe",
   *         "landlord_slug": "john-doe-properties",
   *         "reviewer_id": 456,
   *         "reviewer_name": "Jane Smith",
   *         "reviewer_email": "jane@example.com",
   *         "reviewer_avatar": "https://...",
   *         "rating": 4,
   *         "comment": "Great landlord, very responsive...",
   *         "status": "pending",
   *         "is_flagged": false,
   *         "flag_reason": null,
   *         "rejection_reason": null,
   *         "moderated_by": null,
   *         "moderated_at": null,
   *         "created_at": "2024-01-15T10:30:00Z",
   *         "updated_at": "2024-01-15T10:30:00Z"
   *       }
   *     ],
   *     "pagination": {
   *       "current_page": 1,
   *       "total_pages": 10,
   *       "total_reviews": 100,
   *       "per_page": 10
   *     }
   *   }
   * }
   */
  async getAllReviews(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${BASE_URL}?${params}` : BASE_URL;
    
    const response = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get a single review by ID
   * @param {number} reviewId - Review ID
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Review fetched successfully",
   *   "data": {
   *     "review": { ...same structure as above... }
   *   }
   * }
   */
  async getReviewById(reviewId) {
    const response = await axios.get(`${BASE_URL}/${reviewId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Moderate a review (approve or reject)
   * @param {object} payload - Moderation data
   * @returns {Promise}
   * 
   * Expected Request Body:
   * {
   *   "review_id": 1,
   *   "action": "approve", // "approve" or "reject"
   *   "rejection_reason": "Contains profanity and offensive content" // Required if action is "reject"
   * }
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Review approved successfully",
   *   "data": {
   *     "review": { ...updated review... }
   *   }
   * }
   */
  async moderateReview(payload) {
    const response = await axios.post(`${BASE_URL}/moderate`, payload, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get review statistics
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Stats fetched successfully",
   *   "data": {
     *     "total": 500,
     *     "pending": 50,
     *     "approved": 400,
     *     "rejected": 50,
   *     "by_rating": {
   *       "5": 200,
   *       "4": 150,
   *       "3": 100,
   *       "2": 30,
   *       "1": 20
   *     },
   *     "average_rating": 4.2,
   *     "recent_trend": {
   *       "this_week": 15,
   *       "last_week": 20,
   *       "this_month": 65,
   *       "last_month": 70
   *     },
   *     "moderation_time": {
   *       "average_hours": 12,
   *       "median_hours": 8
   *     }
   *   }
   * }
   */
  async getReviewStats() {
    const response = await axios.get(`${BASE_URL}/stats`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get reviews for a specific landlord
   * @param {string} landlordSlug - Landlord slug
   * @returns {Promise}
   */
  async getLandlordReviews(landlordSlug) {
    const response = await axios.get(`${BASE_URL}/landlord/${landlordSlug}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Delete a review (hard delete - use with caution)
   * @param {number} reviewId - Review ID
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Review deleted successfully"
   * }
   */
  async deleteReview(reviewId) {
    const response = await axios.delete(`${BASE_URL}/${reviewId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get pending reviews count (for notifications)
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Count fetched successfully",
   *   "data": {
   *     "pending_count": 15
   *   }
   * }
   */
  async getPendingCount() {
    const response = await axios.get(`${BASE_URL}/pending-count`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

const reviewRequests = new ReviewRequests();
export default reviewRequests;

