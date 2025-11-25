import { useState, useEffect } from "react";
import { Star, MessageSquare, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import EmptyState from "./EmptyState";
import ConfirmModal from "./ConfirmModal";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Colors from "../../utils/Colors";
import reviewsRequests from "../../api/Renter/General/ReviewsRequests";

const ReviewsSection = ({
  landlordName,
  initialReviews = [],
  propertySlug,
  onReviewAdded,
  onReviewDeleted,
}) => {
  const { user } = useAuthStore();
  // Filter to only show approved reviews
  const approvedReviews = initialReviews.filter(
    (review) => review.is_approved === true
  );
  const [reviews, setReviews] = useState(approvedReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync reviews when initialReviews changes (e.g., after refetch)
  useEffect(() => {
    const approvedReviews = initialReviews.filter(
      (review) => review.is_approved === true
    );
    setReviews(approvedReviews);
    // Reset display count when reviews are refetched
    setDisplayCount(5);
  }, [initialReviews]);

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
      let response;
      if (editingReview) {
        // Update existing review
        response = await reviewsRequests.updateReview(
          editingReview.review_slug || editingReview.id,
          { property_slug: propertySlug, ...reviewData }
        );
        if (response.status && !response.data?.in_error) {
          const updatedReview = response.data?.data;

          if (response.data?.status_code === "000") {
            // Replace the existing review
            if (updatedReview) {
              setReviews((prevReviews) => {
                // Helper function to check if two reviews are the same
                const isSameReview = (r1, r2) => {
                  if (
                    r1.review_slug &&
                    r2.review_slug &&
                    r1.review_slug === r2.review_slug
                  ) {
                    return true;
                  }
                  // Secondary match: id
                  if (r1.id && r2.id && String(r1.id) === String(r2.id)) {
                    return true;
                  }
                  if (
                    r1.review_slug &&
                    r2.id &&
                    r1.review_slug === String(r2.id)
                  ) {
                    return true;
                  }
                  if (
                    r1.id &&
                    r2.review_slug &&
                    String(r1.id) === r2.review_slug
                  ) {
                    return true;
                  }
                  return false;
                };

                // Try to match by the updated review's identifiers first (most reliable)
                let foundIndex = prevReviews.findIndex((r) =>
                  isSameReview(r, updatedReview)
                );

                if (foundIndex === -1) {
                  foundIndex = prevReviews.findIndex((r) =>
                    isSameReview(r, editingReview)
                  );
                }

                // Remove ALL reviews that match (to handle duplicates)
                const filteredReviews = prevReviews.filter((r) => {
                  const isMatch =
                    isSameReview(r, updatedReview) ||
                    isSameReview(r, editingReview);
                  return !isMatch;
                });

                if (foundIndex !== -1 && foundIndex < prevReviews.length) {
                  const newReviews = [...filteredReviews];
                  newReviews.splice(
                    Math.min(foundIndex, newReviews.length),
                    0,
                    updatedReview
                  );

                  const reviewSlugs = newReviews.map(
                    (r) => r.review_slug || r.id
                  );
                  const uniqueSlugs = new Set(reviewSlugs);
                  if (reviewSlugs.length !== uniqueSlugs.size) {
                    const seen = new Set();
                    return newReviews.filter((r) => {
                      const slug = r.review_slug || r.id;
                      if (seen.has(slug)) {
                        return false;
                      }
                      seen.add(slug);
                      return true;
                    });
                  }

                  return newReviews;
                } else {
                  return [updatedReview, ...filteredReviews];
                }
              });
            }
            toast.success(
              response.data?.reason || "Review updated successfully!"
            );
            setEditingReview(null);
            setShowReviewForm(false);
          } else if (response.data?.status_code === "001") {
            // This shouldn't happen on update, but handle it as a new review
            toast.success(
              response.data?.reason || "Review created successfully!"
            );
            if (updatedReview && updatedReview.is_approved === true) {
              // Remove the old review and add the new one
              setReviews((prevReviews) => {
                const isSameReview = (r1, r2) => {
                  if (
                    r1.review_slug &&
                    r2.review_slug &&
                    r1.review_slug === r2.review_slug
                  ) {
                    return true;
                  }
                  if (r1.id && r2.id && String(r1.id) === String(r2.id)) {
                    return true;
                  }
                  if (
                    r1.review_slug &&
                    r2.id &&
                    r1.review_slug === String(r2.id)
                  ) {
                    return true;
                  }
                  if (
                    r1.id &&
                    r2.review_slug &&
                    String(r1.id) === r2.review_slug
                  ) {
                    return true;
                  }
                  return false;
                };

                return prevReviews
                  .filter((r) => !isSameReview(r, editingReview))
                  .concat([updatedReview]);
              });
            }
            setEditingReview(null);
            setShowReviewForm(false);
          } else {
            toast.error(
              response.data?.reason ||
                response.message ||
                "Failed to update review"
            );
          }
        } else {
          toast.error(
            response.data?.reason ||
              response.message ||
              "Failed to update review"
          );
        }
      } else {
        // Create new review
        response = await reviewsRequests.storeReview({
          property_slug: propertySlug,
          ...reviewData,
        });
        if (
          response.status &&
          response.data?.status_code === "001" &&
          !response.data?.in_error
        ) {
          toast.success(
            response.data?.reason || "Review submitted successfully!"
          );
          const newReview = response.data?.data;
          if (newReview) {
            if (newReview.is_approved === true) {
              setReviews([newReview, ...reviews]);
            }
          }
          setShowReviewForm(false);
          setDisplayCount(5);
          
          if (onReviewAdded) {
            onReviewAdded();
          }
        } else {
          toast.error(
            response.data?.reason ||
              response.message ||
              "Failed to submit review"
          );
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        editingReview
          ? "Failed to update review. Please try again."
          : "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const response = await reviewsRequests.deleteReview(
        reviewToDelete.review_slug || reviewToDelete.id
      );
      if (
        response.status &&
        (response.data?.status_code === "001" ||
          response.data?.status_code === "000") &&
        !response.data?.in_error
      ) {
        toast.success(response.data?.reason || "Review deleted successfully!");
        setReviews(
          reviews.filter(
            (r) =>
              r.review_slug !== reviewToDelete.review_slug &&
              r.id !== reviewToDelete.id
          )
        );
        setDeleteModalOpen(false);
        setReviewToDelete(null);
        
        // Refetch property details to get updated review statistics
        if (onReviewDeleted) {
          onReviewDeleted();
        }
      } else {
        toast.error(
          response.data?.reason || response.message || "Failed to delete review"
        );
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
  };

  const handleLoadMore = () => {
    const previousCount = displayCount;
    setDisplayCount((prev) => prev + 5);
    
    // Smooth scroll to the newly loaded reviews after a short delay
    setTimeout(() => {
      const element = document.getElementById(`review-${previousCount}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleShowLess = () => {
    setDisplayCount(5);
    // Scroll to top of reviews section
    setTimeout(() => {
      const element = document.getElementById('reviews-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Sort reviews by most recent first (by created_at date)
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.created_at || a.updated_at || 0);
    const dateB = new Date(b.created_at || b.updated_at || 0);
    return dateB - dateA; // Most recent first
  });

  // Calculate stats and pagination
  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();
  const displayedReviews = sortedReviews.slice(0, displayCount);
  const hasMoreReviews = sortedReviews.length > displayCount;
  const canShowLess = displayCount > 5;
  const totalReviews = sortedReviews.length;

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


  return (
    <Motion.section
      id="reviews-section"
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
          className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Left: Average Rating - Compact */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {averageRating}
                </div>
                <div className="flex gap-0.5 mb-1">
                  {renderStars(averageRating, "w-4 h-4")}
                </div>
                <p className="text-xs text-neutral-600 font-medium">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {/* Right: Rating Distribution - Compact */}
            <div className="flex-1">
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((starCount) => (
                  <div key={starCount} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-10">
                      <span className="text-xs font-semibold text-neutral-600">
                        {starCount}
                      </span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <Motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${ratingDistribution[starCount] > 0 ? (ratingDistribution[starCount] / totalReviews) * 100 : 0}%` }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          delay: starCount * 0.05,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 w-8 text-right">
                      {ratingDistribution[starCount]}
                    </span>
                  </div>
                ))}
              </div>
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
                backgroundColor: "#fff7ed",
                borderColor: "#fb923c",
              }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-base text-orange-700">
                Write a Review
              </span>
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
                  initialData={
                    editingReview
                      ? {
                          rating: editingReview.rating,
                          comment: editingReview.comment,
                        }
                      : null
                  }
                  onCancel={editingReview ? handleCancelEdit : undefined}
                />
                {!editingReview && (
                  <Motion.button
                    onClick={() => setShowReviewForm(false)}
                    className="mt-3 text-sm text-neutral-600 hover:text-neutral-900"
                    whileHover={{ scale: 1.02 }}
                  >
                    Cancel
                  </Motion.button>
                )}
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
                  key={review.review_slug || review.id}
                  id={`review-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.08 },
                  }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ReviewCard
                    review={review}
                    currentUserSlug={user?.user_slug}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteClick}
                  />
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          <Motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {hasMoreReviews && (
              <Motion.button
                onClick={handleLoadMore}
                className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>
                  Load More ({sortedReviews.length - displayCount} remaining)
                </span>
                <ChevronDown className="w-5 h-5" />
              </Motion.button>
            )}
            
            {canShowLess && (
              <Motion.button
                onClick={handleShowLess}
                className="px-8 py-4 rounded-xl font-semibold border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Show Less</span>
                <ChevronUp className="w-5 h-5" />
              </Motion.button>
            )}
          </Motion.div>
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
                ? `Be the first to share your experience with ${
                    landlordName || "this landlord"
                  }!`
                : `Login to be the first to leave a review for ${
                    landlordName || "this landlord"
                  }.`
            }
            actionText={user ? "Write a Review" : undefined}
            onActionClick={user ? () => setShowReviewForm(true) : undefined}
            showAction={!!user}
          />
        </Motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Review?"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Review"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </Motion.section>
  );
};

ReviewsSection.propTypes = {
  landlordName: PropTypes.string,
  initialReviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      review_slug: PropTypes.string,
      reviewer_slug: PropTypes.string,
      reviewer_name: PropTypes.string,
      reviewer_avatar: PropTypes.string,
      rating: PropTypes.number,
      comment: PropTypes.string,
      created_at: PropTypes.string,
      is_approved: PropTypes.bool,
      reviewer: PropTypes.shape({
        slug: PropTypes.string,
        full_name: PropTypes.string,
        profile_picture: PropTypes.string,
      }),
    })
  ),
  propertySlug: PropTypes.string.isRequired,
  onReviewAdded: PropTypes.func,
  onReviewDeleted: PropTypes.func,
};

export default ReviewsSection;
