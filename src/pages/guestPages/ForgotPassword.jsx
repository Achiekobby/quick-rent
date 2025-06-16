import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import { forgotPasswordRequest } from "../../api/Renter/Authentication/ForgotPasswordRequest";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getRedirectPath } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [contactMethod, setContactMethod] = useState("email");

  const redirectMessage = location.state?.message;

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    phone: "233",
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

  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

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

    // Validate based on contact method
    if (contactMethod === "email") {
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
      const contactValue =
        contactMethod === "email" ? formData.email : formData.phone;

      // Make the API call
      const response = await forgotPasswordRequest(contactValue);

      if (response.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate("/reset-password", {
            state: {
              userSlug: response.data.data.user_slug,
              contactMethod,
              contact:
                contactMethod === "email"
                  ? formData.email
                  : `+${formData.phone}`,
              message: response.message,
            },
          });
        }, 2000);
      } else {
        // Handle API error
        if (contactMethod === "email") {
          setErrors({ email: response.message });
        } else {
          setErrors({ phone: response.message });
        }
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Forgot password error:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
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
                  <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Reset Code Sent
                  </h1>
                  <p className="text-neutral-600 mb-6">
                    We've sent a verification code to{" "}
                    {contactMethod === "email"
                      ? formData.email
                      : `+${formData.phone}`}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Redirecting you to reset password page...
                  </p>
                </Motion.div>
              ) : (
                <>
                  <Motion.h1
                    className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight"
                    variants={itemVariants}
                  >
                    Forgot Your Password?
                  </Motion.h1>
                  <Motion.p
                    className="text-neutral-600 mt-3 mb-8"
                    variants={itemVariants}
                  >
                    Enter your email or phone number and we'll send you a
                    verification code to reset your password
                  </Motion.p>

                  {/* Contact method toggle */}
                  <Motion.div
                    className="flex border border-gray-200 rounded-xl p-1 mb-6 relative"
                    variants={itemVariants}
                  >
                    {/* Animated sliding background */}
                    <Motion.div
                      className="absolute top-1 bottom-1 rounded-lg bg-orange-100 z-0"
                      initial={false}
                      animate={{
                        x: contactMethod === "email" ? 0 : "100%",
                        width: "50%",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />

                    <button
                      type="button"
                      className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center z-10 transition-colors duration-200 ${
                        contactMethod === "email"
                          ? "text-orange-700"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setContactMethod("email")}
                    >
                      <Mail
                        className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                          contactMethod === "email" ? "scale-110" : ""
                        }`}
                      />
                      Email
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center z-10 transition-colors duration-200 ${
                        contactMethod === "phone"
                          ? "text-orange-700"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setContactMethod("phone")}
                    >
                      <Smartphone
                        className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                          contactMethod === "phone" ? "scale-110" : ""
                        }`}
                      />
                      Phone
                    </button>
                  </Motion.div>

                  <Motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    variants={itemVariants}
                  >
                    {/* Redirect message */}
                    {redirectMessage && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-600 text-center">
                          {redirectMessage}
                        </p>
                      </div>
                    )}

                    {/* General error message */}
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-600 text-center">
                          {errors.general}
                        </p>
                      </div>
                    )}

                    {/* Email or Phone based on contact method */}
                    <AnimatePresence mode="wait">
                      {contactMethod === "email" ? (
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
                            className="block text-sm font-medium text-neutral-700 text-left"
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
                            <p className="mt-1 text-sm text-red-500 text-left">
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
                            className="block text-sm font-medium text-neutral-700 text-left"
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
                            <p className="mt-1 text-sm text-red-500 text-left">
                              {errors.phone}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-neutral-500 text-left">
                            Only Ghana numbers are supported
                          </p>
                        </Motion.div>
                      )}
                    </AnimatePresence>

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
                          <>
                            Send Reset Code
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

export default ForgotPassword;
