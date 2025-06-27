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
  Shield,
  Settings,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Images from "../../utils/Images";
import Colors from "../../utils/Colors";
import useAuthStore from "../../stores/authStore";
import { loginAdmin } from "../../api/Admin/Authentication/Login";

const AdminLogin = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    password: "",
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
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

    setIsSubmitting(true);
    startLogin();

    try {
      const loginData = {
        emailOrPhone: formData.email,
        password: formData.password,
      };

      console.log('🔐 Attempting admin login with:', {
        email: formData.email,
        timestamp: new Date().toISOString()
      });

      const response = await loginAdmin(loginData);

      if (response.success) {
        console.log('🎉 Admin login successful:', {
          adminId: response.user?.id,
          email: response.user?.email,
          fullName: response.user?.full_name,
          userType: response.user?.user_type,
          adminSlug: response.user?.admin_slug,
          timestamp: new Date().toISOString()
        });

        finishLogin(response);
        
        // Navigate to admin dashboard
        navigate("/admin-dashboard", { replace: true });
      } else {
        console.error('❌ Admin login failed:', response.error);
        loginError(response.error || "Admin login failed. Please try again.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      loginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const adminFeatures = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "User Management",
      description: "Manage platform users and accounts"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Analytics & Reports",
      description: "Monitor platform performance and metrics"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "System Settings",
      description: "Configure platform settings and preferences"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Panel - Branding & Features */}
      <Motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <Motion.div
            className="mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">QuickRent</h1>
                <p className="text-blue-200 text-sm">Admin Portal</p>
              </div>
            </div>
          </Motion.div>

          {/* Welcome Message */}
          <Motion.div
            className="mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Welcome to the
              <br />
              <span className="text-blue-200">Admin Dashboard</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Manage your platform with powerful administrative tools and comprehensive analytics.
            </p>
          </Motion.div>

          {/* Features */}
          <Motion.div
            className="space-y-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {adminFeatures.map((feature, index) => (
              <Motion.div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-blue-200 text-sm">{feature.description}</p>
                </div>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </Motion.div>

      {/* Right Panel - Login Form */}
      <Motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Motion.div
            className="lg:hidden text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-800">QuickRent</h1>
                <p className="text-blue-600 text-sm">Admin Portal</p>
              </div>
            </div>
          </Motion.div>

          {/* Back Button */}
          <Motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button
              onClick={() => navigate("/select-user-type")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to user selection</span>
            </button>
          </Motion.div>

          {/* Form Header */}
          <Motion.div
            className="text-center mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Motion.h2
              className="text-3xl font-bold text-gray-800 mb-2"
              variants={itemVariants}
            >
              Admin Sign In
            </Motion.h2>
            <Motion.p
              className="text-gray-600"
              variants={itemVariants}
            >
              Access your administrative dashboard
            </Motion.p>
          </Motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {authError && (
              <Motion.div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{authError}</p>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <Motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Email Field */}
            <Motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Enter your admin email"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <Motion.p
                  className="mt-2 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </Motion.p>
              )}
            </Motion.div>

            {/* Password Field */}
            <Motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <Motion.p
                  className="mt-2 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </Motion.p>
              )}
            </Motion.div>

            {/* Submit Button */}
            <Motion.div variants={itemVariants}>
              <Motion.button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Motion.button>
            </Motion.div>
          </Motion.form>

          {/* Security Notice */}
          <Motion.div
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">Security Notice</h4>
                <p className="text-xs text-blue-700">
                  Admin access is restricted and monitored. All login attempts are logged for security purposes.
                </p>
              </div>
            </div>
          </Motion.div>

          {/* Footer */}
          <Motion.div
            className="mt-8 text-center text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p>© 2024 QuickRent. All rights reserved.</p>
            <p className="mt-1">Need help? Contact system administrator.</p>
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
};

export default AdminLogin; 