import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  Info,
  Calendar,
  Star,
  Zap,
  UserPlus,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import generalRequests from "../../api/Admin/Landlords/GeneralRequests";
import ghanaRegions from "../../data/ghanaRegions";

const CreateLandlord = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown states
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [regionDropdownPosition, setRegionDropdownPosition] = useState("bottom");
  const [locationDropdownPosition, setLocationDropdownPosition] = useState("bottom");

  // Image upload states
  const [isDragOver, setIsDragOver] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Verification image states
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [ghanaCardFrontPreview, setGhanaCardFrontPreview] = useState(null);
  const [ghanaCardBackPreview, setGhanaCardBackPreview] = useState(null);

  // Refs for error fields to enable smooth scrolling
  const errorFieldRefs = useRef({});
  const regionDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: "",
    email: "",
    phone_number: "+233",
    ghana_card_number: "",
    region: "",
    location: "",
    custom_location: "",
    
    // Business Information
    business_name: "",
    business_type: "",
    business_registration_number: "",
    business_logo: null,
    
    // Verification Images
    selfie_picture: null,
    ghana_card_front: null,
    ghana_card_back: null,
    
    // Account Settings
    is_active: true,
    is_verified: true,
  });


  const businessTypes = [
    "Individual Landlord",
    "Real Estate Company",
    "Property Management Company",
    "Investment Company",
    "Construction Company",
    "Other"
  ];

  // Helper functions for dropdown management
  const filteredRegions = Object.keys(ghanaRegions).filter(region =>
    region.toLowerCase().includes(regionSearchQuery.toLowerCase())
  );

  const filteredLocations = formData.region && ghanaRegions[formData.region]
    ? ghanaRegions[formData.region].filter(location =>
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

  // Image upload handlers
  const handleImageUpload = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      handleInputChange("business_logo", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    handleInputChange("business_logo", null);
  };

  // Verification image upload handlers
  const handleVerificationImageUpload = (file, field, setPreview) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      handleInputChange(field, base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSelfieUpload = (file) => {
    handleVerificationImageUpload(file, "selfie_picture", setSelfiePreview);
  };

  const handleGhanaCardFrontUpload = (file) => {
    handleVerificationImageUpload(file, "ghana_card_front", setGhanaCardFrontPreview);
  };

  const handleGhanaCardBackUpload = (file) => {
    handleVerificationImageUpload(file, "ghana_card_back", setGhanaCardBackPreview);
  };

  const removeVerificationImage = (field, setPreview) => {
    if (setPreview === setSelfiePreview && selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
    } else if (setPreview === setGhanaCardFrontPreview && ghanaCardFrontPreview) {
      URL.revokeObjectURL(ghanaCardFrontPreview);
    } else if (setPreview === setGhanaCardBackPreview && ghanaCardBackPreview) {
      URL.revokeObjectURL(ghanaCardBackPreview);
    }
    setPreview(null);
    handleInputChange(field, null);
  };

  // Helper function to calculate dropdown position
  const calculateDropdownPosition = (dropdownRef) => {
    if (!dropdownRef.current) return "bottom";
    
    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240; // Approximate height of dropdown
    
    // Check if there's enough space below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // If not enough space below but enough above, position above
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
        behavior: "smooth"
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsRegionDropdownOpen(false);
        setIsLocationDropdownOpen(false);
        setRegionSearchQuery("");
        setLocationSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add shake animation styles
  useEffect(() => {
    const style = document.createElement('style');
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

  // Cleanup logo preview URL on unmount
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
      if (ghanaCardFrontPreview) {
        URL.revokeObjectURL(ghanaCardFrontPreview);
      }
      if (ghanaCardBackPreview) {
        URL.revokeObjectURL(ghanaCardBackPreview);
      }
    };
  }, [logoPreview, selfiePreview, ghanaCardFrontPreview, ghanaCardBackPreview]);

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Business Info", icon: Building },
    { id: 3, title: "Account Setup", icon: Settings },
    { id: 4, title: "Review & Create", icon: CheckCircle2 },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.full_name.trim()) {
          newErrors.full_name = "Full name is required";
        } else if (formData.full_name.trim().length < 2) {
          newErrors.full_name = "Full name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }

        if (!formData.phone_number.trim()) {
          newErrors.phone_number = "Phone number is required";
        } else if (!/^\+233[0-9]{9}$/.test(formData.phone_number)) {
          newErrors.phone_number = "Please enter a valid 9-digit Ghana mobile number";
        }

        if (!formData.ghana_card_number.trim()) {
          newErrors.ghana_card_number = "Ghana Card number is required";
        } else if (!/^GHA-[0-9]{9}-[0-9]$/.test(formData.ghana_card_number)) {
          newErrors.ghana_card_number = "Please enter a valid Ghana Card number (GHA-XXXXXXXXX-X)";
        }

        if (!formData.location.trim()) {
          newErrors.location = "Location is required";
        } else if (formData.location === "Other" && !formData.custom_location.trim()) {
          newErrors.custom_location = "Please enter your custom location";
        }
        break;

      case 2:
        if (!formData.business_name.trim()) {
          newErrors.business_name = "Business name is required";
        }

        if (!formData.business_type) {
          newErrors.business_type = "Business type is required";
        }

        if (!formData.selfie_picture) {
          newErrors.selfie_picture = "Selfie picture is required for verification";
        }

        if (!formData.ghana_card_front) {
          newErrors.ghana_card_front = "Ghana Card front image is required";
        }

        if (!formData.ghana_card_back) {
          newErrors.ghana_card_back = "Ghana Card back image is required";
        }
        break;

      case 3:
        // Account settings validation (optional fields)
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // If region changes, reset location and custom_location
      if (field === "region") {
        newData.location = "";
        newData.custom_location = "";
      }
      
      // If location changes to something other than "Other", clear custom_location
      if (field === "location" && value !== "Other") {
        newData.custom_location = "";
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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

    setLoading(true);
    try {
      // Prepare payload with phone number without the + prefix
      const payload = {
        ...formData,
        phone_number: formData.phone_number.replace('+', ''), // Remove + from phone number
        location: formData.location === "Other" ? formData.custom_location : formData.location, // Use custom location if "Other" is selected
        custom_location: undefined, // Remove custom_location from payload
      };

      const response = await generalRequests.createLandlord(payload);

      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Landlord created successfully!");
        navigate("/admin/landlords");
      } else {
        toast.error(response?.data?.reason || "Failed to create landlord");
      }
    } catch (error) {
      console.error("Error creating landlord:", error);
      toast.error("Failed to create landlord");
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <User size={24} className="text-blue-500" />
                </div>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.full_name = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User size={14} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.full_name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.full_name && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.full_name}
                    </Motion.div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.email = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail size={14} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.email}
                    </Motion.div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.phone_number = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone size={14} />
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <div className="flex items-center gap-2">
                        {/* Ghana Flag */}
                        <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm border border-gray-200">
                          <div className="w-full h-full relative">
                            {/* Red stripe */}
                            <div className="absolute top-0 left-0 w-full h-1/3 bg-red-600"></div>
                            {/* Yellow stripe */}
                            <div className="absolute top-1/3 left-0 w-full h-1/3 bg-yellow-500"></div>
                            {/* Green stripe */}
                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-600"></div>
                            {/* Black star */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="w-1 h-1 bg-black" style={{
                                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                              }}></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">+233</span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone_number.replace('+233', '')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        if (value.length <= 9) {
                          handleInputChange("phone_number", `+233${value}`);
                        }
                      }}
                      className={`w-full pl-20 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.phone_number
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter 9-digit number"
                      maxLength={9}
                    />
                  </div>
                  {errors.phone_number && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.phone_number}
                    </Motion.div>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter your 9-digit Ghana mobile number (e.g., 123456789)
                  </p>
                </div>

                {/* Ghana Card */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.ghana_card_number = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield size={14} />
                    Ghana Card Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <div className="flex items-center gap-2">
                        {/* Ghana Flag */}
                        <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm border border-gray-200">
                          <div className="w-full h-full relative">
                            {/* Red stripe */}
                            <div className="absolute top-0 left-0 w-full h-1/3 bg-red-600"></div>
                            {/* Yellow stripe */}
                            <div className="absolute top-1/3 left-0 w-full h-1/3 bg-yellow-500"></div>
                            {/* Green stripe */}
                            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-600"></div>
                            {/* Black star */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="w-1 h-1 bg-black" style={{
                                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                              }}></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">GHA-</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={formData.ghana_card_number.replace(/^GHA-/, '').replace(/-$/, '')}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        
                        // Limit to 10 digits (9 for middle part + 1 for last digit)
                        if (value.length > 10) {
                          value = value.substring(0, 10);
                        }
                        
                        // Format the value
                        let formattedValue = '';
                        if (value.length > 0) {
                          formattedValue = 'GHA-';
                          if (value.length <= 9) {
                            formattedValue += value;
                          } else {
                            formattedValue += value.substring(0, 9) + '-' + value.substring(9);
                          }
                        }
                        
                        handleInputChange("ghana_card_number", formattedValue);
                      }}
                      className={`w-full pl-20 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.ghana_card_number
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="XXXXXXXXX-X"
                      maxLength={13}
                    />
                  </div>
                  {errors.ghana_card_number && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.ghana_card_number}
                    </Motion.div>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter your Ghana Card number (e.g., GHA-123456789-0)
                  </p>
                </div>

                {/* Region */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.region = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={14} />
                    Region *
                  </label>
                  <div className="relative dropdown-container" ref={regionDropdownRef}>
                    <button
                      type="button"
                      onClick={handleRegionDropdownToggle}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-left flex items-center justify-between ${
                        errors.region
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <span className={formData.region ? "text-gray-900" : "text-gray-500"}>
                        {formData.region || "Select region"}
                      </span>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 ${
                          isRegionDropdownOpen ? "rotate-180" : ""
                        }`} 
                      />
                    </button>

                    {isRegionDropdownOpen && (
                      <Motion.div
                        initial={{ opacity: 0, y: regionDropdownPosition === 'top' ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: regionDropdownPosition === 'top' ? 10 : -10 }}
                        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-hidden ${
                          regionDropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                      >
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              type="text"
                              placeholder="Search regions..."
                              value={regionSearchQuery}
                              onChange={(e) => setRegionSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredRegions.length > 0 ? (
                            filteredRegions.map((region) => (
                              <button
                                key={region}
                                type="button"
                                onClick={() => handleRegionSelect(region)}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                                  formData.region === region ? "bg-blue-50 text-blue-700" : "text-gray-900"
                                }`}
                              >
                                <span className="font-medium">{region}</span>
                                {formData.region === region && <Check size={16} className="text-blue-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-sm">No regions found</div>
                          )}
                        </div>
                      </Motion.div>
                    )}
                  </div>
                  {errors.region && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.region}
                    </Motion.div>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.location = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={14} />
                    Location *
                  </label>
                  <div className="relative dropdown-container" ref={locationDropdownRef}>
                    <button
                      type="button"
                      onClick={handleLocationDropdownToggle}
                      disabled={!formData.region}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-left flex items-center justify-between ${
                        errors.location
                          ? "border-red-300 bg-red-50"
                          : formData.region
                          ? "border-gray-300 bg-white hover:border-gray-400"
                          : "border-gray-300 bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <span className={formData.location ? "text-gray-900" : "text-gray-500"}>
                        {formData.location || "Select location"}
                      </span>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 ${
                          isLocationDropdownOpen ? "rotate-180" : ""
                        }`} 
                      />
                    </button>

                    {isLocationDropdownOpen && formData.region && (
                      <Motion.div
                        initial={{ opacity: 0, y: locationDropdownPosition === 'top' ? 10 : -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: locationDropdownPosition === 'top' ? 10 : -10 }}
                        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-hidden ${
                          locationDropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                      >
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              type="text"
                              placeholder="Search locations..."
                              value={locationSearchQuery}
                              onChange={(e) => setLocationSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredLocations.length > 0 ? (
                            filteredLocations.map((location) => (
                              <button
                                key={location}
                                type="button"
                                onClick={() => handleLocationSelect(location)}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                                  formData.location === location ? "bg-blue-50 text-blue-700" : "text-gray-900"
                                }`}
                              >
                                <span className="font-medium">{location}</span>
                                {formData.location === location && <Check size={16} className="text-blue-600" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-sm">No locations found</div>
                          )}
                        </div>
                      </Motion.div>
                    )}
                  </div>
                  {errors.location && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.location}
                    </Motion.div>
                  )}
                </div>

                {/* Custom Location (appears when "Other" is selected) */}
                {formData.location === "Other" && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                    ref={(el) => (errorFieldRefs.current.custom_location = el)}
                  >
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin size={14} />
                      Custom Location *
                    </label>
                    <input
                      type="text"
                      value={formData.custom_location}
                      onChange={(e) => handleInputChange("custom_location", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        errors.custom_location
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter your custom location"
                    />
                    {errors.custom_location && (
                      <Motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle size={12} />
                        {errors.custom_location}
                      </Motion.div>
                    )}
                  </Motion.div>
                )}
              </div>
            </div>
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
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Building size={24} className="text-orange-500" />
                </div>
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.business_name = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building size={14} />
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.business_name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                    placeholder="Enter business name"
                  />
                  {errors.business_name && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.business_name}
                    </Motion.div>
                  )}
                </div>

                {/* Business Type */}
                <div className="space-y-2" ref={(el) => (errorFieldRefs.current.business_type = el)}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Settings size={14} />
                    Business Type *
                  </label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => handleInputChange("business_type", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.business_type
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.business_type && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.business_type}
                    </Motion.div>
                  )}
                </div>

                {/* Business Registration */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield size={14} />
                    Business Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.business_registration_number}
                    onChange={(e) => handleInputChange("business_registration_number", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white hover:border-gray-400"
                    placeholder="Enter business registration number"
                  />
                </div>

                {/* Business Logo Upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building size={14} />
                    Business Logo (Optional)
                  </label>
                  
                  {!logoPreview ? (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50 ${
                        isDragOver
                          ? "border-blue-400 bg-blue-50 scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-full transition-colors duration-300 ${
                          isDragOver ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          <Upload 
                            size={32} 
                            className={`transition-colors duration-300 ${
                              isDragOver ? "text-blue-500" : "text-gray-400"
                            }`} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                            isDragOver ? "text-blue-600" : "text-gray-700"
                          }`}>
                            {isDragOver ? "Drop your logo here" : "Upload Business Logo"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Drag and drop an image, or click to browse
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Recommended: Square format, 200x200px or larger</span>
                        </div>
                      </div>
                      
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={logoPreview}
                              alt="Business logo preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              Logo uploaded successfully
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Business Logo
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Base64 encoded
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById('logo-upload').click()}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Verification Images */}
                <div className="space-y-6 md:col-span-2">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={16} className="text-purple-600" />
                      Identity Verification
                    </h4>
                    <p className="text-sm text-gray-700 mb-6">
                      Upload the required verification images to complete your account setup.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Selfie Picture */}
                      <div className="space-y-2" ref={(el) => (errorFieldRefs.current.selfie_picture = el)}>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <User size={14} />
                          Selfie Picture *
                        </label>
                        
                        {!selfiePreview ? (
                          <div
                            className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                            onClick={() => document.getElementById('selfie-upload').click()}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 rounded-full bg-gray-100">
                                <User size={24} className="text-gray-400" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-sm font-medium text-gray-700">Upload Selfie</h5>
                                <p className="text-xs text-gray-500">Clear face photo</p>
                              </div>
                            </div>
                            <input
                              id="selfie-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSelfieUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={selfiePreview}
                                    alt="Selfie preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-gray-900">Selfie uploaded</h5>
                                  <p className="text-xs text-gray-500">Base64 encoded</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('selfie-upload').click()}
                                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    Change
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVerificationImage("selfie_picture", setSelfiePreview)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <input
                              id="selfie-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSelfieUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        )}
                        {errors.selfie_picture && (
                          <Motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-600 flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {errors.selfie_picture}
                          </Motion.div>
                        )}
                      </div>

                      {/* Ghana Card Front */}
                      <div className="space-y-2" ref={(el) => (errorFieldRefs.current.ghana_card_front = el)}>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Shield size={14} />
                          Ghana Card Front *
                        </label>
                        
                        {!ghanaCardFrontPreview ? (
                          <div
                            className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                            onClick={() => document.getElementById('ghana-card-front-upload').click()}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 rounded-full bg-gray-100">
                                <Shield size={24} className="text-gray-400" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-sm font-medium text-gray-700">Card Front</h5>
                                <p className="text-xs text-gray-500">Front side image</p>
                              </div>
                            </div>
                            <input
                              id="ghana-card-front-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGhanaCardFrontUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={ghanaCardFrontPreview}
                                    alt="Ghana Card front preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-gray-900">Front uploaded</h5>
                                  <p className="text-xs text-gray-500">Base64 encoded</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('ghana-card-front-upload').click()}
                                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    Change
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVerificationImage("ghana_card_front", setGhanaCardFrontPreview)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <input
                              id="ghana-card-front-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGhanaCardFrontUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        )}
                        {errors.ghana_card_front && (
                          <Motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-600 flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {errors.ghana_card_front}
                          </Motion.div>
                        )}
                      </div>

                      {/* Ghana Card Back */}
                      <div className="space-y-2" ref={(el) => (errorFieldRefs.current.ghana_card_back = el)}>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Shield size={14} />
                          Ghana Card Back *
                        </label>
                        
                        {!ghanaCardBackPreview ? (
                          <div
                            className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                            onClick={() => document.getElementById('ghana-card-back-upload').click()}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 rounded-full bg-gray-100">
                                <Shield size={24} className="text-gray-400" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-sm font-medium text-gray-700">Card Back</h5>
                                <p className="text-xs text-gray-500">Back side image</p>
                              </div>
                            </div>
                            <input
                              id="ghana-card-back-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGhanaCardBackUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={ghanaCardBackPreview}
                                    alt="Ghana Card back preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-gray-900">Back uploaded</h5>
                                  <p className="text-xs text-gray-500">Base64 encoded</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('ghana-card-back-upload').click()}
                                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    Change
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVerificationImage("ghana_card_back", setGhanaCardBackPreview)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <input
                              id="ghana-card-back-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGhanaCardBackUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </div>
                        )}
                        {errors.ghana_card_back && (
                          <Motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-600 flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {errors.ghana_card_back}
                          </Motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        );

      case 3:
        return (
          <Motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Settings size={24} className="text-blue-500" />
                </div>
                Account Settings
              </h3>

              <div className="space-y-6">
                {/* Account Status */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">Account Status</h4>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle2 size={14} />
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        Account will be created as active with verification images uploaded during registration.
                      </p>
                      <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield size={16} />
                          Verification Completed:
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Selfie photo uploaded for identity verification</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Ghana Card front and back images uploaded</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Account ready for immediate use</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">Verification Status</h4>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <CheckCircle2 size={14} />
                          Verified
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Account is pre-verified by admin. Landlord can proceed with property listing after activation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Information Card */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Info size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                          <span>Landlord will receive login credentials via email</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                          <span>They must complete identity verification to activate account</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                          <span>Once activated, they can start listing properties</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                          <span>Admin can manually activate account if needed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        );

      case 4:
        return (
          <Motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 border border-indigo-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <CheckCircle2 size={24} className="text-indigo-600" />
                </div>
                Review & Create Landlord
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Review */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">{formData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{formData.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ghana Card</p>
                      <p className="text-sm font-medium text-gray-900">{formData.ghana_card_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Region</p>
                      <p className="text-sm font-medium text-gray-900">{formData.region}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.location === "Other" ? formData.custom_location : formData.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information Review */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={16} className="text-orange-500" />
                    Business Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Business Name</p>
                      <p className="text-sm font-medium text-gray-900">{formData.business_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Business Type</p>
                      <p className="text-sm font-medium text-gray-900">{formData.business_type}</p>
                    </div>
                    {formData.business_registration_number && (
                      <div>
                        <p className="text-xs text-gray-500">Registration Number</p>
                        <p className="text-sm font-medium text-gray-900">{formData.business_registration_number}</p>
                      </div>
                    )}
                    {formData.business_logo && (
                      <div>
                        <p className="text-xs text-gray-500">Business Logo</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={logoPreview}
                              alt="Business logo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Business Logo</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Images Review */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-purple-500" />
                    Identity Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.selfie_picture && (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mx-auto mb-2">
                          <img
                            src={selfiePreview}
                            alt="Selfie"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Selfie Picture</p>
                      </div>
                    )}
                    {formData.ghana_card_front && (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mx-auto mb-2">
                          <img
                            src={ghanaCardFrontPreview}
                            alt="Ghana Card Front"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Ghana Card Front</p>
                      </div>
                    )}
                    {formData.ghana_card_back && (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mx-auto mb-2">
                          <img
                            src={ghanaCardBackPreview}
                            alt="Ghana Card Back"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Ghana Card Back</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Settings Review */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={16} className="text-blue-500" />
                    Account Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        formData.is_active
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {formData.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {formData.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        formData.is_verified
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}>
                        <Shield size={12} />
                        {formData.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-800">
                      <strong>Note:</strong> Account will be created as active with verification images uploaded during registration.
                    </p>
                  </div>
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
        <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
          {/* Header */}
          <Motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <Link
                to="/admin/landlords"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
                  Create New Landlord
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new landlord to the platform
                </p>
              </div>
            </div>
          </Motion.div>

          {/* Progress Steps */}
          <Motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <step.icon size={20} />
                    <span className="font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                        currentStep > step.id ? "bg-blue-500" : "bg-gray-300"
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
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

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
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl hover:from-blue-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl hover:from-blue-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {loading ? "Creating..." : "Create Landlord"}
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

export default CreateLandlord;
