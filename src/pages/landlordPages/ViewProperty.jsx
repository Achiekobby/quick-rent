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
  ExternalLink
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

const ViewProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock property data - in real app, this would come from API
  const mockProperty = {
    id: parseInt(propertyId),
    title: "Modern 3-Bedroom Apartment in East Legon",
    region: "Greater Accra",
    location: "East Legon",
    suburb: "American House",
    district: "Ayawaso West Municipal",
    landmark: "Near East Legon Police Station",
    per_month_amount: 2500,
    rental_years: 1,
    number_of_bedrooms: 3,
    number_of_bathrooms: 2,
    property_type: "3 Bedroom Apartment",
    approval_status: "verified",
    negotiable: true,
    contact_number: "233244567890",
    whatsapp_number: "233244567890",
    year_built: "2020",
    description: "This beautiful 3-bedroom apartment is located in the heart of East Legon, one of Accra's most prestigious neighborhoods. The property features modern amenities, spacious rooms, and excellent connectivity to major business districts. Perfect for families or professionals looking for comfort and convenience.",
    amenities: [
      "Air Conditioning", "Parking", "Security", "Elevator", "Balcony", 
      "WiFi", "Furnished", "Generator", "Water Tank", "CCTV"
    ],
    property_images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-444dcb5c385a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&w=1200&q=80"
    ],
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    views: 245,
    inquiries: 12,
    favorites: 8,
    is_featured: true,
    // Analytics data
    viewsThisMonth: 45,
    inquiriesThisMonth: 3,
    viewsLastMonth: 38,
    inquiriesLastMonth: 2,
    // Recent activity
    recentInquiries: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "233201234567",
        message: "Interested in viewing this property",
        date: "2024-01-22T10:30:00Z"
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "233207654321",
        message: "Is this property still available?",
        date: "2024-01-21T15:45:00Z"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperty(mockProperty);
      setLoading(false);
    }, 1000);
  }, [propertyId]);

  const handleDeleteProperty = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // In real app, make API call to delete
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
      minimumFractionDigits: 0
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
    setCurrentImageIndex((prev) => 
      prev === property.property_images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.property_images.length - 1 : prev - 1
    );
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
                  <span className="text-gray-600">{property.location}, {property.suburb}</span>
                  {property.approval_status === 'verified' ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      <AlertCircle size={12} />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/edit-property/${property.id}`)}
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
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{property.views}</p>
                  <p className="text-xs text-green-600">+{property.viewsThisMonth - property.viewsLastMonth} this month</p>
                </div>
                <Eye className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inquiries</p>
                  <p className="text-2xl font-bold text-gray-900">{property.inquiries}</p>
                  <p className="text-xs text-green-600">+{property.inquiriesThisMonth - property.inquiriesLastMonth} this month</p>
                </div>
                <Users className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">{property.favorites}</p>
                  <p className="text-xs text-gray-500">Saved by users</p>
                </div>
                <Heart className="text-red-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(property.per_month_amount)}</p>
                  <p className="text-xs text-gray-500">{property.negotiable ? 'Negotiable' : 'Fixed'}</p>
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
                  {property.property_images && property.property_images.length > 0 ? (
                    <>
                      <img
                        src={property.property_images[currentImageIndex]}
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {property.property_images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                          >
                            <ChevronRight size={20} />
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {property.property_images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {property.property_images && property.property_images.length > 1 && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto">
                      {property.property_images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? 'border-orange-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
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
                      { id: 'analytics', label: 'Analytics' },
                      { id: 'inquiries', label: 'Inquiries' }
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Bed size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{property.number_of_bedrooms} Bedrooms</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bath size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{property.number_of_bathrooms} Bathrooms</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{property.property_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Built {property.year_built}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{property.description}</p>
                      </div>

                      {/* Amenities */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {property.amenities.map((amenity) => {
                            const IconComponent = getAmenityIcon(amenity);
                            return (
                              <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                                <IconComponent size={16} className="text-orange-500" />
                                <span>{amenity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Location Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Region:</strong> {property.region}</p>
                          <p><strong>Location:</strong> {property.location}</p>
                          <p><strong>Suburb:</strong> {property.suburb}</p>
                          {property.district && <p><strong>District:</strong> {property.district}</p>}
                          {property.landmark && <p><strong>Landmark:</strong> {property.landmark}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'analytics' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Views Trend</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-blue-700">This Month</span>
                                <span className="font-semibold text-blue-900">{property.viewsThisMonth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-blue-700">Last Month</span>
                                <span className="font-semibold text-blue-900">{property.viewsLastMonth}</span>
                              </div>
                              <div className="text-xs text-green-600">
                                +{((property.viewsThisMonth - property.viewsLastMonth) / property.viewsLastMonth * 100).toFixed(1)}% growth
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Inquiries Trend</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-green-700">This Month</span>
                                <span className="font-semibold text-green-900">{property.inquiriesThisMonth}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-green-700">Last Month</span>
                                <span className="font-semibold text-green-900">{property.inquiriesLastMonth}</span>
                              </div>
                              <div className="text-xs text-green-600">
                                +{((property.inquiriesThisMonth - property.inquiriesLastMonth) / property.inquiriesLastMonth * 100).toFixed(1)}% growth
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'inquiries' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
                      {property.recentInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{inquiry.name}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(inquiry.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{inquiry.message}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {inquiry.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {inquiry.phone}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Mail size={16} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Phone size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <p className="font-medium text-gray-900">Download Report</p>
                      <p className="text-sm text-gray-500">Property analytics</p>
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
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">{new Date(property.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${property.approval_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {property.approval_status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Featured</span>
                    <span className="font-medium">{property.is_featured ? 'Yes' : 'No'}</span>
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