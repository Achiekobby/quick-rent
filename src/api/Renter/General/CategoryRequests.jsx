import axios from "axios";
import Config from "../../../utils/Config";
const BASE_URL = `${Config.baseUrl}`;

class CategoryRequests {
  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  async getCategoryStats() {
    try {
      const response = await axios.get(
        `${BASE_URL}/properties/allCategories`,
        this.getHeaders()
      );
      return {
        success: true,
        message: "Category stats fetched successfully",
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch category stats",
        data: null,
      };
    }
  }
}

const categoryRequests = new CategoryRequests();
export default categoryRequests;
