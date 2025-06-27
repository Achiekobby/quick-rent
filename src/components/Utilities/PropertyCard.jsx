import { useState } from "react";
import { Heart, ThumbsUp, Eye, Star, Calendar, MapPin, Loader2 } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import Colors from "../../utils/Colors";
import { storeWishlistItem } from "../../api/Renter/General/WishlistRequests";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore";

const PropertyCard = ({ property }) => {
  const { user } = useAuthStore();
  const pageLocation = useLocation();
  const isWishlistPage = pageLocation.pathname === "/wishlist";
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const {
    property_slug,
    featured_image,
    title,
    location,
    price,
    is_negotiable,
    is_available,
  } = property;

  const handleWishlist = async()=>{
    try{
      if(!user){
        navigate("/login");
        return;
      }
      setIsWishlisting(true);
      const response = await storeWishlistItem({property_slug});
      if(response?.data?.status_code === "000" && !response?.data?.in_error){
        setIsLiked(true);
        localStorage.setItem(`wishlist_${property_slug}`, "true");
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

  const handleViewDetails = () => {
    navigate(`/properties/${property_slug}`);
  };

  return (
    <Motion.div
      className="bg-white rounded-lg sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={featured_image.url}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
          {is_available && (
            <Motion.div
              className="flex items-center gap-1 sm:gap-1.5 bg-white shadow-lg rounded-lg py-1 px-2 sm:py-1.5 sm:px-2.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                Available
              </span>
            </Motion.div>
          )}
          {is_negotiable && (
            <Motion.span
              className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-primary-600 bg-white shadow-lg px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"
              />
              Negotiable
            </Motion.span>
          )}
        </div>
        {!isWishlistPage && (
          <Motion.button
            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white shadow-lg transition-colors duration-200"
            whileTap={{ scale: 0.95 }}
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
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-sm sm:text-base font-semibold text-neutral-900 line-clamp-1 mb-0.5 sm:mb-1">
            {title.length > 15 ? title.slice(0, 15) + "..." : title}
          </h3>

          <p className="text-[10px] sm:text-sm text-primary-600 font-medium mb-1.5 sm:mb-2 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {location}
          </p>

          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <p className="text-sm sm:text-base font-bold text-neutral-900">
                ₵{price}
                <span className="text-[10px] sm:text-sm font-medium text-neutral-500 ml-0.5 sm:ml-1">
                  /mo
                </span>
              </p>
              {is_negotiable && (
                <span className="text-[8px] sm:text-xs text-neutral-500">
                  Negotiable
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at the bottom */}
        <div className="space-y-1.5 sm:space-y-2 mt-auto">
          <Motion.button
            className="w-full bg-primary-600 text-white py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 hover:bg-primary-700"
            style={{ backgroundColor: Colors.accent.orange }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewDetails}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            View Details
          </Motion.button>
        </div>
      </div>
    </Motion.div>
  );
};

export default PropertyCard;
