import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
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
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewRequests.getReviews();
      console.log("RESPONSE: ", response?.data?.data)
      if (response.data?.status_code === "000") {
        setReviews(response?.data?.data);
        calculateStats(response?.data?.data);
      } else {
        toast.error(response.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const calculateStats = (reviewsData) => {
    const stats = {
      total: reviewsData.length,
      approved: reviewsData.filter((r) => r.is_approved === true).length,
      rejected: reviewsData.filter((r) => r.is_approved === false).length,
    };
    setStats(stats);
  };

  // Helper to get status from is_approved
  const getReviewStatus = (review) => {
    if (review.is_approved === true) return "approved";
    if (review.is_approved === false) return "rejected";
    // Default to approved if undefined/null (since reviews start as approved)
    return "approved";
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...reviews];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (review) => getReviewStatus(review) === selectedStatus
      );
    }

    // Filter by rating
    if (selectedRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(selectedRating)
      );
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.reviewer?.full_name?.toLowerCase().includes(query) ||
          review.property?.details?.landlord?.full_name
            ?.toLowerCase()
            .includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.review_slug?.toLowerCase().includes(query)
      );
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [reviews, selectedStatus, selectedRating, searchQuery]);


  // Pagination calculations
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleAction = async () => {
    if (!actionType || !selectedReview) return;

    setActionLoading(true);
    try {
      const reviewSlug = selectedReview.review_slug;
      const status = actionType === "approve" ? "true" : "false";

      const response = await reviewRequests.updateReviewStatus(
        reviewSlug,
        status
      );

      if (response.status) {
        toast.success(
          `Review ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`
        );
        setShowActionModal(false);
        setActionType(null);
        fetchReviews();
      } else {
        toast.error(response.message || "Failed to moderate review");
      }
    } catch (error) {
      console.error("Error moderating review:", error);
      toast.error("Failed to moderate review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setDeleteLoading(true);
    try {
      const reviewSlug = selectedReview.review_slug;
      const response = await reviewRequests.deleteReview(reviewSlug);

      if (response.status) {
        toast.success("Review deleted successfully");
        setShowDeleteModal(false);
        setSelectedReview(null);
        fetchReviews();
      } else {
        toast.error(response.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
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

    const badge = badges[status] || badges.approved;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
      >
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
              star <= rating
                ? "fill-orange-400 text-orange-400"
                : "text-gray-300"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Reviews",
              value: stats.total,
              icon: MessageSquare,
              color: "from-gray-500 to-gray-600",
            },
            {
              label: "Approved",
              value: stats.approved,
              icon: CheckCircle,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: XCircle,
              color: "from-red-500 to-rose-500",
            },
          ].map((stat, index) => (
            <Motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
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

        {/* Reviews Table */}
        <Motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Reviews Found
              </h3>
              <p className="text-gray-600">
                {searchQuery ||
                selectedStatus !== "all" ||
                selectedRating !== "all"
                  ? "Try adjusting your filters"
                  : "No reviews have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b-2 border-orange-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-orange-600" />
                        Review ID
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reviewer
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Landlord
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedReviews.map((review, index) => {
                    const reviewStatus = getReviewStatus(review);
                    const isApproved = reviewStatus === "approved";
                    const isRejected = reviewStatus === "rejected";

                    return (
                      <Motion.tr
                        key={review.review_slug || review.id}
                        className="group hover:bg-gradient-to-r hover:from-orange-50/30 hover:via-amber-50/20 hover:to-orange-50/30 transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetailModal(true);
                        }}
                      >
                        {/* Review ID */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1 h-10 rounded-r-full ${
                                isApproved
                                  ? "bg-gradient-to-b from-green-400 to-emerald-500"
                                  : isRejected
                                  ? "bg-gradient-to-b from-red-400 to-rose-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                #{review.review_slug?.slice(0, 8) || review.id}
                              </div>
                              {review.property?.details?.title && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">
                                    {review.property.details.title}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Reviewer */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            {review.reviewer?.profile_picture ? (
                              <img
                                src={review.reviewer.profile_picture}
                                alt={review.reviewer.full_name}
                                className="w-7 h-7 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold border-2 border-orange-200 flex-shrink-0 ${
                                review.reviewer?.profile_picture ? "hidden" : ""
                              }`}
                            >
                              {review.reviewer?.full_name?.charAt(0) || "R"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {review.reviewer?.full_name || "Unknown"}
                              </div>
                              {review.reviewer?.email && (
                                <div className="text-xs text-gray-500 truncate">
                                  {review.reviewer.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Landlord */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {review.property?.details?.landlord
                                  ?.full_name || "Unknown"}
                              </div>
                              {review.property?.details?.landlord
                                ?.business_name && (
                                <div className="text-xs text-gray-500 truncate">
                                  {
                                    review.property.details.landlord
                                      .business_name
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getRatingColor(
                                review.rating
                              )}`}
                            >
                              {review.rating}/5
                            </span>
                          </div>
                        </td>

                        {/* Comment */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                            {review.comment}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          {getStatusBadge(reviewStatus)}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {moment(
                                  review.timestamps?.created_at ||
                                    review.created_at
                                ).format("MMM DD, YYYY")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {moment(
                                  review.timestamps?.created_at ||
                                    review.created_at
                                ).format("HH:mm")}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div
                            className="flex items-center justify-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Motion.button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowDetailModal(true);
                              }}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Motion.button>

                            {/* Show reject button for approved reviews */}
                            {isApproved && (
                              <Motion.button
                                onClick={() => {
                                  setSelectedReview(review);
                                  setActionType("reject");
                                  setShowActionModal(true);
                                }}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Reject Review"
                              >
                                <XCircle className="w-4 h-4" />
                              </Motion.button>
                            )}

                            {/* Show approve and delete buttons for rejected reviews */}
                            {isRejected && (
                              <>
                                <Motion.button
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setActionType("approve");
                                    setShowActionModal(true);
                                  }}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Approve Review"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Motion.button>
                                <Motion.button
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Delete Review"
                                >
                                  <Ban className="w-4 h-4" />
                                </Motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </Motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredReviews.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Show:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm font-medium bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    of {filteredReviews.length} reviews
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <Motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </Motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <Motion.button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            currentPage === page
                              ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg scale-105"
                              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                          }`}
                          whileHover={
                            currentPage !== page ? { scale: 1.05 } : {}
                          }
                          whileTap={currentPage !== page ? { scale: 0.95 } : {}}
                        >
                          {page}
                        </Motion.button>
                      )
                    )}
                  </div>

                  <Motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={
                      currentPage !== totalPages ? { scale: 1.05 } : {}
                    }
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </Motion.button>
                </div>

                {/* Page Info */}
                <div className="text-sm text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          )}
        </Motion.div>

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
                        <h2 className="text-2xl font-black text-white">
                          Review Details
                        </h2>
                        <p className="text-orange-100 text-sm mt-1">
                          Review #
                          {selectedReview.review_id || selectedReview.id}
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
                    {getStatusBadge(getReviewStatus(selectedReview))}
                    <div className="flex items-center gap-2">
                      {renderStars(selectedReview.rating)}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold border ${getRatingColor(
                          selectedReview.rating
                        )}`}
                      >
                        {selectedReview.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Reviewer Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Reviewer Information
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {selectedReview.reviewer?.profile_picture ? (
                          <img
                            src={selectedReview.reviewer.profile_picture}
                            alt={selectedReview.reviewer.full_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold border-2 border-blue-200 ${
                            selectedReview.reviewer?.profile_picture
                              ? "hidden"
                              : ""
                          }`}
                        >
                          {selectedReview.reviewer?.full_name?.charAt(0) || "R"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {selectedReview.reviewer?.full_name || "Unknown"}
                          </p>
                          {selectedReview.reviewer?.gender && (
                            <p className="text-xs text-gray-500">
                              {selectedReview.reviewer.gender}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedReview.reviewer?.email && (
                        <div className="flex items-center gap-3 ml-13">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {selectedReview.reviewer.email}
                          </span>
                        </div>
                      )}
                      {selectedReview.reviewer?.phone_number && (
                        <div className="flex items-center gap-3 ml-13">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {selectedReview.reviewer.phone_number}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 ml-13">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">
                          {moment(
                            selectedReview.timestamps?.created_at ||
                              selectedReview.created_at
                          ).format("MMMM DD, YYYY HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Landlord Info */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Landlord Being Reviewed
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-orange-600" />
                        <span className="font-bold text-gray-900 text-lg">
                          {selectedReview.property?.details?.landlord
                            ?.full_name || "Unknown"}
                        </span>
                      </div>
                      {selectedReview.property?.details?.landlord
                        ?.business_name && (
                        <div className="ml-8">
                          <p className="text-sm font-semibold text-gray-500 mb-1">
                            Business
                          </p>
                          <p className="text-gray-700">
                            {
                              selectedReview.property.details.landlord
                                .business_name
                            }
                          </p>
                          {selectedReview.property.details.landlord
                            .business_type && (
                            <p className="text-xs text-gray-500 mt-1">
                              {
                                selectedReview.property.details.landlord
                                  .business_type
                              }
                            </p>
                          )}
                        </div>
                      )}
                      {selectedReview.property?.details?.landlord?.email && (
                        <div className="flex items-center gap-3 ml-8">
                          <Mail className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">
                            {selectedReview.property.details.landlord.email}
                          </span>
                        </div>
                      )}
                      {selectedReview.property?.details?.landlord
                        ?.phone_number && (
                        <div className="flex items-center gap-3 ml-8">
                          <Phone className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">
                            {
                              selectedReview.property.details.landlord
                                .phone_number
                            }
                          </span>
                        </div>
                      )}
                      {selectedReview.property?.details?.landlord?.location && (
                        <div className="flex items-start gap-3 ml-8">
                          <MapPin className="w-4 h-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-gray-700">
                              {
                                selectedReview.property.details.landlord
                                  .location
                              }
                            </p>
                            {selectedReview.property.details.landlord
                              .region && (
                              <p className="text-xs text-gray-500">
                                {
                                  selectedReview.property.details.landlord
                                    .region
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Info */}
                  {selectedReview.property?.details && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Property Information
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg mb-1">
                            {selectedReview.property.details.title}
                          </p>
                          {selectedReview.property.details.property_type && (
                            <p className="text-sm text-gray-600">
                              {selectedReview.property.details.property_type}
                            </p>
                          )}
                        </div>
                        {(selectedReview.property.details.location ||
                          selectedReview.property.details.suburb ||
                          selectedReview.property.details.district) && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-700">
                                {[
                                  selectedReview.property.details.location,
                                  selectedReview.property.details.suburb,
                                  selectedReview.property.details.district,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                              {selectedReview.property.details.landmark && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Near:{" "}
                                  {selectedReview.property.details.landmark}
                                </p>
                              )}
                              {selectedReview.property.details.region && (
                                <p className="text-xs text-gray-500">
                                  {selectedReview.property.details.region}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedReview.property.details.price && (
                          <div className="ml-8">
                            <p className="text-sm font-semibold text-gray-500 mb-1">
                              Price
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              ₵
                              {parseFloat(
                                selectedReview.property.details.price
                              ).toLocaleString()}
                              <span className="text-sm font-normal text-gray-500">
                                /month
                              </span>
                            </p>
                          </div>
                        )}
                        {selectedReview.property?.images &&
                          selectedReview.property.images.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-500 mb-2">
                                Property Images
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {selectedReview.property.images
                                  .slice(0, 3)
                                  .map((image, idx) => (
                                    <div
                                      key={image.id || idx}
                                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-200"
                                    >
                                      <img
                                        src={image.image_path || image.url}
                                        alt={`Property ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      {image.is_featured && (
                                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                          Featured
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Review Comment
                    </h3>
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-6xl text-orange-200 font-serif">
                        "
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-8 pt-4">
                        {selectedReview.comment}
                      </p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {getReviewStatus(selectedReview) === "rejected" &&
                    selectedReview.rejection_reason && (
                      <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Rejection Reason
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedReview.rejection_reason}
                        </p>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                    {/* Show reject button for approved reviews */}
                    {getReviewStatus(selectedReview) === "approved" && (
                      <Motion.button
                        onClick={() => {
                          setShowDetailModal(false);
                          setActionType("reject");
                          setShowActionModal(true);
                        }}
                        className="flex-1 py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Review
                      </Motion.button>
                    )}

                    {/* Show approve and delete buttons for rejected reviews */}
                    {getReviewStatus(selectedReview) === "rejected" && (
                      <>
                        <Motion.button
                          onClick={() => {
                            setShowDetailModal(false);
                            setActionType("approve");
                            setShowActionModal(true);
                          }}
                          className="flex-1 py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Re-approve
                        </Motion.button>
                        <Motion.button
                          onClick={() => {
                            setShowDetailModal(false);
                            setShowDeleteModal(true);
                          }}
                          className="flex-1 py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 transition-all shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Ban className="w-5 h-5" />
                          Delete Review
                        </Motion.button>
                      </>
                    )}
                  </div>
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
                <div
                  className={`px-8 py-6 rounded-t-3xl ${
                    actionType === "approve"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-red-500 to-rose-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {actionType === "approve"
                          ? "Approve Review"
                          : "Reject Review"}
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        Review #
                        {selectedReview.review_slug?.slice(0, 8) ||
                          selectedReview.id}
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
                  {actionType === "approve" ? (
                    <div className="mb-6 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-700">
                        This review will be publicly visible on the landlord's
                        profile.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 text-center">
                      <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-gray-700">
                        This review will be rejected and hidden from the landlord's
                        profile.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Motion.button
                      onClick={handleAction}
                      disabled={actionLoading}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                        actionType === "approve"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                      }`}
                      whileHover={
                        !actionLoading ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        !actionLoading ? { scale: 0.98 } : {}
                      }
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>
                            Confirm{" "}
                            {actionType === "approve"
                              ? "Approval"
                              : "Rejection"}
                          </span>
                        </>
                      )}
                    </Motion.button>

                    {!actionLoading && (
                      <Motion.button
                        onClick={() => {
                          setShowActionModal(false);
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

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && selectedReview && (
            <Motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleteLoading && setShowDeleteModal(false)}
            >
              <Motion.div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-8 py-6 rounded-t-3xl bg-gradient-to-r from-red-500 to-rose-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        Delete Review
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        Review #
                        {selectedReview.review_slug?.slice(0, 8) ||
                          selectedReview.id}
                      </p>
                    </div>
                    {!deleteLoading && (
                      <Motion.button
                        onClick={() => setShowDeleteModal(false)}
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
                  <div className="mb-6 text-center">
                    <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold mb-2">
                      Are you sure you want to delete this review?
                    </p>
                    <p className="text-gray-600 text-sm">
                      This action cannot be undone. The review will be
                      permanently removed from the system.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Motion.button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                      whileHover={
                        !deleteLoading ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        !deleteLoading ? { scale: 0.98 } : {}
                      }
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-5 h-5" />
                          <span>Delete Review</span>
                        </>
                      )}
                    </Motion.button>

                    {!deleteLoading && (
                      <Motion.button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setSelectedReview(null);
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
