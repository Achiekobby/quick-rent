import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Home,
  ChevronDown,
  Phone,
  CheckCircle2,
  X,
  ArrowLeft,
  Building,
  FileText,
  MapPin,
  Info,
  CreditCard,
  Hash,
} from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import "react-phone-input-2/lib/style.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("renter");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "233",
    confirmPassword: "",
    // Landlord specific fields
    companyName: "",
    businessRegistrationNumber: "",
    address: "",
    idType: "nationalID",
    idNumber: "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
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

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^233\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid Ghana phone number";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Landlord specific validations
    if (userType === "landlord") {
      if (!formData.idNumber) {
        newErrors.idNumber = "ID number is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const nextStep = () => {
    setStep(2);
  };

  const PhoneInput = () => {
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
          <Phone className="h-5 w-5 text-neutral-400" />
        </div>
        <div className="absolute left-9 top-0 bottom-0 flex items-center">
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-200">
            <img
              src="https://flagcdn.com/w20/gh.png"
              alt="Ghana"
              className="w-4 h-3"
            />
            <span className="text-sm text-neutral-700">+233</span>
          </div>
        </div>
        <input
          type="tel"
          name="phone"
          id="phone"
          className="w-full pl-24 pr-4 py-4 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          placeholder="XX XXX XXXX"
          value={
            formData.phone.startsWith("233")
              ? formData.phone.substring(3)
              : formData.phone
          }
          onChange={(e) => {
            // Only allow numbers
            const value = e.target.value.replace(/\D/g, "");
            handlePhoneChange(`233${value}`);
          }}
          maxLength={9}
        />
      </div>
    );
  };

  const renderUserTypeSelection = () => {
    return (
      <Motion.div
        key="user-type"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full"
      >
        <div className="text-center mb-10">
          <Motion.h1
            className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3"
            variants={itemVariants}
          >
            Join Quick Rent
          </Motion.h1>
          <Motion.p
            className="text-neutral-600 text-lg max-w-md mx-auto"
            variants={itemVariants}
          >
            Select your account type to get started with the registration
            process
          </Motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Motion.button
            className={`flex flex-col items-center p-8 md:p-10 rounded-2xl border-2 transition-all duration-300 overflow-hidden relative ${
              userType === "renter"
                ? "border-orange-500 bg-orange-50"
                : "border-neutral-200 hover:border-orange-300 hover:bg-orange-50/50"
            }`}
            onClick={() => setUserType("renter")}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px rgba(237, 137, 54, 0.2)",
            }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {userType === "renter" && (
              <Motion.div
                className="absolute top-0 right-0 w-24 h-24 bg-orange-500"
                style={{
                  clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                userType === "renter" ? "bg-orange-100" : "bg-neutral-100"
              }`}
            >
              <User
                className={`w-12 h-12 ${
                  userType === "renter" ? "text-orange-600" : "text-neutral-500"
                }`}
              />
            </div>

            <h3
              className={`text-2xl font-bold mb-3 ${
                userType === "renter" ? "text-orange-700" : "text-neutral-700"
              }`}
            >
              I'm a Renter
            </h3>

            <p className="text-neutral-600 text-center">
              Looking for a property to rent in Ghana
            </p>

            {userType === "renter" && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            )}

            <Motion.div
              className={`mt-6 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                userType === "renter"
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-100 text-neutral-700"
              }`}
              animate={{
                scale: userType === "renter" ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: userType === "renter" ? Infinity : 0,
                repeatType: "reverse",
                repeatDelay: 1,
              }}
            >
              {userType === "renter" ? "Selected" : "Select"}
            </Motion.div>
          </Motion.button>

          <Motion.button
            className={`flex flex-col items-center p-8 md:p-10 rounded-2xl border-2 transition-all duration-300 overflow-hidden relative ${
              userType === "landlord"
                ? "border-orange-500 bg-orange-50"
                : "border-neutral-200 hover:border-orange-300 hover:bg-orange-50/50"
            }`}
            onClick={() => setUserType("landlord")}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px rgba(237, 137, 54, 0.2)",
            }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            {userType === "landlord" && (
              <Motion.div
                className="absolute top-0 right-0 w-24 h-24 bg-orange-500"
                style={{
                  clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                userType === "landlord" ? "bg-orange-100" : "bg-neutral-100"
              }`}
            >
              <Home
                className={`w-12 h-12 ${
                  userType === "landlord"
                    ? "text-orange-600"
                    : "text-neutral-500"
                }`}
              />
            </div>

            <h3
              className={`text-2xl font-bold mb-3 ${
                userType === "landlord" ? "text-orange-700" : "text-neutral-700"
              }`}
            >
              I'm a Landlord
            </h3>

            <p className="text-neutral-600 text-center">
              Want to list my properties for rent
            </p>

            {userType === "landlord" && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            )}

            <Motion.div
              className={`mt-6 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                userType === "landlord"
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-100 text-neutral-700"
              }`}
              animate={{
                scale: userType === "landlord" ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: userType === "landlord" ? Infinity : 0,
                repeatType: "reverse",
                repeatDelay: 1,
              }}
            >
              {userType === "landlord" ? "Selected" : "Select"}
            </Motion.div>
          </Motion.button>
        </div>

        <Motion.div className="mt-12 text-center" variants={itemVariants}>
          <Motion.button
            type="button"
            className="px-10 py-4 text-white rounded-xl font-medium shadow-lg inline-flex items-center transition-all duration-200 relative overflow-hidden"
            style={{ backgroundColor: Colors.accent.orange }}
            onClick={nextStep}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 20px rgba(255, 144, 45, 0.25)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Motion.span
              className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400"
              animate={{
                x: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              style={{ opacity: 0.3 }}
            />
            <span className="relative z-10">
              Continue as {userType === "renter" ? "Renter" : "Landlord"}
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </span>
          </Motion.button>
          <p className="mt-6 text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Sign in
            </Link>
          </p>
        </Motion.div>
      </Motion.div>
    );
  };

  const renderRegistrationForm = () => {
    return (
      <Motion.div
        key="registration-form"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full"
      >
        {/* Header with progress indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={() => setStep(1)}
              className="mr-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Go back to user type selection"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-500" />
            </button>

            <div>
              <Motion.h1
                className="text-2xl md:text-3xl font-bold text-neutral-900"
                variants={itemVariants}
              >
                Create your account
              </Motion.h1>
              <Motion.p
                className="text-neutral-600 mt-1"
                variants={itemVariants}
              >
                Join as a {userType === "renter" ? "Renter" : "Landlord"} and{" "}
                {userType === "renter"
                  ? "find your perfect home"
                  : "list your properties"}
              </Motion.p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center mt-8 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
              1
            </div>
            <div className="flex-1 h-1 bg-orange-200 mx-2">
              <div className="h-full bg-orange-500 w-full"></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
              2
            </div>
          </div>
        </div>

        <Motion.form
          onSubmit={handleSubmit}
          className="space-y-8"
          variants={itemVariants}
        >
          {/* Personal Information Section */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 text-neutral-800 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className={`block w-full pl-10 pr-3 py-4 border ${
                      errors.fullName ? "border-red-500" : "border-neutral-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all`}
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-4 border ${
                      errors.email ? "border-red-500" : "border-neutral-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="mt-6">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-700"
              >
                Phone Number
              </label>
              <div
                className={
                  errors.phone
                    ? "border border-red-500 rounded-xl mt-2"
                    : "mt-2"
                }
              >
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <div className="absolute left-9 top-0 bottom-0 flex items-center">
                    <div className="flex items-center gap-1 pr-2 border-r border-neutral-200">
                      <img
                        src="https://flagcdn.com/w20/gh.png"
                        alt="Ghana"
                        className="w-4 h-3"
                      />
                      <span className="text-sm text-neutral-700">+233</span>
                    </div>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="w-full pl-24 pr-4 py-4 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
                    placeholder="XX XXX XXXX"
                    value={
                      formData.phone.startsWith("233")
                        ? formData.phone.substring(3)
                        : formData.phone
                    }
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, "");
                      handlePhoneChange(`233${value}`);
                    }}
                    maxLength={9}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Only Ghana numbers are supported
              </p>
            </div>
          </div>

          {/* Landlord Specific Section */}
          <AnimatePresence>
            {userType === "landlord" && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm"
              >
                <h2 className="text-lg font-semibold mb-6 text-neutral-800 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                  Verification Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Type Selection */}
                  <div className="space-y-2">
                    <label
                      htmlFor="idType"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      ID Type
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <select
                        id="idType"
                        name="idType"
                        className="block w-full pl-10 pr-10 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm appearance-none transition-all"
                        value={formData.idType}
                        onChange={handleInputChange}
                      >
                        <option value="nationalID">National ID Card</option>
                        <option value="passport">Passport</option>
                        <option value="votersID">Voter's ID Card</option>
                        <option value="driversLicense">Driver's License</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      </div>
                    </div>
                  </div>

                  {/* ID Number */}
                  <div className="space-y-2">
                    <label
                      htmlFor="idNumber"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      ID Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        id="idNumber"
                        name="idNumber"
                        type="text"
                        className={`block w-full pl-10 pr-3 py-4 border ${
                          errors.idNumber
                            ? "border-red-500"
                            : "border-neutral-300"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all`}
                        placeholder="Enter your ID number"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.idNumber && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {errors.idNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-600 flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    We require ID verification for landlords to ensure the
                    security of our platform. Your information is secure and
                    will only be used for verification purposes.
                  </p>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Security Section */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-6 text-neutral-800 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-orange-500" />
              Security
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700"
                >
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
                    className={`block w-full pl-10 pr-12 py-4 border ${
                      errors.password ? "border-red-500" : "border-neutral-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
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
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                <div className="mt-2">
                  <div className="flex gap-1 items-center">
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        formData.password.length >= 8
                          ? "bg-green-500"
                          : "bg-neutral-300"
                      }`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        /[A-Z]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-neutral-300"
                      }`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        /[0-9]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-neutral-300"
                      }`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full ${
                        /[^A-Za-z0-9]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-neutral-300"
                      }`}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Must be at least 8 characters with a mix of letters,
                    numbers, and symbols
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-700"
                >
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
                    className={`block w-full pl-10 pr-12 py-4 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-neutral-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
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
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-5 w-5 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="terms" className="text-neutral-600">
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
              <p className="text-xs text-neutral-500 mt-1">
                By creating an account, you agree to receive updates and
                marketing communications from Quick Rent.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Motion.button
              type="submit"
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white font-medium focus:outline-none relative overflow-hidden"
              style={{ backgroundColor: Colors.accent.orange }}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 8px 20px rgba(255, 144, 45, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              <Motion.span
                className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400"
                animate={{
                  x: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                style={{ opacity: 0.3 }}
              />

              <span className="relative z-10 flex items-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </span>
            </Motion.button>
          </div>
        </Motion.form>

        {/* Form Switch */}
        <Motion.div className="mt-8 text-center" variants={itemVariants}>
          <p className="text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Sign in
            </Link>
          </p>
        </Motion.div>
      </Motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-neutral-50">
      <Motion.div
        className="max-w-6xl w-full mx-auto"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        {/* Back button to go back to home */}
        <Motion.button
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-600 hover:text-orange-600 transition-colors mb-4 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 w-auto"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Motion.button>

        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-neutral-100 p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 ? renderUserTypeSelection() : renderRegistrationForm()}
          </AnimatePresence>
        </div>
      </Motion.div>
    </div>
  );
};

export default Register;
