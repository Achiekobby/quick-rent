/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  ArrowLeft,
  Phone,
  Smartphone,
  Building,
  TrendingUp,
  Users,
  Shield,
  Star,
  MapPin,
} from "lucide-react";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import { loginLandlord } from "../../api/Landlord/Authentication/Login";

const LandlordLogin = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    getRedirectPath, 
    startLogin, 
    finishLogin, 
    loginError,
    isLoading,
    error: authError 
  } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginMethod, setLoginMethod] = useState("email");

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    phone: "233",
    password: "",
  });


  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
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

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^233\d{9}$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid Ghana phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startLogin();

    try {
      const loginData = {
        emailOrPhone: loginMethod === "email" ? formData.email : formData.phone,
        password: formData.password,
      };

      console.log('🔐 Attempting landlord login with:', {
        method: loginMethod,
        contact: loginMethod === "email" ? formData.email : formData.phone,
        timestamp: new Date().toISOString()
      });

      const response = await loginLandlord(loginData);

      if (response.success) {
        console.log('🎉 Landlord login successful:', {
          userId: response.user?.id,
          businessName: response.user?.business_name,
          userType: response.user?.user_type,
          timestamp: new Date().toISOString()
        });

        finishLogin(response);
        
        // Show success message briefly before redirect
        const redirectPath = getRedirectPath();
        console.log('🚀 Redirecting to:', redirectPath);
        
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      } else {
        console.warn('⚠️ Landlord login failed:', response.error);
        loginError(response.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("🚨 Landlord login error:", error);
      loginError("An unexpected error occurred. Please try again.");
    }
  };

  const PhoneInput = () => {
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        <div className="absolute left-10 top-0 bottom-0 flex items-center">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
            <img
              src="https://flagcdn.com/w20/gh.png"
              alt="Ghana"
              className="w-5 h-4"
            />
            <span className="text-sm text-gray-700 font-medium">+233</span>
          </div>
        </div>
        <input
          type="tel"
          name="phone"
          id="phone"
          className={`w-full pl-28 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
            errors.phone 
              ? "border-red-400 focus:border-red-500" 
              : "border-gray-200 focus:border-orange-400 hover:border-gray-300"
          } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
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
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
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
            <div className="min-h-full flex items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-md">
                {/* Logo and Header */}
                <Motion.div 
                  className="text-center mb-8"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
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
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Landlord Portal
                    <div className="ml-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  </Motion.div>

                  <Motion.h1 
                    className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Welcome Back
                  </Motion.h1>
                  <Motion.p 
                    className="text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Access your property management dashboard
                  </Motion.p>
                </Motion.div>

                {/* Login method toggle */}
                <Motion.div
                  className="flex border-2 border-gray-200 rounded-xl p-1 mb-6 relative bg-gray-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Motion.div
                    className="absolute top-1 bottom-1 rounded-lg bg-white shadow-md z-0"
                    initial={false}
                    animate={{
                      x: loginMethod === "email" ? 2 : "calc(100% - 2px)",
                      width: "calc(50% - 2px)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />

                  <button
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center z-10 transition-colors duration-200 ${
                      loginMethod === "email"
                        ? "text-orange-700"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setLoginMethod("email")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center z-10 transition-colors duration-200 ${
                      loginMethod === "phone"
                        ? "text-orange-700"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setLoginMethod("phone")}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Phone
                  </button>
                </Motion.div>

                {/* Form */}
                <Motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {/* Email/Phone Input */}
                  <AnimatePresence mode="wait">
                    {loginMethod === "email" ? (
                      <Motion.div
                        key="email"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 ${
                              errors.email
                                ? "border-red-400 focus:border-red-500"
                                : "border-gray-200 focus:border-orange-400 hover:border-gray-300"
                            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
                            placeholder="your.business@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        {errors.email && (
                          <Motion.p 
                            className="mt-2 text-sm text-red-600"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.email}
                          </Motion.p>
                        )}
                      </Motion.div>
                    ) : (
                      <Motion.div
                        key="phone"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Ghana Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="absolute left-10 top-0 bottom-0 flex items-center">
                            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
                              <img
                                src="https://flagcdn.com/w20/gh.png"
                                alt="Ghana"
                                className="w-5 h-4"
                              />
                              <span className="text-sm text-gray-700 font-medium">+233</span>
                            </div>
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            className={`w-full pl-28 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 ${
                              errors.phone 
                                ? "border-red-400 focus:border-red-500" 
                                : "border-gray-200 focus:border-orange-400 hover:border-gray-300"
                            } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
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
                        </div>
                        {errors.phone && (
                          <Motion.p 
                            className="mt-2 text-sm text-red-600"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.phone}
                          </Motion.p>
                        )}
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all duration-300 ${
                          errors.password
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-200 focus:border-orange-400 hover:border-gray-300"
                        } focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 bottom-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <Motion.p 
                        className="mt-2 text-sm text-red-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.password}
                      </Motion.p>
                    )}
                  </div>

                  {/* Forgot Password */}
                  <div className="flex items-center justify-end">
                    <Link
                      to="/landlord-forgot-password"
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Auth Error Display */}
                  {authError && (
                    <Motion.div
                      className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-red-700 text-center font-medium">
                        {authError}
                      </p>
                    </Motion.div>
                  )}

                  {/* Submit Button */}
                  <Motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                    whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Access Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Motion.button>
                </Motion.form>

                {/* Sign up link */}
                <Motion.div 
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-sm text-gray-600">
                    New to Quick Rent?{" "}
                    <Link
                      to="/landlord-register"
                      className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Register your business
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
          
          {/* Fixed content - compact for all screen sizes */}
          <div className="relative flex flex-col justify-center h-full z-10 p-6 xl:p-8 text-white">
            <div className="space-y-4 xl:space-y-5">
              <Motion.div
                className="bg-white/20 backdrop-blur-sm p-2.5 xl:p-3 rounded-xl inline-flex items-center w-fit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-white/30 p-1.5 xl:p-2 rounded-lg mr-2 xl:mr-3">
                  <Shield className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                </div>
                <span className="font-semibold text-xs xl:text-sm">Trusted by 2,000+ Landlords</span>
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-bold mb-3 xl:mb-4 leading-tight">
                  Manage Your Properties Like a Pro
                </h2>
                <p className="text-white/90 text-xs xl:text-sm 2xl:text-base leading-relaxed">
                  Join Ghana's leading property management platform. List properties, screen tenants, collect rent, and grow your business.
                </p>
              </Motion.div>

              {/* Features List - More compact */}
              <Motion.div 
                className="space-y-2 xl:space-y-2.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  "List unlimited properties for free",
                  "Access to 50,000+ verified tenants",
                  "Professional tenant screening",
                  "Secure online rent collection"
                ].map((feature, index) => (
                  <Motion.div
                    key={feature}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 bg-white rounded-full mr-2 xl:mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-xs xl:text-sm">{feature}</span>
                  </Motion.div>
                ))}
              </Motion.div>

              {/* Stats Grid - Compact */}
              <Motion.div 
                className="grid grid-cols-2 gap-2 xl:gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                {[
                  { icon: TrendingUp, value: "95%", label: "Occupancy Rate" },
                  { icon: Users, value: "50K+", label: "Verified Tenants" },
                  { icon: MapPin, value: "16", label: "Regions" },
                  { icon: Star, value: "4.8", label: "Rating" }
                ].map(({ icon: IconComponent, value, label }, index) => (
                  <Motion.div
                    key={label}
                    className="bg-white/20 backdrop-blur-sm p-2 xl:p-2.5 rounded-xl text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <IconComponent className="w-3 h-3 xl:w-4 xl:h-4 mx-auto mb-1" />
                    <div className="text-sm xl:text-base font-bold">{value}</div>
                    <div className="text-white/80 text-xs">{label}</div>
                  </Motion.div>
                ))}
              </Motion.div>
            </div>

            {/* Decorative elements - smaller */}
            <div className="absolute top-16 right-16 w-24 h-24 xl:w-32 xl:h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-16 left-16 w-20 h-20 xl:w-24 xl:h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default LandlordLogin;