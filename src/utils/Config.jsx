const baseUrl = "http://84.247.181.60:2025/api";

const Config = {
  baseUrl: baseUrl,
  guestHeaders: {
    "Content-Type": "application/json",
  },
  renterHeaders: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("quick_renter_token")}`,
  },
};

export default Config;
