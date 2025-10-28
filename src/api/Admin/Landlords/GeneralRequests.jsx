import axios from "axios";
import Config from "../../../utils/Config";
const BASE_URL = `${Config.baseUrl}/admin/landlord`;

class GeneralRequests {
  constructor() {
    // Headers are now generated dynamically for each request
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async getLandlords() {
    const response = await axios.get(`${BASE_URL}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateAccountStatus(payload) {
    const response = await axios.post(`${BASE_URL}/update/account`, payload, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getLandlordProperties(landlord_slug) {
    const response = await axios.get(
      `${BASE_URL}/properties/${landlord_slug}`,
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async createLandlord(payload) {
    const response = await axios.post(`${BASE_URL}/create/landlord`, payload, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createPropertyForLandlord(landlordSlug, payload) {
    const response = await axios.post(
      `${BASE_URL}/properties/create/${landlordSlug}`,
      payload,
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async updateLandlordDetails(landlordSlug, payload) {
    const response = await axios.post(
      `${BASE_URL}/update/landlord_account`,
      payload,
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }
}
const generalRequests = new GeneralRequests();
export default generalRequests;
