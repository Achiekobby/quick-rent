import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  User,
  Building,
  MapPin,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  Camera,
  FileText,
  Shield,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Award,
  Globe,
} from "lucide-react";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import {
  registerLandlord,
  getGhanaRegionsAndCities,
} from "../../api/Landlord/Authentication/Signup";

const PhoneInput = ({ value, onChange, className }) => (
  <div className="relative group">
    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 z-10">
      <Motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
      </Motion.div>
    </div>
    <div className="absolute left-10 top-0 bottom-0 flex items-center z-10">
      <div className="flex items-center gap-2 pr-3 border-r border-gray-200 group-focus-within:border-orange-300 transition-colors duration-300">
        <Motion.img
          src="https://flagcdn.com/w20/gh.png"
          alt="Ghana"
          className="w-5 h-4 rounded-sm shadow-sm"
          whileHover={{ scale: 1.05 }}
        />
        <span className="text-sm text-gray-700 font-medium group-focus-within:text-orange-600 transition-colors duration-300">
          +233
        </span>
      </div>
    </div>
    <input
      type="tel"
      name="phone"
      className={className}
      placeholder="XX XXX XXXX"
      value={value.startsWith("233") ? value.substring(3) : value}
      onChange={(e) => {
        const inputValue = e.target.value.replace(/\D/g, "");
        onChange(`233${inputValue}`);
      }}
      maxLength={9}
    />
  </div>
);

