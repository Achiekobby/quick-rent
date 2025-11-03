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
    try{
      const response = await axios.post(`${Config.baseUrl}/admin/properties/create/landlord_property`, payload, {
        headers: this.getHeaders(),
      });
      return {
        status: true,
        status_code: response?.data?.data?.status_code || "000",
        data: response?.data?.data || [],
        message: response?.data?.data?.message || "Property created successfully",
      };
    }catch(error){
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message: error?.response?.data?.data?.reason || error?.response?.data?.message || "Failed to create property",
      };
    }
  }

  async updatePropertyDetails(payload){
    try{
      const response = await axios.post(`${Config.baseUrl}/admin/properties/update/property_details`, payload, {
        headers: this.getHeaders(),
      });
      return {
        status: true,
        status_code: response?.data?.data?.status_code || "000",
        data: response?.data?.data || [],
        message: response?.data?.data?.message || "Property details updated successfully",
      };
    }catch(error){
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message: error?.response?.data?.data?.reason || error?.response?.data?.message || "Failed to update property details",
      };
    }
  }
}

const propertiesServices = new PropertiesServices();
export default propertiesServices;
