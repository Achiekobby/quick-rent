import React, { useState, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router";
import useAuthStore from "../../stores/authStore";
import {
  verifyAccount,
  resendVerificationOTP,
} from "../../api/Renter/Authentication/VerifyAccount";
import {
  verifyLandlordAccount,
  resendLandlordVerificationOTP,
} from "../../api/Landlord/Authentication/VerifyAccount";
import {
  Shield,
  Mail,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Clock,
  AlertCircle,
  Home,
  LogOut,
  Building,
  User,
  Sparkles,
  Award,
  Crown,
  Phone,
} from "lucide-react";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeVerification, getRedirectPath, user, logout, getUserType } =
    useAuthStore();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);
  const email = location.state?.email || user?.email || "";
  const userType = location.state?.userType || getUserType() || "renter";
  const message = location.state?.message || `Please verify your ${userType} account`;
  
  // For landlords, we might need to use phone number if email is not available
  const contactInfo = userType === "landlord" 
    ? (email || user?.phone_number || "")
    : email;

  const getStoredTimer = () => {
    if (!user?.user_slug) return 600;

    try {
      const stored = localStorage.getItem(
        `verification_timer_${user.user_slug}`
      );
      if (stored) {
        const { timeLeft: storedTimeLeft, timestamp } = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const remaining = Math.max(0, storedTimeLeft - elapsed);
        return remaining;
      }
    } catch (error) {
      console.warn("Error reading stored timer:", error);
      localStorage.removeItem(`verification_timer_${user.user_slug}`);
    }
    return 600;
  };

  const getStoredResendCooldown = () => {
    if (!user?.user_slug) return 0;

    try {
      const stored = localStorage.getItem(`resend_cooldown_${user.user_slug}`);
      if (stored) {
        const { cooldown, timestamp } = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const remaining = Math.max(0, cooldown - elapsed);
        return remaining;
      }
    } catch (error) {
      console.warn("Error reading stored cooldown:", error);
      localStorage.removeItem(`resend_cooldown_${user.user_slug}`);
    }
    return 0;
  };

  const [timeLeft, setTimeLeft] = useState(getStoredTimer);
  const [resendCooldown, setResendCooldown] = useState(getStoredResendCooldown);

  useEffect(() => {
    if (timeLeft > 0) {
      if (user?.user_slug) {
        try {
          localStorage.setItem(
            `verification_timer_${user.user_slug}`,
            JSON.stringify({
              timeLeft,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.warn("Error storing timer:", error);
        }
      }

      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (user?.user_slug) {
        try {
          localStorage.removeItem(`verification_timer_${user.user_slug}`);
        } catch (error) {
          console.warn("Error clearing timer:", error);
        }
      }
    }
  }, [timeLeft, user?.user_slug]);

  useEffect(() => {
    if (resendCooldown > 0) {
      if (user?.user_slug) {
        try {
          localStorage.setItem(
            `resend_cooldown_${user.user_slug}`,
            JSON.stringify({
              cooldown: resendCooldown,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.warn("Error storing cooldown:", error);
        }
      }

      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else {
      if (user?.user_slug) {
        try {
          localStorage.removeItem(`resend_cooldown_${user.user_slug}`);
        } catch (error) {
          console.warn("Error clearing cooldown:", error);
        }
      }
    }
  }, [resendCooldown, user?.user_slug]);

  useEffect(() => {
    return () => {};
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    setResendSuccess(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    setIsVerifying(true);
    setError("");
    setResendSuccess(false);

    try {
      // Use appropriate verification API based on user type
      const result = userType === "landlord" 
        ? await verifyLandlordAccount(otpCode, user?.landlord_slug || user?.user_slug)
        : await verifyAccount(otpCode, user?.user_slug);

      if (result.success) {
        // Store token with appropriate key
        const tokenKey = userType === "landlord" ? "quick_landlord_token" : "quick_renter_token";
        if (result.token) {
          localStorage.setItem(tokenKey, result.token);
        }
        localStorage.setItem("access_token", result.token);
        completeVerification(result.userData);

        //* Clear timer data on successful verification
        if (user?.user_slug) {
          try {
            localStorage.removeItem(`verification_timer_${user.user_slug}`);
            localStorage.removeItem(`resend_cooldown_${user.user_slug}`);
          } catch (error) {
            console.warn("Error clearing timer data:", error);
          }
        }
        setSuccess(true);
        setTimeout(() => {
          navigate(getRedirectPath());
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      // Use appropriate resend API based on user type
      const result = userType === "landlord"
        ? await resendLandlordVerificationOTP(contactInfo)
        : await resendVerificationOTP(email);

      if (result.success) {
        setResendCooldown(60);
        setTimeLeft(600);

        //* Clear old timer data and set new ones
        if (user?.user_slug) {
          try {
            localStorage.removeItem(`verification_timer_${user.user_slug}`);
            localStorage.removeItem(`resend_cooldown_${user.user_slug}`);
          } catch (error) {
            console.warn("Error clearing timer data:", error);
          }
        }
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        setResendSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setResendSuccess(false);
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    if (user?.user_slug) {
      try {
        localStorage.removeItem(`verification_timer_${user.user_slug}`);
        localStorage.removeItem(`resend_cooldown_${user.user_slug}`);
      } catch (error) {
        console.warn("Error clearing timer data:", error);
      }
    }
    logout();
    navigate("/login");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen relative ${
      userType === "landlord" 
        ? "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50"
        : "bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"
    }`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {userType === "landlord" ? (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/15 to-amber-300/15 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-300/15 to-yellow-300/15 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute top-1/3 left-1/3 w-60 h-60 bg-gradient-to-br from-yellow-300/10 to-orange-300/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "4s" }}
            />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300/10 to-blue-300/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </>
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3 ${
                userType === "landlord" 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500" 
                  : "bg-orange-500"
              }`}>
                {userType === "landlord" ? 
                  <Building className="w-4 h-4 sm:w-6 sm:h-6 text-white" /> :
                  <Home className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                }
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Quick<span className={userType === "landlord" ? "text-amber-500" : "text-orange-500"}>Rent</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 hidden sm:block">
                  {userType === "landlord" ? "Landlord" : "Renter"} Account Verification
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Motion.button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200 shadow-sm"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Motion.button>

              <Motion.button
                onClick={handleLogout}
                className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-white rounded-xl border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Motion.div
        className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl flex items-center justify-center shadow-xl relative ${
                userType === "landlord" 
                  ? "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500" 
                  : "bg-orange-500"
              }`}>
                {userType === "landlord" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </Motion.div>

            <Motion.h1
              className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2 sm:mb-3"
              variants={itemVariants}
            >
              Verify Your <span className={userType === "landlord" ? "text-amber-500" : "text-orange-500"}>
                {userType === "landlord" ? "Landlord " : ""}Account
              </span>
            </Motion.h1>

            <Motion.p
              className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4 px-4"
              variants={itemVariants}
            >
              {message}
            </Motion.p>

            <Motion.div
              className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-neutral-500 mb-4"
              variants={itemVariants}
            >
              {userType === "landlord" && contactInfo?.startsWith("233") ? (
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span>
                Code sent to {userType === "landlord" ? contactInfo : email}
              </span>
            </Motion.div>

            {/* User Type Badge */}
            <Motion.div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                userType === "landlord"
                  ? "bg-gradient-to-r from-orange-100 to-amber-100 text-amber-700 border border-amber-200"
                  : "bg-orange-100 text-orange-700 border border-orange-200"
              }`}
              variants={itemVariants}
            >
              {userType === "landlord" ? (
                <>
                  <Building className="w-3 h-3 mr-1.5" />
                  <span>Property Owner</span>
                  <Sparkles className="w-3 h-3 ml-1.5" />
                </>
              ) : (
                <>
                  <User className="w-3 h-3 mr-1.5" />
                  <span>Renter</span>
                </>
              )}
            </Motion.div>
          </div>

          {/* Verification Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
            <Motion.div variants={itemVariants}>
              {/* Timer */}
              <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium text-neutral-600">
                  Code expires in {formatTime(timeLeft)}
                </span>
              </div>

              {/* OTP Input - 4 digits */}
              <div className="flex justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-neutral-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Success Message */}
              {success && (
                <Motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`flex flex-col items-center justify-center space-y-3 mb-4 sm:mb-6 p-4 rounded-xl border-2 ${
                    userType === "landlord"
                      ? "bg-gradient-to-r from-green-50 to-amber-50 border-green-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </Motion.div>
                    {userType === "landlord" && (
                      <Motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
                      >
                        <Crown className="w-5 h-5 text-amber-500" />
                      </Motion.div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm sm:text-base font-semibold text-green-700 block">
                      {userType === "landlord" 
                        ? "🎉 Landlord Account Verified Successfully!" 
                        : "Account verified successfully!"
                      }
                    </span>
                    <span className="text-xs sm:text-sm text-green-600 mt-1 block">
                      {userType === "landlord" 
                        ? "Welcome to your property management dashboard..." 
                        : "Redirecting to your dashboard..."
                      }
                    </span>
                  </div>

                  {userType === "landlord" && (
                    <Motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200"
                    >
                      <Building className="w-3 h-3" />
                      <span>Premium Property Owner Access Granted</span>
                      <Sparkles className="w-3 h-3" />
                    </Motion.div>
                  )}
                </Motion.div>
              )}

              {/* Resend Success Message */}
              {resendSuccess && !success && (
                <Motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`flex items-center justify-center space-x-2 mb-4 sm:mb-6 p-3 rounded-xl border ${
                    userType === "landlord"
                      ? "bg-gradient-to-r from-blue-50 to-amber-50 border-blue-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <Motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </Motion.div>
                  <span className="text-xs sm:text-sm text-blue-700">
                    {userType === "landlord" 
                      ? (contactInfo?.startsWith("233") 
                          ? "New verification code sent to your phone! Check your SMS." 
                          : "New verification code sent to your business email! Check your inbox.")
                      : "Verification code sent successfully! Check your email."
                    }
                  </span>
                  {userType === "landlord" && (
                    <Building className="w-3 h-3 text-amber-500" />
                  )}
                </Motion.div>
              )}

              {/* Error Message */}
              {error && !success && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center space-x-2 mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-red-700">
                    {error}
                  </span>
                </Motion.div>
              )}

              {/* Verify Button */}
              <Motion.button
                onClick={handleVerify}
                disabled={isVerifying || success || otp.join("").length !== 4}
                className={`w-full py-3 sm:py-4 px-6 ${
                  success 
                    ? "bg-green-500" 
                    : userType === "landlord"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    : "bg-orange-500 hover:bg-orange-600"
                } disabled:bg-neutral-300 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed mb-3 sm:mb-4 shadow-lg ${
                  userType === "landlord" && !success && !isVerifying ? "shadow-amber-500/25" : ""
                }`}
                whileHover={{ scale: isVerifying || success ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {success ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">
                      {userType === "landlord" ? "Landlord Account Verified!" : "Verified!"}
                    </span>
                  </div>
                ) : isVerifying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-sm sm:text-base">Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    {userType === "landlord" ? (
                      <>
                        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Verify Landlord Account</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Verify Account</span>
                      </>
                    )}
                  </div>
                )}
              </Motion.button>

              {/* Resend Code */}
              <div className="text-center">
                <span className="text-xs sm:text-sm text-neutral-600">
                  Didn't receive the code?{" "}
                </span>
                <button
                  onClick={handleResendOtp}
                  disabled={isResending || resendCooldown > 0}
                  className="text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? (
                    <span className="inline-flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Resending...</span>
                    </span>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </div>

              {/* Logout Option */}
              <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
                <p className="text-xs sm:text-sm text-neutral-500 mb-2">
                  Don't want to verify now?
                </p>
                <Motion.button
                  onClick={handleLogout}
                  className="inline-flex items-center cursor-pointer space-x-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Logout and return to login</span>
                </Motion.button>
              </div>
            </Motion.div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default VerifyAccount;
