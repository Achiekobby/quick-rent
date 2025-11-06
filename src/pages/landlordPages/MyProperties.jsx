import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Edit3,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Bed,
  Bath,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import EmptyState from "../../components/Utilities/EmptyState";
import { toast } from "react-toastify";
import {
  deleteProperty,
  getAllProperties,
} from "../../api/Landlord/General/PropertyRequest";
import moment from "moment";

const MyProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  // const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
          setFilteredProperties(response?.data?.data);
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

  useEffect(() => {
    let filtered = [...properties];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.suburb.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (property) => property.approval_status === selectedFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        case "views":
          return b.views - a.views;
        default:
          return 0;
      }
    });

    setFilteredProperties(filtered);
  }, [properties, searchQuery, selectedFilter, sortBy]);

  const handleDeleteProperty = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (slug) => {
    setIsDeleting(true);
    try {
      const response = await deleteProperty(slug);
      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        toast.success("Property deleted successfully");
        setProperties((prev) => prev.filter((p) => p.property_slug !== slug));
        setShowDeleteModal(false);
      } else {
        toast.error(
          response?.data?.reason ||
            "Failed to delete property. Please try again."
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.reason ||
          "Failed to delete property. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyCard = ({ property }) => (
    <Motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* <h1 className="">{property.property_slug}</h1> */}
      {/* Image Section */}
      <div className="relative h-32 md:h-48 bg-gray-100">
        {property.featured_image && property.featured_image.url ? (
          <img
            src={property.featured_image.url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={32} className="md:size-12" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          {getStatusBadge(property.approval_status)}
        </div>

        {/* Featured Badge */}
        {property.is_available && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-orange-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs flex items-center gap-1">
            <Star size={10} className="md:size-3" fill="currentColor" />
            <span className="hidden md:inline">Available</span>
          </div>
        )}

        {/* Actions */}
        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex gap-1 md:gap-2">
          <button
            onClick={() => navigate(`/edit-property/${property.property_slug}`)}
            className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Edit3 size={14} className="md:size-4 text-gray-700" />
          </button>
          <button
            onClick={() => navigate(`/view-property/${property.property_slug}`)}
            className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Eye size={14} className="md:size-4 text-gray-700" />
          </button>
          <button
            onClick={() => handleDeleteProperty(property)}
            className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Trash2 size={14} className="md:size-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2 md:p-4">
        <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 text-sm md:text-base">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-gray-600 text-xs md:text-sm mb-2 md:mb-3">
          <MapPin size={12} className="md:size-3.5 flex-shrink-0" />
          <span className="truncate">
            {property.location}, {property.region}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="text-lg md:text-2xl font-bold text-orange-600">
            {formatCurrency(property.price)}
            <span className="text-xs md:text-sm font-normal text-gray-500">
              /month
            </span>
          </div>
          {property.is_negotiable && (
            <span className="hidden md:flex text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
              Negotiable
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-2 md:mb-4">
          <div className="flex items-center gap-1">
            <Home size={12} className="md:size-3.5" />
            <span className="hidden md:inline">
              {property.number_of_rooms} room(s)
            </span>
            <span className="md:hidden">{property.number_of_rooms}R</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={12} className="md:size-3.5" />
            <span className="hidden md:inline">
              {property.no_of_bathrooms} bath
            </span>
            <span className="md:hidden">{property.no_of_bathrooms}B</span>
          </div>
          <div className="flex items-center gap-1 hidden md:flex">
            <Home size={14} />
            <span>{property.property_type.length > 10 ? property.property_type.substring(0, 10) + '...' : property.property_type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={10} className="md:size-3" />
              <span className="hidden md:inline">
                Added {moment(property.created_at).format("DD-MMM-YYYY")}
              </span>
              <span className="md:hidden">
                Added {moment(property.created_at).format("DD/MM")}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
            {property.is_negotiable && (
              <>
                <DollarSign size={10} className="md:size-3" />
                <span>Negotiable</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Motion.div>
  );

  const PropertyListItem = ({ property }) => (
    <Motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3 md:gap-4">
        {/* Image */}
        <div className="w-20 h-16 md:w-24 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {property.featured_image && property.featured_image.url ? (
            <img
              src={property.featured_image.url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={16} className="md:size-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate pr-2 text-sm md:text-base">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {getStatusBadge(property.approval_status)}
              {property.is_available && (
                <div className="bg-orange-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs flex items-center gap-1">
                  <Star size={8} className="md:size-2.5" fill="currentColor" />
                  <span className="hidden md:inline">Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-xs md:text-sm mb-2">
            <MapPin size={10} className="md:size-3 flex-shrink-0" />
            <span className="truncate">
              {property.location}, {property.region}
            </span>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Home size={10} />
                  <span>{property.number_of_rooms}R</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath size={10} />
                  <span>{property.no_of_bathrooms}B</span>
                </div>
              </div>
              <div className="text-sm font-bold text-orange-600">
                {formatCurrency(property.price)}
                <span className="text-xs font-normal text-gray-500">/mo</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <span>Added {moment(property.created_at).format("DD/MM")}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    navigate(`/edit-property/${property.property_slug}`)
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit3 size={12} className="text-gray-600" />
                </button>
                <button
                  onClick={() =>
                    navigate(`/view-property/${property.property_slug}`)
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Eye size={12} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteProperty(property)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Home size={12} />
                <span>{property.number_of_rooms} room(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath size={12} />
                <span>{property.no_of_bathrooms} bath</span>
              </div>
              <div className="flex items-center gap-1">
                <Home size={12} />
                <span>{property.property_type}</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(property.price)}
                <span className="text-xs font-normal text-gray-500">/mo</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>
                    Added {moment(property.created_at).format("DD-MMM-YYYY")}
                  </span>
                </div>
                {property.is_negotiable && (
                  <div className="hidden md:flex items-center gap-1">
                    <DollarSign size={12} />
                    <span>Negotiable</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    navigate(`/edit-property/${property.property_slug}`)
                  }
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit3 size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={() =>
                    navigate(`/view-property/${property.property_slug}`)
                  }
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteProperty(property)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  My Properties
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Manage your property listings and track performance
                </p>
              </div>
              <Motion.button
                onClick={() => navigate("/add-property")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} className="md:size-5" />
                <span className="whitespace-nowrap">Add Property</span>
              </Motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">
                      Total Properties
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {properties.length}
                    </p>
                  </div>
                  <Home className="text-orange-500" size={20} />
                </div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">
                      Available
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {properties.filter((p) => p.is_available).length}
                    </p>
                  </div>
                  <CheckCircle2 className="text-blue-500" size={20} />
                </div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">
                      Avg. Rent
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {properties.length > 0
                        ? formatCurrency(
                            Math.round(
                              properties.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) /
                                properties.length
                            )
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <DollarSign className="text-green-500" size={20} />
                </div>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Verified</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {
                        properties.filter(
                          (p) => p.approval_status === "verified"
                        ).length
                      }
                    </p>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-3 md:p-4 mb-6">
            <div className="flex flex-col gap-3 md:gap-4">
              {/* Search */}
              <div className="w-full relative">
                <Search
                  size={18}
                  className="md:size-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm md:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <div className="flex gap-2 flex-1">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm md:text-base"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Pending</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm md:text-base"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price_high">Price ↓</option>
                    <option value="price_low">Price ↑</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden self-start">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 md:p-2.5 ${
                      viewMode === "grid"
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <Grid3X3 size={18} className="md:size-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 md:p-2.5 ${
                      viewMode === "list"
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <List size={18} className="md:size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          {filteredProperties.length === 0 ? (
            <EmptyState
              icon={searchQuery || selectedFilter !== "all" ? "search" : "home"}
              title={searchQuery || selectedFilter !== "all" ? "No properties found" : "No properties yet"}
              description={
                searchQuery || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by adding your first property to showcase your listings and attract potential renters."
              }
              showAction={!searchQuery && selectedFilter === "all"}
              actionText="Add Your First Property"
              onActionClick={() => navigate("/add-property")}
            />
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <Motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6"
                >
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.property_slug}
                      property={property}
                    />
                  ))}
                </Motion.div>
              ) : (
                <Motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredProperties.map((property) => (
                    <PropertyListItem
                      key={property.property_slug}
                      property={property}
                    />
                  ))}
                </Motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          property={selectedProperty}
        />
      </div>
    </AuthLayout>
  );
};

export default MyProperties;
