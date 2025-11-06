import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Trash2,
  Filter,
  X,
  RefreshCcw,
  ArrowLeft,
  BookmarkX,
} from "lucide-react";
import { useNavigate } from "react-router";
import GuestLayout from "../../Layouts/GuestLayout";
import PropertyCard from "../../components/Utilities/PropertyCard";
import Colors from "../../utils/Colors";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import {
  getWishlist,
  removeWishlistItem,
} from "../../api/Renter/General/WishlistRequests";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);

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

  // Fetch wishlist data
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await getWishlist();
      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        // Convert object to array if needed
        const items = Array.isArray(response?.data?.data)
          ? response?.data?.data
          : Object.values(response?.data?.data || {});
        setWishlistItems(items);
      } else {
        toast.error(response?.data?.reason || "An error occurred");
      }
    } catch (error) {
      toast.error(error?.response?.data?.reason || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // const togglePropertyType = (type) => {
  //   setSelectedPropertyTypes(prev =>
  //     prev.includes(type)
  //       ? prev.filter(t => t !== type)
  //       : [...prev, type]
  //   );
  // };

  const handleRemoveFromWishlist = async (propertySlug, event) => {
    event.stopPropagation();
    try {
      const response = await removeWishlistItem(propertySlug);
      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.wishlist_slug !== propertySlug)
        );
        toast.success("Property removed from wishlist successfully");
      } else {
        toast.error(response?.data?.reason || "Failed to remove from wishlist");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.reason || "Failed to remove from wishlist"
      );
    }
  };

  const handleRefresh = () => {
    fetchWishlist();
  };

  // Get unique property types from wishlist items
  // const getAvailablePropertyTypes = () => {
  //   const types = wishlistItems.map(item => item.property.property_type);
  //   return [...new Set(types)];
  // };

  // Filter and sort items
  const filteredItems = wishlistItems
    .filter((item) => {
      const property = item.property;
      const price = parseFloat(property.price);

      // Property type filter
      const typeMatch =
        selectedPropertyTypes.length === 0 ||
        selectedPropertyTypes.includes(property.property_type);

      // Price range filter
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      return typeMatch && priceMatch;
    })
    .sort((a, b) => {
      const propertyA = a.property;
      const propertyB = b.property;

      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "price-asc":
          return parseFloat(propertyA.price) - parseFloat(propertyB.price);
        case "price-desc":
          return parseFloat(propertyB.price) - parseFloat(propertyA.price);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </GuestLayout>
    );
  }

  // const availablePropertyTypes = getAvailablePropertyTypes();

  return (
    <AuthLayout>
      <Motion.div
        className="max-w-8xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Back button - Positioned at the top */}
        <Motion.button
          onClick={handleGoBack}
          className="flex items-center text-neutral-600 hover:text-primary-600 transition-colors mb-6 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Motion.button>

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-4 border-neutral-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-neutral-600 text-sm mt-1">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "property" : "properties"} saved
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-medium">Filter</span>
            </Motion.button>

            <Motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
            >
              <RefreshCcw className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-medium">Refresh</span>
            </Motion.button>
          </div>
        </div>

        {/* Enhanced Filter panel */}
        <AnimatePresence>
          {showFilter && (
            <Motion.div
              className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-lg border border-neutral-200 p-6 mb-6 backdrop-blur-sm"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Filter Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Filter className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Filter & Sort
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Customize your property search
                    </p>
                  </div>
                </div>
                <Motion.button
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  onClick={() => setShowFilter(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </Motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sort By Section */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-base font-semibold text-neutral-800">
                      Sort By
                    </h3>
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">✨ Newest First</option>
                      <option value="oldest">⏰ Oldest First</option>
                      <option value="price-asc">💰 Price: Low to High</option>
                      <option value="price-desc">💎 Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Price Range Section */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h3 className="text-base font-semibold text-neutral-800">
                      Price Range
                    </h3>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        {/* <label className="block text-xs font-medium text-neutral-600 mb-1">From (₵)</label> */}
                        <input
                          type="number"
                          className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              parseInt(e.target.value) || 0,
                              priceRange[1],
                            ])
                          }
                          min="0"
                          placeholder="Min price"
                        />
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        {/* <label className="block text-xs font-medium text-neutral-600 mb-1">To (₵)</label> */}
                        <input
                          type="number"
                          className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              parseInt(e.target.value) || 10000,
                            ])
                          }
                          min={priceRange[0]}
                          placeholder="Max price"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 bg-neutral-100 px-3 py-2 rounded-lg">
                      Range: ₵{priceRange[0].toLocaleString()} - ₵
                      {priceRange[1].toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Property Type Section */}
                {/* <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <h3 className="text-base font-semibold text-neutral-800">Property Type</h3>
                  </div>
                  <div className="flex-1 space-y-3">
                    {availablePropertyTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availablePropertyTypes.map((type) => (
                          <Motion.button
                            key={type}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                              selectedPropertyTypes.includes(type)
                                ? "bg-primary-500 text-white border-primary-500 shadow-md"
                                : "bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => togglePropertyType(type)}
                          >
                            {type}
                          </Motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-6 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300">
                        <span className="text-sm text-neutral-500">No property types available</span>
                      </div>
                    )}
                    {selectedPropertyTypes.length > 0 && (
                      <div className="text-xs text-neutral-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        {selectedPropertyTypes.length} type{selectedPropertyTypes.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                </div> */}
              </div>

              {/* Filter Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-neutral-200">
                <Motion.button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${Colors.accent.orange}, ${Colors.accent.orange}dd)`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilter(false)}
                >
                  Apply Filters ({filteredItems.length} results)
                </Motion.button>
                <Motion.button
                  className="px-6 py-3 bg-white text-neutral-700 rounded-xl font-medium border border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPropertyTypes([]);
                    setPriceRange([0, 10000]);
                    setSortBy("newest");
                  }}
                >
                  Reset All
                </Motion.button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Properties grid or empty state */}
        {wishlistItems.length > 0 ? (
          <>
            <Motion.div
              className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              variants={staggerContainer}
            >
              {filteredItems.map((wishlistItem, index) => (
                <Motion.div
                  key={wishlistItem.wishlist_slug}
                  variants={fadeIn}
                  custom={index}
                  className="relative group"
                >
                  <PropertyCard property={wishlistItem.property} />

                  {/* Remove button - appears on hover */}
                  <Motion.button
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) =>
                      handleRemoveFromWishlist(wishlistItem.wishlist_slug, e)
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Motion.button>
                </Motion.div>
              ))}
            </Motion.div>

            {/* No results from filter */}
            {filteredItems.length === 0 && (
              <Motion.div
                className="flex flex-col items-center justify-center py-12 px-4 text-center bg-neutral-50 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  No matching properties
                </h3>
                <p className="text-neutral-600 max-w-md mb-6">
                  We couldn't find any properties matching your filter criteria.
                  Try adjusting your filters or clear them to see all your saved
                  properties.
                </p>
                <Motion.button
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium"
                  style={{ backgroundColor: Colors.accent.orange }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedPropertyTypes([]);
                    setPriceRange([0, 10000]);
                    setSortBy("newest");
                  }}
                >
                  Clear Filters
                </Motion.button>
              </Motion.div>
            )}
          </>
        ) : (
          <Motion.div
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Motion.div
              className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6"
              initial={{ scale: 0.8 }}
              animate={{
                scale: [0.8, 1, 0.8],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              <BookmarkX className="w-12 h-12 text-red-400" />
            </Motion.div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-neutral-600 max-w-md mb-8">
              You haven't saved any properties to your wishlist yet. Browse
              properties and click the heart icon to save them for later.
            </p>
            <Motion.button
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center gap-2"
              style={{ backgroundColor: Colors.accent.orange }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/properties")}
            >
              Browse Properties
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Motion.button>
          </Motion.div>
        )}
      </Motion.div>
    </AuthLayout>
  );
};

export default Wishlist;
