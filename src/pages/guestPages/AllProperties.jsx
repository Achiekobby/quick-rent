import { useState, useEffect, useRef } from "react";
import {
  motion as Motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  Search,
  MapPin,
  Filter,
  ChevronDown,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Heart,
  Map,
  X,
  Loader2,
  Home,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import PropertyCard from "../../components/Utilities/PropertyCard";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import { getEveryProperty } from "../../api/Renter/General/DashboardRequests";
import { toast } from "react-toastify";

// Mock categories for the filter tabs
const propertyCategories = [
  { id: 1, name: "All", icon: "🏠" },
  { id: 2, name: "Single Room", icon: "🏢" },
  { id: 3, name: "Chamber and Hall", icon: "🏡" },
  { id: 4, name: "2 Bedroom Apartment", icon: "🛏️" },
  { id: 5, name: "3 Bedroom Apartment", icon: "🏠" },
  { id: 6, name: "Office Space", icon: "🪟" },
  { id: 7, name: "Short Stay", icon: "🏠" },
];

const amenitiesList = [
  "Air Conditioning",
  "Parking",
  "Swimming Pool",
  "Gym",
  "Security",
  "Elevator",
  "Balcony",
  "Garden",
  "WiFi",
  "Furnished",
  "Pet Friendly",
  "Laundry",
  "Storage",
  "Fire Safety",
  "CCTV",
  "Generator",
  "Water Tank",
  "Solar Power",
  "Intercom",
  "Gated Community",
];

const AllProperties = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [showSideFilters, setShowSideFilters] = useState(false);
  const [selectedBedroom, setSelectedBedroom] = useState("Any");
  const [selectedBathroom, setSelectedBathroom] = useState("Any");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("recommended");
  const navRef = useRef(null);
  const navHeight = useRef(0);
  const topRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [properties, setProperties] = useState([]);
  const itemsPerPage = 12;
  
  const location = useLocation();
  const navigate = useNavigate();

  // Apply URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const locationParam = urlParams.get('location');
    const categoryParam = urlParams.get('category');
    
    // Apply location filter to search query
    if (locationParam) {
      setSearchQuery(locationParam);
    }
    
    // Apply category filter
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    // Show toast notification if filters are applied from Hero
    if (locationParam || categoryParam) {
      const filterMessages = [];
      if (locationParam) filterMessages.push(`Location: ${locationParam}`);
      if (categoryParam) filterMessages.push(`Category: ${categoryParam}`);
      
      // toast.success(`Filters applied: ${filterMessages.join(', ')}`, {
      //   position: "top-right",
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      // });
      
      // Smooth scroll to properties section after a short delay
      setTimeout(() => {
        if (topRef.current) {
          window.scrollTo({
            top: topRef.current.offsetTop + 100,
            behavior: 'smooth'
          });
        }
      }, 500);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await getEveryProperty();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setProperties(response?.data?.data || []);
        } else {
          toast.error(response?.data?.reason || "Error fetching properties");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason || "Error fetching properties"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter properties based on selected category and search query
  const filteredProperties = properties.filter((property) => {
    // Debug logging
    if (selectedCategory === "Single Room" && properties.length > 0) {
      console.log("Debug - Property:", property);
      console.log("Debug - Property Type:", property.property_type);
      console.log("Debug - Selected Category:", selectedCategory);
    }
    
    // Category filter
    let categoryMatch = true;
    if (selectedCategory !== "All") {
      const propertyType = property.property_type?.toLowerCase() || "";
      const selectedCategoryLower = selectedCategory.toLowerCase();

      switch (selectedCategoryLower) {
        case "single room":
          categoryMatch =
            propertyType.includes("single room") ||
            propertyType.includes("single-room") ||
            propertyType === "single room";
          break;
        case "chamber and hall":
          categoryMatch =
            propertyType.includes("chamber") && propertyType.includes("hall") ||
            propertyType === "chamber and hall";
          break;
        case "2 bedroom apartment":
          categoryMatch =
            propertyType.includes("2 bedroom") ||
            propertyType.includes("2-bedroom") ||
            propertyType === "2 bedroom apartment";
          break;
        case "3 bedroom apartment":
          categoryMatch =
            propertyType.includes("3 bedroom") ||
            propertyType.includes("3-bedroom") ||
            propertyType === "3 bedroom apartment";
          break;
        case "2/3 bedroom apartment":
          categoryMatch =
            propertyType.includes("2 bedroom") ||
            propertyType.includes("3 bedroom") ||
            propertyType.includes("2-bedroom") ||
            propertyType.includes("3-bedroom") ||
            propertyType === "2 bedroom apartment" ||
            propertyType === "3 bedroom apartment";
          break;
        case "office space":
          categoryMatch = 
            propertyType.includes("office") ||
            propertyType === "office space";
          break;
        case "short stay":
          categoryMatch =
            propertyType.includes("short stay") ||
            propertyType.includes("short-stay") ||
            propertyType.includes("airbnb") ||
            propertyType.includes("vacation") ||
            propertyType === "short stay";
          break;
        default:
          categoryMatch = propertyType.includes(selectedCategoryLower);
      }
    }

    // Debug logging for category match
    if (selectedCategory === "Single Room" && properties.length > 0) {
      console.log("Debug - Category Match:", categoryMatch);
    }

    // Search query filter (enhanced to include location matching)
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        property.title?.toLowerCase() || "",
        property.property_name?.toLowerCase() || "",
        property.property_type?.toLowerCase() || "",
        property.location?.toLowerCase() || "",
        property.city?.toLowerCase() || "",
        property.region?.toLowerCase() || "",
        property.description?.toLowerCase() || "",
      ];
      searchMatch = searchableFields.some((field) => field.includes(query));
      
      // Debug logging for search
      if (searchQuery === "Kumasi" && properties.length > 0) {
        console.log("Debug - Search Query:", searchQuery);
        console.log("Debug - Searchable Fields:", searchableFields);
        console.log("Debug - Search Match:", searchMatch);
      }
    }

    // Price range filter
    let priceMatch = true;
    if (priceRange.min || priceRange.max) {
      const propertyPrice = parseFloat(property.price) || 0;
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;

      priceMatch = propertyPrice >= minPrice && propertyPrice <= maxPrice;
    }

    // Property type filter
    let propertyTypeMatch = true;
    if (selectedPropertyTypes.length > 0) {
      const propertyTypes =
        property.property_types ||
        property.property_type ||
        property.description ||
        property.title ||
        "";
      const propertyTypesLower = propertyTypes.toLowerCase();

      propertyTypeMatch = selectedPropertyTypes.some((selectedType) => {
        const selectedTypeLower = selectedType.toLowerCase();

        // Handle specific mappings
        switch (selectedTypeLower) {
          case "apartment":
            return (
              propertyTypesLower.includes("apartment") ||
              propertyTypesLower.includes("flat")
            );
          case "house":
            return (
              propertyTypesLower.includes("house") ||
              propertyTypesLower.includes("home")
            );
          case "office space":
            return (
              propertyTypesLower.includes("office") ||
              propertyTypesLower.includes("office space")
            );
          case "single room":
            return (
              propertyTypesLower.includes("single room") ||
              propertyTypesLower.includes("single-room") ||
              propertyTypesLower.includes("bedsitter")
            );
          case "studio":
            return propertyTypesLower.includes("studio");
          case "townhouse":
            return (
              propertyTypesLower.includes("townhouse") ||
              propertyTypesLower.includes("town house")
            );
          case "villa":
            return propertyTypesLower.includes("villa");
          default:
            return propertyTypesLower.includes(selectedTypeLower);
        }
      });
    }

    // Bedrooms filter
    let bedroomMatch = true;
    if (selectedBedroom !== "Any") {
      const propertyRooms = parseInt(property.number_of_rooms) || 0;

      switch (selectedBedroom) {
        case "1":
          bedroomMatch = propertyRooms === 1;
          break;
        case "2":
          bedroomMatch = propertyRooms === 2;
          break;
        case "3":
          bedroomMatch = propertyRooms === 3;
          break;
        case "4+":
          bedroomMatch = propertyRooms >= 4;
          break;
        default:
          bedroomMatch = true;
      }
    }

    // Bathrooms filter
    let bathroomMatch = true;
    if (selectedBathroom !== "Any") {
      const propertyBathrooms = parseInt(property.number_of_bathrooms) || 0;

      switch (selectedBathroom) {
        case "1":
          bathroomMatch = propertyBathrooms === 1;
          break;
        case "2":
          bathroomMatch = propertyBathrooms === 2;
          break;
        case "3+":
          bathroomMatch = propertyBathrooms >= 3;
          break;
        default:
          bathroomMatch = true;
      }
    }

    // Amenities filter
    let amenitiesMatch = true;
    if (selectedAmenities.length > 0) {
      // Handle different amenities data formats
      let propertyAmenitiesText = "";
      
      if (property.amenities) {
        if (Array.isArray(property.amenities)) {
          propertyAmenitiesText = property.amenities.join(" ");
        } else if (typeof property.amenities === "string") {
          propertyAmenitiesText = property.amenities;
        } else if (typeof property.amenities === "object") {
          propertyAmenitiesText = JSON.stringify(property.amenities);
        }
      } else if (property.features) {
        if (Array.isArray(property.features)) {
          propertyAmenitiesText = property.features.join(" ");
        } else if (typeof property.features === "string") {
          propertyAmenitiesText = property.features;
        } else if (typeof property.features === "object") {
          propertyAmenitiesText = JSON.stringify(property.features);
        }
      } else {
        propertyAmenitiesText = property.description || "";
      }
      
      const propertyAmenitiesLower = propertyAmenitiesText.toLowerCase();

      // Check if ALL selected amenities are present (AND logic)
      amenitiesMatch = selectedAmenities.every((selectedAmenity) => {
        const amenityLower = selectedAmenity.toLowerCase();

        // Handle specific mappings for common variations
        switch (amenityLower) {
          case "air conditioning":
            return (
              propertyAmenitiesLower.includes("air conditioning") ||
              propertyAmenitiesLower.includes("ac") ||
              propertyAmenitiesLower.includes("air con") ||
              propertyAmenitiesLower.includes("aircon")
            );
          case "parking":
            return (
              propertyAmenitiesLower.includes("parking") ||
              propertyAmenitiesLower.includes("garage") ||
              propertyAmenitiesLower.includes("car park")
            );
          case "swimming pool":
            return (
              propertyAmenitiesLower.includes("pool") ||
              propertyAmenitiesLower.includes("swimming")
            );
          case "gym":
            return (
              propertyAmenitiesLower.includes("gym") ||
              propertyAmenitiesLower.includes("fitness") ||
              propertyAmenitiesLower.includes("exercise")
            );
          case "security":
            return (
              propertyAmenitiesLower.includes("security") ||
              propertyAmenitiesLower.includes("guard")
            );
          case "pet friendly":
            return (
              propertyAmenitiesLower.includes("pet") ||
              propertyAmenitiesLower.includes("animal")
            );
          case "furnished":
            return (
              propertyAmenitiesLower.includes("furnished") ||
              propertyAmenitiesLower.includes("furniture")
            );
          case "wifi":
            return (
              propertyAmenitiesLower.includes("wifi") ||
              propertyAmenitiesLower.includes("wi-fi") ||
              propertyAmenitiesLower.includes("internet")
            );
          case "elevator":
            return (
              propertyAmenitiesLower.includes("elevator") ||
              propertyAmenitiesLower.includes("lift")
            );
          case "gated community":
            return (
              propertyAmenitiesLower.includes("gated") ||
              propertyAmenitiesLower.includes("estate")
            );
          case "solar power":
            return (
              propertyAmenitiesLower.includes("solar") ||
              propertyAmenitiesLower.includes("renewable")
            );
          case "water tank":
            return (
              propertyAmenitiesLower.includes("water tank") ||
              propertyAmenitiesLower.includes("water storage")
            );
          default:
            return propertyAmenitiesLower.includes(amenityLower);
        }
      });
    }

    return (
      categoryMatch &&
      searchMatch &&
      priceMatch &&
      propertyTypeMatch &&
      bedroomMatch &&
      bathroomMatch &&
      amenitiesMatch
    );
  });

  // Sort filtered properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "price_low_high": {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceA - priceB;
      }
      
      case "price_high_low": {
        const priceAHigh = parseFloat(a.price) || 0;
        const priceBHigh = parseFloat(b.price) || 0;
        return priceBHigh - priceAHigh;
      }
      
      case "newest": {
        const dateA = new Date(a.created_at || a.date_created || 0);
        const dateB = new Date(b.created_at || b.date_created || 0);
        return dateB - dateA;
      }
      
      case "oldest": {
        const dateAOld = new Date(a.created_at || a.date_created || 0);
        const dateBOld = new Date(b.created_at || b.date_created || 0);
        return dateAOld - dateBOld;
      }
      
      case "recommended":
      default:
        // Default order (no sorting)
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);

  // Get current properties from sorted results
  const indexOfLastProperty = currentPage * itemsPerPage;
  const indexOfFirstProperty = indexOfLastProperty - itemsPerPage;
  const currentProperties = sortedProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  // Change page and scroll to top
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: topRef.current.offsetTop - navHeight.current - 10,
      behavior: "smooth",
    });
  };

  const nextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    setCurrentPage(newPage);
    if (newPage !== currentPage) {
      window.scrollTo({
        top: topRef.current.offsetTop - navHeight.current - 10,
        behavior: "smooth",
      });
    }
  };

  const prevPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    if (newPage !== currentPage) {
      window.scrollTo({
        top: topRef.current.offsetTop - navHeight.current - 10,
        behavior: "smooth",
      });
    }
  };

  // Filter properties by category, search query, price range, property types, bedrooms, bathrooms, and amenities
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    searchQuery,
    priceRange,
    selectedPropertyTypes,
    selectedBedroom,
    selectedBathroom,
    selectedAmenities,
  ]);

  useEffect(() => {
    const topNavbar = document.querySelector("nav");
    if (topNavbar) {
      navHeight.current = topNavbar.offsetHeight;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (navRef.current) {
            const navPosition = navRef.current.getBoundingClientRect().top;
            setIsNavSticky(navPosition <= navHeight.current);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSideFilters &&
        !e.target.closest(".side-filter-panel") &&
        !e.target.closest(".filter-toggle-btn")
      ) {
        setShowSideFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSideFilters]);

  // Toggle property type selection
  const togglePropertyType = (type) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-white" ref={topRef}>
        {/* Hero Section with Search */}
        <Motion.section
          className="relative bg-neutral-50 pt-6 md:pt-8 pb-4 md:pb-6 border-b border-neutral-200"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            {/* Applied Filters Indicator */}
            {(location.search && (new URLSearchParams(location.search).get('location') || new URLSearchParams(location.search).get('category'))) && (
              <Motion.div
                className="mb-4 flex flex-wrap items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm text-neutral-600 font-medium">Applied filters:</span>
                {new URLSearchParams(location.search).get('location') && (
                  <Motion.span
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <MapPin size={14} />
                    {new URLSearchParams(location.search).get('location')}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(location.search);
                        params.delete('location');
                        const newSearch = params.toString();
                        navigate(`/properties${newSearch ? `?${newSearch}` : ''}`, { replace: true });
                        setSearchQuery("");
                      }}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Motion.span>
                )}
                {new URLSearchParams(location.search).get('category') && (
                  <Motion.span
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Home size={14} />
                    {new URLSearchParams(location.search).get('category')}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(location.search);
                        params.delete('category');
                        const newSearch = params.toString();
                        navigate(`/properties${newSearch ? `?${newSearch}` : ''}`, { replace: true });
                        setSelectedCategory("All");
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Motion.span>
                )}
                <Motion.button
                  className="text-sm text-neutral-500 hover:text-neutral-700 underline"
                  onClick={() => {
                    navigate('/properties', { replace: true });
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Clear all
                </Motion.button>
              </Motion.div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Motion.div
                className={`flex items-center bg-white rounded-full shadow-md border overflow-hidden ${
                  searchQuery ? 'border-orange-300 ring-2 ring-orange-100' : 'border-neutral-200'
                }`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="flex-grow px-3 md:px-4 py-2 md:py-3 flex items-center">
                  <Search
                    size={isMobileView ? 16 : 18}
                    className={`mr-2 ${searchQuery ? 'text-orange-500' : 'text-neutral-400'}`}
                  />
                  <input
                    type="text"
                    placeholder={
                      isMobileView
                        ? "Search properties..."
                        : "Search by location, property type, or features..."
                    }
                    className="w-full outline-none text-neutral-800 text-sm md:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 p-1 hover:bg-neutral-100 rounded-full"
                    >
                      <X size={14} className="text-neutral-400" />
                    </button>
                  )}
                </div>
                <Motion.button
                  className="h-full px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center rounded-r-full shadow-sm"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: Colors.accent.darkOrange,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search
                    size={isMobileView ? 16 : 20}
                    className="text-white"
                  />
                </Motion.button>
              </Motion.div>
            </div>
          </div>
        </Motion.section>

        <Motion.div
          ref={navRef}
          style={{
            top: isNavSticky ? `${navHeight.current}px` : "0",
          }}
          className={`border-b border-neutral-200 sticky bg-white z-40 ${
            isNavSticky ? "shadow-md" : "shadow-sm"
          }`}
          animate={{ 
            boxShadow: isNavSticky ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            mass: 0.8,
          }}
        >
          <div className="container mx-auto px-3 sm:px-6 lg:px-8 overflow-hidden">
            <div className="flex items-center justify-between py-2 md:py-3 gap-2">
              <AnimatePresence mode="wait">
                {isNavSticky && !isMobileView && (
                  <Motion.div
                    key="sticky-search"
                    className="flex-shrink-0 max-w-md mr-2 md:mr-4"
                    initial={{ opacity: 0, width: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, width: "auto", x: 0, scale: 1 }}
                    exit={{ opacity: 0, width: 0, x: -30, scale: 0.9 }}
                    transition={{ 
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      mass: 0.6,
                    }}
                  >
                    <div className="flex items-center bg-white rounded-full shadow-sm border border-neutral-200 overflow-hidden">
                      <div className="flex-grow px-3 py-2 flex items-center">
                        <Search size={14} className="text-neutral-400 mr-2" />
                        <input
                          type="text"
                          placeholder="Quick search..."
                          className="w-full outline-none text-neutral-800 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Motion.button
                        className="h-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center rounded-r-full shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: Colors.accent.darkOrange,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Search size={16} className="text-white" />
                      </Motion.button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isMobileView && isNavSticky && (
                  <Motion.button
                    key="mobile-search-btn"
                    className="p-2 rounded-full border border-neutral-200 mr-2"
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      mass: 0.5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                  >
                    <Search size={18} className="text-neutral-600" />
                  </Motion.button>
                )}
              </AnimatePresence>

              <Motion.div 
                className="flex items-center gap-0.5 sm:gap-1 overflow-x-hidden flex-grow min-w-0"
                initial={false}
                animate={isNavSticky ? {
                  opacity: 1,
                } : {
                  opacity: 1,
                }}
              >
                {propertyCategories.map((category, index) => {
                  const isActiveFromUrl = new URLSearchParams(location.search).get('category') === category.name;
                  const isSelected = selectedCategory === category.name;
                  const isHighlighted = isActiveFromUrl || isSelected;
                  
                  return (
                    <Motion.button
                      key={category.id}
                      className={`flex cursor-pointer flex-col items-center px-1.5 sm:px-2 md:px-2.5 py-1 rounded-lg whitespace-nowrap text-[10px] sm:text-xs md:text-xs transition-all duration-200 flex-shrink-0 ${
                        isHighlighted
                          ? isActiveFromUrl 
                            ? "bg-orange-100 text-orange-800 font-medium border border-orange-200" 
                            : "bg-neutral-100 font-medium"
                          : "hover:bg-neutral-50"
                      }`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.02,
                        duration: 0.4,
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        // Update URL to reflect category change
                        const params = new URLSearchParams(location.search);
                        if (category.name === "All") {
                          params.delete('category');
                        } else {
                          params.set('category', category.name);
                        }
                        const newSearch = params.toString();
                        navigate(`/properties${newSearch ? `?${newSearch}` : ''}`, { replace: true });
                      }}
                    >
                      <span className="text-sm sm:text-base md:text-lg mb-0.5">
                        {category.icon}
                      </span>
                      <span className="leading-tight">{category.name}</span>
                      {isActiveFromUrl && (
                        <Motion.div
                          className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        />
                      )}
                    </Motion.button>
                  );
                })}
              </Motion.div>
              <AnimatePresence>
                <Motion.button
                  className="filter-toggle-btn cursor-pointer ml-2 md:ml-3 p-2 bg-white rounded-full shadow-md border border-neutral-200 flex items-center justify-center"
                  style={{
                    backgroundColor: showSideFilters
                      ? Colors.accent.orange
                      : "white",
                    color: showSideFilters ? "white" : Colors.accent.orange,
                  }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                  onClick={() => setShowSideFilters(!showSideFilters)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sliders size={isMobileView ? 16 : 18} />
                </Motion.button>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showMobileSearch && isMobileView && (
                <Motion.div
                  className="py-2 pb-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center bg-white rounded-full shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="flex-grow px-3 py-2 flex items-center">
                      <Search size={14} className="text-neutral-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Quick search..."
                        className="w-full outline-none text-neutral-800 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="h-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center rounded-r-full shadow-sm">
                      <Search size={16} className="text-white" />
                    </button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </Motion.div>

        {/* Sliding Side Filter Panel */}
        <AnimatePresence>
          {showSideFilters && (
            <Motion.div
              className="fixed left-0 top-0 h-screen w-full z-60 bg-black/50 bg-opacity-20 flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Motion.div
                className="side-filter-panel bg-white h-full w-full max-w-xs md:max-w-md overflow-y-auto shadow-xl"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 1,
                }}
              >
                <div className="sticky top-0 bg-white z-10 px-4 md:px-6 py-3 md:py-4 border-b border-neutral-200 flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold">Filters</h2>
                  <Motion.button
                    className="p-2 rounded-full hover:bg-neutral-100"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSideFilters(false)}
                  >
                    <X size={isMobileView ? 18 : 20} />
                  </Motion.button>
                </div>

                <div className="p-4 md:p-6 space-y-5 md:space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      Price Range
                    </h3>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                          ₵
                        </span>
                        <input
                          type="text"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: e.target.value,
                            }))
                          }
                          className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg text-sm md:text-base"
                        />
                      </div>
                      <span>to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                          ₵
                        </span>
                        <input
                          type="text"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: e.target.value,
                            }))
                          }
                          className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg text-sm md:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      Property Type
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "Apartment",
                        "Office Space",
                        "House",
                        "Single Room",
                        "Studio",
                        "Townhouse",
                        "Villa",
                      ].map((type) => (
                        <Motion.div
                          key={type}
                          className={`flex items-center gap-2 border ${
                            selectedPropertyTypes.includes(type)
                              ? "border-accent-orange bg-orange-50"
                              : "border-neutral-300"
                          } rounded-lg p-3 cursor-pointer hover:bg-neutral-50`}
                          style={
                            selectedPropertyTypes.includes(type)
                              ? { borderColor: Colors.accent.orange }
                              : {}
                          }
                          whileTap={{ scale: 0.98 }}
                          onClick={() => togglePropertyType(type)}
                        >
                          <div
                            className="h-4 w-4 rounded border flex items-center justify-center"
                            style={{
                              backgroundColor: selectedPropertyTypes.includes(
                                type
                              )
                                ? Colors.accent.orange
                                : "white",
                              borderColor: selectedPropertyTypes.includes(type)
                                ? Colors.accent.orange
                                : "#d1d5db",
                            }}
                          >
                            {selectedPropertyTypes.includes(type) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="white"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm cursor-pointer flex-1">
                            {type}
                          </span>
                        </Motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      Bedrooms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["Any", "1", "2", "3", "4+"].map((bed) => (
                        <Motion.button
                          key={bed}
                          className={`px-4 py-2 border rounded-full text-sm ${
                            selectedBedroom === bed
                              ? "bg-accent-orange text-white border-accent-orange"
                              : "border-neutral-300 hover:bg-neutral-50"
                          }`}
                          style={
                            selectedBedroom === bed
                              ? {
                                  backgroundColor: Colors.accent.orange,
                                  borderColor: Colors.accent.orange,
                                }
                              : {}
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBedroom(bed)}
                        >
                          {bed}
                        </Motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      Bathrooms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["Any", "1", "2", "3+"].map((bath) => (
                        <Motion.button
                          key={bath}
                          className={`px-4 py-2 border rounded-full text-sm ${
                            selectedBathroom === bath
                              ? "bg-accent-orange text-white border-accent-orange"
                              : "border-neutral-300 hover:bg-neutral-50"
                          }`}
                          style={
                            selectedBathroom === bath
                              ? {
                                  backgroundColor: Colors.accent.orange,
                                  borderColor: Colors.accent.orange,
                                }
                              : {}
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedBathroom(bath)}
                        >
                          {bath}
                        </Motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  {/* <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                      Amenities
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {amenitiesList.map((amenity) => (
                        <Motion.div
                          key={amenity}
                          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-neutral-50 rounded-lg ${
                            selectedAmenities.includes(amenity)
                              ? "bg-orange-50"
                              : ""
                          }`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleAmenity(amenity)}
                        >
                          <div
                            className="h-4 w-4 rounded border flex items-center justify-center"
                            style={{
                              backgroundColor: selectedAmenities.includes(
                                amenity
                              )
                                ? Colors.accent.orange
                                : "white",
                              borderColor: selectedAmenities.includes(amenity)
                                ? Colors.accent.orange
                                : "#d1d5db",
                            }}
                          >
                            {selectedAmenities.includes(amenity) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="white"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm cursor-pointer flex-1">
                            {amenity}
                          </span>
                        </Motion.div>
                      ))}
                    </div>
                  </div> */}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-3 md:p-4 flex gap-3">
                  <Motion.button
                    className="flex-1 py-2 md:py-3 border border-neutral-300 rounded-lg text-neutral-700 font-medium text-sm md:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedBedroom("Any");
                      setSelectedBathroom("Any");
                      setSelectedPropertyTypes([]);
                      setSelectedAmenities([]);
                      setPriceRange({ min: "", max: "" });
                      setShowSideFilters(false);
                    }}
                  >
                    Reset
                  </Motion.button>
                  <Motion.button
                    className="flex-1 py-2 md:py-3 rounded-lg text-white font-medium text-sm md:text-base"
                    style={{ backgroundColor: Colors.accent.orange }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSideFilters(false)}
                  >
                    Apply Filters
                  </Motion.button>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Property Listings */}
        <Motion.section
          className="py-5 md:py-8"
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="container mx-auto px-3 sm:px-6 lg:px-8">
            <Motion.div
              className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="text-sm md:text-base text-neutral-600">
                Showing{" "}
                <span className="font-medium">
                  {sortedProperties.length === 0
                    ? "0"
                    : `${indexOfFirstProperty + 1}-${Math.min(
                        indexOfLastProperty,
                        sortedProperties.length
                      )}`}
                </span>{" "}
                of{" "}
                <span className="font-medium">{sortedProperties.length}</span>{" "}
                properties
                {selectedCategory !== "All" && (
                  <span className="text-neutral-500">
                    {" "}
                    in <span className="font-medium">{selectedCategory}</span>
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-neutral-600">
                  Sort by:
                </span>
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-neutral-300 rounded-lg py-1 pl-2 md:pl-3 pr-6 md:pr-8 text-xs md:text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_low_high">Price: Low to High</option>
                    <option value="price_high_low">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                </div>
              </div>
            </Motion.div>

            {currentProperties.length === 0 ? (
              <Motion.div
                className="text-center py-12 md:py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4">
                  <div className="text-6xl md:text-7xl mb-4">🏠</div>
                  <h3 className="text-lg md:text-xl font-semibold text-neutral-800 mb-2">
                    No properties found
                  </h3>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    {selectedCategory !== "All"
                      ? `No properties found in "${selectedCategory}" category.`
                      : searchQuery.trim()
                      ? `No properties match your search "${searchQuery}".`
                      : priceRange.min || priceRange.max
                      ? `No properties found in the specified price range.`
                      : selectedPropertyTypes.length > 0
                      ? `No properties found for the selected property types.`
                      : selectedBedroom !== "Any" || selectedBathroom !== "Any"
                      ? `No properties match the selected bedroom/bathroom criteria.`
                      : selectedAmenities.length > 0
                      ? `No properties found with the selected amenities.`
                      : "No properties available at the moment."}
                  </p>
                  {(selectedCategory !== "All" ||
                    searchQuery.trim() ||
                    priceRange.min ||
                    priceRange.max ||
                    selectedPropertyTypes.length > 0 ||
                    selectedBedroom !== "Any" ||
                    selectedBathroom !== "Any" ||
                    selectedAmenities.length > 0) && (
                    <Motion.button
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory("All");
                        setSearchQuery("");
                        setPriceRange({ min: "", max: "" });
                        setSelectedPropertyTypes([]);
                        setSelectedBedroom("Any");
                        setSelectedBathroom("Any");
                        setSelectedAmenities([]);
                      }}
                    >
                      View All Properties
                    </Motion.button>
                  )}
                </div>
              </Motion.div>
            ) : (
              <Motion.div
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {currentProperties.map((property) => (
                  <Motion.div
                    key={property.property_slug}
                    variants={staggerItem}
                  >
                    <PropertyCard property={property} />
                  </Motion.div>
                ))}
              </Motion.div>
            )}

            {/* Pagination */}
            {sortedProperties.length > 0 && totalPages > 1 && (
              <Motion.div
                className="mt-8 md:mt-10 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <nav className="flex items-center gap-1">
                  <Motion.button
                    className="p-1 md:p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={isMobileView ? 14 : 16} />
                  </Motion.button>

                  {isMobileView ? (
                    <div className="px-3 py-1 text-sm">
                      {currentPage} / {totalPages}
                    </div>
                  ) : (
                    <>
                      {Array.from({ length: Math.min(5, totalPages) }).map(
                        (_, i) => {
                          // Show pages around current page
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
                              key={i}
                              className={`w-8 md:w-10 h-8 md:h-10 rounded-lg flex items-center justify-center text-xs md:text-sm ${
                                currentPage === pageNum
                                  ? "bg-primary-600 text-white"
                                  : "border border-neutral-200 hover:bg-neutral-50"
                              }`}
                              style={
                                currentPage === pageNum
                                  ? { backgroundColor: Colors.accent.orange }
                                  : {}
                              }
                              whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.2 },
                              }}
                              whileTap={{
                                scale: 0.95,
                                transition: { duration: 0.1 },
                              }}
                              onClick={() => paginate(pageNum)}
                            >
                              {pageNum}
                            </Motion.button>
                          );
                        }
                      )}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-1">...</span>
                          <Motion.button
                            className="w-8 md:w-10 h-8 md:h-10 rounded-lg border border-neutral-200 flex items-center justify-center text-xs md:text-sm hover:bg-neutral-50"
                            whileHover={{
                              scale: 1.05,
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{
                              scale: 0.95,
                              transition: { duration: 0.1 },
                            }}
                            onClick={() => paginate(totalPages)}
                          >
                            {totalPages}
                          </Motion.button>
                        </>
                      )}
                    </>
                  )}

                  <Motion.button
                    className="p-1 md:p-2 rounded-lg border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={isMobileView ? 14 : 16} />
                  </Motion.button>
                </nav>
              </Motion.div>
            )}
          </div>
        </Motion.section>
      </div>
    </GuestLayout>
  );
};

export default AllProperties;
