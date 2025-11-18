import { useState } from "react";
import { Star, MessageSquare, TrendingUp, ChevronDown } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import EmptyState from "./EmptyState";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Colors from "../../utils/Colors";

const ReviewsSection = ({ landlordSlug, landlordName, initialReviews = [] }) => {
  // landlordSlug will be used for API calls when backend is ready
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState(initialReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const handleSubmitReview = async (reviewData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // Example: const response = await submitLandlordReview(landlordSlug, reviewData);
      console.log("Submitting review for landlord:", landlordSlug, reviewData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock success response
      const newReview = {
        id: Date.now(),
        reviewer_name: user?.name || "Current User",
        reviewer_avatar: user?.avatar || null,
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at: new Date().toISOString(),
      };

      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      toast.success("Review submitted successfully!");
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();
  const displayedReviews = reviews.slice(0, displayCount);
  const hasMoreReviews = reviews.length > displayCount;

  const renderStars = (rating, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-neutral-300"
        }`}
      />
    ));
  };

  const renderRatingBar = (starCount) => {
    const count = ratingDistribution[starCount];
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 w-14">
          <span className="text-sm font-bold text-neutral-700">{starCount}</span>
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        </div>
        <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
          <Motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: starCount * 0.1 }}
          />
        </div>
        <span className="text-sm font-semibold text-neutral-700 w-12 text-right">
          {count} {count === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    );
  };

  return (
    <Motion.section
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              Reviews & Ratings
            </h2>
            {landlordName && (
              <p className="text-sm text-neutral-600 mt-0.5 font-medium">
                for <span className="text-orange-600">{landlordName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Overview */}
      {reviews.length > 0 && (
        <Motion.div
          className="bg-gradient-to-br from-white to-primary-50/30 rounded-2xl p-8 shadow-lg border border-primary-100 mb-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Average Rating */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Decorative background circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-20 scale-150"></div>
                
                <div className="relative bg-white rounded-2xl shadow-xl p-8 border-4 border-yellow-400/20">
                  <div className="text-6xl font-black bg-gradient-to-br from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                    {averageRating}
                  </div>
                  <div className="flex gap-1 mb-3 justify-center items-center">
                    {renderStars(averageRating)}
                  </div>
                  <p className="text-sm text-neutral-600 font-medium text-center">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Rating Distribution */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-700 mb-4 uppercase tracking-wide">Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map((starCount) => (
                <div key={starCount}>{renderRatingBar(starCount)}</div>
              ))}
            </div>
          </div>
        </Motion.div>
      )}

      {/* Review Form for Logged-in Users */}
      {user && (
        <div className="mb-8">
          {!showReviewForm ? (
            <Motion.button
              onClick={() => setShowReviewForm(true)}
              className="w-full py-5 px-6 rounded-2xl border-2 border-dashed border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 hover:border-orange-400 transition-all flex items-center justify-center gap-3 text-orange-700 hover:text-orange-800 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: '#fff7ed',
                borderColor: '#fb923c',
              }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-base text-orange-700">Write a Review</span>
            </Motion.button>
          ) : (
            <AnimatePresence>
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ReviewForm
                  onSubmit={handleSubmitReview}
                  isSubmitting={isSubmitting}
                />
                <Motion.button
                  onClick={() => setShowReviewForm(false)}
                  className="mt-3 text-sm text-neutral-600 hover:text-neutral-900"
                  whileHover={{ scale: 1.02 }}
                >
                  Cancel
                </Motion.button>
              </Motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <>
          <div className="space-y-5">
            <AnimatePresence>
              {displayedReviews.map((review, index) => (
                <Motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.08 },
                  }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ReviewCard review={review} />
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {hasMoreReviews && (
            <Motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Motion.button
                onClick={handleLoadMore}
                className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>
                  Load More Reviews ({reviews.length - displayCount} remaining)
                </span>
                <ChevronDown className="w-5 h-5" />
              </Motion.button>
            </Motion.div>
          )}
        </>
      ) : (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100"
        >
          <EmptyState
            icon="alert"
            title="No Reviews Yet"
            description={
              user
                ? `Be the first to share your experience with ${landlordName || "this landlord"}!`
                : `Login to be the first to leave a review for ${landlordName || "this landlord"}.`
            }
            actionText={user ? "Write a Review" : undefined}
            onActionClick={user ? () => setShowReviewForm(true) : undefined}
            showAction={!!user}
          />
        </Motion.div>
      )}
    </Motion.section>
  );
};

ReviewsSection.propTypes = {
  landlordSlug: PropTypes.string.isRequired,
  landlordName: PropTypes.string,
  initialReviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      reviewer_name: PropTypes.string,
      reviewer_avatar: PropTypes.string,
      rating: PropTypes.number,
      comment: PropTypes.string,
      created_at: PropTypes.string,
    })
  ),
};

export default ReviewsSection;

