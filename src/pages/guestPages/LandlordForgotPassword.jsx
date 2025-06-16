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
  Shield,
  Building2,
} from "lucide-react";
import Colors from "../../utils/Colors";
import GuestLayout from "../../Layouts/GuestLayout";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";
import { landlordForgotPasswordRequest } from "../../api/Landlord/Authentication/ForgotPasswordRequest";

const LandlordForgotPassword = () => {
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
      const response = await landlordForgotPasswordRequest(contactValue);

      if (response.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate("/landlord-reset-password", {
            state: {
              landlordSlug: response.landlordData.landlord_slug,
              contactMethod,
              contact:
                contactMethod === "email"
                  ? formData.email
                  : `+${formData.phone}`,
              message: response.message,
              landlordData: response.landlordData,
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
      console.error("Landlord forgot password error:", error);
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
            const value = e.target.value.replace(/\D/g, "");
            handlePhoneChange("233" + value);
          }}
          maxLength="9"
        />
      </div>
    );
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
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Landlord Password Reset
            </h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Enter your email address or phone number to receive a verification code
            </p>
          </Motion.div>

          {/* Redirect Message */}
          <AnimatePresence>
            {redirectMessage && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <p className="text-blue-800 text-sm text-center">
                  {redirectMessage}
                </p>
              </Motion.div>
            )}
          </AnimatePresence>

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
                  Verification Code Sent!
                </h3>
                <p className="text-green-700 text-sm">
                  Redirecting you to the password reset page...
                </p>
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!success && (
            <Motion.div
              className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100"
              variants={itemVariants}
            >
              {/* Contact Method Toggle */}
              <div className="mb-6">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setContactMethod("email")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      contactMethod === "email"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod("phone")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      contactMethod === "phone"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    Phone
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                {contactMethod === "email" && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className={`w-full pl-10 pr-4 py-4 rounded-xl border ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm`}
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                )}

                {/* Phone Input */}
                {contactMethod === "phone" && (
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <PhoneInput />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                )}

                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{errors.general}</p>
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
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
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

export default LandlordForgotPassword; 