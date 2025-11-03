import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  User,
  CreditCard,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";

const KYCReviewModal = ({
  isOpen,
  onClose,
  landlord,
  onApprove,
  onReject,
  isLoading,
}) => {
  const [showSelfie, setShowSelfie] = useState(true);
  const [showCardFront, setShowCardFront] = useState(true);
  const [showCardBack, setShowCardBack] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState([""]);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !landlord) return null;

  const hasDocuments =
    landlord.selfie_picture &&
    landlord.ghana_card_front &&
    landlord.ghana_card_back;

  const handleApprove = () => {
    if (!hasDocuments) {
      toast.error("Cannot approve KYC without all required documents");
      return;
    }
    if (onApprove) {
      onApprove(landlord.landlord_slug);
    }
  };

  const handleAddReason = () => {
    setRejectionReasons([...rejectionReasons, ""]);
  };

  const handleRemoveReason = (index) => {
    if (rejectionReasons.length > 1) {
      setRejectionReasons(rejectionReasons.filter((_, i) => i !== index));
    }
  };

  const handleReasonChange = (index, value) => {
    const updated = [...rejectionReasons];
    updated[index] = value;
    setRejectionReasons(updated);
  };

  const handleReject = () => {
    const validReasons = rejectionReasons.filter((r) => r.trim());
    if (validReasons.length === 0) {
      toast.error("Please provide at least one rejection reason");
      return;
    }
    if (onReject) {
      onReject(landlord.landlord_slug, validReasons);
      setRejectionReasons([""]);
      setShowRejectForm(false);
    }
  };

  const handleClose = () => {
    setRejectionReasons([""]);
    setShowRejectForm(false);
    onClose();
  };

  const renderImage = (src, alt, show, onToggle, label) => {
    return (
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h5 className="font-medium text-gray-900 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 min-w-0">
            {label === "Selfie Picture" && <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
            {label === "Ghana Card Front" && <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
            {label === "Ghana Card Back" && <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
            <span className="truncate">{label}</span>
          </h5>
          <button
            onClick={onToggle}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          >
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span className="hidden sm:inline">{show ? "Hide" : "Show"}</span>
          </button>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          {show && src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-48 sm:h-64 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : (
            <div className="w-full h-48 sm:h-64 flex items-center justify-center">
              <div className="text-center">
                <EyeOff className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-500">Image hidden</p>
              </div>
            </div>
          )}
          <div className="hidden p-4 bg-gray-100 text-center">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-black/50">
        <Motion.div
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-10 sm:pr-0">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  KYC Verification Review
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Review verification documents for {landlord.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
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
                  {landlord.ghana_card_number && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="break-all">Card Number: {landlord.ghana_card_number}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Status */}
            {!hasDocuments ? (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm sm:text-base font-medium text-red-800">
                      Missing Verification Documents
                    </h5>
                    <p className="text-xs sm:text-sm text-red-600 mt-1">
                      Some required documents are missing. Cannot approve KYC
                      verification without all documents.
                    </p>
                    <ul className="text-xs text-red-600 mt-2 space-y-1">
                      {!landlord.selfie_picture && (
                        <li>• Selfie picture is missing</li>
                      )}
                      {!landlord.ghana_card_front && (
                        <li>• Ghana card front is missing</li>
                      )}
                      {!landlord.ghana_card_back && (
                        <li>• Ghana card back is missing</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm sm:text-base font-medium text-green-800">
                      All Documents Available
                    </h5>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">
                      All required verification documents have been submitted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Documents */}
            <div className="mb-4 sm:mb-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Verification Documents
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {renderImage(
                  landlord.selfie_picture,
                  "Selfie",
                  showSelfie,
                  () => setShowSelfie(!showSelfie),
                  "Selfie Picture"
                )}
                {renderImage(
                  landlord.ghana_card_front,
                  "Ghana Card Front",
                  showCardFront,
                  () => setShowCardFront(!showCardFront),
                  "Ghana Card Front"
                )}
                {renderImage(
                  landlord.ghana_card_back,
                  "Ghana Card Back",
                  showCardBack,
                  () => setShowCardBack(!showCardBack),
                  "Ghana Card Back"
                )}
              </div>
            </div>

            {/* Rejection Reasons Form */}
            {showRejectForm && (
              <Motion.div
                className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs sm:text-sm font-medium text-red-900 mb-2 sm:mb-3">
                  Rejection Reasons *
                </label>
                <p className="text-xs text-red-700 mb-3">
                  Enter one or more reasons for rejecting this KYC verification.
                  Each reason will be displayed as a bullet point.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {rejectionReasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1 flex items-start gap-2 min-w-0">
                        <span className="text-red-700 font-medium mt-2 flex-shrink-0">•</span>
                        <textarea
                          value={reason}
                          onChange={(e) =>
                            handleReasonChange(index, e.target.value)
                          }
                          placeholder={`Reason ${index + 1}...`}
                          className="flex-1 p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-xs sm:text-sm min-w-0"
                          rows={2}
                          disabled={isLoading}
                        />
                      </div>
                      {rejectionReasons.length > 1 && (
                        <button
                          onClick={() => handleRemoveReason(index)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 mt-2 flex-shrink-0"
                          title="Remove reason"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddReason}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Reason
                  </button>
                </div>
              </Motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50 gap-3">
            <div className="text-xs sm:text-sm text-gray-600 hidden sm:flex">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                Review all documents before making a decision
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isLoading || !hasDocuments}
                    className="px-4 sm:px-6 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve KYC</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReasons([""]);
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={
                      isLoading ||
                      rejectionReasons.filter((r) => r.trim()).length === 0
                    }
                    className="px-4 sm:px-6 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default KYCReviewModal;

