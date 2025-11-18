import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { motion as Motion } from "framer-motion";
import PropTypes from "prop-types";
import Colors from "../../utils/Colors";

const ReviewForm = ({ onSubmit, isSubmitting = false }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }
    onSubmit({ rating, comment });
  };

  const handleReset = () => {
    setRating(0);
    setComment("");
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <Motion.button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Star
            className={`w-8 h-8 transition-all duration-200 ${
              starValue <= (hoveredRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-300"
            }`}
          />
        </Motion.button>
      );
    });
  };

  const getRatingLabel = () => {
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    return labels[hoveredRating || rating];
  };

  return (
    <Motion.div
      className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-8 shadow-lg border-2 border-orange-200"
      style={{
        backgroundColor: '#fff7ed',
        borderColor: '#fb923c',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
          <Star className="w-6 h-6 text-white fill-white" />
        </div>
        <h3 className="text-2xl font-bold text-orange-900">
          Review the Landlord
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Rating Stars */}
        <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-md">
          <label className="block text-sm font-bold text-orange-800 mb-4 uppercase tracking-wide">
            Rate your experience
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-2">{renderStars()}</div>
            {(hoveredRating || rating) > 0 && (
              <Motion.div
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-md"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="text-sm font-bold">
                  {getRatingLabel()}
                </span>
              </Motion.div>
            )}
          </div>
          {rating === 0 && (
            <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400"></span>
              Click on a star to rate
            </p>
          )}
        </div>

        {/* Comment Textarea */}
        <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-md">
          <label
            htmlFor="comment"
            className="block text-sm font-bold text-orange-800 mb-3 uppercase tracking-wide"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows="5"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all text-neutral-700 placeholder:text-neutral-400"
            placeholder="Share your experience with this landlord (responsiveness, communication, professionalism, etc.)..."
            required
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-neutral-500">
              Minimum 10 characters required
            </p>
            <p className={`text-xs font-medium ${comment.length > 450 ? 'text-orange-600' : 'text-neutral-500'}`}>
              {comment.length} / 500
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Motion.button
            type="submit"
            disabled={rating === 0 || isSubmitting || comment.trim().length < 10}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg disabled:shadow-none"
            style={{
              background: rating > 0 && comment.trim().length >= 10 
                ? 'linear-gradient(to right, #f97316, #ea580c)' 
                : '#d1d5db',
            }}
            whileHover={
              rating > 0 && !isSubmitting && comment.trim().length >= 10 ? { scale: 1.02, y: -2 } : {}
            }
            whileTap={rating > 0 && !isSubmitting && comment.trim().length >= 10 ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Review</span>
              </>
            )}
          </Motion.button>

          <Motion.button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-6 py-4 rounded-xl font-bold border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all disabled:opacity-50 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear
          </Motion.button>
        </div>
      </form>
    </Motion.div>
  );
};

ReviewForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default ReviewForm;

