import Colors from "../utils/Colors";
import { Home, Building, Bed, Briefcase, Clock } from "lucide-react";
import Images from "../utils/Images";
import CategoryRequests from "../api/Renter/General/CategoryRequests";


const categories = [
  {
    id: 1,
    key:"Single Room",
    icon: <Bed size={24} />,
    title: "Single Room / Hostel",
    description: "Affordable single rooms and hostel",
    ads: "13,567 Ads",
    image: Images.single_room,
    color: Colors.primary[500]
  },
  {
    id: 2,
    key:"Chamber and Hall",
    icon: <Home size={24} />,
    title: "Chamber & Hall",
    description: "Compact living spaces with private facilities",
    ads: "9,635 Ads",
    image: Images.chamber_and_hall,
    color: Colors.accent.orange
  },
  {
    id: 3,
    key:"3 Bedroom Apartment",
    icon: <Building size={24} />,
    title: "2/3 bedroom Apartment",
    description: "Spacious apartments for families and professionals",
    ads: "7,783 Ads",
    image: Images.bedroom_apartment,
    color: Colors.accent.teal
  },
  {
    id: 4,
    key:"Office Space",
    icon: <Briefcase size={24} />,
    title: "Office Space",
    description: "Professional office spaces for business needs",
    ads: "8,452 Ads",
    image: Images.office_space,
    color: Colors.accent.purple
  },
  {
    id: 5,
    key:"Short Stay",
    icon: <Clock size={24} />,
    title: "Short Stay",
    description: "Temporary accommodations",
    ads: "5,121 Ads",
    image: Images.short_stay,
    color: Colors.accent.green
  }
];

export default categories;