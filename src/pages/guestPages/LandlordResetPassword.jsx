import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Building2,
  Timer,
  RotateCcw
} from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import { landlordResetPasswordRequest } from "../../api/Landlord/Authentication/ResetPasswordRequest";
import { resendLandlordVerificationOTP } from "../../api/Landlord/Authentication/VerifyAccount";

const LandlordResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getRedirectPath } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendLoading, setResendLoading] = useState(false);
  
  // Get landlord data from route state
  const landlordSlug = location.state?.landlordSlug;
  const contactInfo = location.state?.contact;
  const contactMethod = location.state?.contactMethod;
  const landlordData = location.state?.landlordData;
  
  // Form data
  const [formData, setFormData] = useState({
    otp: ["", "", "", ""],
    password: "",
    confirmPassword: "",
  });

  // Refs for OTP inputs
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

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

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

  // Redirect to forgot password if landlord slug is missing
  useEffect(() => {
    if (!landlordSlug) {
      navigate('/landlord-forgot-password', { 
        replace: true,
        state: { message: 'Please request a password reset first.' }
      });
    }
  }, [landlordSlug, navigate]);

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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));
    
    // Clear OTP error when user types
    if (errors.otp) {
      setErrors(prev => ({
        ...prev,
        otp: null
      }));
    }
    
    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = ['', '', '', ''];
    
    for (let i = 0; i < pastedText.length; i++) {
      newOtp[i] = pastedText[i];
    }
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedText.length, 3);
    otpRefs[nextIndex].current?.focus();
  };

  const validateForm = () => {
    const newErrors = {};
    
    // OTP validation
    const otpString = formData.otp.join('');
    if (!otpString || otpString.length !== 4) {
      newErrors.otp = "Please enter the complete 4-digit verification code";
    } else if (!/^\d{4}$/.test(otpString)) {
      newErrors.otp = "Verification code must contain only numbers";
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const otpString = formData.otp.join('');
      
      // Make the API call
      const response = await landlordResetPasswordRequest(formData.password, landlordSlug, otpString);
      
      if (response.success) {
        setSuccess(true);
        
        // Redirect to landlord login after showing success message
        setTimeout(() => {
          navigate("/landlord-login", { 
            state: { 
              message: "Password reset successful! Please login with your new password.",
              type: "success"
            }
          });
        }, 2500);
      } else {
        // Handle API errors
        if (response.statusCode === "999") {
          setErrors({
            otp: "Verification code has expired. Please request a new one."
          });
        } else if (response.statusCode === "004") {
          setErrors({
            general: "User account cannot be found. Please try again."
          });
        } else {
          setErrors({
            general: response.message || "Failed to reset password. Please try again."
          });
        }
      }
    } catch (error) {
      console.error("Landlord reset password error:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!contactInfo || !contactMethod) {
      setErrors({
        general: "Unable to resend code. Please start over."
      });
      return;
    }

    setResendLoading(true);
    
    try {
      // Extract the contact value without the + prefix for phone numbers
      const contactValue = contactMethod === "phone" ? 
        contactInfo.replace('+', '') : contactInfo;
      
      const response = await resendLandlordVerificationOTP(contactValue);
      
      if (response.success) {
        // Clear existing errors and show success message
        setErrors({});
        // You could add a toast notification here
        console.log("New verification code sent successfully");
      } else {
        setErrors({
          general: response.error || "Failed to resend verification code"
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrors({
        general: "Failed to resend verification code. Please try again."
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <GuestLayout>
      <Motion.div
        className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="max-w-md w-full space-y-8">
          {/* Header Section */}
          <Motion.div
            className="text-center"
            variants={itemVariants}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Enter the verification code sent to{" "}
              <span className="font-semibold text-orange-600">
                {contactInfo}
              </span>{" "}
              and create your new password
            </p>
          </Motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-green-700 text-sm">
                  Redirecting you to the login page...
                </p>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Landlord Info Display */}
          {!success && landlordData && (
            <Motion.div
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  {landlordData.business_logo ? (
                    <img 
                      src={landlordData.business_logo} 
                      alt="Business Logo"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{landlordData.full_name}</h3>
                  <p className="text-sm text-gray-600">{landlordData.business_name}</p>
                </div>
              </div>
            </Motion.div>
          )}

          {/* Form */}
          {!success && (
            <Motion.div
              className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100"
              variants={itemVariants}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Verification Code
                  </label>
                  <div className="flex gap-3 justify-center">
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        className={`w-14 h-14 text-center text-xl font-semibold rounded-xl border ${
                          errors.otp ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm`}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
                  )}
                  
                  {/* Resend OTP Button */}
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Resend Code
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      className={`w-full pl-10 pr-12 py-4 rounded-xl border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm`}
                      placeholder="Enter your new password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      className={`w-full pl-10 pr-12 py-4 rounded-xl border ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm`}
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 bottom-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm text-center">{errors.general}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </Motion.div>
          )}

          {/* Back to Login Link */}
          <Motion.div
            className="text-center"
            variants={itemVariants}
          >
            <Link
              to="/landlord-login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Landlord Login
            </Link>
          </Motion.div>
        </div>
      </Motion.div>
    </GuestLayout>
  );
};

export default LandlordResetPassword; 