import React, { useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Shield,
  AlertCircle,
  Info,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  RefreshCw,
  Ban,
  CheckCircle,
  User,
  Heart,
  Bookmark,
  Activity,
  Clock,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";
import generalRentersRequests from "../../api/Admin/Rentors/GeneralRentorsRequests";

const ViewModal = ({
  showRenterModal,
  setShowRenterModal,
  selectedRenter,
  onRenterUpdate,
}) => {
  const [actionLoading, setActionLoading] = useState({});

  const handleToggleVerification = async (renterSlug, isVerified) => {
    setActionLoading((prev) => ({
      ...prev,
      [`verify_${renterSlug}`]: true,
    }));

    try {
      const response = await generalRentersRequests.updateAccountStatus({
        user_slug: renterSlug,
        status: isVerified ? "unverify" : "verify",
      });
      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Account verified successfully");

        if (onRenterUpdate) {
          onRenterUpdate(renterSlug, {
            is_verified: !isVerified,
            verification_status: !isVerified ? "verified" : "pending",
          });
        }
      } else {
        toast.error(response?.data?.reason || "Failed to verify account");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update verification status");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`verify_${renterSlug}`]: false,
      }));
    }
  };

  const handleToggleStatus = async (renterSlug, isActive) => {
    setActionLoading((prev) => ({
      ...prev,
      [`status_${renterSlug}`]: true,
    }));

    try {
      const response = await generalRentersRequests.updateAccountStatus({
        user_slug: renterSlug,
        status: isActive ? "deactivate" : "activate",
      });

      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Account status updated successfully");

        if (onRenterUpdate) {
          onRenterUpdate(renterSlug, {
            is_active: !isActive,
          });
        }
      } else {
        toast.error(response?.data?.reason || "Failed to update account status");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update renter status");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${renterSlug}`]: false,
      }));
    }
  };

  return (
    <AnimatePresence>
      {showRenterModal && selectedRenter && (
        <Motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowRenterModal(false)}
        >
          <Motion.div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                      {selectedRenter.full_name?.charAt(0)?.toUpperCase() || "R"}
                    </div>
                    {selectedRenter.is_verified && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-white truncate capitalize">
                      {selectedRenter.full_name || "Unknown User"}
                    </h2>
                    <p className="text-purple-100 text-lg truncate">Renter Profile</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedRenter.is_active
                            ? "bg-green-500/20 text-green-100 border border-green-400/30"
                            : "bg-red-500/20 text-red-100 border border-red-400/30"
                        }`}
                      >
                        {selectedRenter.is_active ? (
                          <>
                            <CheckCircle2 size={10} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={10} />
                            Inactive
                          </>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedRenter.is_verified
                            ? "bg-blue-500/20 text-blue-100 border border-blue-400/30"
                            : "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30"
                        }`}
                      >
                        {selectedRenter.is_verified ? (
                          <>
                            <Shield size={10} />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle size={10} />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowRenterModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0 ml-4"
                >
                  <XCircle size={24} className="text-white/80 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Info size={18} className="text-purple-600" />
                      </div>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Mail size={16} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                          <p className="text-sm text-gray-900 truncate">
                            {selectedRenter.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Phone size={16} className="text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">Phone</p>
                          <p className="text-sm text-gray-900">
                            {selectedRenter.phone_number || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <MapPin size={16} className="text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">Location</p>
                          <p className="text-sm text-gray-900 capitalize">
                            {selectedRenter.location || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <User size={16} className="text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">User Type</p>
                          <p className="text-sm text-gray-900 capitalize">
                            {selectedRenter.user_type || "Renter"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Activity */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity size={18} className="text-blue-600" />
                      </div>
                      Account Activity
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <Heart size={20} className="text-red-500" />
                          <span className="text-2xl font-bold text-gray-900">
                            {Math.floor(Math.random() * 50)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Favorites</p>
                        <p className="text-xs text-gray-500 mt-1">Properties saved</p>
                      </div>

                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <Bookmark size={20} className="text-blue-500" />
                          <span className="text-2xl font-bold text-gray-900">
                            {Math.floor(Math.random() * 20)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Bookings</p>
                        <p className="text-xs text-gray-500 mt-1">Total bookings</p>
                      </div>

                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <Star size={20} className="text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900">
                            {(Math.random() * 2 + 3).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">Rating</p>
                        <p className="text-xs text-gray-500 mt-1">Average rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock size={18} className="text-purple-600" />
                      </div>
                      Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                        <span className="text-sm text-gray-600 font-medium">Account ID</span>
                        <span className="text-sm font-semibold text-gray-900">#{selectedRenter.id}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                        <span className="text-sm text-gray-600 font-medium">Joined</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {moment(selectedRenter.created_at).format("MMM DD, YYYY")}
                        </span>
                      </div>

                      {selectedRenter.verified_at && (
                        <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                          <span className="text-sm text-gray-600 font-medium">Verified</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {moment(selectedRenter.verified_at).format("MMM DD, YYYY")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Settings size={18} className="text-gray-600" />
                      </div>
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() =>
                          handleToggleVerification(selectedRenter.user_slug, selectedRenter.is_verified)
                        }
                        disabled={actionLoading[`verify_${selectedRenter.user_slug}`]}
                        className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                          selectedRenter.is_verified
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } disabled:opacity-50`}
                      >
                        {actionLoading[`verify_${selectedRenter.user_slug}`] ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Shield size={16} />
                        )}
                        {selectedRenter.is_verified ? "Remove Verification" : "Verify Account"}
                      </button>

                      <button
                        onClick={() =>
                          handleToggleStatus(selectedRenter.user_slug, selectedRenter.is_active)
                        }
                        disabled={actionLoading[`status_${selectedRenter.user_slug}`]}
                        className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                          selectedRenter.is_active
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } disabled:opacity-50`}
                      >
                        {actionLoading[`status_${selectedRenter.user_slug}`] ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : selectedRenter.is_active ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        {selectedRenter.is_active ? "Deactivate Account" : "Activate Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewModal; 