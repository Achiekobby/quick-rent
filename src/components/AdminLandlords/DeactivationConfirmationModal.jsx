import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  UserX,
  Shield,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";

const DeactivationConfirmationModal = ({
  isOpen,
  onClose,
  landlord,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !landlord) return null;

  const handleConfirm = () => {
    if (confirmText.toLowerCase() !== "deactivate") {
      toast.error("Please type 'DEACTIVATE' to confirm");
      return;
    }
    onConfirm(landlord.landlord_slug, reason.trim() || "No reason provided");
  };

  const handleClose = () => {
    setReason("");
    setConfirmText("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50 bg-opacity-20">
        <Motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Deactivate Landlord Account
                </h2>
                <p className="text-sm text-gray-600">
                  This action will deactivate the landlord's account
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Warning */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Important: Account Deactivation
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• The landlord will lose access to their account</li>
                    <li>
                      • All their properties will be hidden from public view
                    </li>
                    <li>
                      • They will not be able to manage bookings or payments
                    </li>
                    <li>
                      • This action can be reversed by reactivating the account
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Landlord Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Landlord Information
              </h4>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {landlord.full_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-gray-900 capitalize">
                    {landlord.full_name}
                  </h5>
                  <p className="text-sm text-gray-600 capitalize">
                    {landlord.business_name}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
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
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {landlord.properties_count} Properties
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

            {/* Deactivation Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Reason for Deactivation (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional: Provide a reason for deactivating this landlord's account..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be recorded for audit purposes (optional)
              </p>
            </div>

            {/* Confirmation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Type "DEACTIVATE" to confirm *
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DEACTIVATE here"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h5 className="font-medium text-blue-900 mb-2">
                  Current Status
                </h5>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-blue-800">Active Account</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <h5 className="font-medium text-purple-900 mb-2">
                  Verification
                </h5>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      landlord.is_verified ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    {landlord.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                This action can be reversed later
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  isLoading || confirmText.toLowerCase() !== "deactivate"
                }
                className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    Confirm Deactivation
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

export default DeactivationConfirmationModal;
