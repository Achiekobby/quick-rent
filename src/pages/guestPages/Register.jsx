import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  ChevronDown,
  Phone,
  CheckCircle2,
  X,
  ArrowLeft,
  Info,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Home,
  UserCheck,
  Building,
  Sparkles,
  Shield,
  Star,
  Heart,
  Zap,
  Calendar,
  Users,
} from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import useAuthStore from "../../stores/authStore";
import { registerRenter } from "../../api/Renter/Authentication/Signup";

const Register = () => {
  const navigate = useNavigate();
  const { 
    startRegistration, 
    finishRegistration, 
    registrationError, 
    requiresVerification, 
    getRedirectPath,
    registrationData,
    isRegistering,
    isAuthenticated
  } = useAuthStore();
  const fileInputRef = useRef(null);
  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "233",
    gender: "",
    password: "",
    confirmPassword: "",
    avatar: null,
    dateOfBirth: "",
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const pageVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      x: -50,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

  const validateEmail = (email) => {
    // More comprehensive email validation regex that requires a proper domain with TLD
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

  const validateDateOfBirth = (dateString) => {
    if (!dateString) return { isValid: false, message: "Date of birth is required" };
    
    const inputDate = new Date(dateString);
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Check if date is valid
    if (isNaN(inputDate.getTime())) {
      return { isValid: false, message: "Please enter a valid date" };
    }
    
    // Check if date is in the future
    if (inputDate > today) {
      return { isValid: false, message: "Date of birth cannot be in the future" };
    }
    
    // Check if date is today
    const todayString = today.toISOString().split('T')[0];
    if (dateString === todayString) {
      return { isValid: false, message: "Date of birth cannot be today" };
    }
    
    // Check minimum age (must be at least 13 years old for legal reasons)
    const minAge = 13;
    const minAgeDate = new Date(currentYear - minAge, today.getMonth(), today.getDate());
    if (inputDate > minAgeDate) {
      return { isValid: false, message: `You must be at least ${minAge} years old to register` };
    }
    
    // Check maximum age (reasonable limit of 120 years)
    const maxAge = 120;
    const maxAgeDate = new Date(currentYear - maxAge, today.getMonth(), today.getDate());
    if (inputDate < maxAgeDate) {
      return { isValid: false, message: "Please enter a valid date of birth" };
    }
    
    return { isValid: true, message: null };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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
    if (name === 'email' && value.trim()) {
      const emailValidation = validateEmail(value.trim().toLowerCase());
      if (!emailValidation.isValid) {
        setErrors((prev) => ({
          ...prev,
          [name]: emailValidation.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
      // Convert email to lowercase for consistency
      filteredValue = value.trim().toLowerCase();
    }
    
    // Real-time date of birth validation
    if (name === 'dateOfBirth' && value) {
      const dateValidation = validateDateOfBirth(value);
      if (!dateValidation.isValid) {
        setErrors((prev) => ({
          ...prev,
          [name]: dateValidation.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));

    // Clear error when user types (except for email and dateOfBirth which have real-time validation)
    if (errors[name] && name !== 'email' && name !== 'dateOfBirth') {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    // Clear error when user types
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: null,
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarError("");

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (4MB)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setAvatarError('Image size must be less than 4MB.');
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 0) {
      // Step 0: Role Selection
      if (!selectedRole) {
        newErrors.role = "Please select your role";
      }
    }

    if (currentStep === 1) {
      // Step 1: Basic Info
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

    if (currentStep === 2) {
      // Step 2: Profile & Gender
      const dateValidation = validateDateOfBirth(formData.dateOfBirth);
      if (!dateValidation.isValid) {
        newErrors.dateOfBirth = dateValidation.message;
      }
      
      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }
    }

    if (currentStep === 3) {
      // Step 3: Security
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else {
        if (!/(?=.*[a-z])/.test(formData.password)) {
          newErrors.password = "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
          newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!/(?=.*\d)/.test(formData.password)) {
          newErrors.password = "Password must contain at least one number";
        } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
          newErrors.password = "Password must contain at least one special character";
        }
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    startRegistration();
    setErrors({});

    try {
      const result = await registerRenter(formData, avatarFile);

      if (result.success) {
        // Handle the successful registration using the auth store
        finishRegistration(result);
        
        // Check if user needs verification
        if (requiresVerification()) {
          navigate("/verify-account", { 
            state: { 
              email: formData.email,
              message: registrationData?.reason || "Please verify your account to continue"
            }
          });
        } else {
          navigate(getRedirectPath());
        }
      } else {
        // Handle API errors
        registrationError(result.message || "Registration failed. Please try again.");
        
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        
        setErrors(prev => ({
          ...prev,
          general: result.message || "Registration failed. Please try again."
        }));
      }
    } catch (error) {
      console.log(error);
      registrationError("An unexpected error occurred. Please try again.");
      setErrors({
        general: "An unexpected error occurred. Please try again."
      });
    }
  };

  const renderStepIndicator = () => {
    if (step === 0) return null;
    
    const steps = [
      { number: 1, label: "Basic Info", icon: User },
      { number: 2, label: "Profile", icon: Camera },
      { number: 3, label: "Security", icon: Shield }
    ];
    
    return (
      <div className="mb-6 sm:mb-8 px-4">
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          {steps.map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const isActive = step === stepItem.number;
            const isCompleted = step > stepItem.number;
            const isAccessible = step >= stepItem.number;
            
            return (
              <div key={stepItem.number} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <Motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2 relative ${
                      isCompleted
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
                        : isActive
                        ? "bg-white border-orange-500 text-orange-500 shadow-lg shadow-orange-500/25"
                        : "bg-neutral-100 border-neutral-300 text-neutral-400"
                    }`}
                    whileHover={{ scale: isAccessible ? 1.05 : 1 }}
                    animate={{
                      scale: isActive ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0,
                      repeatType: "reverse",
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isActive ? (
                      <StepIcon className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                    
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-20" />
                    )}
                  </Motion.div>
                  
                  <Motion.div
                    className="mt-2 text-center"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: isAccessible ? 1 : 0.5 }}
                  >
                    <div className={`text-xs font-medium transition-colors ${
                      isAccessible ? "text-orange-600" : "text-neutral-400"
                    }`}>
                      {stepItem.label}
                    </div>
                  </Motion.div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 mb-6 bg-neutral-200 rounded-full overflow-hidden">
                    <Motion.div
                      className="h-full bg-orange-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: step > stepItem.number ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Step 0: Role Selection
  const renderRoleSelection = () => {
    return (
      <Motion.div
        key="role-selection"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full"
      >
        {/* Back Button */}
        <div className="mb-8">
          <Motion.button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200 shadow-sm"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to previous page
          </Motion.button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4 sm:mb-6 px-4"
            variants={itemVariants}
          >
            Join <span className="text-orange-500">QuickRent</span>
          </Motion.h1>
          <Motion.p
            className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-3 sm:mb-4 px-4"
            variants={itemVariants}
          >
            Whether you're looking for a home or listing your property, we've got you covered
          </Motion.p>
          <Motion.p
            className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto px-4"
            variants={itemVariants}
          >
            Select your account type to get started with Ghana's premier rental platform
          </Motion.p>
        </div>

        <Motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto mb-16 px-4 sm:px-6" variants={itemVariants}>
          <Motion.div
            className={`relative bg-white rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
              selectedRole === 'renter'
                ? 'border-orange-500 shadow-xl shadow-orange-500/20 scale-105'
                : 'border-neutral-200 hover:border-orange-300 hover:shadow-lg hover:scale-102'
            }`}
            onClick={() => setSelectedRole('renter')}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Header with Icon */}
            <div className={`p-8 transition-all duration-300 ${
              selectedRole === 'renter' 
                ? 'bg-gradient-to-br from-orange-50 to-orange-100' 
                : 'bg-neutral-50 group-hover:bg-orange-50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'renter' 
                    ? 'bg-orange-500 shadow-lg' 
                    : 'bg-neutral-200 group-hover:bg-orange-200'
                }`}>
                  <Home className={`w-8 h-8 transition-colors ${
                    selectedRole === 'renter' ? 'text-white' : 'text-neutral-600'
                  }`} />
                </div>
                {selectedRole === 'renter' && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </Motion.div>
                )}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 sm:mb-3">I'm a Renter</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Find your perfect home with our comprehensive property search and application tools
              </p>
            </div>

            {/* Features */}
            <div className="p-8 pt-0">
              <div className="space-y-4">
                <div className="flex items-center text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Browse thousands of verified properties</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Secure application & payment process</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">24/7 customer support</span>
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedRole === 'renter' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            )}
          </Motion.div>

          {/* Landlord Card */}
          <Motion.div
            className={`relative bg-white rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
              selectedRole === 'landlord'
                ? 'border-orange-500 shadow-xl shadow-orange-500/20 scale-105'
                : 'border-neutral-200 hover:border-orange-300 hover:shadow-lg hover:scale-102'
            }`}
            onClick={() => setSelectedRole('landlord')}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Header with Icon */}
            <div className={`p-8 transition-all duration-300 ${
              selectedRole === 'landlord' 
                ? 'bg-gradient-to-br from-orange-50 to-orange-100' 
                : 'bg-neutral-50 group-hover:bg-orange-50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'landlord' 
                    ? 'bg-orange-500 shadow-lg' 
                    : 'bg-neutral-200 group-hover:bg-orange-200'
                }`}>
                  <Building className={`w-8 h-8 transition-colors ${
                    selectedRole === 'landlord' ? 'text-white' : 'text-neutral-600'
                  }`} />
                </div>
                {selectedRole === 'landlord' && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </Motion.div>
                )}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 sm:mb-3">I'm a Landlord</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Maximize your property's potential with our comprehensive property management tools
              </p>
            </div>

            {/* Features */}
            <div className="p-8 pt-0">
              <div className="space-y-4">
                <div className="flex items-center text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Premium listing & marketing tools</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Smart tenant screening & matching</span>
                </div>
                <div className="flex items-center text-neutral-700">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Automated rent collection</span>
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedRole === 'landlord' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
            )}
          </Motion.div>
        </Motion.div>

        {errors.role && (
          <Motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-500 flex items-center justify-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.role}
          </Motion.p>
        )}

        <div className="text-center mt-12">
          <Motion.button
            type="button"
            className={`py-4 sm:py-5 px-6 sm:px-10 rounded-2xl shadow-lg text-white font-bold focus:outline-none transition-all duration-300 text-base sm:text-lg relative overflow-hidden ${
              selectedRole 
                ? 'bg-orange-500 hover:bg-orange-600 transform hover:scale-105 shadow-orange-500/25' 
                : 'bg-neutral-400 cursor-not-allowed'
            }`}
            onClick={() => {
              if (selectedRole === 'renter') {
                nextStep();
              } else if (selectedRole === 'landlord') {
                navigate('/landlord-register');
              }
            }}
            disabled={!selectedRole}
            whileHover={selectedRole ? { 
              scale: 1.05,
              boxShadow: "0 12px 24px rgba(251, 146, 60, 0.3)",
            } : {}}
            whileTap={selectedRole ? { scale: 0.95 } : {}}
          >
            <span className="flex items-center justify-center">
              {selectedRole ? (
                <>
                  {selectedRole === 'renter' ? (
                    <Home className="w-5 h-5 mr-3" />
                  ) : (
                    <Building className="w-5 h-5 mr-3" />
                  )}
                  Continue as {selectedRole}
                  <ArrowRight className="w-5 h-5 ml-3" />
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Choose your role to continue
                </>
              )}
            </span>
          </Motion.button>
        </div>
      </Motion.div>
    );
  };

  // Step 1: Basic Information
  const renderStep1 = () => {
    return (
      <Motion.div
        key="step-1"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-6"
      >
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Motion.button
            onClick={() => setStep(0)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200 shadow-sm"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Role
          </Motion.button>
          
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Step 1 of 3</span>
            <span>•</span>
            <span>Basic Information</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-6">
          <Motion.h1
            className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight mb-2"
            variants={itemVariants}
          >
            Let's get <span className="text-orange-500">started</span>
          </Motion.h1>
          <Motion.p
            className="text-neutral-600 max-w-xl mx-auto mb-3"
            variants={itemVariants}
          >
            Tell us a bit about yourself to create your renter account
          </Motion.p>
        </div>

        {renderStepIndicator()}

        {/* Form Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 lg:p-12">
            <Motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" variants={itemVariants}>
          {/* Full Name */}
          <div className="space-y-3">
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-neutral-700 flex items-center"
            >
              <Heart className="w-4 h-4 mr-2 text-pink-500" />
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-all duration-300" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                maxLength={50}
                pattern="[a-zA-ZÀ-ÿ\s'-]+"
                title="Full name can only contain letters, spaces, apostrophes, and hyphens"
                className={`block w-full pl-12 pr-4 py-4 border-2 ${
                  errors.fullName ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-orange-500"
                } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white`}
                placeholder="Enter your full name (letters only)"
                value={formData.fullName}
                onChange={handleInputChange}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            {errors.fullName && (
              <Motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                {errors.fullName}
              </Motion.p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-neutral-700 flex items-center"
            >
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-all duration-300" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
                title="Please enter a valid email address"
                className={`block w-full pl-12 pr-4 py-4 border-2 ${
                  errors.email ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-orange-500"
                } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white`}
                placeholder="Enter your email address"
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
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            {errors.email && (
              <Motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                {errors.email}
              </Motion.p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-neutral-700 flex items-center"
            >
              <Star className="w-4 h-4 mr-2 text-blue-500" />
              Phone Number
            </label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none">
                <Phone className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-all duration-300" />
              </div>
              <div className="absolute left-11 top-0 bottom-0 flex items-center">
                <div className="flex items-center gap-2 pr-3 border-r border-neutral-300">
                  <img
                    src="https://flagcdn.com/w20/gh.png"
                    alt="Ghana"
                    className="w-5 h-4 rounded-sm shadow-sm"
                  />
                  <span className="text-sm font-medium text-neutral-700">+233</span>
                </div>
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                className={`w-full pl-24 sm:pl-28 pr-4 py-4 rounded-2xl border-2 ${
                  errors.phone ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-orange-500"
                } focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white text-sm sm:text-base`}
                placeholder="XX XXX XXXX"
                value={
                  formData.phone.startsWith("233")
                    ? formData.phone.substring(3)
                    : formData.phone
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handlePhoneChange(`233${value}`);
                }}
                maxLength={9}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            {errors.phone && (
              <Motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                {errors.phone}
              </Motion.p>
            )}
            <div className="flex items-center text-xs text-neutral-500">
              <Info className="w-3 h-3 mr-1" />
              <span>Only Ghana numbers are supported for now</span>
            </div>
          </div>
        </Motion.div>

        <Motion.div className="pt-8" variants={itemVariants}>
          <Motion.button
            type="button"
            className="w-full py-5 px-6 rounded-2xl shadow-xl text-white font-semibold focus:outline-none relative overflow-hidden group bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            onClick={nextStep}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 12px 30px rgba(255, 144, 45, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button content */}
            <span className="relative flex items-center justify-center text-base sm:text-lg">
              Continue to Profile
              <Motion.div
                className="ml-3"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="h-5 w-5" />
              </Motion.div>
            </span>
            
            {/* Sparkle effect */}
            <div className="absolute top-2 right-2 opacity-50">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
          </Motion.button>
          
          {/* Progress hint */}
          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-500">
              Step 1 of 3 • Just getting started 🚀
            </p>
          </div>
            </Motion.div>
          </div>
        </div>
      </Motion.div>
    );
  };

  // Step 2: Profile & Gender
  const renderStep2 = () => {
    return (
      <Motion.div
        key="step-2"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-6"
      >
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Motion.button
            onClick={prevStep}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200 shadow-sm"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Basic Info
          </Motion.button>
          
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Step 2 of 3</span>
            <span>•</span>
            <span>Profile Setup</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <Motion.div variants={itemVariants} className="mb-3">
            <div className="w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </Motion.div>
          <Motion.h1
            className="text-2xl font-bold text-neutral-900 tracking-tight mb-2"
            variants={itemVariants}
          >
            Complete your <span className="text-orange-500">profile</span>
          </Motion.h1>
          <Motion.p
            className="text-neutral-600 text-sm max-w-md mx-auto"
            variants={itemVariants}
          >
            Add your profile picture and personal details
          </Motion.p>
        </div>

        {renderStepIndicator()}

        {/* Form Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 lg:p-12">
            <Motion.div className="space-y-6 sm:space-y-8" variants={itemVariants}>
              {/* Avatar Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-neutral-700 flex items-center">
                  <Camera className="w-4 h-4 mr-2 text-orange-500" />
                  Profile Picture <span className="text-neutral-500 ml-1">(Optional)</span>
                </label>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-4 border-white shadow-2xl overflow-hidden">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-orange-400" />
                        </div>
                      )}
                    </div>
                    
                    {avatarPreview && (
                      <Motion.button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </Motion.button>
                    )}
                  </div>
                  
                  <Motion.label
                    htmlFor="avatar"
                    className="cursor-pointer inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {avatarPreview ? "Change Photo" : "Upload Photo"}
                  </Motion.label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-neutral-500 text-center">
                    JPG, PNG or GIF • Max 5MB
                  </p>
                  
                  {avatarError && (
                    <Motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 text-center flex items-center justify-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {avatarError}
                    </Motion.p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-3">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-semibold text-neutral-700 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  Date of Birth
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-all duration-300" />
                  </div>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    min={(() => {
                      const today = new Date();
                      const maxAge = 120;
                      const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
                      return minDate.toISOString().split('T')[0];
                    })()}
                    max={(() => {
                      const today = new Date();
                      const minAge = 13;
                      const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    title="You must be between 13 and 120 years old to register"
                    className={`block w-full pl-12 pr-4 py-4 border-2 ${
                      errors.dateOfBirth ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-orange-500"
                    } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white`}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                {errors.dateOfBirth && (
                  <Motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {errors.dateOfBirth}
                  </Motion.p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-neutral-700 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-500" />
                  Gender
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {["Male", "Female", "Prefer not to say"].map((gender) => (
                    <Motion.button
                      key={gender}
                      type="button"
                      className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.gender === gender
                          ? "border-orange-500 bg-orange-50 text-orange-700 shadow-lg shadow-orange-500/25"
                          : "border-neutral-200 hover:border-orange-300 hover:bg-orange-50/50"
                      }`}
                      onClick={() => setFormData({ ...formData, gender })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {formData.gender === gender && (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 absolute top-2 right-2 text-orange-500" />
                      )}
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
                          {gender === "Male" ? "👨" : gender === "Female" ? "👩" : "🤷"}
                        </div>
                        <div className="font-medium text-xs sm:text-sm">{gender}</div>
                      </div>
                    </Motion.button>
                  ))}
                </div>
                {errors.gender && (
                  <Motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {errors.gender}
                  </Motion.p>
                )}
              </div>
            </Motion.div>

            <Motion.div className="pt-8" variants={itemVariants}>
              <Motion.button
                type="button"
                className="w-full py-5 px-6 rounded-2xl shadow-xl text-white font-semibold focus:outline-none relative overflow-hidden group bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                onClick={nextStep}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 12px 30px rgba(255, 144, 45, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Button content */}
                <span className="relative flex items-center justify-center text-base sm:text-lg">
                  Continue to Security
                  <Motion.div
                    className="ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Motion.div>
                </span>
                
                {/* Sparkle effect */}
                <div className="absolute top-2 right-2 opacity-50">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
              </Motion.button>
              
              {/* Progress hint */}
              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  Step 2 of 3 • Almost there! 💪
                </p>
              </div>
            </Motion.div>
          </div>
        </div>
      </Motion.div>
    );
  };

  // Step 3: Security
  const renderStep3 = () => {
    return (
      <Motion.div
        key="step-3"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full space-y-6"
      >
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Motion.button
            onClick={prevStep}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200 shadow-sm"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Motion.button>
          
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Step 3 of 3</span>
            <span>•</span>
            <span>Account Security</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <Motion.div variants={itemVariants} className="mb-3">
            <div className="w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </Motion.div>
          <Motion.h1
            className="text-2xl font-bold text-neutral-900 tracking-tight mb-2"
            variants={itemVariants}
          >
            Secure your <span className="text-orange-500">account</span>
          </Motion.h1>
          <Motion.p
            className="text-neutral-600 text-sm max-w-md mx-auto"
            variants={itemVariants}
          >
            Create a strong password to protect your account
          </Motion.p>
        </div>

        {renderStepIndicator()}

        {/* Form Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 lg:p-12">
            <Motion.form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" variants={itemVariants}>
          {/* General Error */}
          {errors.general && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </Motion.div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-neutral-700 flex items-center"
            >
              <Lock className="w-4 h-4 mr-2 text-orange-500" />
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password" 
                required
                className={`block w-full pl-12 pr-12 py-4 border-2 ${
                  errors.password ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-orange-500"
                } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-500 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-500 transition-colors" />
                )}
              </button>
            </div>
            {errors.password && (
              <Motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                {errors.password}
              </Motion.p>
            )}
            
            {/* Password Strength Indicator */}
            <div className="mt-3 space-y-2">
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    formData.password.length >= 8 ? "bg-green-500" : "bg-neutral-300"
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    /[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-neutral-300"
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    /[0-9]/.test(formData.password) ? "bg-green-500" : "bg-neutral-300"
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    /[@$!%*?&]/.test(formData.password) ? "bg-green-500" : "bg-neutral-300"
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2 text-xs text-neutral-600">
                <span className={formData.password.length >= 8 ? "text-green-600" : ""}>
                  • 8+ chars
                </span>
                <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                  • Uppercase
                </span>
                <span className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                  • Number
                </span>
                <span className={/[@$!%*?&]/.test(formData.password) ? "text-green-600" : ""}>
                  • Special
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-neutral-700 flex items-center"
            >
              <Shield className="w-4 h-4 mr-2 text-orange-500" />
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={`block w-full pl-12 pr-12 py-4 border-2 ${
                  errors.confirmPassword ? "border-red-500 bg-red-50" : "border-neutral-200 focus:border-orange-500"
                } rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 bg-white`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-500 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-500 transition-colors" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <Motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                {errors.confirmPassword}
              </Motion.p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start p-3 sm:p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
            <div className="flex items-center h-5 mt-0.5 flex-shrink-0">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
              />
            </div>
            <div className="ml-2 sm:ml-3">
              <label htmlFor="terms" className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-orange-600 hover:text-orange-500 underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-orange-600 hover:text-orange-500 underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

              {/* Action Buttons */}
              <Motion.div className="pt-8" variants={itemVariants}>
                <Motion.button
                  type="submit"
                  className="w-full py-5 px-6 rounded-2xl shadow-xl text-white font-semibold focus:outline-none relative overflow-hidden group bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 12px 30px rgba(255, 144, 45, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isRegistering}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Button content */}
                  <span className="relative flex items-center justify-center text-base sm:text-lg">
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
                        <span className="hidden sm:inline">Creating Account...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Create Account</span>
                        <span className="sm:hidden">Create</span>
                        <Motion.div
                          className="ml-2 sm:ml-3"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Motion.div>
                      </>
                    )}
                  </span>
                  
                  {/* Sparkle effect */}
                  <div className="absolute top-2 right-2 opacity-50">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                </Motion.button>
                
                {/* Progress hint */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-neutral-500">
                    Final step • Complete your registration! 🎉
                  </p>
                </div>
              </Motion.div>
            </Motion.form>
          </div>
        </div>
      </Motion.div>
    );
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-300/5 to-orange-300/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
                  <Home className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
                    Quick<span className="text-orange-500">Rent</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 hidden sm:block">Create your account</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-xs sm:text-sm text-neutral-600">
                <span className="hidden sm:inline">Already have an account? </span>
                <Link
                  to="/select-user-type"
                  className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Motion.div
        className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          {step === 0 && renderRoleSelection()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </AnimatePresence>
      </Motion.div>
    </div>
  );
};

export default Register;
