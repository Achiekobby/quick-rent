import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Home, 
  Heart, 
  Search, 
  TrendingUp, 
  ChevronRight, 
  MapPin, 
  Star, 
  Clock,
  Eye
} from 'lucide-react';
import Colors from '../../utils/Colors';
import AuthLayout from '../../Layouts/AuthLayout';
import PropertyCard from '../../components/Utilities/PropertyCard';
import { useNavigate } from 'react-router';

// Mock property data for different sections
const recommendedProperties = [
  {
    id: 1,
    title: "Modern Luxury Apartment",
    location: "East Legon, Accra",
    price: "2,500",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    reviews: 24,
    isNegotiable: true,
    isFeatured: true,
    isVerified: true
  },
  {
    id: 2,
    title: "Spacious Family Home",
    location: "Cantonments, Accra",
    price: "3,800",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.5,
    reviews: 18,
    isNegotiable: true,
    isFeatured: false,
    isVerified: true
  },
  {
    id: 3,
    title: "Cozy Studio Apartment",
    location: "Osu, Accra",
    price: "1,800",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.3,
    reviews: 12,
    isNegotiable: false,
    isFeatured: true,
    isVerified: false
  },
  {
    id: 4,
    title: "Elegant Townhouse",
    location: "Airport Residential, Accra",
    price: "4,200",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    reviews: 31,
    isNegotiable: true,
    isFeatured: false,
    isVerified: true
  }
];

const topSearchedProperties = [
  {
    id: 5,
    title: "Luxury Beachfront Villa",
    location: "Labadi, Accra",
    price: "5,500",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    reviews: 45,
    isNegotiable: true,
    isFeatured: true,
    isVerified: true
  },
  {
    id: 6,
    title: "Affordable Single Room",
    location: "Madina, Accra",
    price: "450",
    image: "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.1,
    reviews: 8,
    isNegotiable: false,
    isFeatured: false,
    isVerified: true
  },
  {
    id: 7,
    title: "Modern 2 Bedroom Apartment",
    location: "Spintex, Accra",
    price: "1,900",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    reviews: 22,
    isNegotiable: true,
    isFeatured: true,
    isVerified: true
  },
  {
    id: 8,
    title: "Executive Townhouse",
    location: "Cantonments, Accra",
    price: "6,200",
    image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    reviews: 17,
    isNegotiable: true,
    isFeatured: false,
    isVerified: true
  }
];

const recentlyViewedProperties = [
  {
    id: 9,
    title: "Penthouse with City View",
    location: "Ridge, Accra",
    price: "7,500",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 5.0,
    reviews: 29,
    viewedOn: "Today at 10:30 AM",
    isNegotiable: true,
    isFeatured: true,
    isVerified: true
  },
  {
    id: 10,
    title: "Cozy 1 Bedroom Flat",
    location: "Adenta, Accra",
    price: "980",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.2,
    reviews: 7,
    viewedOn: "Yesterday at 3:45 PM",
    isNegotiable: false,
    isFeatured: false,
    isVerified: true
  },
  {
    id: 11,
    title: "Family House with Garden",
    location: "Tema, Accra",
    price: "3,200",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.6,
    reviews: 15,
    viewedOn: "2 days ago",
    isNegotiable: true,
    isFeatured: true,
    isVerified: true
  },
  {
    id: 12,
    title: "Serviced Apartment",
    location: "Labone, Accra",
    price: "2,800",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.4,
    reviews: 11,
    viewedOn: "3 days ago",
    isNegotiable: true,
    isFeatured: false,
    isVerified: true
  }
];



const Dashboard = () => {
  const [user] = useState({
    name: "John Doe",
    wishlistCount: 3,
    notifications: 5,
    propertyAlerts: 4,
    viewedProperties: 12
  });
  
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <AuthLayout>
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <Motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Continue exploring properties or pick up where you left off.
        </p>
      </Motion.div>

      {/* Stats Cards */}
      <Motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Wishlist Card */}
        <Motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Wishlist</p>
              <h3 className="text-2xl font-bold text-gray-800">{user.wishlistCount}</h3>
              <p className="text-xs text-gray-500 mt-1">Saved properties</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.pink}15` }}>
              <Heart size={20} color={Colors.accent.pink} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a href="/wishlist" className="text-xs text-blue-600 font-medium flex items-center">
              View all <ChevronRight size={14} className="ml-1" />
            </a>
          </div>
        </Motion.div>

        {/* Notifications Card */}
        <Motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Notifications</p>
              <h3 className="text-2xl font-bold text-gray-800">{user.notifications}</h3>
              <p className="text-xs text-gray-500 mt-1">Unread notifications</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.orange}15` }}>
              <TrendingUp size={20} color={Colors.accent.orange} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a href="/notifications" className="text-xs text-blue-600 font-medium flex items-center">
              View all <ChevronRight size={14} className="ml-1" />
            </a>
          </div>
        </Motion.div>

        {/* Property Alerts Card */}
        <Motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Property Alerts</p>
              <h3 className="text-2xl font-bold text-gray-800">{user.propertyAlerts}</h3>
              <p className="text-xs text-gray-500 mt-1">Active alerts</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.primary[400]}15` }}>
              <Search size={20} color={Colors.primary[500]} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a href="/property-alerts" className="text-xs text-blue-600 font-medium flex items-center">
              View all <ChevronRight size={14} className="ml-1" />
            </a>
          </div>
        </Motion.div>

        {/* Viewed Properties Card */}
        <Motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Viewed</p>
              <h3 className="text-2xl font-bold text-gray-800">{user.viewedProperties}</h3>
              <p className="text-xs text-gray-500 mt-1">Properties viewed</p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.purple}15` }}>
              <Eye size={20} color={Colors.accent.purple} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a href="/viewed-properties" className="text-xs text-blue-600 font-medium flex items-center">
              View all <ChevronRight size={14} className="ml-1" />
            </a>
          </div>
        </Motion.div>
      </Motion.div>

      {/* Recommended Properties Section */}
      <Motion.section 
        className="mb-12" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Recommended For You</h2>
          <Motion.button
            onClick={() => navigate('/all-properties?category=recommended')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
            whileHover={{ x: 3 }}
          >
            View all <ChevronRight size={16} className="ml-1" />
          </Motion.button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendedProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Motion.section>

      {/* Top Searched Properties Section */}
      <Motion.section 
        className="mb-12" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Top Searched Properties</h2>
          <Motion.button
            onClick={() => navigate('/all-properties?category=popular')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
            whileHover={{ x: 3 }}
          >
            View all <ChevronRight size={16} className="ml-1" />
          </Motion.button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topSearchedProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Motion.section>

      {/* Recently Viewed Properties Section */}
      <Motion.section 
        className="mb-12" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Recently Viewed</h2>
          <Motion.button
            onClick={() => navigate('/viewed-properties')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
            whileHover={{ x: 3 }}
          >
            View all <ChevronRight size={16} className="ml-1" />
          </Motion.button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentlyViewedProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Motion.section>

    </div>
    </AuthLayout>
  );
};

export default Dashboard; 