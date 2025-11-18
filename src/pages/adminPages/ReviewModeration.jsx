import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  TrendingUp,
  Activity,
  Mail,
  X,
  Send,
  Ban,
  ShieldCheck,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import reviewRequests from "../../api/Admin/ReviewRequests";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewRequests.getAllReviews();
      
      if (!response.in_error) {
        const reviewsData = response.data?.reviews || [];
        setReviews(reviewsData);
        calculateStats(reviewsData);
      } else {
        toast.error(response.reason || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const stats = {
      total: reviewsData.length,
      pending: reviewsData.filter((r) => r.status === "pending").length,
      approved: reviewsData.filter((r) => r.status === "approved").length,
      rejected: reviewsData.filter((r) => r.status === "rejected").length,
    };
    setStats(stats);
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...reviews];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((review) => review.status === selectedStatus);
    }

    // Filter by rating
    if (selectedRating !== "all") {
      filtered = filtered.filter((review) => review.rating === parseInt(selectedRating));
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.reviewer_name?.toLowerCase().includes(query) ||
          review.landlord_name?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.review_id?.toString().includes(query)
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, selectedStatus, selectedRating, searchQuery]);

  const handleAction = async () => {
    if (!actionType || !selectedReview) return;
    
    if (actionType === 'reject' && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        review_id: selectedReview.id,
        action: actionType,
        rejection_reason: actionType === 'reject' ? rejectionReason : null,
      };

      const response = await reviewRequests.moderateReview(payload);
      
      if (!response.in_error) {
        toast.success(`Review ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        setShowActionModal(false);
        setRejectionReason("");
        setActionType(null);
        fetchReviews();
      } else {
        toast.error(response.reason || "Failed to moderate review");
      }
    } catch (error) {
      console.error("Error moderating review:", error);
      toast.error("Failed to moderate review");
    } finally {
      setActionLoading(false);
    }
  };


  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
        icon: Clock,
        label: "Pending Review",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "bg-green-100 text-green-700 border-green-300";
    if (rating >= 3) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header */}
        <Motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
              Review Moderation
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Approve or reject landlord reviews
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <Motion.button
              onClick={fetchReviews}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingUp className="w-5 h-5" />
              Refresh Data
            </Motion.button>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reviews", value: stats.total, icon: MessageSquare, color: "from-gray-500 to-gray-600" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-rose-500" },
          ].map((stat, index) => (
            <Motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </Motion.div>
          ))}
        </div>

        {/* Filters */}
        <Motion.div
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>
        </Motion.div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Motion.div
              className="bg-white rounded-2xl p-12 text-center shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== "all" || selectedRating !== "all"
                  ? "Try adjusting your filters"
                  : "No reviews have been submitted yet"}
              </p>
            </Motion.div>
          ) : (
            filteredReviews.map((review, index) => (
              <Motion.div
                key={review.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-l-4 border-l-orange-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md">
                          <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Review #{review.review_id || review.id}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getRatingColor(review.rating)}`}>
                              {review.rating}/5
                            </span>
                            {getStatusBadge(review.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reviewer & Landlord Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Reviewer</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{review.reviewer_name}</span>
                        </div>
                        {review.reviewer_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{review.reviewer_email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{moment(review.created_at).format("MMM DD, YYYY")}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Landlord</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{review.landlord_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Comment Preview */}
                    <div className="pl-16">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {review.comment}
                      </p>
                    </div>

                    {/* Rejection Reason */}
                    {review.status === "rejected" && review.rejection_reason && (
                      <div className="pl-16 bg-red-50 rounded-xl p-4 border border-red-200">
                        <p className="text-sm font-bold text-red-900 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{review.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Motion.button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 lg:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      View Full
                    </Motion.button>

                    {review.status === "pending" && (
                      <>
                        <Motion.button
                          onClick={() => {
                            setSelectedReview(review);
                            setActionType("approve");
                            setShowActionModal(true);
                          }}
                          className="flex-1 lg:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Motion.button>

                        <Motion.button
                          onClick={() => {
                            setSelectedReview(review);
                            setActionType("reject");
                            setShowActionModal(true);
                          }}
                          className="flex-1 lg:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Motion.button>
                      </>
                    )}
                  </div>
                </div>
              </Motion.div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedReview && (
            <Motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
            >
              <Motion.div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-6 rounded-t-3xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                        <Star className="w-8 h-8 text-white fill-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Review Details</h2>
                        <p className="text-orange-100 text-sm mt-1">
                          Review #{selectedReview.review_id || selectedReview.id}
                        </p>
                      </div>
                    </div>
                    <Motion.button
                      onClick={() => setShowDetailModal(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-6 h-6 text-white" />
                    </Motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Status & Rating */}
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedReview.status)}
                    <div className="flex items-center gap-2">
                      {renderStars(selectedReview.rating)}
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRatingColor(selectedReview.rating)}`}>
                        {selectedReview.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Reviewer Info */}
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Reviewer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{selectedReview.reviewer_name}</span>
                      </div>
                      {selectedReview.reviewer_email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{selectedReview.reviewer_email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{moment(selectedReview.created_at).format("MMMM DD, YYYY HH:mm")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Landlord Info */}
                  <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Landlord Being Reviewed</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-gray-900">{selectedReview.landlord_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Review Comment</h3>
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-6xl text-orange-200 font-serif">"</div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-8 pt-4">{selectedReview.comment}</p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedReview.status === "rejected" && selectedReview.rejection_reason && (
                    <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Rejection Reason</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Action Modal */}
        <AnimatePresence>
          {showActionModal && selectedReview && (
            <Motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setShowActionModal(false)}
            >
              <Motion.div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`px-8 py-6 rounded-t-3xl ${
                  actionType === 'approve' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {actionType === 'approve' ? 'Approve Review' : 'Reject Review'}
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        Review #{selectedReview.review_id || selectedReview.id}
                      </p>
                    </div>
                    {!actionLoading && (
                      <Motion.button
                        onClick={() => setShowActionModal(false)}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-6 h-6 text-white" />
                      </Motion.button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {actionType === 'approve' ? (
                    <div className="mb-6 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-700">
                        This review will be publicly visible on the landlord's profile.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Reason for Rejection *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="6"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all text-gray-700 placeholder:text-gray-400"
                        placeholder="Provide a detailed reason for rejecting this review (profanity, spam, offensive content, etc.)"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Motion.button
                      onClick={handleAction}
                      disabled={actionLoading || (actionType === 'reject' && !rejectionReason.trim())}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                        actionType === 'approve' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                          : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                      }`}
                      whileHover={!actionLoading && (actionType === 'approve' || rejectionReason.trim()) ? { scale: 1.02 } : {}}
                      whileTap={!actionLoading && (actionType === 'approve' || rejectionReason.trim()) ? { scale: 0.98 } : {}}
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</span>
                        </>
                      )}
                    </Motion.button>

                    {!actionLoading && (
                      <Motion.button
                        onClick={() => {
                          setShowActionModal(false);
                          setRejectionReason("");
                          setActionType(null);
                        }}
                        className="px-6 py-4 rounded-xl font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </Motion.button>
                    )}
                  </div>
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default ReviewModeration;

