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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/my-properties')}
                className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600">{property.location}, {property.region}</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getApprovalStatusColor(property.approval_status)}`}>
                    <StatusIcon size={12} />
                    <span className="capitalize">{property.approval_status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/edit-property/${property.property_slug}`)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={handleDeleteProperty}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Property Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{property.approval_status}</p>
                  <p className="text-xs text-gray-500">{property.is_available ? 'Available' : 'Not Available'}</p>
                </div>
                <StatusIcon className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="text-lg font-bold text-gray-900">{property.property_type}</p>
                  <p className="text-xs text-gray-500">{property.number_of_rooms} Room(s)</p>
                </div>
                <Home className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rental Period</p>
                  <p className="text-lg font-bold text-gray-900">{property.rental_years} Year(s)</p>
                  <p className="text-xs text-gray-500">Built in {property.year_built}</p>
                </div>
                <Calendar className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(property.price)}</p>
                  <p className="text-xs text-gray-500">{property.is_negotiable ? 'Negotiable' : 'Fixed'}</p>
                </div>
                <DollarSign className="text-orange-500" size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="relative h-96">
                  <img
                    src={getCurrentImageUrl()}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  {property.images && property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors shadow-lg"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors shadow-lg"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {property.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {property.images && property.images.length > 1 && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? 'border-orange-500' : 'border-gray-200'
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

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="border-b border-gray-100">
                  <div className="flex">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'landlord', label: 'Landlord Info' },
                      { id: 'location', label: 'Location Details' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`px-6 py-4 border-b-2 font-medium transition-colors ${
                          selectedTab === tab.id
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {selectedTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Property Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Home size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{property.number_of_rooms} Room(s)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bath size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{property.no_of_bathrooms} Bathroom(s)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BuildingIcon size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{property.property_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Built {property.year_built}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bath size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600 capitalize">{property.bathroom_type} Bathroom</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600 capitalize">{property.kitchen_type} Kitchen</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{property.description}</p>
                      </div>

                      {/* Amenities */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {property.amenities.map((amenity) => {
                              const IconComponent = getAmenityIcon(amenity.name);
                              return (
                                <div key={amenity.slug} className="flex items-center gap-2 text-sm text-gray-600">
                                  <IconComponent size={16} className="text-orange-500" />
                                  <span>{amenity.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTab === 'landlord' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Landlord Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                              {property.landlord.business_logo ? (
                                <img 
                                  src={property.landlord.business_logo} 
                                  alt={property.landlord.business_name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User size={24} className="text-orange-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{property.landlord.full_name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{property.landlord.business_name}</p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Business Type:</strong> {property.landlord.business_type}</p>
                                <p><strong>Location:</strong> {property.landlord.location}, {property.landlord.region}</p>
                                <p><strong>Email:</strong> {property.landlord.email}</p>
                                <p><strong>Phone:</strong> {property.landlord.phone_number}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {property.landlord.is_verified ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      <CheckCircle2 size={12} />
                                      <span>Verified Landlord</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                      <AlertCircle size={12} />
                                      <span>Unverified</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'location' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Details</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-900">Region</p>
                              <p>{property.region}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Location</p>
                              <p>{property.location}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Suburb</p>
                              <p>{property.suburb}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">District</p>
                              <p>{property.district}</p>
                            </div>
                            {property.landmark && (
                              <div className="md:col-span-2">
                                <p className="font-medium text-gray-900">Landmark</p>
                                <p>{property.landmark}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Phone size={20} className="text-orange-500" />
                    <div>
                      <p className="font-medium text-gray-900">View Contacts</p>
                      <p className="text-sm text-gray-500">Show contact details</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Share2 size={20} className="text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Share Property</p>
                      <p className="text-sm text-gray-500">Get shareable link</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Download size={20} className="text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Download Info</p>
                      <p className="text-sm text-gray-500">Property details</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium capitalize ${
                      property.approval_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {property.approval_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium">{property.is_available ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Negotiable</span>
                    <span className="font-medium">{property.is_negotiable ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Period</span>
                    <span className="font-medium">{property.rental_years} year(s)</span>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowContactModal(false)}
            >
              <Motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-gray-600" />
                      <span className="font-medium">{property.contact_number}</span>
                    </div>
                    <button
                      onClick={() => handleCopyContact(property.contact_number)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} className="text-green-600" />
                      <span className="font-medium">{property.whatsapp_number}</span>
                    </div>
                    <button
                      onClick={() => handleCopyContact(property.whatsapp_number)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${property.whatsapp_number}`, '_blank')}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </button>
                </div>
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