import axios from "axios";
import Config from "../../../utils/Config";
const BASE_URL = `${Config.baseUrl}/`;

class ReportRequests {
  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("quick_renter_token")}`,
      },
    };
  }

  async submitReport(payload) {
    try {
      const response = await axios.post(
        `${BASE_URL}rentor/report_landlord`,
        payload,
        this.getHeaders()
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.message || "Report submitted successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.message || "Failed to submit report",
      };
    }
  }

  async updateReport(reportSlug, payload) {
    try {
      const response = await axios.put(
        `${BASE_URL}rentor/update_report/${reportSlug}`,
        payload,
        this.getHeaders()
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.reason || "Report updated successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.reason || "Failed to update report",
      };
    }
  }

  async getReports() {
    try {
      const response = await axios.get(
        `${BASE_URL}rentor/my_reports`,
        this.getHeaders()
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.reason || "Reports fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.reason || "Failed to get reports",
      };
    }
  }

  async deleteReport(reportSlug) {
    try {
      const response = await axios.delete(
        `${BASE_URL}rentor/delete_report/${reportSlug}`,
        this.getHeaders()
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.reason || "Report deleted successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.reason || "Failed to delete report",
      };
    }
  }

  async getReport(reportSlug) {
    try {
      const response = await axios.get(
        `${BASE_URL}rentor/show_report/${reportSlug}`,
        this.getHeaders()
      );
      return {
        status: true,
        data: response.data.data,
        message: response.data.reason || "Report fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        message: error.response?.data?.reason || "Failed to get report",
      };
    }
  }
}

const reportRequests = new ReportRequests();
export default reportRequests;