const LandlordRegister = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    getRedirectPath,
    startRegistration,
    finishRegistration,
    registrationError,
    isRegistering,
    error: authError,
  } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

  //Todo => Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "233",
    businessName: "",
    businessType: "",
    businessRegistration: "",
    region: "",
    city: "",
    location: "",
    customLocation: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Get regions and cities data
  const regionsAndCities = getGhanaRegionsAndCities();
  const regions = Object.keys(regionsAndCities);

  // Update available cities when region changes
  useEffect(() => {
    if (formData.region) {
      setAvailableCities(regionsAndCities[formData.region] || []);
      setFormData((prev) => ({
        ...prev,
        city: "",
        location: "",
        customLocation: "",
      }));
      setShowCustomLocation(false);
    }
  }, [formData.region]);

  // Handle city selection and "Other" option
  useEffect(() => {
    if (formData.city === "Other") {
      setShowCustomLocation(true);
      setFormData((prev) => ({ ...prev, location: prev.customLocation }));
    } else if (formData.city) {
      setShowCustomLocation(false);
      setFormData((prev) => ({
        ...prev,
        location: formData.city,
        customLocation: "",
      }));
    }
  }, [formData.city, formData.customLocation]);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email) return { isValid: false, message: "Email is required" };
    if (email.length > 254) return { isValid: false, message: "Email is too long" };
    if (!emailRegex.test(email)) return { isValid: false, message: "Please enter a valid email address" };
    if (email.includes('..')) return { isValid: false, message: "Email cannot contain consecutive dots" };
    if (email.startsWith('.') || email.endsWith('.')) return { isValid: false, message: "Email cannot start or end with a dot" };
    if (email.includes('@.') || email.includes('.@')) return { isValid: false, message: "Invalid format around @ symbol" };
    
    // Additional check for proper domain structure
    const parts = email.split('@');
    if (parts.length !== 2) return { isValid: false, message: "Email must contain exactly one @ symbol" };
    
    const [localPart, domain] = parts;
    if (!localPart || !domain) return { isValid: false, message: "Email must have both local and domain parts" };
    
    // Check if domain has at least one dot and ends with valid TLD
    if (!domain.includes('.')) return { isValid: false, message: "Email must have a valid domain (e.g., gmail.com)" };
    
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return { isValid: false, message: "Email must have a valid domain extension" };
    
    return { isValid: true, message: null };
  };

  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Filter full name to only allow letters, spaces, and common name characters
    let filteredValue = value;
    if (name === 'fullName') {
      // Allow letters (including accented characters), spaces, apostrophes, and hyphens
      filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
      // Prevent multiple consecutive spaces
      filteredValue = filteredValue.replace(/\s+/g, ' ');
      // Prevent starting with space
      if (filteredValue.startsWith(' ')) {
        filteredValue = filteredValue.trimStart();
      }
    }
    
    // Real-time email validation
    if (name === 'email') {
      const emailValidation = validateEmail(value.trim().toLowerCase());
      if (value.trim() && !emailValidation.isValid) {
        setErrors((prev) => ({
          ...prev,
          [name]: emailValidation.message,
        }));
      } else if (value.trim() && emailValidation.isValid) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
      // Convert email to lowercase for consistency
      filteredValue = value.trim().toLowerCase();
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : filteredValue,
    }));

    // Handle custom location input
    if (name === "customLocation") {
      setFormData((prev) => ({
        ...prev,
        location: value,
        [name]: value,
      }));
    }

    // Clear error when user types (except for email which has real-time validation)
    if (errors[name] && name !== 'email') {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
        // Also clear location error when typing in custom location
        ...(name === "customLocation" && { location: null }),
      }));
    }
  };

  const handlePhoneChange = useCallback(
    (value) => {
      setFormData((prev) => ({ ...prev, phone: value }));
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    },
    [errors.phone]
  );

  const handleBusinessLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBusinessLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBusinessLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.fullName.trim())) {
        newErrors.fullName = "Full name can only contain letters, spaces, apostrophes, and hyphens";
      } else if (formData.fullName.trim().length > 50) {
        newErrors.fullName = "Full name must be less than 50 characters";
      }
      
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message;
      }
      
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^233\d{9}$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid Ghana phone number";
      }
    }

    if (step === 2) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.businessType) {
        newErrors.businessType = "Business type is required";
      }
      if (!formData.region) {
        newErrors.region = "Region is required";
      }
      if (!formData.city) {
        newErrors.city = "City is required";
      }
      if (formData.city === "Other" && !formData.customLocation.trim()) {
        newErrors.customLocation = "Please enter your location";
      }
      if (!formData.location?.trim()) {
        newErrors.location = "Location is required";
      }
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Password confirmation is required";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "You must accept the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    startRegistration();

    try {
      const response = await registerLandlord(formData, businessLogoFile);

      if (response.success) {
        finishRegistration(response);
        navigate("/verify-account", {
          state: {
            email: formData.email,
            userType: "landlord",
          },
        });
      } else {
        registrationError(
          response.error || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      registrationError("An unexpected error occurred. Please try again.");
    }
  };

  const businessTypes = [
    "Individual Property Owner",
    "Real Estate Company",
    "Property Management Company",
    "Investment Company",
    "Individual",
    "Other",
  ];

  const renderStep1 = () => (
    <Motion.div
      key="step1"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      {/* Business Logo Upload */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-xl border-4 border-orange-200 overflow-hidden bg-gray-100 flex items-center justify-center">
            {businessLogoPreview ? (
              <img
                src={businessLogoPreview}
                alt="Business Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Building className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Logo</span>
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleBusinessLogoChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="ml-4 text-left">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Business Logo
          </p>
          <p className="text-xs text-gray-500">Upload your business logo</p>
          <p className="text-xs text-gray-400">
            (Optional - JPEG, PNG, WebP max 4MB)
          </p>
        </div>
      </div>

      {/* Full Name - Full Width */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            maxLength={50}
            pattern="[a-zA-ZÀ-ÿ\s'-]+"
            title="Full name can only contain letters, spaces, apostrophes, and hyphens"
            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.fullName
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
            placeholder="Enter your full name (letters only)"
          />
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Business Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={(e) => {
              if (e.target.value.trim()) {
                const emailValidation = validateEmail(e.target.value.trim().toLowerCase());
                if (!emailValidation.isValid) {
                  setErrors((prev) => ({
                    ...prev,
                    email: emailValidation.message,
                  }));
                }
              }
            }}
            maxLength={254}
            pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
            title="Please enter a valid email address"
            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.email
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
            placeholder="Enter your business email address"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ghana Phone Number *
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          className={`w-full pl-28 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
            errors.phone
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-orange-400 hover:border-gray-300"
          } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>
    </Motion.div>
  );

  const renderStep2 = () => (
    <Motion.div
      key="step2"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Information
        </h2>
        <p className="text-gray-600">Tell us about your property business</p>
      </div>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Business Name *
        </label>
        <div className="relative">
          <Building className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.businessName
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
            placeholder="e.g., Osei Properties Ltd"
          />
        </div>
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.businessType
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
          >
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
          )}
        </div>

        {/* Business Registration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Registration Number
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="businessRegistration"
              value={formData.businessRegistration}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white"
              placeholder="Optional"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optional - Your business registration number
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Region */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Region *
          </label>
          <select
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.region
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
          >
            <option value="">Select region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="mt-1 text-sm text-red-600">{errors.region}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City *
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            disabled={!formData.region}
            className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.city
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:bg-gray-100 bg-white`}
          >
            <option value="">Select city</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
      </div>

      {/* Custom Location Input - Appears when "Other" is selected */}
      <AnimatePresence>
        {showCustomLocation && (
          <Motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Your Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="customLocation"
                  value={formData.customLocation}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
                    errors.customLocation
                      ? "border-red-400"
                      : "border-gray-200 focus:border-orange-400"
                  } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
                  placeholder="Enter your specific location"
                />
              </div>
              {errors.customLocation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customLocation}
                </p>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );

  const renderStep3 = () => (
    <Motion.div
      key="step3"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Security & Terms
        </h2>
        <p className="text-gray-600">
          Create a secure password and accept our terms
        </p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.password
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 ${
              errors.confirmPassword
                ? "border-red-400"
                : "border-gray-200 focus:border-orange-400"
            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <div className="text-sm">
            <p className="text-gray-700">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
        {errors.acceptTerms && (
          <p className="mt-2 text-sm text-red-600">{errors.acceptTerms}</p>
        )}
      </div>

      {/* Auth Error Display */}
      {authError && (
        <Motion.div
          className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-700 text-center font-medium">
            {authError}
          </p>
        </Motion.div>
      )}
    </Motion.div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Back button - positioned absolutely */}
      <Motion.button
        onClick={() => navigate("/select-user-type")}
        className="absolute top-4 left-4 z-50 flex items-center text-gray-600 hover:text-orange-600 transition-all duration-300 px-3 py-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 backdrop-blur-sm bg-white/90 shadow-lg"
        whileHover={{ x: -3, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Back</span>
      </Motion.button>

      <div className="h-full flex">
        {/* Left side - Scrollable Form */}
        <Motion.div
          className="w-full lg:w-1/2 flex flex-col relative z-10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Form Container - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col justify-center p-6 lg:p-8 py-12">
              <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center min-h-0">
                {/* Logo and Header */}
                <Motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/">
                    <Motion.img
                      src={Images.logo}
                      alt="Quick Rent"
                      className="w-32 mx-auto mb-6"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </Link>

                  {/* Landlord Badge */}
                  <Motion.div
                    className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-sm font-semibold mb-6 border border-orange-200"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Landlord Registration
                  </Motion.div>

                  <Motion.h1
                    className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Join Ghana's Leading Platform
                  </Motion.h1>
                  <Motion.p
                    className="text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Start managing your properties professionally
                  </Motion.p>
                </Motion.div>

                {/* Progress Steps */}
                <div className="mb-10">
                  <div className="flex items-center justify-center relative">
                    <div className="flex items-center justify-between w-full max-w-sm relative">
                      {/* Background connecting line that passes through circle centers */}
                      <div className="absolute top-1/2 left-5 right-5 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

                      {/* Progress connecting line that passes through circle centers */}
                      <Motion.div
                        className="absolute top-1/2 left-5 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 -translate-y-1/2 transition-all duration-500 z-0"
                        style={{
                          width:
                            currentStep === 1
                              ? "0%"
                              : currentStep === 2
                              ? "calc(50% - 20px)"
                              : "calc(100% - 40px)",
                        }}
                      />

                      {[
                        { step: 1, title: "Personal Info", icon: User },
                        { step: 2, title: "Business Details", icon: Building },
                        { step: 3, title: "Security", icon: Shield },
                      ].map(({ step, title, icon: Icon }) => (
                        <Motion.div
                          key={step}
                          className="flex flex-col items-center relative z-10"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: step * 0.1 }}
                        >
                          <Motion.div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500 border-2 shadow-lg relative ${
                              currentStep >= step
                                ? "text-white border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/25"
                                : currentStep === step
                                ? "text-orange-500 border-orange-300 bg-white shadow-orange-200/50"
                                : "text-gray-400 border-gray-200 bg-white shadow-gray-200/50"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            animate={
                              currentStep === step
                                ? {
                                    boxShadow:
                                      "0 0 20px rgba(251, 146, 60, 0.4)",
                                    scale: [1, 1.05, 1],
                                  }
                                : {}
                            }
                            transition={{ duration: 0.3 }}
                          >
                            {currentStep > step ? (
                              <Motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <Check className="w-4 h-4" />
                              </Motion.div>
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </Motion.div>

                          <Motion.div
                            className="mt-2 text-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: step * 0.1 + 0.2 }}
                          >
                            <div
                              className={`text-xs font-semibold transition-colors duration-300 ${
                                currentStep >= step
                                  ? "text-orange-600"
                                  : "text-gray-500"
                              }`}
                            >
                              Step {step}
                            </div>
                            <div
                              className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                                currentStep >= step
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {title}
                            </div>
                          </Motion.div>

                          {/* Active step indicator */}
                          {currentStep === step && (
                            <Motion.div
                              className="absolute -bottom-1 w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            />
                          )}
                        </Motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Step description */}
                  <Motion.div
                    className="mt-4 text-center"
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full inline-block">
                      {currentStep === 1 && "Tell us about yourself"}
                      {currentStep === 2 && "Share your business information"}
                      {currentStep === 3 && "Secure your account"}
                    </p>
                  </Motion.div>
                </div>

                {/* Form Steps */}
                <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                  <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                      {currentStep === 1 && renderStep1()}
                      {currentStep === 2 && renderStep2()}
                      {currentStep === 3 && renderStep3()}
                    </AnimatePresence>
                  </div>

                  {/* Navigation Buttons - Fixed at bottom */}
                  <div className="flex justify-between pt-6 mt-auto sticky bottom-0 bg-gradient-to-t from-orange-50 via-amber-50 to-transparent backdrop-blur-sm pb-2 -mx-6 px-6 lg:-mx-8 lg:px-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base min-w-[80px] sm:min-w-[100px] ${
                        currentStep === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Previous
                    </button>

                    {currentStep < 3 ? (
                      <Motion.button
                        type="button"
                        onClick={nextStep}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center text-sm sm:text-base min-w-[100px] sm:min-w-[120px]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="hidden sm:inline">Next Step</span>
                        <span className="sm:hidden">Next</span>
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Motion.button>
                    ) : (
                      <Motion.button
                        type="submit"
                        disabled={isRegistering}
                        className="px-4 sm:px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center disabled:opacity-70 text-sm sm:text-base min-w-[120px] sm:min-w-[140px]"
                        whileHover={!isRegistering ? { scale: 1.02 } : {}}
                        whileTap={!isRegistering ? { scale: 0.98 } : {}}
                      >
                        {isRegistering ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">Create Account</span>
                            <span className="sm:hidden">Create</span>
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Motion.button>
                    )}
                  </div>
                </form>

                {/* Login link */}
                <Motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/landlord-login"
                      className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </Motion.div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Right side - Fixed Marketing Content (Hidden on mobile) */}
        <Motion.div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Fixed content - properly sized to fit viewport */}
          <div className="relative flex flex-col justify-center h-full z-10 p-8 xl:p-10 text-white">
            <div className="space-y-6 max-h-full overflow-hidden">
              <Motion.div
                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl inline-flex items-center w-fit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-white/30 p-2 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-sm">Trusted Platform</span>
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl xl:text-3xl font-bold mb-4 leading-tight">
                  Grow Your Property Business in Ghana
                </h2>
                <p className="text-white/90 text-sm xl:text-base leading-relaxed">
                  Join thousands of successful landlords who trust Quick Rent to
                  manage their properties and maximize rental income.
                </p>
              </Motion.div>

              {/* Benefits List - Reduced */}
              <Motion.div
                className="space-y-2.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  "List unlimited properties for free",
                  "Access to 50,000+ verified tenants",
                  "Professional tenant screening",
                  "Secure online rent collection",
                ].map((benefit, index) => (
                  <Motion.div
                    key={benefit}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Check className="w-4 h-4 mr-3 text-green-300 flex-shrink-0" />
                    <span className="text-white/90 text-sm">{benefit}</span>
                  </Motion.div>
                ))}
              </Motion.div>

              {/* Stats Grid - Compact */}
              <Motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                {[
                  { value: "2K+", label: "Landlords" },
                  { value: "95%", label: "Success Rate" },
                  { value: "16", label: "Regions" },
                ].map(({ value, label }, index) => (
                  <Motion.div
                    key={label}
                    className="bg-white/20 backdrop-blur-sm p-3 rounded-xl text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-lg font-bold">{value}</div>
                    <div className="text-white/80 text-xs">{label}</div>
                  </Motion.div>
                ))}
              </Motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default LandlordRegister;
