import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  Home,
  Heart,
  Search,
  TrendingUp,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import Colors from "../../utils/Colors";
import AuthLayout from "../../Layouts/AuthLayout";
import PropertyCard from "../../components/Utilities/PropertyCard";
import { useNavigate } from "react-router";
import { getAllProperties } from "../../api/Renter/General/DashboardRequests";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [user] = useState({
    name: "John Doe",
    wishlistCount: 3,
    notifications: 5,
    propertyAlerts: 4,
    viewedProperties: 12,
  });

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [popularProperties, setPopularProperties] = useState([]);
  const [luxuryProperties, setLuxuryProperties] = useState([]);
  console.log(properties);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await getAllProperties();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setProperties(response?.data?.data);
          setFeaturedProperties(response?.data?.data?.featured_properties);
          setPopularProperties(response?.data?.data?.popular_properties);
          setLuxuryProperties(response?.data?.data?.luxury_properties);
        } else {
          toast.error(response?.data?.reason || "An error occurred");
        }
      } catch (error) {
        toast.error(error?.response?.data?.reason || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  if(loading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 size={40} className="animate-spin" />
      </div>
    )
  }

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
          {/* <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Wishlist</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user.wishlistCount}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Saved properties</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.accent.pink}15` }}
              >
                <Heart size={20} color={Colors.accent.pink} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href="/wishlist"
                className="text-xs text-blue-600 font-medium flex items-center"
              >
                View all <ChevronRight size={14} className="ml-1" />
              </a>
            </div>
          </Motion.div> */}

          {/* Notifications Card */}
          {/* <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Notifications</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user.notifications}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Unread notifications
                </p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.accent.orange}15` }}
              >
                <TrendingUp size={20} color={Colors.accent.orange} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href="/notifications"
                className="text-xs text-blue-600 font-medium flex items-center"
              >
                View all <ChevronRight size={14} className="ml-1" />
              </a>
            </div>
          </Motion.div> */}

          {/* Property Alerts Card */}
          {/* <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Property Alerts</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user.propertyAlerts}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Active alerts</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.primary[400]}15` }}
              >
                <Search size={20} color={Colors.primary[500]} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href="/property-alerts"
                className="text-xs text-blue-600 font-medium flex items-center"
              >
                View all <ChevronRight size={14} className="ml-1" />
              </a>
            </div>
          </Motion.div> */}

          {/* Viewed Properties Card */}
          {/* <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Viewed</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {user.viewedProperties}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Properties viewed</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.accent.purple}15` }}
              >
                <Eye size={20} color={Colors.accent.purple} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href="/viewed-properties"
                className="text-xs text-blue-600 font-medium flex items-center"
              >
                View all <ChevronRight size={14} className="ml-1" />
              </a>
            </div>
          </Motion.div> */}
        </Motion.div>

        {/* Recommended Properties Section */}
        {featuredProperties?.length > 0 && (
          <Motion.section
            className="mb-12"
            variants={sectionVariants}
            initial="hidden"
            animate={!loading && featuredProperties?.length > 0 ? "visible" : "hidden"}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Featured Properties
              </h2>
              <Motion.button
                onClick={() => navigate("/all-properties?category=featured")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                whileHover={{ x: 3 }}
              >
                View all <ChevronRight size={16} className="ml-1" />
              </Motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.property_slug} property={property} />
              ))}
            </div>
          </Motion.section>
        )}

        {/* Top Searched Properties Section */}
        {popularProperties?.length > 0 && (
          <Motion.section
            className="mb-12"
            variants={sectionVariants}
            initial="hidden"
            animate={!loading && popularProperties?.length > 0 ? "visible" : "hidden"}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Top Searched Properties
              </h2>
              <Motion.button
                onClick={() => navigate("/all-properties?category=popular")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                whileHover={{ x: 3 }}
              >
                View all <ChevronRight size={16} className="ml-1" />
              </Motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularProperties.map((property) => (
                <PropertyCard key={property.property_slug} property={property} />
              ))}
            </div>
          </Motion.section>
        )}

        {/* Recently Viewed Properties Section */}
        {luxuryProperties?.length > 0 && (
          <Motion.section
            className="mb-12"
            variants={sectionVariants}
            initial="hidden"
            animate={!loading && luxuryProperties?.length > 0 ? "visible" : "hidden"}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Top Selling Properties
              </h2>
              <Motion.button
                onClick={() => navigate("/viewed-properties")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                whileHover={{ x: 3 }}
              >
                View all <ChevronRight size={16} className="ml-1" />
              </Motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {luxuryProperties.map((property) => (
                <PropertyCard key={property.property_slug} property={property} />
              ))}
            </div>
          </Motion.section>
        )}
      </div>
    </AuthLayout>
  );
};

export default Dashboard;
