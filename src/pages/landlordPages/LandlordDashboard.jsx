import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Home, 
  Plus, 
  ChevronRight, 
  MapPin, 
  Star, 
  Clock,
  Eye,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import Colors from '../../utils/Colors';
import AuthLayout from '../../Layouts/AuthLayout';
import { useNavigate } from 'react-router';
import useAuthStore from '../../stores/authStore';
import { getAllProperties } from '../../api/Landlord/General/PropertyRequest';
import { toast } from 'react-toastify';
import moment from 'moment';

const LandlordDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual properties data
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await getAllProperties();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setProperties(response?.data?.data || []);
        } else {
          toast.error(
            response?.data?.reason ||
              "Failed to fetch properties. Please try again."
          );
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason ||
            "Failed to fetch properties. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Calculate actual statistics from real data
  const getPropertyStats = () => {
    const totalProperties = properties.length;
    const verifiedProperties = properties.filter(p => p.approval_status === 'verified').length;
    const pendingProperties = properties.filter(p => p.approval_status === 'unverified').length;
    const availableProperties = properties.filter(p => p.is_available).length;
    
    return {
      totalProperties,
      verifiedProperties,
      pendingProperties,
      availableProperties
    };
  };

  const stats = getPropertyStats();

  // Get recent properties (last 3 added)
  const getRecentProperties = () => {
    return [...properties]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    if (status === "verified") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          <CheckCircle2 size={12} />
          <span>Verified</span>
        </div>
      );
    }
    if (status === "unverified") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
          <AlertCircle size={12} />
          <span>Pending</span>
        </div>
      );
    }
    return null;
  };

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

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </AuthLayout>
    );
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
            Welcome back, {user?.full_name || user?.business_name || "Landlord"}!
          </h1>
          <p className="text-gray-600">
            Manage your property listings and track their performance.
          </p>
        </Motion.div>

        {/* Quick Actions */}
        <Motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-orange-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/add-property')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Add New Property</h3>
                <p className="text-orange-100 text-sm">Create a new property listing</p>
              </div>
              <Plus className="w-8 h-8 text-orange-100" />
            </div>
          </Motion.button>

          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-blue-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/my-properties')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Manage Properties</h3>
                <p className="text-blue-100 text-sm">View and edit your listings</p>
              </div>
              <Building className="w-8 h-8 text-blue-100" />
            </div>
          </Motion.button>
        </Motion.div>

        {/* Stats Cards - Real Data */}
        <Motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Properties */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Properties</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalProperties}</h3>
                <p className="text-xs text-gray-500 mt-1">Properties listed</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.orange}15` }}>
                <Building size={20} color={Colors.accent.orange} />
              </div>
            </div>
          </Motion.div>

          {/* Verified Properties */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Verified</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.verifiedProperties}</h3>
                <p className="text-xs text-gray-500 mt-1">Live properties</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.green}15` }}>
                <CheckCircle2 size={20} color={Colors.accent.green} />
              </div>
            </div>
          </Motion.div>

          {/* Pending Properties */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending Review</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.pendingProperties}</h3>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.yellow}15` }}>
                <Clock size={20} color={Colors.accent.yellow} />
              </div>
            </div>
          </Motion.div>

          {/* Available Properties */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Available</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.availableProperties}</h3>
                <p className="text-xs text-gray-500 mt-1">Ready to rent</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.primary[400]}15` }}>
                <Home size={20} color={Colors.primary[500]} />
              </div>
            </div>
          </Motion.div>
        </Motion.div>

        {/* Recent Properties & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Properties</h2>
              <button
                onClick={() => navigate('/my-properties')}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            {getRecentProperties().length > 0 ? (
              <div className="space-y-4">
                {getRecentProperties().map((property) => (
                  <div key={property.property_slug} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 mr-3 overflow-hidden">
                      {property.featured_image?.url ? (
                        <img
                          src={property.featured_image.url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{property.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 truncate">{property.location}, {property.region}</p>
                        {getStatusBadge(property.approval_status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {moment(property.created_at).format("MMM DD, YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => navigate(`/view-property/${property.property_slug}`)}
                        className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={14} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => navigate(`/edit-property/${property.property_slug}`)}
                        className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Edit3 size={14} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No properties yet</p>
                <button
                  onClick={() => navigate('/add-property')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add Your First Property
                </button>
              </div>
            )}
          </Motion.div>

          {/* Quick Links - Only Available Features */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { 
                  title: "My Properties", 
                  description: "View and manage all properties", 
                  path: "/my-properties", 
                  icon: <Building size={20} />,
                  available: true
                },
                { 
                  title: "Add Property", 
                  description: "Create a new property listing", 
                  path: "/add-property", 
                  icon: <Plus size={20} />,
                  available: true
                },
                { 
                  title: "Profile Settings", 
                  description: "Update your profile information", 
                  path: "/profile", 
                  icon: <Star size={20} />,
                  available: true
                },
                { 
                  title: "Contact Support", 
                  description: "Get help with your account", 
                  path: "/contact-support", 
                  icon: <Eye size={20} />,
                  available: true
                }
              ].filter(link => link.available).map((link, index) => (
                <Motion.button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-600">
                      {link.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{link.title}</p>
                      <p className="text-xs text-gray-500">{link.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Motion.button>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LandlordDashboard;