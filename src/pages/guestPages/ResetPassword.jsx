import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import Images from "../../utils/Images";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      setSuccess(true);
      
      // Redirect to login after showing success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 1500);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-gray-50">
        <Motion.div 
          className="max-w-lg w-full mx-auto"
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

          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-neutral-100 p-8">
            <div className="text-center">
              <img 
                src={Images.logo} 
                alt="Quick Rent" 
                className="w-32 inline-block mb-8" 
              />
              
              {success ? (
                <Motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900 mb-2">Password Reset Successful</h1>
                  <p className="text-neutral-600 mb-6">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <p className="text-sm text-neutral-500">Redirecting you to login page...</p>
                </Motion.div>
              ) : (
                <>
                  <Motion.h1 
                    className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight"
                    variants={itemVariants}
                  >
                    Reset Your Password
                  </Motion.h1>
                  <Motion.p 
                    className="text-neutral-600 mt-3 mb-8"
                    variants={itemVariants}
                  >
                    Create a new secure password for your account
                  </Motion.p>

                  <Motion.form 
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    variants={itemVariants}
                  >
                    {/* Password */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-700 text-left">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          className={`block w-full pl-10 pr-10 py-4 border ${errors.password ? 'border-red-500' : 'border-neutral-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm`}
                          placeholder="Create a new password"
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
                        <p className="mt-1 text-sm text-red-500 text-left">{errors.password}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-500 text-left">
                        Must be at least 8 characters with a mix of letters, numbers, and symbols
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 text-left">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          className={`block w-full pl-10 pr-10 py-4 border ${errors.confirmPassword ? 'border-red-500' : 'border-neutral-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm`}
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
                            <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-500" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500 text-left">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Motion.button
                        type="submit"
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white font-medium focus:outline-none"
                        style={{ backgroundColor: Colors.accent.orange }}
                        whileHover={{ scale: 1.01, boxShadow: "0 8px 20px rgba(255, 144, 45, 0.25)" }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            Reset Password
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Motion.button>
                    </div>
                  </Motion.form>

                  <Motion.div 
                    className="mt-8 text-center"
                    variants={itemVariants}
                  >
                    <p className="text-sm text-neutral-600">
                      Remember your password?{" "}
                      <Link
                        to="/login"
                        className="font-medium text-orange-600 hover:text-orange-500"
                      >
                        Back to login
                      </Link>
                    </p>
                  </Motion.div>
                </>
              )}
            </div>
          </div>
        </Motion.div>
      </div>
    </>
  );
};

export default ResetPassword; 