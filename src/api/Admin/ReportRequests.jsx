import axios from "axios";
import Config from "../..//utils/Config";
const BASE_URL = `${Config.baseUrl}/admin`;

class ReportRequests {
  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async getReportsStats() {
    try {
      const response = await axios.get(`${BASE_URL}/report/get_report_stats`, {
        headers: this.getHeaders(),
      });
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Reports stats fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to get reports stats",
      };
    }
  }

  async getReports() {
    try {
      const response = await axios.get(`${BASE_URL}/report/get_all_reports`, {
        headers: this.getHeaders(),
      });
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Reports fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to get reports",
      };
    }
  }

  async getReport(reportSlug) {
    try {
      const response = await axios.get(
        `${BASE_URL}/report/get_single_report/${reportSlug}`,
        {
          headers: this.getHeaders(),
        }
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Report fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to get report",
      };
    }
  }

  async updateReportStatus(reportSlug, payload) {
    try {
      // payload can be either a string (status) or an object { status: "..." }
      const requestPayload = typeof payload === 'string' 
        ? { status: payload } 
        : payload;
      
      const response = await axios.put(
        `${BASE_URL}/report/update_report/${reportSlug}`,
        requestPayload,
        {
          headers: this.getHeaders(),
        }
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Report updated successfully",
        in_error: false,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to update report",
        in_error: true,
        reason: error.response?.data?.reason || "Failed to update report",
      };
    }
  }

  async getLandlordReports(landlordSlug) {
    try {
      const response = await axios.get(
        `${BASE_URL}/report/get_landlord_reports/${landlordSlug}`,
        {
          headers: this.getHeaders(),
        }
      );
      return {
        status: true,
        data: response.data.data,
        message:
          response.data.message || "Landlord reports fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to get landlord reports",
      };
    }
  }
}

const reportRequests = new ReportRequests();
export default reportRequests;
