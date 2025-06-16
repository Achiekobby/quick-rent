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
  Home
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

const MyProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  // const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  const mockProperties = [
    {
      id: 1,
      title: "Modern 3-Bedroom Apartment in East Legon",
      region: "Greater Accra",
      location: "East Legon",
      suburb: "American House",
      per_month_amount: 2500,
      rental_years: 1,
      number_of_bedrooms: 3,
      number_of_bathrooms: 2,
      property_type: "3 Bedroom Apartment",
      approval_status: "verified",
      property_images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
      ],
      created_at: "2024-01-15T10:30:00Z",
      views: 245,
      inquiries: 12,
      is_featured: true,
      negotiable: true
    },
    {
      id: 2,
      title: "Cozy Chamber and Hall in Tema",
      region: "Greater Accra",
      location: "Tema",
      suburb: "Community 25",
      per_month_amount: 800,
      rental_years: 1,
      number_of_bedrooms: 1,
      number_of_bathrooms: 1,
      property_type: "Chamber and Hall",
      approval_status: "unverified",
      property_images: [
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
      ],
      created_at: "2024-01-10T14:20:00Z",
      views: 89,
      inquiries: 5,
      is_featured: false,
      negotiable: false
    },
    {
      id: 3,
      title: "Luxury 2-Bedroom in Airport Residential",
      region: "Greater Accra",
      location: "Airport Residential",
      suburb: "Dzorwulu",
      per_month_amount: 3200,
      rental_years: 2,
      number_of_bedrooms: 2,
      number_of_bathrooms: 2,
      property_type: "2 Bedroom Apartment",
      approval_status: "verified",
      property_images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-444dcb5c385a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&w=800&q=80"
      ],
      created_at: "2024-01-05T09:15:00Z",
      views: 432,
      inquiries: 28,
      is_featured: true,
      negotiable: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...properties];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.suburb.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(property => property.approval_status === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'price_high':
          return b.per_month_amount - a.per_month_amount;
        case 'price_low':
          return a.per_month_amount - b.per_month_amount;
        case 'views':
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

  const confirmDelete = () => {
    // In real app, make API call to delete
    setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
    setShowDeleteModal(false);
    setSelectedProperty(null);
    toast.success('Property deleted successfully');
  };

  const getStatusBadge = (status) => {
    if (status === 'verified') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          <CheckCircle2 size={12} />
          <span>Verified</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
        <AlertCircle size={12} />
        <span>Pending</span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const PropertyCard = ({ property }) => (
    <Motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        {property.property_images && property.property_images.length > 0 ? (
          <img
            src={property.property_images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={48} />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge(property.approval_status)}
        </div>

        {/* Featured Badge */}
        {property.is_featured && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            <span>Featured</span>
          </div>
        )}

        {/* Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={() => navigate(`/edit-property/${property.id}`)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Edit3 size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => navigate(`/properties/${property.id}`)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Eye size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => handleDeleteProperty(property)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
          <MapPin size={14} />
          <span>{property.location}, {property.suburb}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(property.per_month_amount)}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </div>
          {property.negotiable && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Negotiable
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Bed size={14} />
            <span>{property.number_of_bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={14} />
            <span>{property.number_of_bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Home size={14} />
            <span>{property.property_type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{property.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{property.inquiries} inquiries</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{new Date(property.created_at).toLocaleDateString()}</span>
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
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-24 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {property.property_images && property.property_images.length > 0 ? (
            <img
              src={property.property_images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={20} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate pr-4">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(property.approval_status)}
              {property.is_featured && (
                <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  <span>Featured</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
            <MapPin size={12} />
            <span>{property.location}, {property.suburb}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Bed size={12} />
                <span>{property.number_of_bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath size={12} />
                <span>{property.number_of_bathrooms}</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(property.per_month_amount)}
                <span className="text-xs font-normal text-gray-500">/mo</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{property.views} views</span>
                <span>{property.inquiries} inquiries</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => navigate(`/edit-property/${property.id}`)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit3 size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={() => navigate(`/properties/${property.id}`)}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                <p className="text-gray-600 mt-1">
                  Manage your property listings and track performance
                </p>
              </div>
              <Motion.button
                onClick={() => navigate('/add-property')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                Add Property
              </Motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                  </div>
                  <Home className="text-orange-500" size={24} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {properties.reduce((sum, p) => sum + p.views, 0)}
                    </p>
                  </div>
                  <Eye className="text-blue-500" size={24} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Inquiries</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {properties.reduce((sum, p) => sum + p.inquiries, 0)}
                    </p>
                  </div>
                  <Users className="text-green-500" size={24} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {properties.filter(p => p.approval_status === 'verified').length}
                    </p>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties by title, location..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Pending</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="views">Most Viewed</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <Grid3X3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first property"}
              </p>
              {!searchQuery && selectedFilter === 'all' && (
                <Motion.button
                  onClick={() => navigate('/add-property')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={20} />
                  Add Your First Property
                </Motion.button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <Motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
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
                    <PropertyListItem key={property.id} property={property} />
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
          property={selectedProperty}
        />
      </div>
    </AuthLayout>
  );
};

export default MyProperties; 