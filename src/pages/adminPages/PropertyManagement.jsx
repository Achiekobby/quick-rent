import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  Search,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Grid3X3,
  List,
  Download,
  RefreshCw,
  Star,
  Home,
  Building,
  User,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Plus,
  Edit3,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import dashboardRequests from "../../api/Admin/DashboardRequets";
import { useNavigate } from "react-router";

const PropertyManagement = () => {
  // State management
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    property: null,
    newStatus: null,
    isLoading: false,
  });
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    region: "all",
    priceRange: "all",
    dateRange: "all",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleNavigateToEdit = (property) => {
    navigate(`/admin/properties/edit/${property.id}`);
  };

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, filters]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardRequests.getAllProperties();
      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        const mappedProperties = response.data.data.map((property) => ({
          id: property.property_slug,
          title: property.title,
          category: property.property_type,
          region: property.region,
          location: property.location,
          price: parseFloat(property.price),
          status:
            property.approval_status === "verified"
              ? "verified"
              : property.approval_status === "unverified"
              ? "unverified"
              : property.approval_status,
          isListed: property.is_available,
          images: property.images?.map((img) => img.url) || [],
          featuredImage:
            property.featured_image?.url ||
            property.images?.[0]?.url ||
            "/api/placeholder/400/300",
          landlord: {
            name: property.landlord.full_name,
            email: property.landlord.email,
            phone: property.landlord.phone_number,
          },
          createdAt: property.created_at,
          verifiedAt:
            property.approval_status === "verified"
              ? property.created_at
              : null,
          description: property.description,
          amenities: property.amenities || [],
          rating: 4.0,
          views: Math.floor(Math.random() * 500) + 50,
          suburb: property.suburb,
          district: property.district,
          landmark: property.landmark,
          yearBuilt: property.year_built,
          numberOfRooms: property.number_of_rooms,
          numberOfBathrooms: property.number_of_bathrooms,
          bathroomType: property.bathroom_type,
          kitchenType: property.kitchen_type,
          isNegotiable: property.is_negotiable,
          contactNumber: property.contact_number,
          whatsappNumber: property.whatsapp_number,
        }));
        setProperties(mappedProperties);
      } else {
        toast.error(response?.data?.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch properties");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.landlord.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" || property.status === filters.status;
      const matchesCategory =
        filters.category === "all" || property.category === filters.category;
      const matchesRegion =
        filters.region === "all" || property.region === filters.region;

      return matchesSearch && matchesStatus && matchesCategory && matchesRegion;
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const handleVerifyProperty = async (propertyId, newStatus) => {
    // Show confirmation modal first
    const property = properties.find((p) => p.id === propertyId);
    setConfirmationModal({
      isOpen: true,
      property,
      newStatus,
      isLoading: false,
    });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmationModal.property || !confirmationModal.newStatus) return;

    setConfirmationModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await dashboardRequests.updatePropertyStatus(
        confirmationModal.property.id,
        confirmationModal.newStatus
      );

      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        const updatedProperties = properties.map((property) =>
          property.id === confirmationModal.property.id
            ? {
                ...property,
                status: confirmationModal.newStatus,
                verifiedAt:
                  confirmationModal.newStatus === "verified"
                    ? new Date().toISOString()
                    : null,
              }
            : property
        );
        setProperties(updatedProperties);
        toast.success(
          `Property ${
            confirmationModal.newStatus === "verified"
              ? "verified"
              : "unverified"
          } successfully`
        );

        // Close modal
        setConfirmationModal({
          isOpen: false,
          property: null,
          newStatus: null,
          isLoading: false,
        });
      } else {
        toast.error(response?.message || "Failed to update property status");
        setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update property status");
      setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const cancelStatusUpdate = () => {
    setConfirmationModal({
      isOpen: false,
      property: null,
      newStatus: null,
      isLoading: false,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "unverified":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "unverified":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const PropertyCard = ({ property }) => (
    <Motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
      whileHover={{ y: -2, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        <img
          src={property.featuredImage}
          alt={property.title}
          className="w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(
              property.status
            )}`}
          >
            {getStatusIcon(property.status)}
            <span className="hidden sm:inline">
              {property.status.charAt(0).toUpperCase() +
                property.status.slice(1)}
            </span>
          </span>
        </div>

        <div className="absolute top-2 right-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-white text-xs font-bold">
              ₵{property.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick stats overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">
              {property.views}
            </span>
          </div>
          {property.rating && (
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">
                {property.rating}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {property.title.length > 20
              ? property.title.slice(0, 20) + "..."
              : property.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Enhanced property info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <Building className="w-3 h-3" />
              <span className="truncate">{property.category}</span>
            </div>
            <span className="text-gray-500 text-xs">
              {property.numberOfRooms}Room
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.landlord.name}</span>
          </div>
        </div>

        {/* Action buttons and date */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(property.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          <div className="flex items-center gap-1">
            <Motion.button
              onClick={() => setSelectedProperty(property)}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-4 h-4" />
            </Motion.button>
            <Motion.button
              onClick={() => handleNavigateToEdit(property)}
              className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit3 className="w-4 h-4" />
            </Motion.button>

            <Motion.button
              onClick={() => handleVerifyProperty(property.id, "verified")}
              disabled={property.status === "verified"}
              className={`p-1.5 rounded-lg transition-colors ${
                property.status === "verified"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
              whileHover={property.status !== "verified" ? { scale: 1.1 } : {}}
              whileTap={property.status !== "verified" ? { scale: 0.9 } : {}}
            >
              <CheckCircle className="w-4 h-4" />
            </Motion.button>

            <Motion.button
              onClick={() => handleVerifyProperty(property.id, "unverified")}
              disabled={property.status === "unverified"}
              className={`p-1.5 rounded-lg transition-colors ${
                property.status === "unverified"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
              whileHover={
                property.status !== "unverified" ? { scale: 1.1 } : {}
              }
              whileTap={property.status !== "unverified" ? { scale: 0.9 } : {}}
            >
              <XCircle className="w-4 h-4" />
            </Motion.button>
          </div>
        </div>
      </div>
    </Motion.div>
  );

  const PropertyListItem = ({ property }) => (
    <Motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <img
          src={property.featuredImage}
          alt={property.title}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">
              {property.title}
            </h3>
            <span className="text-base sm:text-lg font-bold text-gray-900 flex-shrink-0">
              ₵{property.price.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{property.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{property.landlord.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{property.views} views</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  property.status
                )}`}
              >
                {getStatusIcon(property.status)}
                <span className="hidden sm:inline">
                  {property.status.charAt(0).toUpperCase() +
                    property.status.slice(1)}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                {new Date(property.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Motion.button
                onClick={() => setSelectedProperty(property)}
                className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
              </Motion.button>

              <Motion.button
                onClick={() => handleVerifyProperty(property.id, "verified")}
                disabled={property.status === "verified"}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  property.status === "verified"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
                whileHover={
                  property.status !== "verified" ? { scale: 1.05 } : {}
                }
                whileTap={property.status !== "verified" ? { scale: 0.95 } : {}}
              >
                <CheckCircle className="w-4 h-4" />
              </Motion.button>

              <Motion.button
                onClick={() => handleVerifyProperty(property.id, "unverified")}
                disabled={property.status === "unverified"}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  property.status === "unverified"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
                whileHover={
                  property.status !== "unverified" ? { scale: 1.05 } : {}
                }
                whileTap={
                  property.status !== "unverified" ? { scale: 0.95 } : {}
                }
              >
                <XCircle className="w-4 h-4" />
              </Motion.button>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header */}
        <Motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
              Property Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and verify all properties in the system
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/admin/properties/create"
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Property</span>
            </Link>
            <Motion.button
              onClick={fetchProperties}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Motion.button>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: "Total Properties",
              value: properties.length,
              color: "blue",
              icon: Building,
            },
            {
              label: "Verified",
              value: properties.filter((p) => p.status === "verified").length,
              color: "green",
              icon: CheckCircle,
            },
            {
              label: "Unverified",
              value: properties.filter((p) => p.status === "unverified").length,
              color: "yellow",
              icon: Clock,
            },
            {
              label: "Rejected",
              value: properties.filter((p) => p.status === "rejected").length,
              color: "red",
              icon: XCircle,
            },
          ].map((stat, index) => (
            <Motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-lg ${
                    stat.color === "blue"
                      ? "bg-blue-100"
                      : stat.color === "green"
                      ? "bg-green-100"
                      : stat.color === "yellow"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <stat.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      stat.color === "blue"
                        ? "text-blue-600"
                        : stat.color === "green"
                        ? "text-green-600"
                        : stat.color === "yellow"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </Motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <Motion.div
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search properties, locations, or landlords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <Motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-4 border-t border-gray-200"
              >
                {[
                  {
                    key: "status",
                    label: "Status",
                    options: ["all", "verified", "unverified", "rejected"],
                  },
                  {
                    key: "category",
                    label: "Category",
                    options: [
                      "all",
                      "Single Room",
                      "2 Bedroom Apartment",
                      "3 Bedroom Apartment",
                      "Chamber and Hall",
                      "Office Space",
                    ],
                  },
                  {
                    key: "region",
                    label: "Region",
                    options: [
                      "all",
                      "Greater Accra",
                      "Ashanti",
                      "Western",
                      "Central",
                      "Northern",
                    ],
                  },
                  {
                    key: "priceRange",
                    label: "Price Range",
                    options: [
                      "all",
                      "0-1000",
                      "1000-10000",
                      "10000-100000",
                      "100000+",
                    ],
                  },
                  {
                    key: "dateRange",
                    label: "Date Range",
                    options: ["all", "today", "week", "month"],
                  },
                ].map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      {filter.label}
                    </label>
                    <select
                      value={filters[filter.key]}
                      onChange={(e) =>
                        setFilters({ ...filters, [filter.key]: e.target.value })
                      }
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {filter.options.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>
        </Motion.div>

        {/* View Toggle and Results */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm sm:text-base text-gray-600">
              Showing {currentProperties.length} of {filteredProperties.length}{" "}
              properties
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <Motion.button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Motion.button>
            <Motion.button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </Motion.button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-8">
                {currentProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {currentProperties.map((property) => (
                  <PropertyListItem key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <Motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Motion.button>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Motion.button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50 transition-colors"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNum}
                    </Motion.button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-400">...</span>
                    <Motion.button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {totalPages}
                    </Motion.button>
                  </>
                )}

                <Motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Property Detail Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setSelectedProperty(null)}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                      {selectedProperty.title}
                    </h2>
                    <div className="flex items-center gap-2 text-blue-100">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        {selectedProperty.location}, {selectedProperty.region}
                      </span>
                    </div>
                  </div>

                  <Motion.button
                    onClick={() => setSelectedProperty(null)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </Motion.button>
                </div>

                {/* Status and Price Header */}
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 backdrop-blur-sm ${
                      selectedProperty.status === "verified"
                        ? "bg-green-100/90 text-green-800 border-green-200"
                        : selectedProperty.status === "unverified"
                        ? "bg-yellow-100/90 text-yellow-800 border-yellow-200"
                        : "bg-red-100/90 text-red-800 border-red-200"
                    }`}
                  >
                    {getStatusIcon(selectedProperty.status)}
                    {selectedProperty.status.charAt(0).toUpperCase() +
                      selectedProperty.status.slice(1)}
                  </span>

                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      ₵{selectedProperty.price.toLocaleString()}
                    </div>
                    <div className="text-blue-100 text-sm">per month</div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Images and Description */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Property Image */}
                      <div className="relative">
                        <img
                          src={selectedProperty.featuredImage}
                          alt={selectedProperty.title}
                          className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                            <Eye className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-medium">
                              {selectedProperty.views}
                            </span>
                          </div>
                          {selectedProperty.rating && (
                            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white text-sm font-medium">
                                {selectedProperty.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Property Description */}
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Building className="w-5 h-5 text-blue-600" />
                          Property Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedProperty.description ||
                            "No description available for this property."}
                        </p>
                      </div>

                      {/* Amenities */}
                      {selectedProperty.amenities?.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-blue-600" />
                            Amenities & Features
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {selectedProperty.amenities.map(
                              (amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 truncate">
                                    {amenity}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                          <Home className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedProperty.numberOfRooms}
                          </div>
                          <div className="text-xs text-gray-600">Rooms</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                          <Building className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedProperty.numberOfBathrooms || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600">Bathrooms</div>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Home className="w-5 h-5 text-blue-600" />
                          Property Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">
                              Category
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {selectedProperty.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">
                              Region
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {selectedProperty.region}
                            </span>
                          </div>
                          {selectedProperty.yearBuilt && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600 text-sm">
                                Year Built
                              </span>
                              <span className="font-medium text-gray-900 text-sm">
                                {selectedProperty.yearBuilt}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">
                              Listed Date
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {new Date(
                                selectedProperty.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {selectedProperty.landmark && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-600 text-sm">
                                Landmark
                              </span>
                              <span className="font-medium text-gray-900 text-sm">
                                {selectedProperty.landmark}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Landlord Information */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-purple-600" />
                          Landlord Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {selectedProperty.landlord.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                Property Owner
                              </div>
                            </div>
                          </div>
                          <div className="pl-13 space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 break-all">
                                {selectedProperty.landlord.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {selectedProperty.landlord.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {(selectedProperty.contactNumber ||
                        selectedProperty.whatsappNumber) && (
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-orange-600" />
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            {selectedProperty.contactNumber && (
                              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                                <Phone className="w-4 h-4 text-orange-600" />
                                <div>
                                  <div className="text-sm text-gray-600">
                                    Property Contact
                                  </div>
                                  <div className="font-medium text-gray-900">
                                    {selectedProperty.contactNumber}
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedProperty.whatsappNumber && (
                              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                                <Phone className="w-4 h-4 text-green-600" />
                                <div>
                                  <div className="text-sm text-gray-600">
                                    WhatsApp
                                  </div>
                                  <div className="font-medium text-gray-900">
                                    {selectedProperty.whatsappNumber}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-center pt-2">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                  selectedProperty.isNegotiable
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {selectedProperty.isNegotiable
                                  ? "💰 Negotiable Price"
                                  : "🔒 Fixed Price"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Motion.button
                    onClick={() => {
                      handleVerifyProperty(selectedProperty.id, "verified");
                      setSelectedProperty(null);
                    }}
                    disabled={selectedProperty.status === "verified"}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                      selectedProperty.status === "verified"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-green-600 text-white hover:bg-green-700 hover:shadow-xl"
                    }`}
                    whileHover={
                      selectedProperty.status !== "verified"
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      selectedProperty.status !== "verified"
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verify Property</span>
                  </Motion.button>

                  <Motion.button
                    onClick={() => {
                      handleVerifyProperty(selectedProperty.id, "unverified");
                      setSelectedProperty(null);
                    }}
                    disabled={selectedProperty.status === "unverified"}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                      selectedProperty.status === "unverified"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        : "bg-red-600 text-white hover:bg-red-700 hover:shadow-xl"
                    }`}
                    whileHover={
                      selectedProperty.status !== "unverified"
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      selectedProperty.status !== "unverified"
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Unverify Property</span>
                  </Motion.button>

                  <Motion.button
                    onClick={() => setSelectedProperty(null)}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">Close</span>
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmationModal.isOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelStatusUpdate}
          >
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    confirmationModal.newStatus === "verified"
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {confirmationModal.newStatus === "verified" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-600" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {confirmationModal.newStatus === "verified"
                    ? "Verify Property"
                    : "Unverify Property"}
                </h3>

                <p className="text-gray-600 mb-2">
                  Are you sure you want to{" "}
                  {confirmationModal.newStatus === "verified"
                    ? "verify"
                    : "unverify"}{" "}
                  this property?
                </p>

                {confirmationModal.property && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {confirmationModal.property.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {confirmationModal.property.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      Landlord: {confirmationModal.property.landlord.name}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Motion.button
                    onClick={cancelStatusUpdate}
                    disabled={confirmationModal.isLoading}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </Motion.button>

                  <Motion.button
                    onClick={confirmStatusUpdate}
                    disabled={confirmationModal.isLoading}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                      confirmationModal.newStatus === "verified"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {confirmationModal.isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `${
                        confirmationModal.newStatus === "verified"
                          ? "Verify"
                          : "Unverify"
                      } Property`
                    )}
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default PropertyManagement;
