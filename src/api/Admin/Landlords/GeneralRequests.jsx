import axios from "axios";
import Config from "../../../utils/Config";
const BASE_URL = `${Config.baseUrl}/admin/landlord`;

class GeneralRequests {

  constructor() {
    this.headers = {
      ContentType: "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`
    }
  }

  async getLandlords() {
    const response = await axios.get(`${BASE_URL}`,{
      headers: this.headers
    });
    return response.data;
  }

  async updateAccountStatus(payload){
    const response = await axios.post(`${BASE_URL}/update/account`, payload, {
      headers: this.headers
    });
    return response.data;
  }

  async getLandlordProperties(landlord_slug){
    const response = await axios.get(`${BASE_URL}/properties/${landlord_slug}`, {
      headers: this.headers
    });
    return response.data;
  }
}
const generalRequests = new GeneralRequests();
export default generalRequests;





