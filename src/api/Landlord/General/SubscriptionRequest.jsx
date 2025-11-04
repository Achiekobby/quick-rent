import axios from "axios";
import Config from "../../../utils/Config";

class SubscriptionRequest {
  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("quick_landlord_token")}`,
    };
  }

  async getSubscriptionPackages() {
    try {
      const response = await axios.get(`${Config.baseUrl}/subscription/plans`, {
        headers: this.getHeaders(),
      });

      const responseData = response?.data?.data || response?.data;
      const plansArray = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      return {
        status: true,
        status_code:
          responseData?.status_code ||
          response?.data?.data?.status_code ||
          "000",
        data: plansArray,
        message:
          responseData?.message ||
          response?.data?.data?.message ||
          "Subscription packages fetched successfully",
      };
    } catch (error) {
      console.error("Subscription packages error:", error);
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch subscription packages",
      };
    }
  }

  async initiateSubscriptionPayment(payload) {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/landlord/subscriptions/payment`,
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
          "Subscription payment initiated successfully",
      };
    } catch (error) {
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to initiate subscription payment",
      };
    }
  }

  async verifySubscriptionPayment(payload) {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/landlord/subscriptions/check_payment_status`,
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
          "Subscription payment verified successfully",
      };
    } catch (error) {
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to verify subscription payment",
      };
    }
  }

  async getSubscriptionHistory() {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/landlord/subscriptions/subscription_history`,
        {
          headers: this.getHeaders(),
        }
      );

      const responseData = response?.data?.data || response?.data;
      const historyArray = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      return {
        status: true,
        status_code: responseData?.status_code || "000",
        data: historyArray,
        message:
          responseData?.message || "Subscription history fetched successfully",
      };
    } catch (error) {
      console.error("Subscription history error:", error);
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch subscription history",
      };
    }
  }

  async getPayments() {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/landlord/subscriptions/transactions`,
        {
          headers: this.getHeaders(),
        }
      );

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
        message: responseData?.message || "Payments fetched successfully",
      };
    } catch (error) {
      console.error("Payments error:", error);
      return {
        status: false,
        status_code: error?.response?.data?.data?.status_code || "500",
        data: [],
        message:
          error?.response?.data?.data?.reason ||
          error?.response?.data?.message ||
          "Failed to fetch payments",
      };
    }
  }
}

const subscriptionRequest = new SubscriptionRequest();
export default subscriptionRequest;
