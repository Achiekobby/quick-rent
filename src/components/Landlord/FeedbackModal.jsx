import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Bug,
  Palette,
  Rocket,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import feedback from "../../api/Landlord/General/FeedbackRequest";
import PropTypes from "prop-types";

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    {
      id: "ui",
      label: "User Interface",
      icon: <Palette className="w-5 h-5" />,
      description: "Design, layout, and visual experience",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "features",
      label: "Features",
      icon: <Rocket className="w-5 h-5" />,
      description: "New features or feature improvements",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "performance",
      label: "Performance",
      icon: <Zap className="w-5 h-5" />,
      description: "Speed, responsiveness, and optimization",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "bugs",
      label: "Bugs & Issues",
      icon: <Bug className="w-5 h-5" />,
      description: "Technical problems or errors",
      color: "from-red-500 to-rose-500",
    },
    {
      id: "other",
      label: "Other",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "General feedback or suggestions",
      color: "from-gray-500 to-slate-500",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    if (!category) {
      toast.error("Please select a feedback category");
      return;
    }

    if (!message.trim()) {
      toast.error("Please provide your feedback message");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await feedback.submitFeedback({
        rating: rating.toString(),
        category,
        comment: message.trim(),
        suggestion: suggestions.trim() || null,
      });

      if (response?.data?.status_code === "000" && !response?.data?.in_error) {
        setIsSuccess(true);
        toast.success(
          response.data.reason ||
            "Thank you for your feedback! We appreciate your input."
        );
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        toast.error(
          response?.data?.reason ||
            "Failed to submit feedback. Please try again."
        );
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(
        error?.response?.data?.reason ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setCategory("");
      setMessage("");
      setSuggestions("");
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Share Your Feedback
                  </h2>
                  <p className="text-white/90 text-sm">
                    Help us improve QuickRent for you
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isSuccess ? (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600">
                  Your feedback has been submitted successfully. We truly
                  appreciate your input!
                </p>
              </Motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How would you rate your experience? *
                  </label>
                  <div className="flex items-center gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="relative group"
                      >
                        <Star
                          className={`w-12 h-12 transition-all duration-200 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          } ${
                            star <= (hoveredRating || rating)
                              ? "scale-110"
                              : "scale-100"
                          }`}
                        />
                        {star === (hoveredRating || rating) && (
                          <Motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap"
                          >
                            {star === 1
                              ? "Poor"
                              : star === 2
                              ? "Fair"
                              : star === 3
                              ? "Good"
                              : star === 4
                              ? "Very Good"
                              : "Excellent"}
                          </Motion.span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What would you like to provide feedback on? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                          category === cat.id
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              category === cat.id
                                ? `bg-gradient-to-br ${cat.color} text-white`
                                : "bg-gray-100 text-gray-600"
                            } transition-all duration-200`}
                          >
                            {cat.icon}
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-semibold mb-1 ${
                                category === cat.id
                                  ? "text-orange-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {cat.label}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {cat.description}
                            </p>
                          </div>
                          {category === cat.id && (
                            <Motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </Motion.div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Feedback *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your experience, what you liked, what could be improved, or any issues you encountered..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length} characters
                  </p>
                </div>

                {/* Suggestions Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Suggestions for Improvement (Optional)
                  </label>
                  <textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="Do you have any specific suggestions or ideas for improvement?"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-4">
                  <Motion.button
                    type="submit"
                    disabled={
                      isSubmitting || !rating || !category || !message.trim()
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </Motion.button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

FeedbackModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  landlordSlug: PropTypes.string.isRequired,
};

export default FeedbackModal;
