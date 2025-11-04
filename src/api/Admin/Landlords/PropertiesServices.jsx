import axios from "axios";
import Config from "../../../utils/Config";

class PropertiesServices {
  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_admin_token")}`,
    };
  }

  async createLandlordProperty(payload) {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/admin/properties/create/landlord_property`,
        payload,
        {
          headers: this.getHeaders(),
        }
      );
      return {
        status: true,
        status_code: response?.data?.data?.status_code || "000",
        data: response?.data?.data || [],
        message:
          response?.data?.data?.message || "Property created successfully",
      };
    } catch (error) {
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to create property",
      };
    }
  }

  async editLandlordProperty(payload) {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/admin/properties/edit/landlord_property`,
        payload,
        {
          headers: this.getHeaders(),
        }
      );
      return {
        status: true,
        status_code: response?.data?.data?.status_code || "000",
        data: response?.data?.data || [],
        message:
          response?.data?.data?.message ||
          "Property details updated successfully",
      };
    } catch (error) {
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to update property details",
      };
    }
  }

  async getPropertyById(propertySlug) {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/properties/${propertySlug}`,
        {
          headers: this.getHeaders(),
        }
      );
      return {
        status: true,
        status_code: response?.data?.data?.status_code || "000",
        data: response?.data?.data || null,
        message: response?.data?.data?.message || "Property fetched successfully",
      };
    } catch (error) {
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: null,
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch property",
      };
    }
  }
}

const propertiesServices = new PropertiesServices();
export default propertiesServices;
