import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Calendar,
  Phone,
  MessageCircle,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Home,
  Star,
  Copy,
  Eye,
  EyeOff,
  Code,
  Building,
  User,
  Search,
  Sparkles,
  Settings,
  Info,
  Zap,
  CheckCircle2,
  XCircle,
  Car,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import generalRequests from "../../api/Admin/Landlords/GeneralRequests";
import propertiesServices from "../../api/Admin/Landlords/PropertiesServices";
import ghanaRegions from "../../data/ghanaRegions";

const CreateProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [landlords, setLandlords] = useState([]);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  // Dropdown states for Region and Location
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [regionDropdownPosition, setRegionDropdownPosition] =
    useState("bottom");
  const [locationDropdownPosition, setLocationDropdownPosition] =
    useState("bottom");

  // Refs for error fields to enable smooth scrolling
  const errorFieldRefs = useRef({});
  const regionDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Property Basic Info
    title: "",
    property_type: "",

    // Location
    region: "",
    location: "",
    suburb: "",
    district: "",
    landmark: "",

    // Property Details
    number_of_bedrooms: 1,
    number_of_bathrooms: 1,
    bathroom_type: "private",
    kitchen_type: "private",
    year_built: "",
    square_feet: "",
    description: "",

    // Pricing & Contact
    per_month_amount: "",
    rental_years: 1,
    negotiable: false,
    contact_number: "",
    whatsapp_number: "",

    // Amenities
    amenities: [],

    // Images
    property_images: [],

    // Availability
    is_available: true,
    approval_status: "unverified",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const propertyTypes = [
    "Single Room",
    "Chamber and Hall",
    "2 Bedroom Apartment",
    "3 Bedroom Apartment",
    "Office Space",
    "Short Stay",
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

  // Load landlords on component mount
  useEffect(() => {
    const loadLandlords = async () => {
      try {
        const response = await generalRequests.getLandlords();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setLandlords(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Error loading landlords:", error);
        toast.error("Failed to load landlords");
      }
    };

    loadLandlords();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsRegionDropdownOpen(false);
        setIsLocationDropdownOpen(false);
        setRegionSearchQuery("");
        setLocationSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper functions for dropdown management
  const filteredRegions = Object.keys(ghanaRegions).filter((region) =>
    region.toLowerCase().includes(regionSearchQuery.toLowerCase())
  );

  const filteredLocations =
    formData.region && ghanaRegions[formData.region]
      ? ghanaRegions[formData.region].filter((location) =>
          location.toLowerCase().includes(locationSearchQuery.toLowerCase())
        )
      : [];

  const handleRegionSelect = (region) => {
    handleInputChange("region", region);
    setIsRegionDropdownOpen(false);
    setRegionSearchQuery("");
  };

  const handleLocationSelect = (location) => {
    handleInputChange("location", location);
    setIsLocationDropdownOpen(false);
    setLocationSearchQuery("");
  };

  // Helper function to calculate dropdown position
  const calculateDropdownPosition = (dropdownRef) => {
    if (!dropdownRef.current) return "bottom";

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return "top";
    }

    return "bottom";
  };

  const handleRegionDropdownToggle = () => {
    if (!isRegionDropdownOpen) {
      const position = calculateDropdownPosition(regionDropdownRef);
      setRegionDropdownPosition(position);
    }
    setIsRegionDropdownOpen(!isRegionDropdownOpen);
  };

  const handleLocationDropdownToggle = () => {
    if (!isLocationDropdownOpen) {
      const position = calculateDropdownPosition(locationDropdownRef);
      setLocationDropdownPosition(position);
    }
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };

  // Filter landlords based on search term
  const filteredLandlords = landlords.filter((landlord) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      landlord.full_name?.toLowerCase().includes(searchLower) ||
      landlord.email?.toLowerCase().includes(searchLower) ||
      landlord.business_name?.toLowerCase().includes(searchLower)
    );
  });

  // Helper function to scroll to first error field
  const scrollToFirstError = (newErrors) => {
    const firstErrorField = Object.keys(newErrors)[0];
    if (firstErrorField && errorFieldRefs.current[firstErrorField]) {
      const element = errorFieldRefs.current[firstErrorField];
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const offset = 120;

      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: "smooth",
      });

      element.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        element.style.animation = "";
      }, 500);
    }
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Add shake animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const steps = [
    { id: 1, title: "Select Landlord", icon: User },
    { id: 2, title: "Basic Info", icon: Home },
    { id: 3, title: "Property Specifications", icon: Settings },
    { id: 4, title: "Pricing & Contact", icon: DollarSign },
    { id: 5, title: "Images & Review", icon: ImageIcon },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedLandlord) {
          newErrors.landlord = "Please select a landlord";
        }
        break;

      case 2:
        if (!formData.title.trim()) {
          newErrors.title = "Property title is required";
        }
        if (!formData.property_type) {
          newErrors.property_type = "Property type is required";
        }
        if (!formData.region) {
          newErrors.region = "Region is required";
        }
        if (!formData.location) {
          newErrors.location = "Location is required";
        }
        break;

      case 3:
        if (formData.number_of_bedrooms < 0) {
          newErrors.number_of_bedrooms = "Invalid number of bedrooms";
        }
        if (formData.number_of_bathrooms < 0) {
          newErrors.number_of_bathrooms = "Invalid number of bathrooms";
        }
        if (!formData.year_built || formData.year_built.trim() === "") {
          newErrors.year_built = "Year built is required";
        } else if (parseInt(formData.year_built) > new Date().getFullYear()) {
          newErrors.year_built = "Year built cannot be in the future";
        }
        if (!formData.square_feet || formData.square_feet.trim() === "") {
          newErrors.square_feet = "Square feet is required";
        }
        if (formData.amenities.length === 0) {
          newErrors.amenities = "Please select at least one amenity";
        }
        if (!formData.description.trim()) {
          newErrors.description = "Property description is required";
        }
        break;

      case 4:
        if (!formData.per_month_amount || formData.per_month_amount <= 0) {
          newErrors.per_month_amount = "Valid monthly rent is required";
        }
        if (!formData.contact_number.trim()) {
          newErrors.contact_number = "Contact number is required";
        }
        if (!formData.whatsapp_number.trim()) {
          newErrors.whatsapp_number = "WhatsApp number is required";
        }
        break;

      case 5:
        if (formData.property_images.length === 0) {
          newErrors.property_images = "At least one property image is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If region changes, reset location
      if (field === "region") {
        newData.location = "";
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.property_images.length + files.length;

    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const base64Images = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await convertToBase64(file);
          return {
            image: base64,
            is_featured: false,
          };
        })
      );

      // Create preview URLs for display
      const newPreviewUrls = validFiles.map((file) =>
        URL.createObjectURL(file)
      );

      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      setFormData((prev) => {
        const updatedImages = [...prev.property_images, ...base64Images];

        // If this is the first image and no image is featured, make it featured
        if (prev.property_images.length === 0 && updatedImages.length > 0) {
          updatedImages[0].is_featured = true;
        }

        return {
          ...prev,
          property_images: updatedImages,
        };
      });

      toast.success(`${validFiles.length} image(s) uploaded successfully`);
    } catch {
      toast.error("Failed to process images. Please try again.");
    }
  };

  const removeImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    if (imagePreviewUrls[index]) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }

    const wasFeatureImage = formData.property_images[index]?.is_featured;

    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));

    setFormData((prev) => {
      const updatedImages = prev.property_images.filter((_, i) => i !== index);

      // If we removed the featured image and there are other images, make the first one featured
      if (wasFeatureImage && updatedImages.length > 0) {
        updatedImages[0].is_featured = true;
      }

      return {
        ...prev,
        property_images: updatedImages,
      };
    });

    toast.success("Image removed successfully");
  };

  const setFeaturedImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      property_images: prev.property_images.map((img, i) => ({
        ...img,
        is_featured: i === index,
      })),
    }));
    toast.success("Featured image updated");
  };

  const getFeaturedImageIndex = () => {
    return formData.property_images.findIndex((img) => img.is_featured);
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 9 && /^\d{9}$/.test(cleanPhone);
  };

  const handlePhoneChange = (field, value) => {
    let cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 9) {
      cleanValue = cleanValue.slice(0, 9);
    }
    handleInputChange(field, cleanValue);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      scrollToFirstError(errors);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      scrollToFirstError(errors);
      return;
    }

    if (!selectedLandlord) {
      toast.error("Please select a landlord");
      return;
    }

    setLoading(true);
    try {
      // Prepare the payload with the correct structure
      const payload = {
        landlord_slug: selectedLandlord.landlord_slug,
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        region: formData.region,
        location: formData.location,
        suburb: formData.suburb,
        district: formData.district,
        landmark: formData.landmark,
        bathroom_type: formData.bathroom_type,
        number_of_bedrooms: formData.number_of_bedrooms,
        number_of_bathrooms: formData.number_of_bathrooms,
        kitchen_type: formData.kitchen_type,
        square_feet: formData.square_feet,
        year_built: formData.year_built,
        amenities: formData.amenities,
        per_month_amount: parseFloat(formData.per_month_amount),
        rental_years: formData.rental_years,
        negotiable: formData.negotiable,
        is_available: formData.is_available,
        contact_number: formData.contact_number.replace('+', ''), // Remove + prefix
        whatsapp_number: formData.whatsapp_number.replace('+', ''), // Remove + prefix
        approval_status: formData.approval_status,
        property_images: formData.property_images.map((img) => ({
          image: img.image,
          is_featured: img.is_featured
        }))
      };

      const response = await propertiesServices.createLandlordProperty(payload);

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Property created successfully!"
        );
        navigate("/admin/properties");
      } else {
        toast.error(response?.data?.reason || "Failed to create property");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <User size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Select Landlord
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose the property owner from the list below
                    </p>
                  </div>
                </div>
                {selectedLandlord && (
                  <Motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg"
                  >
                    <CheckCircle2 size={18} />
                    <span className="font-semibold text-sm">1 Selected</span>
                  </Motion.div>
                )}
              </div>

              <div
                className="space-y-4"
                ref={(el) => (errorFieldRefs.current.landlord = el)}
              >
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search landlords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  />
                </div>

                {/* Results Count */}
                {!selectedLandlord && filteredLandlords.length > 0 && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between px-2"
                  >
                    <p className="text-sm text-gray-600 font-medium">
                      {filteredLandlords.length} landlord
                      {filteredLandlords.length !== 1 ? "s" : ""} available
                    </p>
                    {searchTerm && (
                      <p className="text-xs text-gray-500">
                        Filtered from {landlords.length} total
                      </p>
                    )}
                  </Motion.div>
                )}

                {/* Landlords Grid */}
                {filteredLandlords.length === 0 ? (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <User size={36} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm
                        ? "No Matches Found"
                        : "No Landlords Available"}
                    </h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      {searchTerm
                        ? "Try adjusting your search terms or clear the search to see all landlords"
                        : "There are no landlords in the system yet. Please add landlords first."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Clear Search
                      </button>
                    )}
                  </Motion.div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {filteredLandlords.map((landlord, index) => {
                          const isSelected =
                            selectedLandlord?.landlord_slug ===
                            landlord.landlord_slug;

                          return (
                            <Motion.div
                              key={landlord.landlord_slug}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.05 }}
                              layout
                            >
                              <div
                                onClick={() => {
                                  setSelectedLandlord(landlord);
                                  if (errors.landlord) {
                                    setErrors((prev) => ({
                                      ...prev,
                                      landlord: "",
                                    }));
                                  }
                                }}
                                className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? "border-2 border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                                    : "border-gray-200 bg-gray-100 hover:bg-gray-200"
                                }`}
                              >
                                {/* Selection Checkmark */}
                                <div className="absolute top-2 right-2">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-gray-300 bg-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check
                                        size={12}
                                        className="text-white"
                                        strokeWidth={3}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex items-center gap-3 pr-6">
                                  {/* Avatar */}
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 flex-shrink-0 ${
                                      isSelected
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                        : "bg-gray-500"
                                    }`}
                                  >
                                    {landlord.full_name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "L"}
                                  </div>

                                  {/* Details */}
                                  <div className="min-w-0 flex-1">
                                    <h4
                                      className={`font-semibold text-sm truncate transition-colors duration-200 ${
                                        isSelected
                                          ? "text-blue-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {landlord.full_name || "Unknown Landlord"}
                                    </h4>
                                    <p
                                      className={`text-xs truncate transition-colors duration-200 ${
                                        isSelected
                                          ? "text-blue-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {landlord.email || "No email"}
                                    </p>
                                    {landlord.business_name && (
                                      <p
                                        className={`text-xs truncate mt-0.5 transition-colors duration-200 ${
                                          isSelected
                                            ? "text-blue-500"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {landlord.business_name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Scroll Indicator */}
                    {filteredLandlords.length > 6 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-50 to-transparent pointer-events-none rounded-b-xl"></div>
                    )}
                  </div>
                )}

                {/* Selected Landlord Summary Card */}
                <AnimatePresence>
                  {selectedLandlord && (
                    <Motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20"></div>
                      <div className="relative p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-2xl shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-md"></div>
                              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                                {selectedLandlord.full_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "L"}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-bold text-blue-900 text-xl">
                                  {selectedLandlord.full_name}
                                </h5>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-green-700 text-xs font-bold">
                                    SELECTED
                                  </span>
                                </div>
                              </div>
                              <p className="text-blue-700 font-semibold text-sm">
                                {selectedLandlord.email}
                              </p>
                              {selectedLandlord.business_name && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Building
                                    size={14}
                                    className="text-blue-600"
                                  />
                                  <p className="text-blue-600 text-sm font-medium">
                                    {selectedLandlord.business_name}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLandlord(null);
                            }}
                            className="group p-3 text-blue-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-red-200"
                            title="Clear selection"
                          >
                            <X
                              size={20}
                              className="group-hover:rotate-90 transition-transform duration-300"
                            />
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {errors.landlord && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                    >
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle size={18} className="text-red-600" />
                      </div>
                      <p className="text-sm font-semibold text-red-700">
                        {errors.landlord}
                      </p>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #3b82f6, #6366f1);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #2563eb, #4f46e5);
              }
            `}</style>
          </Motion.div>
        );

      case 2:
        return (
          <Motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stunning Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-blue-50 rounded-3xl p-8 border-2 border-orange-200 shadow-xl">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 to-blue-200/20 animate-pulse"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl shadow-lg">
                    <Home size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                      Basic Information
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Tell us about the property essentials
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Title - Full Width Hero Input */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
              ref={(el) => (errorFieldRefs.current.title = el)}
            >
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                <label className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Sparkles size={18} className="text-orange-600" />
                  </div>
                  Property Title *
                  <span className="ml-auto text-xs font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Make it catchy!
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-5 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 font-medium ${
                    errors.title
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-200"
                  }`}
                  placeholder="e.g., Modern 2-Bedroom Apartment in East Legon"
                />
                {errors.title && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle size={16} />
                    {errors.title}
                  </Motion.div>
                )}
              </div>
            </Motion.div>

            {/* Property Type - Interactive Cards */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
              ref={(el) => (errorFieldRefs.current.property_type = el)}
            >
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                <label className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building size={18} className="text-blue-600" />
                  </div>
                  Property Type *
                  <span className="ml-auto text-xs font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Select one
                  </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyTypes.map((type) => {
                    const isSelected = formData.property_type === type;
                    return (
                      <Motion.button
                        key={type}
                        type="button"
                        onClick={() => handleInputChange("property_type", type)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-blue-50 shadow-lg ring-2 ring-orange-200"
                            : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-md"
                        }`}
                      >
                        {/* Selection Indicator */}
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check
                                size={12}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="text-left pr-6">
                          <div
                            className={`text-sm font-semibold transition-colors ${
                              isSelected ? "text-orange-900" : "text-gray-900"
                            }`}
                          >
                            {type}
                          </div>
                        </div>
                      </Motion.button>
                    );
                  })}
                </div>

                {errors.property_type && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle size={16} />
                    {errors.property_type}
                  </Motion.div>
                )}
              </div>
            </Motion.div>

            {/* Location Section */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin size={18} className="text-green-600" />
                </div>
                <h4 className="text-base font-bold text-gray-900">
                  Location Details
                </h4>
                <span className="ml-auto text-xs font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Where is it?
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Region Dropdown */}
                <div
                  className="space-y-2"
                  ref={(el) => (errorFieldRefs.current.region = el)}
                >
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    Region *
                  </label>
                  <div
                    className="relative dropdown-container"
                    ref={regionDropdownRef}
                  >
                    <button
                      type="button"
                      onClick={handleRegionDropdownToggle}
                      className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-left flex items-center justify-between ${
                        errors.region
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-200"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          formData.region ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {formData.region || "Select region"}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isRegionDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isRegionDropdownOpen && (
                        <Motion.div
                          initial={{
                            opacity: 0,
                            y: regionDropdownPosition === "top" ? 10 : -10,
                            scale: 0.95,
                          }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            y: regionDropdownPosition === "top" ? 10 : -10,
                            scale: 0.95,
                          }}
                          transition={{ duration: 0.2 }}
                          className={`absolute z-50 w-full bg-white border-2 border-orange-300 rounded-xl shadow-2xl max-h-72 overflow-hidden ${
                            regionDropdownPosition === "top"
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                        >
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                              <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={16}
                              />
                              <input
                                type="text"
                                placeholder="Search regions..."
                                value={regionSearchQuery}
                                onChange={(e) =>
                                  setRegionSearchQuery(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm font-medium"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar">
                            {filteredRegions.length > 0 ? (
                              filteredRegions.map((region) => (
                                <button
                                  key={region}
                                  type="button"
                                  onClick={() => handleRegionSelect(region)}
                                  className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center justify-between group ${
                                    formData.region === region
                                      ? "bg-orange-50 text-orange-900"
                                      : "text-gray-900"
                                  }`}
                                >
                                  <span className="font-medium">{region}</span>
                                  {formData.region === region && (
                                    <Check
                                      size={16}
                                      className="text-orange-600"
                                      strokeWidth={3}
                                    />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                <Search
                                  size={24}
                                  className="mx-auto mb-2 text-gray-300"
                                />
                                No regions found
                              </div>
                            )}
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.region && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-2 bg-red-50 px-2 py-1.5 rounded-lg"
                    >
                      <AlertCircle size={14} />
                      {errors.region}
                    </Motion.div>
                  )}
                </div>

                {/* Location Dropdown */}
                <div
                  className="space-y-2"
                  ref={(el) => (errorFieldRefs.current.location = el)}
                >
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    Location *
                  </label>
                  <div
                    className="relative dropdown-container"
                    ref={locationDropdownRef}
                  >
                    <button
                      type="button"
                      onClick={handleLocationDropdownToggle}
                      disabled={!formData.region}
                      className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-left flex items-center justify-between ${
                        errors.location
                          ? "border-red-300 bg-red-50"
                          : formData.region
                          ? "border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-200"
                          : "border-gray-200 bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          formData.location ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {formData.location ||
                          (formData.region
                            ? "Select location"
                            : "Select region first")}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isLocationDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isLocationDropdownOpen && formData.region && (
                        <Motion.div
                          initial={{
                            opacity: 0,
                            y: locationDropdownPosition === "top" ? 10 : -10,
                            scale: 0.95,
                          }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            y: locationDropdownPosition === "top" ? 10 : -10,
                            scale: 0.95,
                          }}
                          transition={{ duration: 0.2 }}
                          className={`absolute z-50 w-full bg-white border-2 border-orange-300 rounded-xl shadow-2xl max-h-72 overflow-hidden ${
                            locationDropdownPosition === "top"
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                        >
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                              <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={16}
                              />
                              <input
                                type="text"
                                placeholder="Search locations..."
                                value={locationSearchQuery}
                                onChange={(e) =>
                                  setLocationSearchQuery(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm font-medium"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar">
                            {filteredLocations.length > 0 ? (
                              filteredLocations.map((location) => (
                                <button
                                  key={location}
                                  type="button"
                                  onClick={() => handleLocationSelect(location)}
                                  className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center justify-between group ${
                                    formData.location === location
                                      ? "bg-orange-50 text-orange-900"
                                      : "text-gray-900"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {location}
                                  </span>
                                  {formData.location === location && (
                                    <Check
                                      size={16}
                                      className="text-orange-600"
                                      strokeWidth={3}
                                    />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                <Search
                                  size={24}
                                  className="mx-auto mb-2 text-gray-300"
                                />
                                No locations found
                              </div>
                            )}
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.location && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-2 bg-red-50 px-2 py-1.5 rounded-lg"
                    >
                      <AlertCircle size={14} />
                      {errors.location}
                    </Motion.div>
                  )}
                </div>

                {/* Suburb - Optional */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    Suburb
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.suburb}
                    onChange={(e) =>
                      handleInputChange("suburb", e.target.value)
                    }
                    className="w-full px-4 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:bg-white hover:border-blue-200 font-medium"
                    placeholder="e.g., Trasacco Valley"
                  />
                </div>

                {/* District - Optional */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    District
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      handleInputChange("district", e.target.value)
                    }
                    className="w-full px-4 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:bg-white hover:border-blue-200 font-medium"
                    placeholder="e.g., Accra Metropolitan"
                  />
                </div>

                {/* Landmark - Optional Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Star size={14} className="text-gray-400" />
                    Landmark
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) =>
                      handleInputChange("landmark", e.target.value)
                    }
                    className="w-full px-4 py-3.5 border-2 border-gray-200 bg-gray-50 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 hover:bg-white hover:border-blue-200 font-medium"
                    placeholder="e.g., Near Marina Mall, Opposite Shoprite"
                  />
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        );

      case 3:
        return (
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Bedrooms and Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bedrooms *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        "number_of_bedrooms",
                        Math.max(0, formData.number_of_bedrooms - 1)
                      )
                    }
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-semibold min-w-[2rem] text-center">
                    {formData.number_of_bedrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        "number_of_bedrooms",
                        formData.number_of_bedrooms + 1
                      )
                    }
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {errors.number_of_bedrooms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.number_of_bedrooms}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bathrooms *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        "number_of_bathrooms",
                        Math.max(0, formData.number_of_bathrooms - 1)
                      )
                    }
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-semibold min-w-[2rem] text-center">
                    {formData.number_of_bathrooms}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        "number_of_bathrooms",
                        formData.number_of_bathrooms + 1
                      )
                    }
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {errors.number_of_bathrooms && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.number_of_bathrooms}
                  </p>
                )}
              </div>
            </div>

            {/* Bathroom and Kitchen Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathroom Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["private", "shared"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange("bathroom_type", type)}
                      className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                        formData.bathroom_type === type
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kitchen Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["private", "shared"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange("kitchen_type", type)}
                      className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                        formData.kitchen_type === type
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Year Built */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built *
              </label>
              <input
                ref={(el) => (errorFieldRefs.current.year_built = el)}
                type="number"
                value={formData.year_built}
                onChange={(e) =>
                  handleInputChange("year_built", e.target.value)
                }
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                  errors.year_built
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              />
              {errors.year_built && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.year_built}
                </p>
              )}
            </div>

            {/* Square Feet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Feet *
              </label>
              <input
                ref={(el) => (errorFieldRefs.current.square_feet = el)}
                type="text"
                value={formData.square_feet}
                onChange={(e) =>
                  handleInputChange("square_feet", e.target.value)
                }
                placeholder="e.g., 20"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                  errors.square_feet
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              />
              {errors.square_feet && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.square_feet}
                </p>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities *
              </label>
              <div
                ref={(el) => (errorFieldRefs.current.amenities = el)}
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${
                  errors.amenities
                    ? "border border-red-500 rounded-xl p-3 bg-red-50"
                    : ""
                }`}
              >
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-3 border rounded-xl text-sm font-medium transition-all text-left ${
                      formData.amenities.includes(amenity)
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.amenities.includes(amenity)
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.amenities.includes(amenity) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.amenities && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.amenities}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Description *
              </label>
              <textarea
                ref={(el) => (errorFieldRefs.current.description = el)}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your property in detail. Include what makes it special, nearby amenities, transportation links, etc."
                rows={5}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none ${
                  errors.description
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                  {formData.description.length} characters
                </span>
              </div>
            </div>
          </Motion.div>
        );

      case 4:
        return (
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Rental Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent (GHS) *
                </label>
                <div className="relative">
                  <DollarSign
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    ref={(el) => (errorFieldRefs.current.per_month_amount = el)}
                    type="number"
                    value={formData.per_month_amount}
                    onChange={(e) =>
                      handleInputChange("per_month_amount", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.per_month_amount
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.per_month_amount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.per_month_amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rental Period (Years)
                </label>
                <select
                  value={formData.rental_years}
                  onChange={(e) =>
                    handleInputChange("rental_years", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={4}>4 Years</option>
                  <option value={5}>5+ Years</option>
                </select>
              </div>
            </div>

            {/* Toggles Section */}
            <div className="space-y-4">
              {/* Negotiable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Price is negotiable
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow potential tenants to negotiate the rental price
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("negotiable", !formData.negotiable)
                  }
                  className={`w-12 h-6 rounded-full transition-all ${
                    formData.negotiable ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      formData.negotiable ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Available Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Property is available for rent
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Toggle this off if the property is temporarily unavailable
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("is_available", !formData.is_available)
                  }
                  className={`w-12 h-6 rounded-full transition-all ${
                    formData.is_available ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      formData.is_available
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium">
                    +233
                  </div>
                  <input
                    ref={(el) => (errorFieldRefs.current.contact_number = el)}
                    type="text"
                    value={formData.contact_number}
                    onChange={(e) =>
                      handlePhoneChange("contact_number", e.target.value)
                    }
                    placeholder="244567890"
                    maxLength="9"
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.contact_number
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {formData.contact_number &&
                  !validatePhoneNumber(formData.contact_number) && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Please enter exactly 9 digits after 233
                    </p>
                  )}
                {errors.contact_number && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.contact_number}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium">
                    +233
                  </div>
                  <input
                    ref={(el) => (errorFieldRefs.current.whatsapp_number = el)}
                    type="text"
                    value={formData.whatsapp_number}
                    onChange={(e) =>
                      handlePhoneChange("whatsapp_number", e.target.value)
                    }
                    placeholder="244567890"
                    maxLength="9"
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${
                      errors.whatsapp_number
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {formData.whatsapp_number &&
                  !validatePhoneNumber(formData.whatsapp_number) && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Please enter exactly 9 digits after 233
                    </p>
                  )}
                {errors.whatsapp_number && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.whatsapp_number}
                  </p>
                )}
              </div>
            </div>

            {/* Copy Contact to WhatsApp */}
            <button
              type="button"
              onClick={() =>
                handleInputChange("whatsapp_number", formData.contact_number)
              }
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              Use same number for WhatsApp
            </button>
          </Motion.div>
        );

      case 5:
        return (
          <Motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Images *{" "}
                <span className="text-gray-400">(Maximum 5 images)</span>
              </label>

              {/* Upload Button */}
              <div
                ref={(el) => (errorFieldRefs.current.property_images = el)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  errors.property_images
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formData.property_images.length >= 5}
                  className={`px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors ${
                    formData.property_images.length >= 5
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  <Upload size={20} />
                  Upload Images
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  Drop images here or click to browse (Max 5MB each)
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Supported formats: JPG, PNG, WebP
                </p>
                {formData.property_images.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    {formData.property_images.length}/5 images uploaded
                  </p>
                )}
              </div>

              {errors.property_images && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.property_images}
                </p>
              )}

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Property Images
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click the star to set featured image
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <Motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Featured Badge */}
                          {formData.property_images[index]?.is_featured && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                              <Star size={12} fill="currentColor" />
                              Featured
                            </div>
                          )}

                          {/* Image Controls */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFeaturedImage(index)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                formData.property_images[index]?.is_featured
                                  ? "bg-orange-500 text-white"
                                  : "bg-white text-gray-800 hover:bg-gray-100"
                              }`}
                            >
                              <Star
                                size={14}
                                fill={
                                  formData.property_images[index]?.is_featured
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                              {formData.property_images[index]?.is_featured
                                ? "Featured"
                                : "Set Featured"}
                            </button>

                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <X size={14} />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Image Info */}
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900">
                            Image {index + 1}
                            {formData.property_images[index]?.is_featured && (
                              <span className="ml-2 text-orange-600">
                                • Featured
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {imageFiles[index]?.size
                              ? `${(
                                  imageFiles[index].size /
                                  1024 /
                                  1024
                                ).toFixed(2)} MB`
                              : ""}
                          </p>
                        </div>
                      </Motion.div>
                    ))}
                  </div>

                  {/* Featured Image Info */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Star
                        size={20}
                        className="text-orange-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-orange-900">
                          Featured Image
                        </h4>
                        <p className="text-sm text-orange-700 mt-1">
                          {getFeaturedImageIndex() >= 0
                            ? `Image ${
                                getFeaturedImageIndex() + 1
                              } is set as featured and will be displayed on property cards.`
                            : "The first image will be used as featured image by default."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Review Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-8 border border-emerald-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                Review & Create Property
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Information */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home size={16} className="text-blue-600" />
                    Property Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Title</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Property Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.property_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-3">
                        {formData.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-green-600" />
                    Location Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Region</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Suburb</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.suburb}
                      </p>
                    </div>
                    {formData.district && (
                      <div>
                        <p className="text-xs text-gray-500">District</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formData.district}
                        </p>
                      </div>
                    )}
                    {formData.landmark && (
                      <div>
                        <p className="text-xs text-gray-500">Landmark</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formData.landmark}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={16} className="text-orange-600" />
                    Property Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Bedrooms</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.number_of_bedrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bathrooms</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.number_of_bathrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bathroom Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {formData.bathroom_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kitchen Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {formData.kitchen_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Year Built</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.year_built || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Square Feet</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.square_feet || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amenities</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.amenities.length} selected
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign size={16} className="text-yellow-600" />
                    Pricing Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Rent</p>
                      <p className="text-sm font-medium text-gray-900">
                        GHS {formData.per_month_amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rental Period</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.rental_years}{" "}
                        {formData.rental_years === 1 ? "Year" : "Years"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Negotiable</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.negotiable ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Security Deposit</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.security_deposit
                          ? `GHS ${formData.security_deposit}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Utilities Included
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          formData.utilities_included
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formData.utilities_included ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Landlord */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    Selected Landlord
                  </h4>
                  {selectedLandlord && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {selectedLandlord.full_name?.charAt(0) || "L"}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {selectedLandlord.full_name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {selectedLandlord.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedLandlord.business_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
          {/* Header */}
          <Motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <Link
                to="/admin/properties"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                  Create New Property
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new property for a landlord
                </p>
              </div>
            </div>
          </Motion.div>

          {/* Progress Steps */}
          <Motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`relative flex items-center justify-center gap-2 px-2 py-2 md:px-3 md:py-2.5 lg:px-4 lg:py-3 rounded-lg md:rounded-xl transition-all duration-300 group ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <step.icon
                      size={16}
                      className="md:w-5 md:h-5 flex-shrink-0"
                    />
                    <span className="font-medium text-xs hidden lg:block whitespace-nowrap">
                      {step.title}
                    </span>

                    {/* Tooltip for mobile/tablet */}
                    <div
                      className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 lg:hidden ${
                        currentStep >= step.id ? "block" : "hidden"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 md:mx-2 transition-colors duration-300 ${
                        currentStep > step.id ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </Motion.div>

          {/* Step Content */}
          <Motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentStep < steps.length ? (
                  <Motion.button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-xl hover:from-orange-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next
                    <ArrowRight size={16} />
                  </Motion.button>
                ) : (
                  <Motion.button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Home size={16} />
                    )}
                    {loading ? "Creating..." : "Create Property"}
                  </Motion.button>
                )}
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CreateProperty;
