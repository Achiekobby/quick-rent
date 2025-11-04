import axios from "axios";
import Config from "../..//utils/Config";
const BASE_URL = `${Config.baseUrl}/admin`;

class DashboardRequests {
  constructor() {
    // Headers are now generated dynamically for each request
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async getDashboardData() {
    const response = await axios.get(`${BASE_URL}/dashboardStats`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getAllProperties() {
    const response = await axios.get(`${Config.baseUrl}/admin/properties`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
      },
    });
    return response.data;
  }

  async updatePropertyStatus(propertySlug, status) {
    const response = await axios.post(
      `${BASE_URL}/properties/status`,
      { property_slug: propertySlug, status: status },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getSubscriptionPayments() {
    try {
      const response = await axios.get(`${BASE_URL}/transactions`, {
        headers: this.getHeaders(),
      });

      // Handle nested data structure: response.data.data.data
      const responseData = response?.data?.data || response?.data;
      const paymentsArray = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      return {
        status: true,
        status_code: responseData?.status_code || "000",
        data: paymentsArray,
        message:
          responseData?.message || "Subscription payments fetched successfully",
      };
    } catch (error) {
      console.error("Subscription payments error:", error);
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch subscription payments",
      };
    }
  }

  async getLandlordSubscriptions() {
    try {
      const response = await axios.get(`${BASE_URL}/landlord_subscriptions`, {
        headers: this.getHeaders(),
      });

      const responseData = response?.data?.data || response?.data;
      const subscriptionsArray = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      return {
        status: true,
        status_code: responseData?.status_code || "000",
        data: subscriptionsArray,
        message:
          responseData?.message ||
          "Landlord subscriptions fetched successfully",
      };
    } catch (error) {
      console.error("Landlord subscriptions error:", error);
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch landlord subscriptions",
      };
    }
  }

  async getSubscriptionStats() {
    try {
      const response = await axios.get(`${BASE_URL}/subscription_stats`, {
        headers: this.getHeaders(),
      });
      return {
        status: true,
        status_code: response?.data?.data?.status_code || "000",
        data: response?.data?.data || [],
        message:
          response?.data?.data?.message ||
          "Subscription stats fetched successfully",
      };
    } catch (error) {
      console.error("Subscription stats error:", error);
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch subscription stats",
      };
    }
  }
}

const dashboardRequests = new DashboardRequests();
export default dashboardRequests;
