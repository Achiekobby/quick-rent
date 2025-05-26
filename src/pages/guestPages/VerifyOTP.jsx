import { useState, useRef, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import Images from "../../utils/Images";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);

  const { contactMethod, contact } = location.state || {
    contactMethod: "email",
    contact:
      contactMethod === "email" ? "user@example.com" : "+233 XX XXX XXXX",
  };

  // OTP inputs
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user types
    if (error) {
      setError("");
    }

    // Auto-focus next input if current input is filled
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted data is a 4-digit number
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);

      // Focus the last input
      inputRefs[3].current.focus();
    }
  };

  const handleResendOtp = () => {
    setResendDisabled(true);
    setCountdown(30);
    setTimeout(() => {
      // In a real app, you would handle the resend OTP logic here
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if OTP is complete
    if (otp.some((digit) => digit === "")) {
      setError("Please enter the complete verification code");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      // For demo: Show success for "1234", error for anything else
      if (otp.join("") === "1234") {
        setSuccess(true);

        // Redirect after showing success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    }, 1500);
  };

  return (
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
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  Verification Successful
                </h1>
                <p className="text-neutral-600 mb-6">
                  Your account has been verified successfully.
                </p>
                <p className="text-sm text-neutral-500">
                  Redirecting you to the dashboard...
                </p>
              </Motion.div>
            ) : (
              <>
                <Motion.h1
                  className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight"
                  variants={itemVariants}
                >
                  Verify Your Account
                </Motion.h1>
                <Motion.p
                  className="text-neutral-600 mt-3 mb-8"
                  variants={itemVariants}
                >
                  We've sent a 4-digit code to{" "}
                  {contactMethod === "email" ? "your email" : "your phone"}
                  <br />
                  <span className="font-medium">{contact}</span>
                </Motion.p>

                <Motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  variants={itemVariants}
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 text-left">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-between gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={inputRefs[index]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                        />
                      ))}
                    </div>
                    {error && (
                      <div className="flex items-center mt-3 text-red-500 text-sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        {error}
                      </div>
                    )}
                  </div>

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
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Verify Account"
                      )}
                    </Motion.button>
                  </div>
                </Motion.form>

                <Motion.div
                  className="mt-8 text-center"
                  variants={itemVariants}
                >
                  <p className="text-sm text-neutral-600">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      className={`font-medium ${
                        resendDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-orange-600 hover:text-orange-500"
                      }`}
                      onClick={handleResendOtp}
                      disabled={resendDisabled}
                    >
                      {resendDisabled ? (
                        `Resend in ${countdown}s`
                      ) : (
                        <span className="flex items-center justify-center">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Resend Code
                        </span>
                      )}
                    </button>
                  </p>
                </Motion.div>
              </>
            )}
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default VerifyOTP;
