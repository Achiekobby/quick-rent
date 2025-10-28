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
    const response = await axios.get(
      `${Config.baseUrl}/properties/allProperties`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
}

const dashboardRequests = new DashboardRequests();
export default dashboardRequests;
