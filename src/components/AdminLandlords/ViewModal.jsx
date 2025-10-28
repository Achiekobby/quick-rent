import React, { useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Shield,
  AlertCircle,
  Info,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  Settings,
  RefreshCw,
  Ban,
  CheckCircle,
  Edit,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";
import generalRequests from "../../api/Admin/Landlords/GeneralRequests";
import { useNavigate } from "react-router";

const ViewModal = ({
  showLandlordModal,
  setShowLandlordModal,
  selectedLandlord,
  onLandlordUpdate,
}) => {
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  const handleToggleVerification = async (landlord_slug, isVerified) => {
    setActionLoading((prev) => ({
      ...prev,
      [`verify_${landlord_slug}`]: true,
    }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlord_slug,
        status: isVerified ? "unverify" : "verify",
      });
      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Account verified successfully"
        );

        if (onLandlordUpdate) {
          onLandlordUpdate(landlord_slug, {
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
        [`verify_${landlord_slug}`]: false,
      }));
    }
  };

  const handleToggleStatus = async (landlord_slug, isActive) => {
    setActionLoading((prev) => ({
      ...prev,
      [`status_${landlord_slug}`]: true,
    }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlord_slug,
        status: isActive ? "deactivate" : "activate",
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Account status updated successfully"
        );

        if (onLandlordUpdate) {
          onLandlordUpdate(landlord_slug, {
            is_active: !isActive,
          });
        }
      } else {
        toast.error(
          response?.data?.reason || "Failed to update account status"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update landlord status");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${landlord_slug}`]: false,
      }));
    }
  };

  return (
    <AnimatePresence>
      {showLandlordModal && selectedLandlord && (
        <Motion.div
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowLandlordModal(false)}
        >
          <Motion.div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Profile Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                      {selectedLandlord.full_name?.charAt(0)?.toUpperCase() ||
                        "L"}
                    </div>
                    {selectedLandlord.is_verified && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-white truncate capitalize">
                      {selectedLandlord.full_name}
                    </h2>
                    <p className="text-blue-100 text-lg truncate capitalize">
                      {selectedLandlord.business_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedLandlord.is_active
                            ? "bg-green-500/20 text-green-100 border border-green-400/30"
                            : "bg-red-500/20 text-red-100 border border-red-400/30"
                        }`}
                      >
                        {selectedLandlord.is_active ? (
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
                          selectedLandlord.is_verified
                            ? "bg-blue-500/20 text-blue-100 border border-blue-400/30"
                            : "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30"
                        }`}
                      >
                        {selectedLandlord.is_verified ? (
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
                  onClick={() => setShowLandlordModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0 ml-4"
                >
                  <XCircle
                    size={24}
                    className="text-white/80 hover:text-white"
                  />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information Card */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Info size={18} className="text-blue-600" />
                      </div>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Mail size={16} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Email
                          </p>
                          <p className="text-sm text-gray-900 truncate">
                            {selectedLandlord.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Phone size={16} className="text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Phone
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedLandlord.phone_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <MapPin size={16} className="text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Location
                          </p>
                          <p className="text-sm text-gray-900 capitalize">
                            {selectedLandlord.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <Building size={16} className="text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Region
                          </p>
                          <p className="text-sm text-gray-900 capitalize">
                            {selectedLandlord.region}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building size={18} className="text-blue-600" />
                      </div>
                      Business Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Business Type
                        </p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {selectedLandlord.business_type || "Not specified"}
                        </p>
                      </div>

                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Registration Number
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedLandlord.business_registration_number ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          User Type
                        </p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {selectedLandlord.user_type}
                        </p>
                      </div>

                      <div className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          Verification Channel
                        </p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {selectedLandlord.verification_channel || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Sidebar */}
                <div className="space-y-6">
                  {/* Properties Stats */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
                        <Building size={32} className="text-white" />
                      </div>
                      <p className="text-3xl font-bold text-green-700 mb-1">
                        {selectedLandlord.properties_count || 0}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        Total Properties
                      </p>
                    </div>
                  </div>

                  {/* Account Timeline */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock size={18} className="text-purple-600" />
                      </div>
                      Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                        <span className="text-sm text-gray-600 font-medium">
                          Account ID
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          #{selectedLandlord.id}
                        </span>
                      </div>

                      {selectedLandlord.verified_at && (
                        <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                          <span className="text-sm text-gray-600 font-medium">
                            Verified
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {moment(selectedLandlord.verified_at).format(
                              "MMM DD, YYYY"
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                        <span className="text-sm text-gray-600 font-medium">
                          Slug
                        </span>
                        <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded truncate max-w-32">
                          {selectedLandlord.landlord_slug?.split("-")[0]}...
                        </span>
                      </div>
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
                        type="button"
                        onClick={() => {
                          console.log('Navigating to:', `/landlords/${encodeURIComponent(selectedLandlord.landlord_slug)}/properties`);
                          console.log('Landlord slug:', selectedLandlord.landlord_slug);
                          navigate(`/landlords/${encodeURIComponent(selectedLandlord.landlord_slug)}/properties`);
                          setShowLandlordModal(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Building size={16} />
                        View Properties
                      </button>

                      <Motion.button
                        onClick={() => {
                          navigate(`/admin/landlords/edit/${selectedLandlord.landlord_slug}`);
                          setShowLandlordModal(false);
                        }}
                        className="group w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                        Edit Landlord Details
                      </Motion.button>

                      <button
                        onClick={() =>
                          handleToggleVerification(
                            selectedLandlord.landlord_slug,
                            selectedLandlord.is_verified
                          )
                        }
                        disabled={
                          actionLoading[
                            `verify_${selectedLandlord.landlord_slug}`
                          ]
                        }
                        className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                          selectedLandlord.is_verified
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } disabled:opacity-50`}
                      >
                        {actionLoading[
                          `verify_${selectedLandlord.landlord_slug}`
                        ] ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Shield size={16} />
                        )}
                        {selectedLandlord.is_verified
                          ? "Remove Verification"
                          : "Verify Account"}
                      </button>

                      <button
                        onClick={() =>
                          handleToggleStatus(
                            selectedLandlord.landlord_slug,
                            selectedLandlord.is_active
                          )
                        }
                        disabled={
                          actionLoading[
                            `status_${selectedLandlord.landlord_slug}`
                          ]
                        }
                        className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                          selectedLandlord.is_active
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } disabled:opacity-50`}
                      >
                        {actionLoading[
                          `status_${selectedLandlord.landlord_slug}`
                        ] ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : selectedLandlord.is_active ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        {selectedLandlord.is_active
                          ? "Deactivate Account"
                          : "Activate Account"}
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
