import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  Home, 
  TrendingUp, 
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Shield,
  Zap,
  TreePine,
  Sparkles,
  Mail,
  Copy,
  ExternalLink,
  User,
  BuildingIcon
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { toast } from "react-toastify";
import { getPropertyById } from "../../api/Landlord/General/PropertyRequest";

const ViewProperty = () => {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const {propertySlug} = useParams();
  
  useEffect(()=>{
    const fetchProperty = async()=>{
      setLoading(true)
      try{
        const response = await getPropertyById(propertySlug);
        if(response?.data?.status_code === "000" && !response?.data?.in_error){
          setProperty(response?.data?.data);
          setCurrentImageIndex(0); // Reset image index when property loads
        }else{
          toast.error(response?.data?.reason || "Failed to fetch property. Please try again.");
        }
      }catch(error){
        toast.error(error?.response?.data?.reason || "An error occurred while fetching the property. Please try again.");
      }finally{
        setLoading(false);
      }
    }
    fetchProperty();
  },[propertySlug]);

  const handleDeleteProperty = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    toast.success('Property deleted successfully');
    navigate('/my-properties');
  };

  const handleCopyContact = (contact) => {
    navigator.clipboard.writeText(contact);
    toast.success('Contact copied to clipboard');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      "Air Conditioning": Zap,
      "Parking": Car,
      "Swimming Pool": Waves,
      "Gym": Dumbbell,
      "Security": Shield,
      "Elevator": Building,
      "Balcony": Home,
      "Garden": TreePine,
      "WiFi": Wifi,
      "Furnished": Sparkles
    };
    return icons[amenity] || Star;
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => {
        const nextIndex = prev === property.images.length - 1 ? 0 : prev + 1;
        console.log('Next image:', nextIndex, 'of', property.images.length);
        return nextIndex;
      });
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => {
        const prevIndex = prev === 0 ? property.images.length - 1 : prev - 1;
        console.log('Prev image:', prevIndex, 'of', property.images.length);
        return prevIndex;
      });
    }
  };

  // Get current image URL
  const getCurrentImageUrl = () => {
    if (property?.images && property.images.length > 0) {
      // Ensure currentImageIndex is within bounds
      const safeIndex = Math.min(currentImageIndex, property.images.length - 1);
      const imageUrl = property.images[safeIndex]?.url || property?.featured_image?.url || '/placeholder-image.jpg';
      console.log('Current image index:', currentImageIndex, 'Safe index:', safeIndex, 'URL:', imageUrl);
      return imageUrl;
    }
    return property?.featured_image?.url || '/placeholder-image.jpg';
  };

  const getApprovalStatusColor = (status) => {
    switch(status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch(status) {
      case 'verified':
        return CheckCircle2;
      case 'unverified':
        return AlertCircle;
      case 'rejected':
        return AlertCircle;
      default:
        return AlertCircle;
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

  if (!property) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Home size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property not found</h3>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/my-properties')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const StatusIcon = getApprovalStatusIcon(property.approval_status);

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate('/my-properties')}
                className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors flex-shrink-0 mt-1"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{property.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{property.location}, {property.region}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium w-fit ${getApprovalStatusColor(property.approval_status)}`}>
                    <StatusIcon size={12} />
                    <span className="capitalize">{property.approval_status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => navigate(`/edit-property/${property.property_slug}`)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <Edit3 size={16} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDeleteProperty}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button className="p-2 sm:p-2.5 hover:bg-white rounded-lg border border-gray-200 transition-colors flex-shrink-0">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Property Status</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 capitalize truncate">{property.approval_status}</p>
                  <p className="text-xs text-gray-500 mt-1">{property.is_available ? 'Available' : 'Not Available'}</p>
                </div>
                <StatusIcon className="text-blue-500 flex-shrink-0" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Property Type</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 truncate">{property.property_type}</p>
                  <p className="text-xs text-gray-500 mt-1">{property.number_of_rooms} Room(s)</p>
                </div>
                <Home className="text-green-500 flex-shrink-0" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Rental Period</p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{property.rental_years} Year(s)</p>
                  <p className="text-xs text-gray-500 mt-1">Built in {property.year_built}</p>
                </div>
                <Calendar className="text-purple-500 flex-shrink-0" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Monthly Rent</p>
                  <p className="text-base sm:text-lg font-bold text-orange-600 truncate">{formatCurrency(property.price)}</p>
                  <p className="text-xs text-gray-500 mt-1">{property.is_negotiable ? 'Negotiable' : 'Fixed'}</p>
                </div>
                <DollarSign className="text-orange-500 flex-shrink-0" size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="relative h-64 sm:h-80 lg:h-96 group">
                  <img
                    src={getCurrentImageUrl()}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setShowFullImageModal(true)}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  
                  {/* Overlay with expand icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                       onClick={() => setShowFullImageModal(true)}>
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
                      <Eye size={24} className="text-gray-800" />
                    </div>
                  </div>

                  {property.images && property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full transition-all shadow-lg hover:shadow-xl touch-manipulation"
                      >
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full transition-all shadow-lg hover:shadow-xl touch-manipulation"
                      >
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
                        {property.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all touch-manipulation ${
                              index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/60 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {property.images && property.images.length > 1 && (
                  <div className="p-3 sm:p-4 border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                            index === currentImageIndex ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Tabs */}
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-100 shadow-sm">
                <div className="p-1.5 sm:p-2">
                  <div className="flex bg-gray-100/50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                    {[
                      { id: 'overview', label: 'Overview', icon: Home, description: 'Property details & amenities' },
                      { id: 'landlord', label: 'Landlord', icon: User, description: 'Owner information' },
                      { id: 'location', label: 'Location', icon: MapPin, description: 'Address & area details' }
                    ].map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <Motion.button
                          key={tab.id}
                          onClick={() => setSelectedTab(tab.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-shrink-0 relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                            selectedTab === tab.id
                              ? 'bg-white text-orange-600 shadow-md border border-orange-100'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <IconComponent size={16} className={`sm:w-[18px] sm:h-[18px] ${selectedTab === tab.id ? 'text-orange-500' : 'text-gray-400'}`} />
                            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{tab.label}</span>
                          </div>
                          <div className={`text-xs mt-0.5 sm:mt-1 transition-opacity ${
                            selectedTab === tab.id ? 'opacity-70' : 'opacity-50'
                          }`}>
                            <span className="hidden lg:inline text-xs">{tab.description}</span>
                          </div>
                          {selectedTab === tab.id && (
                            <Motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg -z-10"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </Motion.button>
                      );
                    })}
                  </div>
                </div>

                <Motion.div 
                  key={selectedTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 sm:p-6"
                >
                  {selectedTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Property Details Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Home size={20} className="text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { icon: Home, label: 'Rooms', value: `${property.number_of_rooms} Room(s)`, color: 'text-blue-600' },
                            { icon: Bath, label: 'Bathrooms', value: `${property.number_of_bathrooms} Bathroom(s)`, color: 'text-cyan-600' },
                            { icon: BuildingIcon, label: 'Type', value: property.property_type, color: 'text-purple-600' },
                            { icon: Calendar, label: 'Built', value: property.year_built, color: 'text-green-600' },
                            { icon: Bath, label: 'Bathroom Type', value: `${property.bathroom_type} Bathroom`, color: 'text-pink-600' },
                            { icon: Home, label: 'Kitchen', value: `${property.kitchen_type} Kitchen`, color: 'text-orange-600' }
                          ].map((detail, index) => {
                            const IconComponent = detail.icon;
                            return (
                              <Motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                              >
                                <IconComponent size={18} className={detail.color} />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">{detail.label}</p>
                                  <p className="font-medium text-gray-900 capitalize">{detail.value}</p>
                                </div>
                              </Motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description Card */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <MessageCircle size={20} className="text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <p className="text-gray-700 leading-relaxed">{property.description}</p>
                        </div>
                      </div>

                      {/* Amenities Card */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50/50 rounded-xl p-6 border border-purple-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Sparkles size={20} className="text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {property.amenities.map((amenity, index) => {
                              const IconComponent = getAmenityIcon(amenity);
                              return (
                                <Motion.div
                                  key={amenity.slug}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-all hover:scale-105"
                                >
                                  <div className="p-1.5 bg-purple-100 rounded-lg">
                                    <IconComponent size={16} className="text-purple-600" />
                                  </div>
                                  <span className="font-medium text-gray-700">{amenity}</span>
                                </Motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTab === 'landlord' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-4 sm:p-6 border border-orange-100">
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <User size={18} className="text-white sm:w-5 sm:h-5" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Landlord Information</h3>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 sm:p-6 border border-orange-100 shadow-sm">
                          {/* Mobile-First Layout */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-col items-center sm:items-start">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-sm mb-2 sm:mb-0">
                                {property.landlord.business_logo ? (
                                  <img 
                                    src={property.landlord.business_logo} 
                                    alt={property.landlord.business_name}
                                    className="w-full h-full rounded-xl object-cover"
                                  />
                                ) : (
                                  <User size={24} className="text-orange-600 sm:w-7 sm:h-7" />
                                )}
                              </div>
                              
                              {/* Verification Badge - Mobile */}
                              <div className="sm:hidden">
                                {property.landlord.is_verified ? (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    <CheckCircle2 size={12} />
                                    <span>Verified</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                    <AlertCircle size={12} />
                                    <span>Unverified</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Information Section */}
                            <div className="flex-1 min-w-0">
                              {/* Name and Business */}
                              <div className="text-center sm:text-left mb-4">
                                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{property.landlord.full_name}</h4>
                                <p className="text-orange-600 font-medium text-sm sm:text-base truncate">{property.landlord.business_name}</p>
                              </div>
                              
                              {/* Information Grid */}
                              <div className="space-y-3 sm:space-y-4 mb-4">
                                {/* Business Type */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <BuildingIcon size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Business Type</span>
                                  </div>
                                  <p className="text-sm sm:text-base font-semibold text-gray-900 pl-6">{property.landlord.business_type}</p>
                                </div>
                                
                                {/* Location */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Location</span>
                                  </div>
                                  <p className="text-sm sm:text-base font-semibold text-gray-900 pl-6 break-words">{property.landlord.location}, {property.landlord.region}</p>
                                </div>
                                
                                {/* Contact Information */}
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Mail size={16} className="text-gray-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm text-gray-600 font-medium">Email</span>
                                    </div>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 pl-6 break-all">{property.landlord.email}</p>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm text-gray-600 font-medium">Phone</span>
                                    </div>
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 pl-6">{property.landlord.phone_number}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Verification Badge - Desktop */}
                              <div className="hidden sm:flex justify-start">
                                {property.landlord.is_verified ? (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    <CheckCircle2 size={16} />
                                    <span>Verified Landlord</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                                    <AlertCircle size={16} />
                                    <span>Unverified</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'location' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl p-6 border border-emerald-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-emerald-500 rounded-lg">
                            <MapPin size={20} className="text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                              { label: 'Region', value: property.region, icon: MapPin },
                              { label: 'Location', value: property.location, icon: MapPin },
                              { label: 'Suburb', value: property.suburb, icon: Home },
                              { label: 'District', value: property.district, icon: BuildingIcon }
                            ].map((location, index) => {
                              const IconComponent = location.icon;
                              return (
                                <Motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100"
                                >
                                  <div className="p-2 bg-emerald-500 rounded-lg">
                                    <IconComponent size={18} className="text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 font-medium">{location.label}</p>
                                    <p className="text-lg font-bold text-gray-900">{location.value}</p>
                                  </div>
                                </Motion.div>
                              );
                            })}
                          </div>
                          
                          {property.landmark && (
                            <Motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                  <Star size={18} className="text-white" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">Landmark</p>
                                  <p className="text-lg font-bold text-gray-900">{property.landmark}</p>
                                </div>
                              </div>
                            </Motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Motion.div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
                  >
                    <Phone size={18} className="text-orange-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">View Contacts</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Show contact details</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors touch-manipulation">
                    <Share2 size={18} className="text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Share Property</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Get shareable link</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors touch-manipulation sm:col-span-2 lg:col-span-1">
                    <Download size={18} className="text-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Download Info</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Property details</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Property Information</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-right">{new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium capitalize ${
                      property.approval_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {property.approval_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium">{property.is_available ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Negotiable</span>
                    <span className="font-medium">{property.is_negotiable ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rental Period</span>
                    <span className="font-medium text-right">{property.rental_years} year(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Modal */}
        <AnimatePresence>
          {showContactModal && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
              onClick={() => setShowContactModal(false)}
            >
              <Motion.div
                initial={{ scale: 0.95, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 100 }}
                className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Phone size={18} className="text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{property.contact_number}</span>
                    </div>
                    <button
                      onClick={() => handleCopyContact(property.contact_number)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation flex-shrink-0"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <MessageCircle size={18} className="text-green-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{property.whatsapp_number}</span>
                    </div>
                    <button
                      onClick={() => handleCopyContact(property.whatsapp_number)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation flex-shrink-0"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-4 py-3 sm:py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium touch-manipulation"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${property.whatsapp_number}`, '_blank')}
                    className="flex-1 px-4 py-3 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium touch-manipulation"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </button>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Full Image Modal */}
        <AnimatePresence>
          {showFullImageModal && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
              onClick={() => setShowFullImageModal(false)}
            >
              <Motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-6xl max-h-[95vh] sm:max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowFullImageModal(false)}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-colors touch-manipulation"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Main image */}
                <img
                  src={getCurrentImageUrl()}
                  alt={`${property.title} - Full view`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />

                {/* Navigation buttons */}
                {property.images && property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full transition-colors touch-manipulation"
                    >
                      <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full transition-colors touch-manipulation"
                    >
                      <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                )}

                {/* Thumbnail strip */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-8 sm:bottom-16 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 max-w-xs sm:max-w-md overflow-x-auto scrollbar-hide px-4">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                          index === currentImageIndex ? 'border-orange-500' : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          property={property}
        />
      </div>
    </AuthLayout>
  );
};

export default ViewProperty; 