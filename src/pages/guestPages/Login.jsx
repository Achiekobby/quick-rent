import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  ChevronRight,
  ArrowLeft,
  Phone,
  Smartphone,
  Home,
  Building,
  Users,
} from "lucide-react";
import Colors from "../../utils/Colors";
import "react-phone-input-2/lib/style.css";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import { loginRenter } from "../../api/Renter/Authentication/Login";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"

  // Get user type from navigation state
  const selectedUserType = location.state?.userType || null;
  const fromUserTypeSelection = location.state?.from === "user-type-selection";

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

  // Redirect to user type selection if no user type is selected
  useEffect(() => {
    if (!selectedUserType && !fromUserTypeSelection) {
      navigate("/select-user-type", { replace: true });
    }
  }, [selectedUserType, fromUserTypeSelection, navigate]);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    phone: "233",
    password: "",
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

    // Email or Phone validation based on login method
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

    // Password validation
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
      // Prepare login data
      const loginData = {
        emailOrPhone: loginMethod === "email" ? formData.email : formData.phone,
        password: formData.password,
      };

      // Call the login API
      const response = await loginRenter(loginData);

      if (response.success) {
        // Login successful
        finishLogin(response);
        
        // Navigate to dashboard (will be redirected based on user type)
        const redirectPath = getRedirectPath();
        navigate(redirectPath, { replace: true });
      } else {
        // Login failed
        loginError(response.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      loginError("An unexpected error occurred. Please try again.");
    }
  };

  // Custom phone input component with Ghana only
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
          className={`w-full pl-24 pr-4 py-4 rounded-xl border ${
            errors.phone ? "border-red-500" : "border-neutral-300"
          } focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm`}
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-gray-50">
      <Motion.div
        className="max-w-6xl w-full mx-auto"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        {/* Back button */}
        <Motion.button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-4 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 w-auto"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Back</span>
        </Motion.button>

        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-neutral-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="p-6 sm:p-12">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="mb-12 text-center lg:text-left">
                  <Link to="/">
                    <img
                      src={Images.logo}
                      alt="Quick Rent"
                      className="w-32 inline-block mb-8"
                    />
                  </Link>

                  {/* User Type Indicator */}
                  {selectedUserType && (
                    <Motion.div
                      className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6"
                      variants={itemVariants}
                    >
                      {selectedUserType === 'renter' ? (
                        <>
                          <Home className="w-4 h-4 mr-2" />
                          Signing in as Renter
                        </>
                      ) : (
                        <>
                          <Building className="w-4 h-4 mr-2" />
                          Signing in as Landlord
                        </>
                      )}
                      <button
                        onClick={() => navigate("/select-user-type")}
                        className="ml-3 text-orange-600 hover:text-orange-800 underline"
                      >
                        Change
                      </button>
                    </Motion.div>
                  )}

                  <Motion.h1
                    className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight"
                    variants={itemVariants}
                  >
                    Welcome back
                  </Motion.h1>
                  <Motion.p
                    className="text-neutral-600 mt-3 text-lg"
                    variants={itemVariants}
                  >
                    Sign in to continue to your account
                  </Motion.p>
                </div>

                {/* Login method toggle */}
                <Motion.div
                  className="flex border border-gray-200 rounded-xl p-1 mb-6 relative"
                  variants={itemVariants}
                >
                  {/* Animated sliding background */}
                  <Motion.div
                    className="absolute top-1 bottom-1 rounded-lg bg-orange-100 z-0"
                    initial={false}
                    animate={{
                      x: loginMethod === "email" ? 0 : "100%",
                      width: "50%",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />

                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center z-10 transition-colors duration-200 ${
                      loginMethod === "email"
                        ? "text-orange-700"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setLoginMethod("email")}
                  >
                    <Mail
                      className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                        loginMethod === "email" ? "scale-110" : ""
                      }`}
                    />
                    Email
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center z-10 transition-colors duration-200 ${
                      loginMethod === "phone"
                        ? "text-orange-700"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setLoginMethod("phone")}
                  >
                    <Smartphone
                      className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                        loginMethod === "phone" ? "scale-110" : ""
                      }`}
                    />
                    Phone
                  </button>
                </Motion.div>

                {/* Form */}
                <Motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6 flex-1"
                  variants={itemVariants}
                >
                  {/* Email or Phone based on login method */}
                  <AnimatePresence mode="wait">
                    {loginMethod === "email" ? (
                      <Motion.div
                        key="email-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-neutral-700"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-neutral-400" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className={`block w-full pl-10 pr-3 py-4 border ${
                              errors.email
                                ? "border-red-500"
                                : "border-neutral-300"
                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.email}
                          </p>
                        )}
                      </Motion.div>
                    ) : (
                      <Motion.div
                        key="phone-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-neutral-700"
                        >
                          Phone Number
                        </label>
                        <div
                          className={
                            errors.phone
                              ? "border border-red-500 rounded-xl"
                              : ""
                          }
                        >
                          <PhoneInput />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.phone}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-neutral-500">
                          Only Ghana numbers are supported
                        </p>
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className={`block w-full pl-10 pr-10 py-4 border ${
                          errors.password
                            ? "border-red-500"
                            : "border-neutral-300"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password */}
                  <div className="flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-orange-600 hover:text-orange-500"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Auth Error Display */}
                  {authError && (
                    <Motion.div
                      className="p-4 bg-red-50 border border-red-200 rounded-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-red-600 text-center">
                        {authError}
                      </p>
                    </Motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Motion.button
                      type="submit"
                      className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white font-medium focus:outline-none"
                      style={{ backgroundColor: Colors.accent.orange }}
                      whileHover={{
                        scale: 1.01,
                        boxShadow: "0 8px 20px rgba(255, 144, 45, 0.25)",
                      }}
                      whileTap={{ scale: 0.98 }}
                                              disabled={isLoading}
                    >
                                              {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Motion.button>
                  </div>
                </Motion.form>

                {/* OAuth Logins */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-neutral-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* <div className="mt-6 grid grid-cols-2 gap-3">
                    <Motion.button
                      type="button"
                      className="py-3 px-4 border border-neutral-200 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                      >
                        <path
                          fill="#EA4335"
                          d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                        />
                        <path
                          fill="#4A90E2"
                          d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-neutral-700 ml-2">
                        Google
                      </span>
                    </Motion.button>

                    <Motion.button
                      type="button"
                      className="py-3 px-4 border border-neutral-200 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                      >
                        <path
                          fill="#1877F2"
                          d="M24,12.073c0,-6.627 -5.373,-12 -12,-12c-6.627,0 -12,5.373 -12,12c0,5.991 4.388,10.954 10.125,11.854l0,-8.385l-3.047,0l0,-3.469l3.047,0l0,-2.643c0,-3.006 1.792,-4.669 4.533,-4.669c1.312,0 2.686,0.235 2.686,0.235l0,2.953l-1.514,0c-1.491,0 -1.956,0.925 -1.956,1.874l0,2.25l3.328,0l-0.532,3.469l-2.796,0l0,8.385c5.737,-0.9 10.125,-5.863 10.125,-11.854Z"
                        />
                        <path
                          fill="#FFFFFF"
                          d="M16.672,15.542l0.532,-3.469l-3.328,0l0,-2.25c0,-0.949 0.465,-1.874 1.956,-1.874l1.514,0l0,-2.953c0,0 -1.374,-0.235 -2.686,-0.235c-2.741,0 -4.533,1.663 -4.533,4.669l0,2.643l-3.047,0l0,3.469l3.047,0l0,8.385c0.611,0.096 1.237,0.146 1.875,0.146c0.638,0 1.264,-0.05 1.875,-0.146l0,-8.385l2.796,0Z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-neutral-700 ml-2">
                        Facebook
                      </span>
                    </Motion.button>
                  </div> */}
                </div>

                {/* Form Switch */}
                <Motion.div
                  className="mt-10 text-center"
                  variants={itemVariants}
                >
                  <p className="text-sm text-neutral-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-orange-600 hover:text-orange-500"
                    >
                      Create an account
                    </Link>
                  </p>
                </Motion.div>
              </div>
            </div>

            {/* Right side - Image and content */}
            <div className="hidden lg:block relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/55 to-black/50"></div>
              </div>

              <div className="relative flex flex-col justify-between h-full z-10 p-12 text-white">
                <div>
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl inline-flex items-center mb-6">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">
                      Trusted by over 50,000 customers
                    </span>
                  </div>

                  <Motion.h2
                    className="text-4xl font-bold mb-6 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Find your perfect home in Ghana with Quick Rent
                  </Motion.h2>

                  <Motion.p
                    className="text-white/80 text-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Browse thousands of verified properties, schedule viewings,
                    and secure your ideal living space - all in one place.
                  </Motion.p>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <Motion.div
                      className="bg-white/10 backdrop-blur-sm p-5 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <div className="text-2xl font-bold mb-1">5,000+</div>
                      <div className="text-white/70 text-sm">Properties</div>
                    </Motion.div>

                    <Motion.div
                      className="bg-white/10 backdrop-blur-sm p-5 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <div className="text-2xl font-bold mb-1">2,000+</div>
                      <div className="text-white/70 text-sm">Landlords</div>
                    </Motion.div>

                    <Motion.div
                      className="bg-white/10 backdrop-blur-sm p-5 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="text-2xl font-bold mb-1">24/7</div>
                      <div className="text-white/70 text-sm">Support</div>
                    </Motion.div>
                  </div>

                  <Motion.div
                    className="border-t border-white/20 pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <p className="italic text-white/70 mb-4">
                      "I found my dream apartment in just 3 days! The
                      verification process gave me peace of mind that I was
                      dealing with genuine listings."
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img
                          src="https://randomuser.me/api/portraits/women/32.jpg"
                          alt="Testimonial"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Abena Mensah</p>
                        <div className="flex items-center">
                          <p className="text-xs text-white/70 mr-2">
                            Found home in East Legon
                          </p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="w-3 h-3 text-yellow-300 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;
