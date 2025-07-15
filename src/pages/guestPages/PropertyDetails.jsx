import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Heart,
  Share2,
  Star,
  Check,
  X,
  Phone,
  MessageSquare,
  ArrowLeft,
  Camera,
  Bed,
  Bath,
  Sofa,
  Wind,
  Shield,
  Waves,
  Dumbbell,
  Car,
  Wifi,
  Smartphone,
  Home,
  Menu,
  ChevronUp,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  PhoneCall,
  AirVent,
  WashingMachine,
  CameraIcon,
  Store,
  Crop,
  Tractor,
  Dog,
  UtilityPole,
  Sun,
  Loader2,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import GuestLayout from "../../Layouts/GuestLayout";
import Colors from "../../utils/Colors";
import PropertyCard from "../../components/Utilities/PropertyCard";
import { toast } from "react-toastify";
import { showPropertyDetails } from "../../api/Renter/General/DashboardRequests";
import EmptyState from "../../components/Utilities/EmptyState";
import useAuthStore from "../../stores/authStore";
import { storeWishlistItem } from "../../api/Renter/General/WishlistRequests";

const PropertyDetails = () => {
  const { propertySlug } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenActiveImage, setFullscreenActiveImage] = useState(0);
  const [isHoveringMainImage, setIsHoveringMainImage] = useState(false);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const {user} = useAuthStore();
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [, setWishlistItems] = useState([]);
  // Function to mask phone number for unauthenticated users
  const maskPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "N/A";
    if (user) return phoneNumber; // Show full number if user is authenticated
    
    const phone = phoneNumber.toString();
    if (phone.length <= 6) return phone; // Don't mask very short numbers
    
    const start = phone.slice(0, 3);
    const end = phone.slice(-2);
    const middle = "*".repeat(phone.length - 5);
    
    return `${start}${middle}${end}`;
  };
  
  const handleWishlist = async()=>{
    try{
      if(!user){
        navigate("/login");
        return;
      }
      setIsWishlisting(true);
      const response = await storeWishlistItem({propertySlug});
      if(response?.data?.status_code === "000" && !response?.data?.in_error){
        setIsLiked(true);
        localStorage.setItem(`wishlist_${propertySlug}`, "true");
        toast.success(response?.data?.reason || "Property added to wishlist");
        setWishlistItems(prevItems => [...prevItems, property]);
      }
      else{
        toast.error(response?.data?.reason || "An error occurred");
      }
    }catch(error){
      toast.error(error?.response?.data?.reason || "An error occurred");
    }finally{
      setIsWishlisting(false);
    }
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Track scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showFullscreenGallery) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showFullscreenGallery]);

  // Define functions before any early returns
  const handleCallLandlord = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (property?.contact_number) {
      window.location.href = `tel:+233${property.contact_number}`;
    }
  };

  const handleWhatsAppLandlord = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (property?.whatsapp_number) {
      window.location.href = `https://wa.me/${property.whatsapp_number.replace(
        /\s+/g,
        ""
      )}`;
    }
  };

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch {
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        const response = await showPropertyDetails(propertySlug);
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setProperty(response?.data?.data);
          setRelatedProperties(response?.data?.data?.related_properties || []);
        } else {
          toast.error(
            response?.data?.reason || "Could not fetch property details"
          );
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason || "Could not fetch property details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [propertySlug]);

  if (loading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </GuestLayout>
    );
  }

  if (!property) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            title="Property Not Found"
            description="The property you're looking for doesn't exist or has been removed."
            actionText="Go Back"
            onAction={handleGoBack}
          />
        </div>
      </GuestLayout>
    );
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenFullscreenGallery = (index) => {
    setFullscreenActiveImage(index);
    setShowFullscreenGallery(true);
  };

  const handleCloseFullscreenGallery = () => {
    setShowFullscreenGallery(false);
  };

  const handlePrevImage = () => {
    if (property?.images?.length) {
      setFullscreenActiveImage((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (property?.images?.length) {
      setFullscreenActiveImage((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleThumbnailClick = (index) => {
    // Swap the active image with the thumbnail
    setActiveImage(index);
  };

  const displayedAmenities = property?.amenities
    ? showAllAmenities
      ? property.amenities
      : property.amenities.slice(0, 6)
    : [];

  // Function to render the appropriate icon for each amenity
  const renderAmenityIcon = (iconName) => {
    const iconProps = { className: "w-4 h-4 text-primary-600" };
    switch (iconName) {
      case "Air Conditioning":
        return <AirVent {...iconProps} />;
      case "Parking":
        return <Car {...iconProps} />;
      case "Furnished":
        return <Sofa {...iconProps} />;
      case "Security":
        return <Shield {...iconProps} />;
      case "Swimming Pool":
        return <Waves {...iconProps} />;
      case "Gym":
        return <Dumbbell {...iconProps} />;
      case "Dumbbell":
        return <Dumbbell {...iconProps} />;
      case "Car":
        return <Car {...iconProps} />;
      case "WiFi":
      case "wifi":
        return <Wifi {...iconProps} />;
      case "Internet":
        return <Wifi {...iconProps} />;
      case "Laundry":
        return <WashingMachine {...iconProps} />;
      case "CCTV":
        return <CameraIcon {...iconProps} />;
      case "Gated Community":
        return <Shield {...iconProps} />;
      case "Storage":
        return <Store {...iconProps} />;
      case "Garden":
        return <Tractor {...iconProps} />;
      case "Pet Friendly":
        return <Dog {...iconProps} />;
      case "Generator":
        return <UtilityPole {...iconProps} />;
      case "Solar Power":
        return <Sun {...iconProps} />;
      default:
        return <Check {...iconProps} />;
    }
  };

  // Navigation menu items
  const navItems = [
    {
      name: "Home",
      icon: <Home className="w-4 h-4" />,
      action: () => navigate("/"),
    },
    {
      name: "Back",
      icon: <ArrowLeft className="w-4 h-4" />,
      action: handleGoBack,
    },
    {
      name: "Call",
      icon: <PhoneCall className="w-4 h-4" />,
      action: handleCallLandlord,
    },
    {
      name: "Top",
      icon: <ChevronUp className="w-4 h-4" />,
      action: handleScrollToTop,
    },
  ];

  return (
    <GuestLayout>
      <Motion.div
        className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Back Button and Actions */}
        <div className="flex justify-between items-center mb-4">
          <Motion.button
            onClick={handleGoBack}
            className="flex items-center text-neutral-600 hover:text-primary-600 transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Back</span>
          </Motion.button>

          <div className="flex items-center gap-2">
            <Motion.button
              className="p-2 rounded-full bg-white shadow-md hover:bg-neutral-50 transition-colors"
              whileTap={{ scale: 0.97 }}
              onClick={handleWishlist}
            >
            {isWishlisting ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors duration-200 text-neutral-600" />
            ) : (
              <Heart
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors duration-200 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-neutral-600"
                }`}
              />
            )}
            </Motion.button>

            {/* <Motion.button
              className="p-2 rounded-full bg-white shadow-md hover:bg-neutral-50 transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              <Share2 className="w-5 h-5 text-neutral-600" />
            </Motion.button> */}
          </div>
        </div>

        {/* Property Title */}
        <Motion.div className="mb-6" variants={fadeIn}>
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mr-auto">
              {property?.title || "Property Title"}
            </h1>

            <div className="flex items-center">
              {property?.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                  Featured
                </span>
              )}

              {property?.isVerified && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center text-neutral-600 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {property?.location || "Location not specified"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold text-neutral-900">
                ₵{property?.price?.toLocaleString() || "0"}
              </span>
              <span className="text-sm text-neutral-500 ml-1">/month</span>
              {property?.isNegotiable && (
                <span className="block text-xs text-neutral-500">
                  Negotiable
                </span>
              )}
            </div>
          </div>
        </Motion.div>

        {/* Enhanced Image Gallery - Airbnb Style */}
        <Motion.div className="mb-6" variants={fadeIn}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 h-[300px] md:h-[400px]">
            {/* Main large image (left side) */}
            <div
              className="col-span-2 row-span-2 relative rounded-md overflow-hidden bg-neutral-100"
              onMouseEnter={() => setIsHoveringMainImage(true)}
              onMouseLeave={() => setIsHoveringMainImage(false)}
            >
              <Motion.img
                src={
                  property.images?.[activeImage]?.url ||
                  "/placeholder-image.jpg"
                }
                alt={`Property view ${activeImage + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                key={activeImage}
                onClick={() => handleOpenFullscreenGallery(activeImage)}
              />

              <AnimatePresence>
                {isHoveringMainImage && (
                  <Motion.button
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm p-3 rounded-full shadow-lg text-white hover:bg-black/80 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleOpenFullscreenGallery(activeImage)}
                  >
                    <Eye className="w-6 h-6" />
                  </Motion.button>
                )}
              </AnimatePresence>

              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {activeImage + 1} / {property.images?.length || 0}
              </div>
            </div>

            {/* Thumbnail grid (right side) - Top Row */}
            {property.images
              ?.filter((_, index) => index !== activeImage)
              ?.slice(0, 2)
              ?.map((image, idx) => {
                const originalIndex = property.images.findIndex(
                  (img, i) =>
                    i !== activeImage &&
                    property.images
                      .filter((_, j) => j !== activeImage)
                      .indexOf(img) === idx
                );
                return (
                  <Motion.button
                    key={`top-${originalIndex}`}
                    onClick={() => handleThumbnailClick(originalIndex)}
                    className="relative rounded-md overflow-hidden bg-neutral-100"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${originalIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Motion.button>
                );
              })}

            {/* Thumbnail grid (right side) - Bottom Row */}
            {property.images
              ?.filter((_, index) => index !== activeImage)
              ?.slice(2, 4)
              ?.map((image, idx) => {
                const originalIndex = property.images.findIndex(
                  (img, i) =>
                    i !== activeImage &&
                    property.images
                      .filter((_, j) => j !== activeImage)
                      .indexOf(img) ===
                      idx + 2
                );
                return (
                  <Motion.button
                    key={`bottom-${originalIndex}`}
                    onClick={() => handleThumbnailClick(originalIndex)}
                    className="relative rounded-md overflow-hidden bg-neutral-100"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${originalIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Motion.button>
                );
              })}

            {/* Empty placeholders if needed */}
            {(property.images?.length || 0) <= 4 &&
              Array(4 - ((property.images?.length || 0) - 1))
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="rounded-md overflow-hidden bg-neutral-100 flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 text-neutral-300" />
                  </div>
                ))}
          </div>

          {/* View all photos button */}
          <Motion.button
            className="mt-2 flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors"
            onClick={() => handleOpenFullscreenGallery(0)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-4 h-4" />
            View all photos
          </Motion.button>
        </Motion.div>

        {/* Fullscreen Gallery Modal */}
        <AnimatePresence>
          {showFullscreenGallery && (
            <Motion.div
              className="fixed inset-0 z-50 bg-black/95 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 text-white">
                <div className="text-sm">
                  {fullscreenActiveImage + 1} / {property.images?.length || 0}
                </div>
                <Motion.button
                  className="p-2 rounded-full hover:bg-white/10"
                  onClick={handleCloseFullscreenGallery}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </Motion.button>
              </div>

              {/* Main Image */}
              <div className="flex-1 flex items-center justify-center relative max-h-[70vh]">
                <Motion.img
                  key={fullscreenActiveImage}
                  src={
                    property.images?.[fullscreenActiveImage]?.url ||
                    "/placeholder-image.jpg"
                  }
                  alt={`Property view ${fullscreenActiveImage + 1}`}
                  className="max-h-full max-w-full object-contain h-auto w-auto mx-auto"
                  style={{ maxHeight: "70vh", maxWidth: "90vw" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Navigation buttons */}
                <Motion.button
                  className="absolute left-4 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white"
                  onClick={handlePrevImage}
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Motion.button>

                <Motion.button
                  className="absolute right-4 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white"
                  onClick={handleNextImage}
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Motion.button>
              </div>

              {/* Thumbnails */}
              <div className="p-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 justify-center">
                  {property.images?.map((image, index) => (
                    <Motion.button
                      key={index}
                      onClick={() => setFullscreenActiveImage(index)}
                      className={`flex-shrink-0 h-16 aspect-[4/3] rounded-lg overflow-hidden border-2 ${
                        fullscreenActiveImage === index
                          ? `border-${Colors.accent.orange.substring(1)}`
                          : "border-transparent"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </Motion.button>
                  ))}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Two Column Layout for details and contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Motion.div
            className="lg:col-span-2 space-y-10"
            variants={staggerContainer}
          >
            <Motion.div
              className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200"
              variants={fadeIn}
            >
              <div>
                <h2 className="font-bold text-neutral-900 mb-1 text-[15px] lg:text-base">
                  {property?.title || "Property Title"}
                </h2>
                <div className="flex items-center gap-3 text-neutral-600">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    <span className="text-[10.5px] lg:text-base">
                      {property?.number_of_rooms || 0} rooms
                    </span>
                  </div>
                  <span className="text-neutral-300">•</span>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    <span className="text-[10.5px] lg:text-base">
                      {property?.number_of_bathrooms || 0} bathrooms
                    </span>
                  </div>
                  <span className="text-neutral-300">•</span>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-[10.5px] lg:text-base">
                      {property?.location || "Location not specified"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center mr-3 overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      property?.landlord?.full_name || "Landlord"
                    )}&background=random`}
                    alt={property?.landlord?.full_name || "Landlord"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 text-sm lg:text-base">
                    Hosted by {property?.landlord?.full_name || "Landlord"}
                  </h3>
                  <p className="text-[10px] lg:text-xs text-neutral-500">
                    Response time: 24 hours
                  </p>
                </div>
              </div>
            </Motion.div>

            {/* Description */}
            <Motion.section
              variants={fadeIn}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-[15px] lg:text-base font-bold text-neutral-900 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <Home className="w-4 h-4 text-primary-600" />
                </span>
                About this space
              </h2>
              <p className="text-neutral-700 leading-relaxed text-[13px] lg:text-base">
                {property?.description || "No description available"}
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Property Type</p>
                  <p className="font-medium text-neutral-800">
                    {property?.property_type || "Not specified"}
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Rooms</p>
                  <p className="font-medium text-neutral-800">
                    {property?.number_of_rooms || 0}
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Year Built</p>
                  <p className="font-medium text-neutral-800">
                    {property?.year_built || "Not specified"}
                  </p>
                </div>
              </div>
            </Motion.section>

            {/* Amenities */}
            <Motion.section
              variants={fadeIn}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-[15px] lg:text-base font-bold text-neutral-900 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4 text-primary-600" />
                </span>
                What this place offers
              </h2>

              <Motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-y-4"
                variants={staggerContainer}
              >
                {displayedAmenities.map((amenity, index) => (
                  <Motion.div
                    key={index}
                    className="flex items-center"
                    variants={fadeIn}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                      {renderAmenityIcon(amenity)}
                    </div>
                    <span className="text-neutral-700 text-[13px] lg:text-base">
                      {amenity}
                    </span>
                  </Motion.div>
                ))}
              </Motion.div>

              {(property?.amenities?.length || 0) > 6 && (
                <Motion.button
                  className="mt-6 text-sm font-medium px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors flex items-center"
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ color: Colors.accent.orange }}
                >
                  {showAllAmenities
                    ? "Show Less"
                    : `Show all ${property?.amenities?.length || 0} amenities`}
                  {!showAllAmenities && <ArrowRight className="w-4 h-4 ml-1" />}
                </Motion.button>
              )}
            </Motion.section>
          </Motion.div>

          {/* Right Column - Contact and Actions */}
          <Motion.div className="space-y-6" variants={staggerContainer}>
            {/* Price Card */}
            <Motion.div
              className="bg-white rounded-xl shadow-md p-6 border border-neutral-100 sticky top-24"
              variants={fadeIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-2xl font-bold text-neutral-900">
                    ₵{property?.price?.toLocaleString() || "0"}
                  </span>
                  <span className="text-sm text-neutral-500 ml-1">/month</span>
                  {property?.is_negotiable && (
                    <span className="block text-xs text-neutral-500 mt-1">
                      Price is negotiable
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">
                    Contact {property?.landlord?.full_name || "Landlord"}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        property?.landlord?.full_name || "Landlord"
                      )}&background=random`}
                      alt={property?.landlord?.full_name || "Landlord"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex items-center text-sm mb-2">
                  <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                  <span>+{maskPhoneNumber(property?.contact_number)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MessageSquare className="w-4 h-4 text-neutral-500 mr-2" />
                  <span>
                    Response Rate:{" "}
                    {property?.landlord?.response_rate || "24 hours"}
                  </span>
                </div>
              </div>

              <Motion.button
                onClick={handleCallLandlord}
                className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 mb-3"
                style={{
                  backgroundColor: Colors.accent.orange,
                  color: "white",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <PhoneCall className="w-5 h-5" />
                {user ? 'Call Landlord' : 'Login to Call'}
              </Motion.button>

              <Motion.button
                onClick={handleWhatsAppLandlord}
                className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  backgroundColor: "#25D366",
                  color: "white",
                  boxShadow: "0 4px 14px rgba(37, 211, 102, 0.4)",
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 6px 20px rgba(37, 211, 102, 0.5)",
                  backgroundColor: "#1ea952",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {user ? 'WhatsApp Landlord' : 'Login to WhatsApp'}
              </Motion.button>
            </Motion.div>
          </Motion.div>
        </div>

        {/* Related Properties Section */}
        <Motion.section className="mb-12" variants={fadeIn}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-neutral-900 flex items-center">
              <Home className="w-5 h-5 mr-2 text-primary-600" />
              Related Properties
            </h2>
            <Motion.button
              onClick={() => navigate("/properties")}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: Colors.accent.orange }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedProperties.map((property) => (
              <PropertyCard key={property.property_slug} property={property} />
            ))}
            {relatedProperties.length === 0 && (
              <div className="col-span-full text-center text-neutral-600">
                <EmptyState
                  icon="home"
                  title="No related properties found"
                  description="There are no related properties to display at the moment."
                />
              </div>
            )}
          </div>
        </Motion.section>
      </Motion.div>

      {/* Floating Navigation Menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollTop && (
            <Motion.button
              className="p-3 rounded-full shadow-lg text-white"
              style={{ backgroundColor: Colors.primary[600] }}
              onClick={handleScrollToTop}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUp className="w-5 h-5" />
            </Motion.button>
          )}
        </AnimatePresence>

        {/* Main Navigation Menu Button */}
        <Motion.div className="relative">
          {/* Menu Items */}
          <AnimatePresence>
            {isNavMenuOpen && (
              <Motion.div
                className="absolute bottom-16 right-0 flex flex-col gap-3 items-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {navItems.map((item, index) => (
                  <Motion.button
                    key={index}
                    className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-white shadow-lg text-neutral-700"
                    onClick={() => {
                      item.action();
                      setIsNavMenuOpen(false);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: index * 0.08 },
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                      transition: {
                        delay: (navItems.length - index - 1) * 0.05,
                      },
                    }}
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.name}</span>
                  </Motion.button>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Main Menu Button */}
          <Motion.button
            className="p-4 rounded-full shadow-lg text-white"
            style={{ backgroundColor: Colors.accent.orange }}
            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isNavMenuOpen ? (
                <Motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </Motion.div>
              ) : (
                <Motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </Motion.div>
              )}
            </AnimatePresence>
          </Motion.button>
        </Motion.div>
      </div>
    </GuestLayout>
  );
};

export default PropertyDetails;
