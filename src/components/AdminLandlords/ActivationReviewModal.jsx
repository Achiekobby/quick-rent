import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CreditCard,
  Shield,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";

const ActivationReviewModal = ({
  isOpen,
  onClose,
  landlord,
  onApprove,
  onReject,
  isLoading,
}) => {
  const [showSelfie, setShowSelfie] = useState(true);
  const [showGhanaCard, setShowGhanaCard] = useState(true);

  if (!isOpen || !landlord) return null;

  const hasVerificationDocuments = landlord.selfie_image && landlord.ghana_card_image;

  const handleApprove = () => {
    if (!hasVerificationDocuments) {
      toast.error("Cannot activate landlord without verification documents");
      return;
    }
    onApprove(landlord.landlord_slug);
  };

  const handleReject = () => {
    onReject(landlord.landlord_slug);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
        <Motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Landlord Activation Review
                </h2>
                <p className="text-sm text-gray-600">
                  Review verification documents before activation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Landlord Info */}
            <div className="mb-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {landlord.full_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {landlord.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {landlord.business_name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {landlord.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {landlord.phone_number}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {landlord.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Joined</div>
                  <div className="text-sm font-medium">
                    {moment(landlord.join_date).format("MMM DD, YYYY")}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Documents Status */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Documents
              </h4>
              
              {!hasVerificationDocuments ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <h5 className="font-medium text-red-800">
                        Missing Verification Documents
                      </h5>
                      <p className="text-sm text-red-600 mt-1">
                        This landlord has not uploaded required verification documents (selfie and Ghana card).
                        Cannot activate account without proper verification.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Selfie Image */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Selfie Image
                      </h5>
                      <button
                        onClick={() => setShowSelfie(!showSelfie)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {showSelfie ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showSelfie ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {showSelfie ? (
                        <img
                          src={landlord.selfie_image}
                          alt="Selfie"
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Image hidden</p>
                          </div>
                        </div>
                      )}
                      <div className="hidden p-4 bg-gray-100 text-center">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Failed to load image</p>
                      </div>
                    </div>
                  </div>

                  {/* Ghana Card Image */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Ghana Card Image
                      </h5>
                      <button
                        onClick={() => setShowGhanaCard(!showGhanaCard)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {showGhanaCard ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showGhanaCard ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {showGhanaCard ? (
                        <img
                          src={landlord.ghana_card_image}
                          alt="Ghana Card"
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Image hidden</p>
                          </div>
                        </div>
                      )}
                      <div className="hidden p-4 bg-gray-100 text-center">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Failed to load image</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h5 className="font-medium text-blue-900 mb-2">Account Status</h5>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${landlord.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-blue-800">
                    {landlord.is_active ? 'Currently Active' : 'Currently Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <h5 className="font-medium text-purple-900 mb-2">Verification Status</h5>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${landlord.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-purple-800">
                    {landlord.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {hasVerificationDocuments ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  All verification documents are available
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Missing verification documents
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading || !hasVerificationDocuments}
                className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivationReviewModal;
