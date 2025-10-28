import axios from "axios";
import Config from "../../utils/Config";
const BASE_URL = `${Config.baseUrl}/admin`;

class PropertyRequests {
  constructor() {
    // Headers are now generated dynamically for each request
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async getAllProperties() {
    const response = await axios.get(`${Config.baseUrl}/properties/mixedProperties`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  async updatePropertyStatus(propertySlug, status) {
    const response = await axios.put(
      `${BASE_URL}/properties/${propertySlug}/status`,
      { approval_status: status },
      { headers: this.headers }
    );
    return response.data;
  }
}

const propertyRequests = new PropertyRequests();
export default propertyRequests; 