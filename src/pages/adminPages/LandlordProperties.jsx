import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Search,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  RefreshCw,
  Home,
  User,
  Mail,
  Shield,
  Clock,
  Tag,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  Edit,
  MoreHorizontal,
  ExternalLink,
  Info,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import generalRequests from "../../api/Admin/Landlords/GeneralRequests";

const LandlordProperties = () => {
  const { landlordSlug } = useParams();
  const navigate = useNavigate();

  console.log('LandlordProperties component rendered!');
  console.log('landlordSlug from params:', landlordSlug);

  // State management
  const [landlordData, setLandlordData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    verified: 0,
    unverified: 0,
    averagePrice: 0,
  });

  // Load landlord properties
  useEffect(() => {
    const loadLandlordProperties = async () => {
      try {
        setLoading(true);
        const response = await generalRequests.getLandlordProperties(landlordSlug);
        
        console.log('API Response:', response);
        
        if (response?.data?.status_code === "000" && !response?.data?.in_error) {
          const data = response?.data?.data[0];
          console.log('Landlord Data:', data);
          
          setLandlordData(data);
          setProperties(data?.properties || []);
          setFilteredProperties(data?.properties || []);
          
          // Calculate stats
          const propertyList = data?.properties || [];
          const totalProps = propertyList.length;
          const availableProps = propertyList.filter(p => p.is_available).length;
          const verifiedProps = propertyList.filter(p => p.approval_status === "verified").length;
          const avgPrice = propertyList.length > 0 
            ? propertyList.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / propertyList.length 
            : 0;

          setStats({
            total: totalProps,
            available: availableProps,
            unavailable: totalProps - availableProps,
            verified: verifiedProps,
            unverified: totalProps - verifiedProps,
            averagePrice: avgPrice,
          });
        } else {
          toast.error(response?.reason || "Failed to load properties");
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        toast.error("Failed to load landlord properties");
      } finally {
        setLoading(false);
      }
    };

    if (landlordSlug) {
      loadLandlordProperties();
    }
  }, [landlordSlug]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...properties];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.property_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.suburb.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case "available":
        filtered = filtered.filter((p) => p.is_available);
        break;
      case "unavailable":
        filtered = filtered.filter((p) => !p.is_available);
        break;
      case "verified":
        filtered = filtered.filter((p) => p.approval_status === "verified");
        break;
      case "unverified":
        filtered = filtered.filter((p) => p.approval_status === "unverified");
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, selectedFilter, sortBy]);

  const getStatusBadge = (property) => {
    if (!property.is_available) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <XCircle size={12} />
          Unavailable
        </span>
      );
    }

    if (property.approval_status === "verified") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle2 size={12} />
          Verified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        <AlertCircle size={12} />
        Pending
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatCompactPrice = (price) => {
    if (price >= 1000000) {
      return `GHS\u00A0${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `GHS\u00A0${(price / 1000).toFixed(1)}K`;
    } else {
      return `GHS\u00A0${price.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header */}
        <Motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm sm:text-base p-1 sm:p-0"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Back to Landlord Management</span>
          </button>

          {/* Landlord Info Header */}
          {landlordData && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl border-2 border-white/30 flex-shrink-0">
                  {landlordData.full_name?.charAt(0)?.toUpperCase() || "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold capitalize break-words">
                    {landlordData.full_name}'s Properties
                  </h1>
                  <p className="text-blue-100 text-base sm:text-lg capitalize break-words">
                    {landlordData.business_name}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 break-all">
                      <Mail size={12} sm:size={14} className="flex-shrink-0" />
                      <span className="truncate">{landlordData.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} sm:size={14} className="flex-shrink-0" />
                      <span>{landlordData.phone_number}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} sm:size={14} className="flex-shrink-0" />
                      <span className="truncate">{landlordData.location}, {landlordData.region}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Building size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Total Properties
              </p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Available
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.available}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Available Properties
              </p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <XCircle size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Unavailable
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.unavailable}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Unavailable Properties
              </p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Verified
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.verified}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Verified Properties
              </p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                <AlertCircle size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.unverified}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Pending Verification
              </p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <DollarSign size={24} className="text-white" />
              </div>
              <div className="text-right min-w-0 flex-shrink-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Avg Price
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 whitespace-nowrap leading-tight overflow-hidden">
                  {formatCompactPrice(stats.averagePrice)}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Average Price
              </p>
            </div>
          </Motion.div>
        </div>

        {/* Filters and Search */}
        <Motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Properties</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="title">Title A-Z</option>
                </select>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    } transition-colors rounded-l-lg`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    } transition-colors rounded-r-lg`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <p className="text-sm text-gray-600">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Building size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "This landlord hasn't uploaded any properties yet"}
            </p>
          </Motion.div>
        ) : (
          <Motion.div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredProperties.map((property) => (
                <Motion.div
                  key={property.property_slug}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="relative h-48 bg-gray-200">
                    {property.featured_image ? (
                      <img
                        src={property.featured_image.image_path}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center" style={{ display: property.featured_image ? 'none' : 'flex' }}>
                      <ImageIcon size={32} className="text-gray-500" />
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(property)}
                    </div>

                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm font-semibold">
                      {formatPrice(property.price)}
                    </div>

                    {property.images && property.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                        <ImageIcon size={12} />
                        {property.images.length}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {property.location}, {property.region}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Tag size={14} className="text-gray-400" />
                        <span className="text-gray-600">{property.property_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed size={14} className="text-gray-400" />
                        <span className="text-gray-600">{property.number_of_rooms} Room{property.number_of_rooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={14} className="text-gray-400" />
                        <span className="text-gray-600">{property.number_of_bathrooms || 'N/A'} Bath{property.number_of_bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">{property.year_built}</span>
                      </div>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{property.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Created {moment(property.created_at).fromNow()}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowPropertyModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </AnimatePresence>
          </Motion.div>
        )}

        {/* Property Details Modal */}
        <AnimatePresence>
          {showPropertyModal && selectedProperty && (
            <Motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPropertyModal(false)}
            >
              <Motion.div
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedProperty.title}</h2>
                      <p className="text-blue-100 flex items-center gap-1">
                        <MapPin size={16} />
                        {selectedProperty.location}, {selectedProperty.region}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPropertyModal(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <XCircle size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        {getStatusBadge(selectedProperty)}
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(selectedProperty.price)}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="font-medium ml-2">{selectedProperty.property_type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Rooms:</span>
                            <span className="font-medium ml-2">{selectedProperty.number_of_rooms}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Bathrooms:</span>
                            <span className="font-medium ml-2">{selectedProperty.number_of_bathrooms || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Year Built:</span>
                            <span className="font-medium ml-2">{selectedProperty.year_built}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Kitchen:</span>
                            <span className="font-medium ml-2 capitalize">{selectedProperty.kitchen_type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Bathroom:</span>
                            <span className="font-medium ml-2 capitalize">{selectedProperty.bathroom_type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">District:</span>
                            <span className="font-medium ml-2">{selectedProperty.district}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Suburb:</span>
                            <span className="font-medium ml-2">{selectedProperty.suburb}</span>
                          </div>
                          {selectedProperty.landmark && (
                            <div>
                              <span className="text-gray-500">Landmark:</span>
                              <span className="font-medium ml-2">{selectedProperty.landmark}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <span>{selectedProperty.contact_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle size={16} className="text-gray-400" />
                            <span>{selectedProperty.whatsapp_number}</span>
                          </div>
                        </div>
                      </div>

                      {selectedProperty.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                          <p className="text-sm text-gray-700">{selectedProperty.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProperty.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProperty.images && selectedProperty.images.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Images ({selectedProperty.images.length})
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedProperty.images.slice(0, 4).map((image, index) => (
                              <div key={image.id} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={image.image_path}
                                  alt={`Property ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center" style={{ display: 'none' }}>
                                  <ImageIcon size={24} className="text-gray-500" />
                                </div>
                                {image.is_featured && (
                                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                    Featured
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {selectedProperty.images.length > 4 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{selectedProperty.images.length - 4} more images
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default LandlordProperties; 