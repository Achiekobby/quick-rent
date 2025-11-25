import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Eye,
  Star,
  Calendar,
  User,
  TrendingUp,
  Loader2,
  X,
  Bug,
  Palette,
  Rocket,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import feedbackRequests from "../../api/Admin/FeedbackRequests";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    byCategory: {},
    byRating: {},
  });

  const categories = [
    { id: "ui", label: "User Interface", icon: <Palette className="w-4 h-4" />, color: "purple" },
    { id: "features", label: "Features", icon: <Rocket className="w-4 h-4" />, color: "blue" },
    { id: "performance", label: "Performance", icon: <Zap className="w-4 h-4" />, color: "yellow" },
    { id: "bugs", label: "Bugs & Issues", icon: <Bug className="w-4 h-4" />, color: "red" },
    { id: "other", label: "Other", icon: <MessageSquare className="w-4 h-4" />, color: "gray" },
  ];

  // Fetch feedbacks
  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await feedbackRequests.getFeedbacks();
      
      if (!response.data.in_error && response?.data?.status_code === "000") {
        const data = response.data?.data || {};
        const feedbacksData = Array.isArray(data) 
          ? data 
          : Object.values(data).map((feedback, index) => ({
              ...feedback,
              id: feedback.feedback_id || feedback.id || index,
              created_at: feedback.timestamps?.created_at || feedback.created_at,
              updated_at: feedback.timestamps?.updated_at || feedback.updated_at,
            }));
        setFeedbacks(feedbacksData);
        calculateStats(feedbacksData);
      } else {
        toast.error(response.data?.reason || "Failed to fetch feedbacks");
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbacksData) => {
    const total = feedbacksData.length;
    const ratings = feedbacksData.map((f) => parseInt(f.rating) || 0);
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    const byCategory = {};
    const byRating = {};

    feedbacksData.forEach((feedback) => {
      const category = feedback.category || "other";
      byCategory[category] = (byCategory[category] || 0) + 1;

      const rating = feedback.rating || "0";
      byRating[rating] = (byRating[rating] || 0) + 1;
    });

    setStats({
      total,
      averageRating: parseFloat(averageRating),
      byCategory,
      byRating,
    });
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...feedbacks];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((feedback) => feedback.category === selectedCategory);
    }

    // Filter by rating
    if (selectedRating !== "all") {
      filtered = filtered.filter((feedback) => feedback.rating === selectedRating);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (feedback) =>
          feedback.landlord?.full_name?.toLowerCase().includes(query) ||
          feedback.landlord?.business_name?.toLowerCase().includes(query) ||
          feedback.message?.toLowerCase().includes(query) ||
          feedback.suggestions?.toLowerCase().includes(query) ||
          feedback.category?.toLowerCase().includes(query)
      );
    }

    setFilteredFeedbacks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [feedbacks, selectedCategory, selectedRating, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

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

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId) || categories[categories.length - 1];
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseInt(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= numRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header */}
        <Motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Landlord Feedback Management
              </h1>
              <p className="text-gray-600 text-lg">
                Review and manage feedback from landlords
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Feedbacks</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-yellow-100 text-sm mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{stats.averageRating}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= Math.round(stats.averageRating)
                        ? "fill-white text-white"
                        : "text-yellow-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <User className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-green-100 text-sm mb-1">Unique Landlords</p>
            <p className="text-3xl font-bold">
              {new Set(feedbacks.map(f => f.landlord?.id || f.landlord?.landlord_slug || f.landlord_id)).size}
            </p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-purple-100 text-sm mb-1">This Month</p>
            <p className="text-3xl font-bold">
              {feedbacks.filter((f) => {
                const feedbackDate = moment(f.created_at);
                return feedbackDate.isSame(moment(), 'month');
              }).length}
            </p>
          </Motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search feedbacks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedFeedbacks.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No feedbacks found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery || selectedCategory !== "all" || selectedRating !== "all"
                  ? "Try adjusting your filters"
                  : "No feedbacks yet. Feedbacks will appear here when landlords submit them"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {paginatedFeedbacks.map((feedback, index) => {
                  const categoryInfo = getCategoryInfo(feedback.category);
                  const landlord = feedback.landlord || {};
                  
                  return (
                    <Motion.div
                      key={feedback.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {landlord.full_name?.[0]?.toUpperCase() || 
                               landlord.business_name?.[0]?.toUpperCase() || 
                               "L"}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-800">
                                  {landlord.full_name || landlord.business_name || "Unknown Landlord"}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  categoryInfo.color === "purple" ? "bg-purple-100 text-purple-700" :
                                  categoryInfo.color === "blue" ? "bg-blue-100 text-blue-700" :
                                  categoryInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                                  categoryInfo.color === "red" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  <span className="flex items-center gap-1">
                                    {categoryInfo.icon}
                                    {categoryInfo.label}
                                  </span>
                                </span>
                              </div>

                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {renderStars(feedback.rating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {moment(feedback.created_at).fromNow()}
                                </span>
                              </div>

                              {/* Message Preview */}
                              <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                                {feedback.message}
                              </p>

                              {/* Suggestions if available */}
                              {feedback.suggestions && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-xs font-medium text-blue-800 mb-1">
                                    Suggestions:
                                  </p>
                                  <p className="text-xs text-blue-700 line-clamp-1">
                                    {feedback.suggestions}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(feedback)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredFeedbacks.length)} of{" "}
                    {filteredFeedbacks.length} feedbacks
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {getPageNumbers().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof page === "number" && setCurrentPage(page)}
                        disabled={page === "..."}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-orange-500 text-white"
                            : page === "..."
                            ? "cursor-default"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedFeedback && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDetailModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <Motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden z-10"
              >
                <div className="p-6 overflow-y-auto max-h-[90vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                        {(selectedFeedback.landlord?.full_name?.[0] || 
                          selectedFeedback.landlord?.business_name?.[0] || 
                          "L").toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedFeedback.landlord?.full_name || 
                           selectedFeedback.landlord?.business_name || 
                           "Unknown Landlord"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {moment(selectedFeedback.created_at).format("MMMM DD, YYYY [at] h:mm A")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedFeedback.rating)}
                      <span className="text-lg font-semibold text-gray-800 ml-2">
                        {selectedFeedback.rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Category
                    </label>
                    {(() => {
                      const catInfo = getCategoryInfo(selectedFeedback.category);
                      return (
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                          catInfo.color === "purple" ? "bg-purple-100 text-purple-700" :
                          catInfo.color === "blue" ? "bg-blue-100 text-blue-700" :
                          catInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                          catInfo.color === "red" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {catInfo.icon}
                          {catInfo.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Feedback Message
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedFeedback.comment}
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {selectedFeedback.suggestions && (
                    <div className="mb-6">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Suggestions for Improvement
                      </label>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-blue-900 whitespace-pre-wrap">
                          {selectedFeedback.suggestions}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Landlord Info */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Landlord Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">
                          {selectedFeedback.landlord?.full_name || 
                           selectedFeedback.landlord?.business_name || 
                           "N/A"}
                        </p>
                      </div>
                      {selectedFeedback.landlord?.email && (
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {selectedFeedback.landlord.email}
                          </p>
                        </div>
                      )}
                      {selectedFeedback.landlord?.phone && (
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">
                            {selectedFeedback.landlord.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default FeedbackManagement;

