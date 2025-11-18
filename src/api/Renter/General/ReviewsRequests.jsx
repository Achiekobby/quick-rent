import { axiosInstance } from "../../axiosInstance";

/**
 * Submit a review for a landlord
 * Reviews are landlord-focused and will appear on all properties by that landlord
 * @param {string} landlordSlug - The landlord slug
 * @param {object} reviewData - The review data { rating: number, comment: string }
 * @returns {Promise} - API response
 * 
 * Expected Request Body:
 * {
 *   "rating": 5,        // Integer between 1-5
 *   "comment": "Great landlord! Very responsive and professional."
 * }
 * 
 * Expected Response:
 * {
 *   "status_code": "000",
 *   "in_error": false,
 *   "reason": "Review submitted successfully",
 *   "data": {
 *     "id": 123,
 *     "reviewer_name": "John Doe",
 *     "reviewer_avatar": "https://...",
 *     "rating": 5,
 *     "comment": "Great landlord! Very responsive and professional.",
 *     "created_at": "2024-01-15T10:30:00Z"
 *   }
 * }
 */
export const submitLandlordReview = async (landlordSlug, reviewData) => {
  const response = await axiosInstance.post(
    `/landlords/${landlordSlug}/reviews`,
    reviewData
  );
  return response;
};

/**
 * Fetch reviews for a landlord
 * These reviews will appear on all properties by this landlord
 * @param {string} landlordSlug - The landlord slug
 * @param {object} params - Query parameters { page: number, per_page: number }
 * @returns {Promise} - API response
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
 *         "reviewer_name": "John Doe",
 *         "reviewer_avatar": "https://example.com/avatar.jpg",
 *         "rating": 5,
 *         "comment": "Great landlord! Very responsive and professional.",
 *         "created_at": "2024-01-15T10:30:00Z"
 *       },
 *       {
 *         "id": 2,
 *         "reviewer_name": "Jane Smith",
 *         "reviewer_avatar": null,
 *         "rating": 4,
 *         "comment": "Good landlord, minor issues but overall satisfied.",
 *         "created_at": "2024-01-10T14:20:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "current_page": 1,
 *       "per_page": 10,
 *       "total": 25,
 *       "last_page": 3
 *     },
 *     "average_rating": 4.5,
 *     "total_reviews": 25
 *   }
 * }
 */
export const fetchLandlordReviews = async (landlordSlug, params = {}) => {
  const response = await axiosInstance.get(
    `/landlords/${landlordSlug}/reviews`,
    { params }
  );
  return response;
};

/**
 * Report a review
 * @param {string} landlordSlug - The landlord slug
 * @param {number} reviewId - The review ID
 * @param {object} reportData - The report data { reason: string }
 * @returns {Promise} - API response
 * 
 * Expected Request Body:
 * {
 *   "reason": "spam" // or "inappropriate", "offensive", etc.
 * }
 * 
 * Expected Response:
 * {
 *   "status_code": "000",
 *   "in_error": false,
 *   "reason": "Review reported successfully"
 * }
 */
export const reportReview = async (landlordSlug, reviewId, reportData) => {
  const response = await axiosInstance.post(
    `/landlords/${landlordSlug}/reviews/${reviewId}/report`,
    reportData
  );
  return response;
};

/**
 * Update a review (for the review owner)
 * @param {string} landlordSlug - The landlord slug
 * @param {number} reviewId - The review ID
 * @param {object} reviewData - Updated review data { rating: number, comment: string }
 * @returns {Promise} - API response
 */
export const updateReview = async (landlordSlug, reviewId, reviewData) => {
  const response = await axiosInstance.put(
    `/landlords/${landlordSlug}/reviews/${reviewId}`,
    reviewData
  );
  return response;
};

/**
 * Delete a review (for the review owner)
 * @param {string} landlordSlug - The landlord slug
 * @param {number} reviewId - The review ID
 * @returns {Promise} - API response
 */
export const deleteReview = async (landlordSlug, reviewId) => {
  const response = await axiosInstance.delete(
    `/landlords/${landlordSlug}/reviews/${reviewId}`
  );
  return response;
};

