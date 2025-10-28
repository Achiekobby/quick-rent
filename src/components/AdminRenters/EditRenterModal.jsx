import React, { useState, useEffect } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  XCircle,
  Save,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings,
  Info,
  Calendar,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import generalRentersRequests from "../../api/Admin/Rentors/GeneralRentorsRequests";

const EditRenterModal = ({
  showEditModal,
  setShowEditModal,
  selectedRenter,
  onRenterUpdate,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    is_active: true,
    is_verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("personal");

  // Initialize form data when modal opens
  useEffect(() => {
    if (selectedRenter && showEditModal) {
      setFormData({
        full_name: selectedRenter.full_name || "",
        email: selectedRenter.email || "",
        phone_number: selectedRenter.phone_number || "",
        is_active: selectedRenter.is_active || false,
        is_verified: selectedRenter.is_verified || false,
      });
      setErrors({});
    }
  }, [selectedRenter, showEditModal]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number (7-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const response = await generalRentersRequests.updateRenterDetails({
        ...formData,
        user_slug: selectedRenter.user_slug,
      });

      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Renter details updated successfully");
        
        if (onRenterUpdate) {
          onRenterUpdate(selectedRenter.user_slug, formData);
        }
        
        setShowEditModal(false);
      } else {
        toast.error(response?.data?.reason || "Failed to update renter details");
      }
    } catch (error) {
      console.error("Error updating renter:", error);
      toast.error("Failed to update renter details");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "account", label: "Account Settings", icon: Settings },
  ];

  return (
    <AnimatePresence>
      {showEditModal && selectedRenter && (
        <Motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowEditModal(false)}
        >
          <Motion.div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                      <Settings size={24} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Edit Renter Details
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Update information for {selectedRenter.full_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-white/80 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              <AnimatePresence mode="wait">
                {activeTab === "personal" && (
                  <Motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Personal Information Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User size={18} className="text-blue-600" />
                        </div>
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User size={14} />
                            Full Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.full_name}
                              onChange={(e) => handleInputChange("full_name", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                                errors.full_name
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                              placeholder="Enter full name"
                            />
                            {errors.full_name && (
                              <Motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 text-xs text-red-600 flex items-center gap-1"
                              >
                                <AlertCircle size={12} />
                                {errors.full_name}
                              </Motion.div>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Mail size={14} />
                            Email Address *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                                errors.email
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                              placeholder="Enter email address"
                            />
                            {errors.email && (
                              <Motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 text-xs text-red-600 flex items-center gap-1"
                              >
                                <AlertCircle size={12} />
                                {errors.email}
                              </Motion.div>
                            )}
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Phone size={14} />
                            Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={formData.phone_number}
                              onChange={(e) => handleInputChange("phone_number", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                                errors.phone_number
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                              placeholder="Enter phone number"
                            />
                            {errors.phone_number && (
                              <Motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 text-xs text-red-600 flex items-center gap-1"
                              >
                                <AlertCircle size={12} />
                                {errors.phone_number}
                              </Motion.div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </Motion.div>
                )}

                {activeTab === "account" && (
                  <Motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Account Settings Section */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Settings size={18} className="text-purple-600" />
                        </div>
                        Account Settings
                      </h3>

                      <div className="space-y-6">
                        {/* Account Status */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap size={16} className="text-purple-600" />
                            Account Status
                          </h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Account Active</p>
                              <p className="text-xs text-gray-500">Enable or disable this account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>

                        {/* Verification Status */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-green-600" />
                            Verification Status
                          </h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Account Verified</p>
                              <p className="text-xs text-gray-500">Mark this account as verified</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.is_verified}
                                onChange={(e) => handleInputChange("is_verified", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>

                        {/* Current Status Display */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Info size={16} className="text-gray-600" />
                            Current Status Preview
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                                formData.is_active
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {formData.is_active ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {formData.is_active ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                                formData.is_verified
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}
                            >
                              <Shield size={14} />
                              {formData.is_verified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <Motion.button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </Motion.button>
              </div>
            </form>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditRenterModal;
