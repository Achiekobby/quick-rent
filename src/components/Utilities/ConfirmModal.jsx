import { motion as Motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import PropTypes from "prop-types";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger" // 'danger' or 'warning'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "from-red-100 to-red-200",
      iconColor: "text-red-600",
      buttonBg: "from-red-500 to-red-600",
      buttonHover: "hover:from-red-600 hover:to-red-700",
    },
    warning: {
      iconBg: "from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      buttonBg: "from-orange-500 to-orange-600",
      buttonHover: "hover:from-orange-600 hover:to-orange-700",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 400 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon with animated background */}
              <Motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 400 }}
                className={`relative w-16 h-16 bg-gradient-to-br ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <div className={`absolute inset-0 ${styles.iconColor.replace('text-', 'bg-')}/10 rounded-full animate-pulse`}></div>
                <AlertTriangle size={28} className={`${styles.iconColor} relative z-10`} />
              </Motion.div>
              
              {/* Title and description */}
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {description}
                </p>
              </Motion.div>
              
              {/* Action buttons */}
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3"
              >
                <Motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {cancelText}
                </Motion.button>
                <Motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r ${styles.buttonBg} text-white rounded-xl font-semibold ${styles.buttonHover} shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={isLoading ? {} : { scale: 1.02 }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    confirmText
                  )}
                </Motion.button>
              </Motion.div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(["danger", "warning"]),
};

export default ConfirmModal;

