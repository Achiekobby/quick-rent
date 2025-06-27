import axios from "axios";
import Config from "../../../utils/Config";
const BASE_URL = `${Config.baseUrl}/admin/rentor`;

class GeneralRentersRequests {
  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async getRenters() {
    const response = await axios.get(`${BASE_URL}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async updateAccountStatus(payload) {
    const response = await axios.post(`${BASE_URL}/update/account`, payload, {
      headers: this.headers,
    });
    return response.data;
  }

  async getRenterDetails(renterSlug) {
    const response = await axios.get(`${BASE_URL}/${renterSlug}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async getRenterBookings(renterSlug) {
    const response = await axios.get(`${BASE_URL}/bookings/${renterSlug}`, {
      headers: this.headers,
    });
    return response.data;
  }
}

const generalRentersRequests = new GeneralRentersRequests();
export default generalRentersRequests;
