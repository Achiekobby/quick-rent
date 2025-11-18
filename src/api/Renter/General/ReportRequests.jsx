import { axiosInstance } from "../../axiosInstance";

/**
 * Report a landlord
 * @param {string} landlordSlug - The landlord slug
 * @param {object} reportData - The report data
 * @returns {Promise} - API response
 * 
 * Expected Request Body:
 * {
 *   "reason": "fraud", // One of: fraud, harassment, discrimination, unsafe, unresponsive, contract_violation, other
 *   "custom_reason": "Specific reason if other", // Required if reason is "other"
 *   "description": "Detailed description of the issue..."
 * }
 * 
 * Expected Response:
 * {
 *   "status_code": "000",
 *   "in_error": false,
 *   "reason": "Report submitted successfully",
 *   "data": {
 *     "report_id": 123,
 *     "status": "pending",
 *     "created_at": "2024-01-15T10:30:00Z"
 *   }
 * }
 */
export const reportLandlord = async (landlordSlug, reportData) => {
  const response = await axiosInstance.post(
    `/landlords/${landlordSlug}/report`,
    reportData
  );
  return response;
};

/**
 * Get user's report history (optional)
 * @returns {Promise} - API response
 * 
 * Expected Response:
 * {
 *   "status_code": "000",
 *   "in_error": false,
 *   "reason": "Reports fetched successfully",
 *   "data": {
 *     "reports": [
 *       {
 *         "id": 123,
 *         "landlord_name": "John Doe",
 *         "landlord_slug": "john-doe-properties",
 *         "reason": "unresponsive",
 *         "status": "reviewed",
 *         "created_at": "2024-01-15T10:30:00Z"
 *       }
 *     ]
 *   }
 * }
 */
export const getUserReports = async () => {
  const response = await axiosInstance.get('/reports/my-reports');
  return response;
};

