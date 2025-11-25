import axios from "axios";
import Config from "../../../utils/Config";

const BASE_URL = `${Config.baseUrl}/`;

class ReviewsRequests {
  getHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("quick_renter_token")}`,
      },
    };
  }

  async getAllReviews() {
    try {
      const response = await axios.get(`${BASE_URL}reviews`, this.getHeaders());
      return {
        success: true,
        message: "Reviews fetched successfully",
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response.data.message,
        data: null,
      };
    }
  }

  async storeReview(payload){
    try{
      const response = await axios.post(`${BASE_URL}rentor/store_review`, payload, this.getHeaders());
      return {
        status:true,
        data:response.data.data,
        message:response.data.message || "Review stored successfully",
      }
    }catch(error){
      return {
        status:false,
        data:null,
        message:error.response?.data?.message || "Failed to store review",
      }
    }
  }

  async updateReview(reviewSlug, payload){
    try{
      const response = await axios.put(`${BASE_URL}rentor/update_review/${reviewSlug}`, payload, this.getHeaders());
      return {
        status:true,
        data:response.data.data,
        message:response.data.message || "Review updated successfully",
      }
    }catch(error){
      return {
        status:false,
        data:null,
        message:error.response?.data?.message || "Failed to update review",
      }
    }
  }

  async deleteReview(reviewSlug){
    try{
      const response = await axios.delete(`${BASE_URL}rentor/delete_review/${reviewSlug}`, this.getHeaders());
      return {
        status:true,
        data:response.data.data,
        message:response.data.message || "Review deleted successfully",
      }
    }catch(error){
      return {
        status:false,
        data:null,
        message:error.response?.data?.message || "Failed to delete review",
      }
    }
  }
}

const reviewsRequests = new ReviewsRequests();
export default reviewsRequests;
