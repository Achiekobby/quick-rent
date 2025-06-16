import { useState, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2, ArrowRight, Shield } from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import { resetPasswordRequest } from "../../api/Renter/Authentication/ResetPasswordRequest";
import forgotPasswordRequest from "../../api/Renter/Authentication/ForgotPasswordRequest";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getRedirectPath } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendLoading, setResendLoading] = useState(false);
  
  // Get user slug from route state
  const userSlug = location.state?.userSlug;
  const contactInfo = location.state?.contact;
  
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

  // Redirect to forgot password if user slug is missing
  useEffect(() => {
    if (!userSlug) {
      navigate('/forgot-password', { 
        replace: true,
        state: { message: 'Please request a password reset first.' }
      });
    }
  }, [userSlug, navigate]);

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
      const response = await resetPasswordRequest(userSlug, otpString, formData.password);
      
      if (response.success) {
        setSuccess(true);
        
        //Todo => Redirect to renter login after showing success message
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Password reset successful! Please log in with your new password.",
              type: "success"
            } 
          });
        }, 2000);
      } else {
        //Todo => Handle API error
        if (response.message.toLowerCase().includes('otp') || response.message.toLowerCase().includes('code')) {
          setErrors({ otp: response.message });
        } else if (response.message.toLowerCase().includes('password')) {
          setErrors({ password: response.message });
        } else {
          setErrors({ general: response.message });
        }
      }
    } catch (error) {
      //Todo => Handle unexpected errors
      console.error("Reset password error:", error);
      setErrors({ 
        general: "An unexpected error occurred. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Todo => Handle Resend Otp using the forgot password api
  const handleResendOtp = async () => {
    setResendLoading(true);
    try{
      const response = await forgotPasswordRequest(contactInfo);
      if (response.success) {
        toast.success(response?.data?.reason || "OTP Sent Succesfully");
      }else{
        toast.error(response?.data?.reason || "Failed to send reset code");
      }
    }catch(error){
      toast.error(error?.response?.data?.reason || "Failed to send reset code");
    }finally{
      setResendLoading(false);
    }
   
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
          {/*//Todo => Back button */}
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
                  <Motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 relative"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                    <Motion.div
                      className="absolute inset-0 rounded-full bg-green-200"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  </Motion.div>
                  <Motion.h1 
                    className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    🎉 Success!
                  </Motion.h1>
                  <Motion.p 
                    className="text-neutral-600 mb-6 text-center leading-relaxed"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Your password has been reset successfully{contactInfo ? ` for ${contactInfo}` : ''}. 
                    <br />
                    <span className="font-medium text-green-600">You can now log in with your new secure password!</span>
                  </Motion.p>
                  <Motion.div
                    className="flex items-center space-x-2 text-sm text-neutral-500"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Redirecting you to the login page...</span>
                  </Motion.div>
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
                    {/* General error message */}
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-600 text-center">{errors.general}</p>
                      </div>
                    )}

                    {/* OTP Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700 text-left">
                        <Shield className="inline w-4 h-4 mr-2" />
                        Verification Code
                      </label>
                      <div className="flex justify-center space-x-3">
                        {formData.otp.map((digit, index) => (
                          <Motion.input
                            key={index}
                            ref={otpRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            className={`w-14 h-14 text-center text-xl font-bold border ${
                              errors.otp ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-200`}
                            whileFocus={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          />
                        ))}
                      </div>
                      {errors.otp && (
                        <p className="mt-1 text-sm text-red-500 text-center">{errors.otp}</p>
                      )}
                      <div className="text-center">
                        <p className="mt-1 text-xs text-neutral-500">
                          Enter the 4-digit code sent to {contactInfo}
                        </p>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="mt-2 text-xs text-orange-600 hover:text-orange-700 hover:underline transition-colors duration-200"
                        >
                          {resendLoading ? (
                            <div className="flex items-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Resending...
                            </div>
                          ) : (
                            "Didn't receive the code? Resend"
                          )}
                        </button>
                      </div>
                    </div>

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
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white font-medium focus:outline-none relative overflow-hidden"
                        style={{ backgroundColor: Colors.accent.orange }}
                        whileHover={{ 
                          scale: 1.01, 
                          boxShadow: "0 8px 20px rgba(255, 144, 45, 0.25)",
                          background: "linear-gradient(45deg, #ff902d, #ff6b1a)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        animate={
                          formData.otp.every(digit => digit !== '') && formData.password && formData.confirmPassword
                            ? {
                                boxShadow: [
                                  "0 4px 12px rgba(255, 144, 45, 0.15)",
                                  "0 8px 20px rgba(255, 144, 45, 0.25)",
                                  "0 4px 12px rgba(255, 144, 45, 0.15)"
                                ]
                              }
                            : {}
                        }
                        transition={{
                          boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Resetting Password...
                          </div>
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