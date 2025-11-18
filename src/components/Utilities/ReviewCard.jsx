import { Star, Flag } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useState } from "react";
import PropTypes from "prop-types";

const ReviewCard = ({ review }) => {
  const [avatarError, setAvatarError] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-neutral-300"
        }`}
      />
    ));
  };

  return (
    <Motion.div
      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:border-primary-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-primary-500 to-primary-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 shadow-md ring-2 ring-white">
              {review?.reviewer_avatar && !avatarError ? (
                <img
                  src={review.reviewer_avatar}
                  alt={review?.reviewer_name || "Reviewer"}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-base font-bold text-white">
                  {review?.reviewer_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U"}
                </span>
              )}
            </div>
            {/* Verified badge (optional - can be removed if not needed) */}
            {review?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* User Info */}
          <div>
            <h4 className="font-bold text-neutral-900 text-base mb-0.5">
              {review?.reviewer_name || "Anonymous User"}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-xs text-neutral-500">
                {formatDate(review?.created_at)}
              </p>
              {/* Rating stars inline with name */}
              <div className="flex items-center gap-0.5">
                {renderStars(review?.rating || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Report button moved to top right */}
        <Motion.button
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Flag className="w-3.5 h-3.5" />
        </Motion.button>
      </div>

      {/* Review Content with Quote Styling */}
      <div className="relative">
        {/* Decorative quote mark */}
        <div className="absolute -left-2 -top-2 text-5xl text-primary-100 font-serif leading-none select-none">"</div>
        
        <div className="relative pl-4 pr-2">
          <p className="text-neutral-700 text-[15px] leading-relaxed font-normal">
            {review?.comment || "No comment provided"}
          </p>
        </div>
      </div>

      {/* Optional: Rating breakdown or tags */}
      {review?.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Motion.div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reviewer_name: PropTypes.string,
    reviewer_avatar: PropTypes.string,
    rating: PropTypes.number,
    comment: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
};

export default ReviewCard;

