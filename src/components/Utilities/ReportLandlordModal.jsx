import { useState } from "react";
import { X, AlertTriangle, Flag, Send, Loader2, CheckCircle } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const ReportLandlordModal = ({ isOpen, onClose, landlordName, landlordSlug }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  console.log("landlordSlug", landlordSlug);

  const reportReasons = [
    { id: "fraud", label: "Fraud or Scam", icon: "🚨", description: "False listings or deceptive practices" },
    { id: "harassment", label: "Harassment", icon: "😡", description: "Threatening or abusive behavior" },
    { id: "discrimination", label: "Discrimination", icon: "⚖️", description: "Unfair treatment based on protected characteristics" },
    { id: "unsafe", label: "Unsafe Property", icon: "⚠️", description: "Property poses health or safety risks" },
    { id: "unresponsive", label: "Unresponsive", icon: "📵", description: "Fails to respond to important issues" },
    { id: "contract_violation", label: "Contract Violation", icon: "📄", description: "Breaching rental agreement terms" },
    { id: "other", label: "Other", icon: "💬", description: "Other issues not listed above" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await reportLandlord(landlordSlug, { reason: selectedReason, custom_reason: customReason, description });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSuccess(true);
      toast.success("Report submitted successfully. We'll review it shortly.");

      // Close modal after showing success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      toast.error(error?.response?.data?.reason || "Failed to submit report. Please try again.");
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setDescription("");
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <Motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white/95 to-white/90 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/50"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-orange-600 px-8 py-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                    <Flag className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Report Landlord</h2>
                    <p className="text-red-100 text-sm mt-1">
                      Reporting <span className="font-bold">{landlordName}</span>
                    </p>
                  </div>
                </div>
                <Motion.button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-white" />
                </Motion.button>
              </div>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <Motion.div
                className="p-12 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Report Submitted
                </h3>
                <p className="text-neutral-600 max-w-md mx-auto">
                  Thank you for bringing this to our attention. Our team will review your report and take appropriate action.
                </p>
              </Motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Warning Banner */}
                <Motion.div
                  className="bg-amber-100 border-l-4 border-amber-600 p-4 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Important Notice</p>
                      <p className="text-xs text-amber-800 mt-1">
                        False reports may result in account suspension. Only submit genuine concerns.
                      </p>
                    </div>
                  </div>
                </Motion.div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-4 uppercase tracking-wide">
                    Select Reason for Report
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reportReasons.map((reason) => (
                      <Motion.button
                        key={reason.id}
                        type="button"
                        onClick={() => setSelectedReason(reason.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedReason === reason.id
                            ? "border-red-500 bg-red-50 shadow-md"
                            : "border-neutral-200 bg-white hover:border-red-300 hover:shadow-sm"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{reason.icon}</span>
                          <div className="flex-1">
                            <p className={`font-bold text-sm ${
                              selectedReason === reason.id ? "text-red-700" : "text-neutral-900"
                            }`}>
                              {reason.label}
                            </p>
                            <p className="text-xs text-neutral-600 mt-1">
                              {reason.description}
                            </p>
                          </div>
                          {selectedReason === reason.id && (
                            <Motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </Motion.div>
                          )}
                        </div>
                      </Motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Reason (if Other is selected) */}
                {selectedReason === "other" && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-sm"
                  >
                    <label htmlFor="customReason" className="block text-sm font-bold text-neutral-800 mb-3">
                      Specify Your Reason
                    </label>
                    <input
                      id="customReason"
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-neutral-700 placeholder:text-neutral-400"
                      placeholder="Please specify your reason..."
                      required={selectedReason === "other"}
                    />
                  </Motion.div>
                )}

                {/* Description */}
                <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-sm">
                  <label htmlFor="description" className="block text-sm font-bold text-neutral-800 mb-3">
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all text-neutral-700 placeholder:text-neutral-400"
                    placeholder="Please provide detailed information about your concern. Include dates, specific incidents, and any relevant details..."
                    required
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-neutral-500">
                      Minimum 20 characters required
                    </p>
                    <p className={`text-xs font-medium ${description.length > 900 ? 'text-red-600' : 'text-neutral-500'}`}>
                      {description.length} / 1000
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Motion.button
                    type="submit"
                    disabled={!selectedReason || description.trim().length < 20 || isSubmitting || (selectedReason === "other" && !customReason)}
                    className="flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
                    style={{
                      background: !selectedReason || description.trim().length < 20 || isSubmitting
                        ? '#d1d5db'
                        : 'linear-gradient(to right, #ef4444, #f97316)',
                    }}
                    whileHover={
                      selectedReason && description.trim().length >= 20 && !isSubmitting
                        ? { scale: 1.02, y: -2 }
                        : {}
                    }
                    whileTap={
                      selectedReason && description.trim().length >= 20 && !isSubmitting
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Report...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </Motion.button>

                  <Motion.button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-4 rounded-xl font-bold border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all disabled:opacity-50 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </Motion.button>
                </div>
              </form>
            )}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

ReportLandlordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  landlordName: PropTypes.string.isRequired,
  landlordSlug: PropTypes.string.isRequired,
};

export default ReportLandlordModal;

