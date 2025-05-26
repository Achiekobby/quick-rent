import Colors from "../utils/Colors";
import { Home, Building, Bed, Briefcase, Clock } from "lucide-react";
const categories = [
  {
    id: 1,
    icon: <Bed size={24} />,
    title: "Single Room / Hostel",
    description: "Affordable single rooms and hostel",
    ads: "13,567 Ads",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop",
    color: Colors.primary[500]
  },
  {
    id: 2,
    icon: <Home size={24} />,
    title: "Chamber & Hall",
    description: "Compact living spaces with private facilities",
    ads: "9,635 Ads",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
    color: Colors.accent.orange
  },
  {
    id: 3,
    icon: <Building size={24} />,
    title: "2/3 bedroom Apartment",
    description: "Spacious apartments for families and professionals",
    ads: "7,783 Ads",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
    color: Colors.accent.teal
  },
  {
    id: 4,
    icon: <Briefcase size={24} />,
    title: "Office Space",
    description: "Professional office spaces for business needs",
    ads: "8,452 Ads",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000&auto=format&fit=crop",
    color: Colors.accent.purple
  },
  {
    id: 5,
    icon: <Clock size={24} />,
    title: "Short Stay",
    description: "Temporary accommodations",
    ads: "5,121 Ads",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    color: Colors.accent.green
  }
];

export default categories;