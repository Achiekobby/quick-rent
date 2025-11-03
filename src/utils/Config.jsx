// const baseUrl = "http://84.247.181.60:2025/api";
// const baseUrl = "https://gba.quicksmscontent.com/api";
const baseUrl = "https://rent.quicksmscontent.com/api";

const Config = {
  baseUrl: baseUrl,
  guestHeaders: {
    "Content-Type": "application/json",
  },
  renterHeaders: {
    "Content-Type": "application/json",
  },

  telecel:"VOD",
  mtn:"MTN",
  airtelTigo:"AIR",
  card_payment:"CRD"
};

export default Config;
