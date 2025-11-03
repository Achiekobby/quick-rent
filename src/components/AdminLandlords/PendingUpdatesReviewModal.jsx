import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";

const PendingUpdatesReviewModal = ({
  isOpen,
  onClose,
  landlord,
  onApprove,
  onReject,
  isLoading,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !landlord || !landlord.pending_updates) return null;

  const pendingUpdates = landlord.pending_updates;
  const currentData = {
    full_name: landlord.full_name,
    email: landlord.email,
    phone_number: landlord.phone_number,
    business_name: landlord.business_name,
    business_type: landlord.business_type,
    business_registration_number: landlord.business_registration_number,
    location: landlord.location,
    region: landlord.region,
    selfie_picture: landlord.selfie_picture,
    ghana_card_number: landlord.ghana_card_number,
    ghana_card_front: landlord.ghana_card_front,
    ghana_card_back: landlord.ghana_card_back,
  };

  const hasChanges = (field) => {
    // For image fields, only show changes if the field exists in pending_updates
    // If the field doesn't exist, it means the user didn't replace it
    const imageFields = ['selfie_picture', 'ghana_card_front', 'ghana_card_back'];
    if (imageFields.includes(field)) {
      // Only show if the image field exists in pending_updates
      return Object.prototype.hasOwnProperty.call(pendingUpdates, field) && pendingUpdates[field] !== null && pendingUpdates[field] !== undefined;
    }
    // For non-image fields, check if the value actually changed
    return Object.prototype.hasOwnProperty.call(pendingUpdates, field) && currentData[field] !== pendingUpdates[field];
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(landlord.landlord_slug);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    if (onReject) {
      onReject(landlord.landlord_slug, rejectionReason.trim());
      setRejectionReason("");
      setShowRejectForm(false);
    }
  };

  const handleClose = () => {
    setRejectionReason("");
    setShowRejectForm(false);
    onClose();
  };

  const renderFieldComparison = (field, label, Icon) => {
    if (!hasChanges(field)) return null;

    const IconComponent = Icon;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{label}</h5>
        </div>
        <div className="space-y-3 sm:space-y-2">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <p className="text-xs font-medium text-gray-500 mb-1">Current</p>
              <p className="text-xs sm:text-sm text-gray-700 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 break-words">
                {currentData[field] || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-5 sm:mt-6 flex-shrink-0 self-center rotate-90 sm:rotate-0" />
            <div className="flex-1 w-full sm:w-auto">
              <p className="text-xs font-medium text-gray-500 mb-1">New Value</p>
              <p className="text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-blue-200 break-words">
                {pendingUpdates[field] || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImageComparison = (field, label) => {
    // Only show if the field exists in pending_updates (user wants to replace it)
    // If field doesn't exist, it means user didn't change it
    if (!Object.prototype.hasOwnProperty.call(pendingUpdates, field) || pendingUpdates[field] === null || pendingUpdates[field] === undefined) {
      return null;
    }

    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          </div>
          <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{label}</h5>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Current</p>
            {currentData[field] ? (
              <img
                src={currentData[field]}
                alt="Current"
                className="w-full h-40 sm:h-48 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div className="w-full h-40 sm:h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No image</p>
                </div>
              </div>
            )}
            <div className="hidden p-4 bg-gray-100 text-center rounded-lg mt-2">
              <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Failed to load</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">New Value</p>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                Updated
              </span>
            </div>
            {pendingUpdates[field] ? (
              <img
                src={pendingUpdates[field]}
                alt="New"
                className="w-full h-40 sm:h-48 object-cover rounded-lg border-2 border-blue-400"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div className="w-full h-40 sm:h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No image</p>
                </div>
              </div>
            )}
            <div className="hidden p-4 bg-gray-100 text-center rounded-lg mt-2">
              <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Failed to load</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-black/50">
        <Motion.div
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-0"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
              <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  Review Pending Updates
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Review changes requested by {landlord.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Landlord Info */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                  {landlord.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize truncate">
                    {landlord.full_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 capitalize truncate">
                    {landlord.business_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Changes */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Pending Changes
                </h3>
              </div>

              {/* Text Fields */}
              {renderFieldComparison("full_name", "Full Name", User)}
              {renderFieldComparison("email", "Email Address", Mail)}
              {renderFieldComparison("phone_number", "Phone Number", Phone)}
              {renderFieldComparison("business_name", "Business Name", Building)}
              {renderFieldComparison("business_type", "Business Type", Building)}
              {renderFieldComparison(
                "business_registration_number",
                "Business Registration Number",
                FileText
              )}
              {renderFieldComparison("location", "Location", MapPin)}
              {renderFieldComparison("region", "Region", MapPin)}
              {renderFieldComparison("ghana_card_number", "Ghana Card Number", CreditCard)}

              {/* Image Fields */}
              {renderImageComparison(
                "selfie_picture",
                "Selfie Picture"
              )}
              {renderImageComparison(
                "ghana_card_front",
                "Ghana Card Front"
              )}
              {renderImageComparison(
                "ghana_card_back",
                "Ghana Card Back"
              )}
            </div>

            {/* Rejection Reason Form */}
            {showRejectForm && (
              <Motion.div
                className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs sm:text-sm font-medium text-red-900 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejecting these updates. This will be visible to the landlord..."
                  className="w-full p-2 sm:p-3 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-xs text-red-700 mt-1">
                  This reason will be displayed to the landlord
                </p>
              </Motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Review all changes before approving
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 rounded-lg transition-colors order-3 sm:order-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm sm:text-base bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-2 sm:order-3"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Updates</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 rounded-lg transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isLoading || !rejectionReason.trim()}
                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Confirm Rejection</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PendingUpdatesReviewModal;

