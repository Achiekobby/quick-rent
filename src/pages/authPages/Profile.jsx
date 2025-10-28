import { useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Smartphone,
  Heart,
  Home,
  Building,
  Star,
  Award,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Check,
  Info,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import useAuthStore from "../../stores/authStore";
import Colors from "../../utils/Colors";
import { updateProfile } from "../../api/Renter/General/ProfileRequest";
import {
  updateLandlordProfile,
  changeLandlordPassword,
} from "../../api/Landlord/General/ProfileRequest";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateUser, getUserType } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageBase64, setProfileImageBase64] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  console.log("user", user);

  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    gender: user?.gender || "",
    business_name: user?.business_name || "",
    business_type: user?.business_type || "",
    location: user?.location || "",
    region: user?.region || "",
    business_registration_number: user?.business_registration_number || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });
  const userType = getUserType();

  const validatePassword = (
    password,
    confirmPassword = passwordForm.confirmPassword
  ) => {
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      passwordsMatch: password === confirmPassword && password.length > 0,
    };
    setPasswordValidation(validation);
    return validation;
  };

  const getPasswordStrength = () => {
    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar } =
      passwordValidation;
    const criteriaCount = [
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (criteriaCount === 0)
      return { strength: 0, label: "No password", color: "#E5E7EB" };
    if (criteriaCount <= 2)
      return { strength: 25, label: "Weak", color: "#EF4444" };
    if (criteriaCount <= 3)
      return { strength: 50, label: "Fair", color: "#F59E0B" };
    if (criteriaCount <= 4)
      return { strength: 75, label: "Good", color: Colors.accent.orange };
    return { strength: 100, label: "Strong", color: "#10B981" };
  };

  //Todo => Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const businessTypes = [
    "Individual Property Owner",
    "Real Estate Company",
    "Property Management Company",
    "Investment Company",
    "Individual",
    "Other",
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      //Todo => Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      //Todo => Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setProfileImage(base64String);
        setProfileImageBase64(base64String);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to upload image");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    console.log("Save button clicked!");
    setIsSaving(true);

    try {
      let result;

      if (userType === "landlord") {
        // Landlord-specific payload
        const payload = {
          full_name: editForm.full_name,
          email: editForm.email,
          phone_number: editForm.phone_number,
          business_name: editForm.business_name,
          business_type: editForm.business_type,
          location: editForm.location,
          region: editForm.region,
          business_registration_number: editForm.business_registration_number,
        };

        // Add business_logo only if provided (it's optional)
        if (profileImageBase64) {
          payload.business_logo = profileImageBase64;
        }

        console.log("Landlord payload being sent:", payload);
        result = await updateLandlordProfile(payload);
      } else {
        // Renter-specific payload
        const payload = {
          full_name: editForm.full_name,
          email: editForm.email,
          phone_number: editForm.phone_number,
          gender: editForm.gender,
          profile_picture: profileImageBase64 || "",
        };

        console.log("Renter payload being sent:", payload);
        result = await updateProfile(payload);
      }


      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
        updateUser({
          ...user,
          ...result.data,
          profile_picture:
            profileImage ||
            result.data?.profile_picture ||
            result.data?.business_logo ||
            user?.profile_picture,
        });

        setEditForm({
          full_name: result.data?.full_name || editForm.full_name,
          email: result.data?.email || editForm.email,
          phone_number: result.data?.phone_number || editForm.phone_number,
          gender: result.data?.gender || editForm.gender,
          business_name: result.data?.business_name || editForm.business_name,
          business_type: result.data?.business_type || editForm.business_type,
          location: result.data?.location || editForm.location,
          region: result.data?.region || editForm.region,
          business_registration_number:
            result.data?.business_registration_number ||
            editForm.business_registration_number,
        });

        setIsEditing(false);
        setProfileImageBase64("");
        toast.success(result.message || "Profile updated successfully");
      } else {
        console.error("API returned error:", result);
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    console.log("Password change requested");
    setIsChangingPassword(true);

    try {
      const result = await changeLandlordPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      console.log("Password change response:", result);

      if (result.success) {
        toast.success(result.message || "Password changed successfully");

        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordChange(false);

        // Log out user so they can log in with new password
        setTimeout(() => {
          toast.info("Please log in with your new password");
          // Clear tokens and redirect to login
          localStorage.removeItem("quick_landlord_token");
          localStorage.removeItem("quick_renter_token");
          window.location.href = "/login";
        }, 2000);
      } else {
        console.error("Password change error:", result);

        // Handle specific validation errors
        if (result.validationErrors?.old_password) {
          toast.error("The current password is incorrect.");
        } else {
          toast.error(result.message || "Failed to change password");
        }
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusBadge = () => {
    if (user?.is_verified) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          <CheckCircle2 size={16} />
          <span className="font-medium">Verified</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
        <AlertCircle size={16} />
        <span className="font-medium">Pending Verification</span>
      </div>
    );
  };



  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    userType !== "admin" && { id: "security", label: "Security", icon: Shield },
  ].filter(Boolean);

  return (
    <AuthLayout>
      <Motion.div
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Loading Overlay */}
        <AnimatePresence>
          {isSaving && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 bg-opacity-20 flex items-center justify-center z-50"
            >
              <Motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 mx-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                  <div
                    className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin"
                    style={{ borderTopColor: Colors.accent.orange }}
                  ></div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Updating Profile
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Please wait while we save your changes...
                  </p>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <Motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {profileImage ||
                        user?.profile_picture ||
                        user?.business_logo ? (
                          <img
                            src={
                              profileImage ||
                              user?.profile_picture ||
                              user?.business_logo
                            }
                            alt={user?.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User
                            size={28}
                            className="text-gray-400 sm:w-8 sm:h-8"
                          />
                        )}
                      </div>
                    </div>

                    {/*//Todo => Upload Button */}
                    <Motion.button
                      className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white transition-colors"
                      style={{ backgroundColor: Colors.accent.orange }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#e67300")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = Colors.accent.orange)
                      }
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isUploading ? (
                        <RefreshCw
                          size={12}
                          className="animate-spin sm:w-3.5 sm:h-3.5"
                        />
                      ) : (
                        <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                      )}
                    </Motion.button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Business Logo Notice for Landlords */}
                  {userType === "landlord" && isEditing && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500">
                        Business logo is optional
                      </p>
                    </div>
                  )}

                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {user?.full_name || "User Name"}
                    </h1>
                    <p className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">
                      {user?.email}
                    </p>
                    <div className="flex justify-center sm:justify-start">
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>

                {/*//Todo => Action Buttons */}
                {
                  userType !== "admin" && (     
                <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-end">
                  <Motion.button
                    className="px-4 sm:px-6 py-2 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                    style={{
                      background: `linear-gradient(to right, ${Colors.accent.orange}, #e67300)`,
                    }}
                    onClick={() => setIsEditing(!isEditing)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit3 size={14} className="inline mr-2 sm:w-4 sm:h-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Motion.button>
                </div>
                  )
                }
              </div>

              {/*//Todo => User Stats */}
              {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100">
                {getUserStats().map((stat) => (
                  <Motion.div
                    key={stat.label}
                    className="text-center"
                    variants={itemVariants}
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon
                        size={16}
                        className="sm:w-5 sm:h-5"
                        style={{ color: stat.color }}
                      />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </Motion.div>
                ))}
              </div> */}
            </div>
          </Motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/*//Todo => Sidebar Navigation */}
            <Motion.div className="lg:col-span-1" variants={cardVariants}>
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 lg:sticky lg:top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  Settings
                </h3>
                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
                  {tabs.map((tab) => (
                    <Motion.button
                      key={tab.id}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "text-white shadow-lg"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      style={
                        activeTab === tab.id
                          ? {
                              background: `linear-gradient(to right, ${Colors.accent.orange}, #e67300)`,
                            }
                          : {}
                      }
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ x: window.innerWidth >= 1024 ? 5 : 0 }}
                    >
                      <tab.icon size={16} className="sm:w-4.5 sm:h-4.5" />
                      <span className="font-medium text-sm sm:text-base">
                        {tab.label}
                      </span>
                      <ChevronRight
                        size={14}
                        className={`ml-auto transition-transform hidden lg:block ${
                          activeTab === tab.id ? "rotate-90" : ""
                        }`}
                      />
                    </Motion.button>
                  ))}
                </nav>
              </div>
            </Motion.div>

            {/*//Todo => Main Content */}
            <Motion.div className="lg:col-span-3" variants={cardVariants}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <Motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 sm:p-6 lg:p-8"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          Profile Information
                        </h2>
                        {isEditing && (
                          <Motion.button
                            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              isSaving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            whileHover={!isSaving ? { scale: 1.02 } : {}}
                            whileTap={!isSaving ? { scale: 0.98 } : {}}
                          >
                            {isSaving ? (
                              <>
                                <RefreshCw
                                  size={14}
                                  className="inline mr-2 animate-spin sm:w-4 sm:h-4"
                                />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save
                                  size={14}
                                  className="inline mr-2 sm:w-4 sm:h-4"
                                />
                                Save Changes
                              </>
                            )}
                          </Motion.button>
                        )}
                      </div>

                      {/* Re-verification Notice */}
                      {isEditing && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle
                              size={20}
                              className="text-amber-600 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <h4 className="text-sm font-semibold text-amber-800 mb-1">
                                Profile Re-verification Required
                              </h4>
                              <p className="text-sm text-amber-700">
                                After saving your profile changes, your account will go under review again for verification by an admin. You may experience temporary access limitations during this process.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  full_name: e.target.value,
                                })
                              }
                              disabled={isSaving}
                              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                isSaving ? "bg-gray-100 cursor-not-allowed" : ""
                              }`}
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                              {user?.full_name || "Not provided"}
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center">
                            <Mail size={16} className="mr-2 text-gray-500" />
                            {user?.email || "Not provided"}
                          </div>
                          {isEditing && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle
                                  size={16}
                                  className="text-blue-600 mt-0.5 flex-shrink-0"
                                />
                                <div>
                                  <p className="text-sm text-blue-800 font-medium">
                                    Email cannot be changed
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    To update your email address, please contact
                                    the Quick Rent team for security
                                    verification.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editForm.phone_number}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone_number: e.target.value,
                                })
                              }
                              disabled={isSaving}
                              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                isSaving ? "bg-gray-100 cursor-not-allowed" : ""
                              }`}
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center">
                              <Phone size={16} className="mr-2 text-gray-500" />
                              {user?.phone_number || "Not provided"}
                            </div>
                          )}
                        </div>

                        {/* Gender - Hidden */}
                        {/* <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          {isEditing ? (
                            <select
                              value={editForm.gender}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  gender: e.target.value,
                                })
                              }
                              disabled={isSaving}
                              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                isSaving ? "bg-gray-100 cursor-not-allowed" : ""
                              }`}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                              {user?.gender
                                ? user.gender.charAt(0).toUpperCase() +
                                  user.gender.slice(1)
                                : "Not specified"}
                            </div>
                          )}
                        </div> */}

                        {/* Landlord specific fields */}
                        {userType === "landlord" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Name
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.business_name}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      business_name: e.target.value,
                                    })
                                  }
                                  disabled={isSaving}
                                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                    isSaving
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center">
                                  <Building
                                    size={16}
                                    className="mr-2 text-gray-500"
                                  />
                                  {user?.business_name || "Not provided"}
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Type
                              </label>
                              {isEditing ? (
                                <select
                                  value={editForm.business_type}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      business_type: e.target.value,
                                    })
                                  }
                                  disabled={isSaving}
                                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                    isSaving
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <option value="">Select Business Type</option>
                                  {businessTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                  {user?.business_type || "Not provided"}
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      location: e.target.value,
                                    })
                                  }
                                  disabled={isSaving}
                                  placeholder="e.g. Accra"
                                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                    isSaving
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center">
                                  <MapPin
                                    size={16}
                                    className="mr-2 text-gray-500"
                                  />
                                  {user?.location || "Not provided"}
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Region
                              </label>
                              {isEditing ? (
                                <select
                                  value={editForm.region}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      region: e.target.value,
                                    })
                                  }
                                  disabled={isSaving}
                                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                    isSaving
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <option value="">Select Region</option>
                                  <option value="Greater Accra">
                                    Greater Accra
                                  </option>
                                  <option value="Ashanti">Ashanti</option>
                                  <option value="Western">Western</option>
                                  <option value="Eastern">Eastern</option>
                                  <option value="Central">Central</option>
                                  <option value="Northern">Northern</option>
                                  <option value="Upper East">Upper East</option>
                                  <option value="Upper West">Upper West</option>
                                  <option value="Volta">Volta</option>
                                  <option value="Brong Ahafo">
                                    Brong Ahafo
                                  </option>
                                </select>
                              ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center">
                                  <Globe
                                    size={16}
                                    className="mr-2 text-gray-500"
                                  />
                                  {user?.region || "Not provided"}
                                </div>
                              )}
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Registration Number
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.business_registration_number}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      business_registration_number:
                                        e.target.value,
                                    })
                                  }
                                  disabled={isSaving}
                                  placeholder="e.g. QR13-DSSA-6676"
                                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                                    isSaving
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center">
                                  <Award
                                    size={16}
                                    className="mr-2 text-gray-500"
                                  />
                                  {user?.business_registration_number ||
                                    "Not provided"}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Account Status */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-3 ${
                                  user?.is_active
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="text-gray-900 font-medium">
                                {user?.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            {user?.verified_at && (
                              <span className="text-xs sm:text-sm text-gray-500">
                                Verified on{" "}
                                {new Date(
                                  user.verified_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center sm:justify-end">
                          <Motion.button
                            className={`px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 text-sm sm:text-base shadow-lg ${
                              isSaving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 hover:shadow-xl"
                            }`}
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            whileHover={!isSaving ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!isSaving ? { scale: 0.98 } : {}}
                          >
                            {isSaving ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="inline mr-2 animate-spin sm:w-4 sm:h-4"
                                />
                                Saving Changes...
                              </>
                            ) : (
                              <>
                                <Save
                                  size={16}
                                  className="inline mr-2 sm:w-4 sm:h-4"
                                />
                                Save Changes
                              </>
                            )}
                          </Motion.button>
                        </div>
                      )}
                    </Motion.div>
                  )}

                  {activeTab === "security" && userType !== "admin" && (
                    <Motion.div
                      key="security"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 sm:p-6 lg:p-8"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                        Security Settings
                      </h2>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Password Change */}
                        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Password
                              </h3>
                              <p className="text-gray-600 text-sm sm:text-base">
                                Keep your account secure with a strong password
                              </p>
                            </div>
                            <Motion.button
                              className="px-4 py-2 text-white rounded-lg transition-colors text-sm sm:text-base flex-shrink-0"
                              style={{ backgroundColor: Colors.accent.orange }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#e67300")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor =
                                  Colors.accent.orange)
                              }
                              onClick={() =>
                                setShowPasswordChange(!showPasswordChange)
                              }
                              whileHover={{ scale: 1.02 }}
                            >
                              <Lock
                                size={14}
                                className="inline mr-2 sm:w-4 sm:h-4"
                              />
                              Change Password
                            </Motion.button>
                          </div>

                          <AnimatePresence>
                            {showPasswordChange && (
                              <Motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-4 overflow-hidden"
                              >
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={
                                        showPasswords.current
                                          ? "text"
                                          : "password"
                                      }
                                      value={passwordForm.currentPassword}
                                      onChange={(e) =>
                                        setPasswordForm({
                                          ...passwordForm,
                                          currentPassword: e.target.value,
                                        })
                                      }
                                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      placeholder="Enter current password"
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      onClick={() =>
                                        setShowPasswords({
                                          ...showPasswords,
                                          current: !showPasswords.current,
                                        })
                                      }
                                    >
                                      {showPasswords.current ? (
                                        <EyeOff size={20} />
                                      ) : (
                                        <Eye size={20} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={
                                        showPasswords.new ? "text" : "password"
                                      }
                                      value={passwordForm.newPassword}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        setPasswordForm({
                                          ...passwordForm,
                                          newPassword: newValue,
                                        });
                                        validatePassword(
                                          newValue,
                                          passwordForm.confirmPassword
                                        );
                                      }}
                                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      placeholder="Enter new password"
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      onClick={() =>
                                        setShowPasswords({
                                          ...showPasswords,
                                          new: !showPasswords.new,
                                        })
                                      }
                                    >
                                      {showPasswords.new ? (
                                        <EyeOff size={20} />
                                      ) : (
                                        <Eye size={20} />
                                      )}
                                    </button>
                                  </div>

                                  {/* Password Strength Indicator */}
                                  {passwordForm.newPassword && (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                          Password Strength
                                        </span>
                                        <span
                                          className="text-sm font-medium"
                                          style={{
                                            color: getPasswordStrength().color,
                                          }}
                                        >
                                          {getPasswordStrength().label}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <Motion.div
                                          className="h-2 rounded-full transition-all duration-300"
                                          style={{
                                            backgroundColor:
                                              getPasswordStrength().color,
                                            width: `${
                                              getPasswordStrength().strength
                                            }%`,
                                          }}
                                          initial={{ width: 0 }}
                                          animate={{
                                            width: `${
                                              getPasswordStrength().strength
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Password Requirements */}
                                  {passwordForm.newPassword && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        Password must contain:
                                      </h4>
                                      <div className="space-y-2">
                                        {[
                                          {
                                            key: "minLength",
                                            text: "At least 8 characters",
                                          },
                                          {
                                            key: "hasUppercase",
                                            text: "One uppercase letter",
                                          },
                                          {
                                            key: "hasLowercase",
                                            text: "One lowercase letter",
                                          },
                                          {
                                            key: "hasNumber",
                                            text: "One number",
                                          },
                                          {
                                            key: "hasSpecialChar",
                                            text: "One special character (!@#$%^&*)",
                                          },
                                        ].map((requirement) => (
                                          <div
                                            key={requirement.key}
                                            className="flex items-center gap-2"
                                          >
                                            <div
                                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                                passwordValidation[
                                                  requirement.key
                                                ]
                                                  ? "bg-green-500"
                                                  : "bg-gray-300"
                                              }`}
                                            >
                                              {passwordValidation[
                                                requirement.key
                                              ] && (
                                                <Check
                                                  size={10}
                                                  className="text-white"
                                                />
                                              )}
                                            </div>
                                            <span
                                              className={`text-sm ${
                                                passwordValidation[
                                                  requirement.key
                                                ]
                                                  ? "text-green-700"
                                                  : "text-gray-600"
                                              }`}
                                            >
                                              {requirement.text}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={
                                        showPasswords.confirm
                                          ? "text"
                                          : "password"
                                      }
                                      value={passwordForm.confirmPassword}
                                      onChange={(e) => {
                                        const confirmValue = e.target.value;
                                        setPasswordForm({
                                          ...passwordForm,
                                          confirmPassword: confirmValue,
                                        });
                                        validatePassword(
                                          passwordForm.newPassword,
                                          confirmValue
                                        );
                                      }}
                                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                                        passwordForm.confirmPassword &&
                                        passwordForm.newPassword
                                          ? passwordValidation.passwordsMatch
                                            ? "border-green-500 focus:border-green-500"
                                            : "border-red-500 focus:border-red-500"
                                          : "border-gray-300 focus:border-orange-500"
                                      }`}
                                      placeholder="Confirm new password"
                                    />
                                    <button
                                      type="button"
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      onClick={() =>
                                        setShowPasswords({
                                          ...showPasswords,
                                          confirm: !showPasswords.confirm,
                                        })
                                      }
                                    >
                                      {showPasswords.confirm ? (
                                        <EyeOff size={20} />
                                      ) : (
                                        <Eye size={20} />
                                      )}
                                    </button>
                                  </div>

                                  {/* Password Match Indicator */}
                                  {passwordForm.confirmPassword &&
                                    passwordForm.newPassword && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <div
                                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                            passwordValidation.passwordsMatch
                                              ? "bg-green-500"
                                              : "bg-red-500"
                                          }`}
                                        >
                                          {passwordValidation.passwordsMatch ? (
                                            <Check
                                              size={10}
                                              className="text-white"
                                            />
                                          ) : (
                                            <X
                                              size={10}
                                              className="text-white"
                                            />
                                          )}
                                        </div>
                                        <span
                                          className={`text-sm ${
                                            passwordValidation.passwordsMatch
                                              ? "text-green-700"
                                              : "text-red-700"
                                          }`}
                                        >
                                          {passwordValidation.passwordsMatch
                                            ? "Passwords match"
                                            : "Passwords do not match"}
                                        </span>
                                      </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <Motion.button
                                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                      isChangingPassword
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : passwordForm.currentPassword &&
                                          passwordForm.newPassword &&
                                          passwordForm.confirmPassword &&
                                          passwordValidation.passwordsMatch &&
                                          getPasswordStrength().strength >= 75
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                    onClick={handlePasswordChange}
                                    disabled={
                                      isChangingPassword ||
                                      !(
                                        passwordForm.currentPassword &&
                                        passwordForm.newPassword &&
                                        passwordForm.confirmPassword &&
                                        passwordValidation.passwordsMatch &&
                                        getPasswordStrength().strength >= 75
                                      )
                                    }
                                    whileHover={
                                      !isChangingPassword &&
                                      passwordForm.currentPassword &&
                                      passwordForm.newPassword &&
                                      passwordForm.confirmPassword &&
                                      passwordValidation.passwordsMatch &&
                                      getPasswordStrength().strength >= 75
                                        ? { scale: 1.02 }
                                        : {}
                                    }
                                  >
                                    {isChangingPassword ? (
                                      <>
                                        <RefreshCw
                                          size={14}
                                          className="inline mr-2 animate-spin sm:w-4 sm:h-4"
                                        />
                                        Updating...
                                      </>
                                    ) : (
                                      "Update Password"
                                    )}
                                  </Motion.button>
                                  <Motion.button
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    onClick={() => setShowPasswordChange(false)}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    Cancel
                                  </Motion.button>
                                </div>
                              </Motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Motion.div>
          </div>
        </div>
      </Motion.div>
    </AuthLayout>
  );
};

export default Profile;
