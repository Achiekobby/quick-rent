import axios from "axios";
import Config from "../../../utils/Config";

class PropertiesServices {
  constructor() {
    // Headers are now generated dynamically for each request
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async createLandlordProperty(payload) {
    const response = await axios.post(
      `${Config.baseUrl}/admin/properties/create/landlord_property`,
      payload,
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }
}

const propertiesServices = new PropertiesServices();
export default propertiesServices;
