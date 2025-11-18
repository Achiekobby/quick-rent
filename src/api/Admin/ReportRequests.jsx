import axios from "axios";
import Config from "../../utils/Config";

const BASE_URL = `${Config.baseUrl}/admin/reports`;

class ReportRequests {
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
   * Get all landlord reports
   * @param {object} filters - Optional filters (status, reason, date_from, date_to)
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Reports fetched successfully",
   *   "data": {
   *     "reports": [
   *       {
   *         "id": 1,
   *         "report_id": "RPT-001",
   *         "landlord_id": 123,
   *         "landlord_name": "John Doe",
   *         "landlord_slug": "john-doe-properties",
   *         "landlord_email": "john@example.com",
   *         "landlord_phone": "+1234567890",
   *         "reporter_id": 456,
   *         "reporter_name": "Jane Smith",
   *         "reporter_email": "jane@example.com",
   *         "reason": "unresponsive",
   *         "custom_reason": null,
   *         "description": "Detailed description...",
   *         "status": "pending",
   *         "admin_notes": null,
   *         "reviewed_by": null,
   *         "reviewed_at": null,
   *         "created_at": "2024-01-15T10:30:00Z",
   *         "updated_at": "2024-01-15T10:30:00Z"
   *       }
   *     ],
   *     "pagination": {
   *       "current_page": 1,
   *       "total_pages": 5,
   *       "total_reports": 50,
   *       "per_page": 10
   *     }
   *   }
   * }
   */
  async getAllReports(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${BASE_URL}?${params}` : BASE_URL;
    
    const response = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get a single report by ID
   * @param {number} reportId - Report ID
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Report fetched successfully",
   *   "data": {
   *     "report": { ...same structure as above... }
   *   }
   * }
   */
  async getReportById(reportId) {
    const response = await axios.get(`${BASE_URL}/${reportId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Update report status
   * @param {object} payload - Report update data
   * @returns {Promise}
   * 
   * Expected Request Body:
   * {
   *   "report_id": 1,
   *   "action": "investigate", // "investigate", "resolve", "dismiss"
   *   "admin_notes": "Investigation started, contacting both parties..."
   * }
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Report status updated successfully",
   *   "data": {
   *     "report": { ...updated report... }
   *   }
   * }
   */
  async updateReportStatus(payload) {
    const response = await axios.post(`${BASE_URL}/update-status`, payload, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get reports statistics
   * @returns {Promise}
   * 
   * Expected Response:
   * {
   *   "status_code": "000",
   *   "in_error": false,
   *   "reason": "Stats fetched successfully",
   *   "data": {
   *     "total": 100,
   *     "pending": 25,
   *     "under_investigation": 15,
   *     "resolved": 50,
   *     "dismissed": 10,
   *     "by_reason": {
   *       "fraud": 10,
   *       "harassment": 15,
   *       "discrimination": 5,
   *       "unsafe": 20,
   *       "unresponsive": 30,
   *       "contract_violation": 15,
   *       "other": 5
   *     },
   *     "recent_trend": {
   *       "this_week": 5,
   *       "last_week": 8,
   *       "this_month": 20,
   *       "last_month": 18
   *     }
   *   }
   * }
   */
  async getReportStats() {
    const response = await axios.get(`${BASE_URL}/stats`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Get reports for a specific landlord
   * @param {string} landlordSlug - Landlord slug
   * @returns {Promise}
   */
  async getLandlordReports(landlordSlug) {
    const response = await axios.get(`${BASE_URL}/landlord/${landlordSlug}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  /**
   * Bulk update reports
   * @param {object} payload - Bulk update data
   * @returns {Promise}
   * 
   * Expected Request Body:
   * {
   *   "report_ids": [1, 2, 3],
   *   "action": "dismiss",
   *   "admin_notes": "Bulk dismissal - spam reports"
   * }
   */
  async bulkUpdateReports(payload) {
    const response = await axios.post(`${BASE_URL}/bulk-update`, payload, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

}

const reportRequests = new ReportRequests();
export default reportRequests;

