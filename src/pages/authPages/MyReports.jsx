import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import reportRequests from "../../api/Renter/General/ReportRequests";
import UpdateReportModal from "../../components/Utilities/UpdateReportModal";
import ConfirmModal from "../../components/Utilities/ConfirmModal";

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_investigation: 0,
    resolved: 0,
    dismissed: 0,
  });

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportRequests.getReports();
      if (response.status) {
        // Handle different response structures
        const reportsData = Array.isArray(response.data)
          ? response.data
          : response.data?.reports || response.data?.data || [];
        setReports(reportsData);
        calculateStats(reportsData);
      } else {
        toast.error(response.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData) => {
    const stats = {
      total: reportsData.length,
      pending: reportsData.filter((r) => r.status === "pending").length,
      under_investigation: reportsData.filter(
        (r) => r.status === "under_investigation"
      ).length,
      resolved: reportsData.filter((r) => r.status === "resolved").length,
      dismissed: reportsData.filter((r) => r.status === "dismissed").length,
    };
    setStats(stats);
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...reports];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((report) => report.status === selectedStatus);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.landlord_name?.toLowerCase().includes(query) ||
          report.reason?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query) ||
          report.report_id?.toString().includes(query)
      );
    }

    setFilteredReports(filtered);
  }, [reports, selectedStatus, searchQuery]);

  const handleDelete = async () => {
    if (!selectedReport) return;

    setIsDeleting(true);
    try {
      const response = await reportRequests.deleteReport(
        selectedReport.report_slug || selectedReport.id
      );
      if (response.status) {
        toast.success(response.message || "Report deleted successfully!");
        fetchReports();
        setShowDeleteModal(false);
        setSelectedReport(null);
      } else {
        toast.error(response.message || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateSuccess = () => {
    fetchReports();
    setShowUpdateModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
        icon: Clock,
        label: "Pending",
      },
      under_investigation: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        icon: Eye,
        label: "Investigating",
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
        icon: CheckCircle,
        label: "Resolved",
      },
    };
    return badges[status] || badges.pending;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      fraud: "Fraud or Scam",
      harassment: "Harassment",
      discrimination: "Discrimination",
      unsafe: "Unsafe Property",
      unresponsive: "Unresponsive",
      contract_violation: "Contract Violation",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  const getReasonIcon = (reason) => {
    const icons = {
      fraud: "🚨",
      harassment: "😡",
      discrimination: "⚖️",
      unsafe: "⚠️",
      unresponsive: "📵",
      contract_violation: "📄",
      other: "💬",
    };
    return icons[reason] || "📋";
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your reports...</p>
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
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
              My Reports
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              View and manage your landlord reports
            </p>
          </div>

          <Motion.button
            onClick={fetchReports}
            className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </Motion.button>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Reports",
              value: stats.total,
              icon: FileText,
              color: "from-gray-500 to-gray-600",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "from-yellow-500 to-orange-500",
            },
            {
              label: "Investigating",
              value: stats.under_investigation,
              icon: Eye,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: CheckCircle,
              color: "from-green-500 to-emerald-500",
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
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {stat.label}
              </div>
            </Motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <Motion.div
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by landlord, reason, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_investigation">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </Motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Motion.div
              className="bg-white rounded-2xl p-12 text-center shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {reports.length === 0 ? "No Reports Yet" : "No Reports Found"}
              </h3>
              <p className="text-gray-600">
                {reports.length === 0
                  ? "You haven't submitted any reports yet. Reports you submit will appear here."
                  : "Try adjusting your filters or search query"}
              </p>
            </Motion.div>
          ) : (
            filteredReports.map((report, index) => {
              const statusBadge = getStatusBadge(report.status);
              const StatusIcon = statusBadge.icon;

              const isPending = report.status === "pending";
              const isInvestigating = report.status === "under_investigation";
              const isResolved = report.status === "resolved";
              const isDismissed = report.status === "dismissed";

              return (
                <Motion.div
                  key={report.report_slug || report.id}
                  className="group bg-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-red-200 overflow-hidden relative backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  {/* Animated Gradient accent bar */}
                  <Motion.div 
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    style={{ transformOrigin: "left" }}
                  />
                  
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 via-orange-50/0 to-red-50/0 group-hover:from-red-50/30 group-hover:via-orange-50/20 group-hover:to-red-50/30 transition-all duration-500 pointer-events-none rounded-2xl" />

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    {/* Left Section */}
                    <div className="flex-1 space-y-2.5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Motion.div
                            className="p-2.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-md flex-shrink-0 ring-2 ring-red-100 group-hover:ring-red-300 transition-all"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Flag className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </Motion.div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                Report #{report.report_id || report.id}
                              </h3>
                              <Motion.span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                                whileHover={{ scale: 1.05 }}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusBadge.label}
                              </Motion.span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium truncate max-w-[120px] md:max-w-none">
                                  {report.landlord.full_name.length > 15
                                    ? report.landlord.full_name.substring(
                                        0,
                                        10
                                      ) + "..."
                                    : report.landlord.full_name ||
                                      "Unknown Landlord"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  {moment(report.created_at).format(
                                    "MMM DD, YYYY"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <Motion.div
                        className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-2.5 border border-gray-200 hover:border-gray-300 transition-all"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Motion.span
                            className="text-xl md:text-2xl"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          >
                            {getReasonIcon(report.reason)}
                          </Motion.span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-bold text-gray-700">
                              {getReasonLabel(report.reason)}
                            </p>
                            {report.reason === "other" &&
                              report.custom_reason && (
                                <p className="text-xs text-gray-600 mt-0.5 italic line-clamp-1">
                                  {report.custom_reason}
                                </p>
                              )}
                          </div>
                        </div>
                      </Motion.div>

                      {/* Timeline Tracker */}
                      <Motion.div 
                        className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl p-3 border-2 border-gray-200/50 shadow-inner backdrop-blur-sm relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        {/* Animated background shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="flex items-center justify-between relative py-1.5">
                          {/* Animated Timeline Line */}
                          <div className="absolute top-4 left-0 right-0 h-1.5 bg-gray-200/60 rounded-full z-0 hidden sm:block overflow-hidden shadow-inner">
                            <Motion.div
                              className="h-full rounded-full relative"
                              initial={{ width: 0 }}
                              animate={{
                                width:
                                  isResolved || isDismissed
                                    ? "100%"
                                    : isInvestigating
                                    ? "66%"
                                    : "33%",
                                background:
                                  isResolved
                                    ? "linear-gradient(to right, #facc15, #3b82f6, #10b981)"
                                    : isDismissed
                                    ? "linear-gradient(to right, #facc15, #3b82f6, #ef4444)"
                                    : isInvestigating
                                    ? "linear-gradient(to right, #facc15, #3b82f6)"
                                    : "linear-gradient(to right, #facc15, #facc15)",
                              }}
                              transition={{
                                duration: 1.8,
                                ease: [0.4, 0, 0.2, 1],
                                delay: 0.4,
                              }}
                            >
                              {/* Shimmer effect on progress line */}
                              <Motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{
                                  x: ["-100%", "100%"],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                            </Motion.div>
                          </div>

                          {/* Step 1: Pending */}
                          <Motion.div
                            className="flex flex-col items-center gap-1 relative z-10 flex-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Motion.div
                              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 relative transition-all ${
                                isPending ||
                                isInvestigating ||
                                isResolved ||
                                isDismissed
                                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-500 shadow-lg ring-2 ring-yellow-200/50"
                                  : "bg-white border-gray-300"
                              }`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{
                                scale: 1,
                                rotate: 0,
                                boxShadow:
                                  isPending
                                    ? [
                                        "0 0 0 0 rgba(251, 191, 36, 0.4)",
                                        "0 0 0 10px rgba(251, 191, 36, 0)",
                                        "0 0 0 0 rgba(251, 191, 36, 0)",
                                      ]
                                    : "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                              transition={{
                                scale: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                  delay: 0.2,
                                },
                                rotate: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                  delay: 0.2,
                                },
                                boxShadow: {
                                  duration: 2,
                                  repeat: isPending ? Infinity : 0,
                                  ease: "easeInOut",
                                },
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Clock
                                className={`w-4 h-4 md:w-4.5 md:h-4.5 ${
                                  isPending ||
                                  isInvestigating ||
                                  isResolved ||
                                  isDismissed
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                              />
                            </Motion.div>
                            <div className="text-center">
                              <p
                                className={`text-xs font-semibold ${
                                  isPending ||
                                  isInvestigating ||
                                  isResolved ||
                                  isDismissed
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                Pending
                              </p>
                              {/* {isPending && (
                                <Motion.p
                                  className="text-[10px] text-yellow-600 font-medium"
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                >
                                  Current
                                </Motion.p>
                              )} */}
                            </div>
                          </Motion.div>

                          {/* Step 2: Investigating */}
                          <Motion.div
                            className="flex flex-col items-center gap-1 relative z-10 flex-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Motion.div
                              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                isInvestigating ||
                                isResolved ||
                                isDismissed
                                  ? "bg-gradient-to-br from-blue-400 to-cyan-500 border-blue-500 shadow-lg ring-2 ring-blue-200/50"
                                  : isPending
                                  ? "bg-white border-gray-300"
                                  : "bg-white border-gray-300 opacity-50"
                              }`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{
                                scale: 1,
                                rotate: 0,
                                boxShadow:
                                  isInvestigating
                                    ? [
                                        "0 0 0 0 rgba(59, 130, 246, 0.4)",
                                        "0 0 0 10px rgba(59, 130, 246, 0)",
                                        "0 0 0 0 rgba(59, 130, 246, 0)",
                                      ]
                                    : "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                              transition={{
                                scale: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                  delay: 0.3,
                                },
                                rotate: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                  delay: 0.3,
                                },
                                boxShadow: {
                                  duration: 2,
                                  repeat: isInvestigating ? Infinity : 0,
                                  ease: "easeInOut",
                                },
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Eye
                                className={`w-4 h-4 md:w-4.5 md:h-4.5 ${
                                  isInvestigating ||
                                  isResolved ||
                                  isDismissed
                                    ? "text-white"
                                    : "text-gray-400"
                                }`}
                              />
                            </Motion.div>
                            <div className="text-center">
                              <p
                                className={`text-xs font-semibold ${
                                  isInvestigating ||
                                  isResolved ||
                                  isDismissed
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                Investigating
                              </p>
                              {/* {isInvestigating && (
                                <Motion.p
                                  className="text-[10px] text-blue-600 font-medium"
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                >
                                  Current
                                </Motion.p>
                              )} */}
                            </div>
                          </Motion.div>

                          {/* Step 3: Resolved */}
                          <Motion.div
                            className="flex flex-col items-center gap-1 relative z-10 flex-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <Motion.div
                              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                isResolved
                                  ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 shadow-lg ring-2 ring-green-200/50"
                                  : isDismissed
                                  ? "bg-gradient-to-br from-red-400 to-rose-500 border-red-500 shadow-lg ring-2 ring-red-200/50"
                                  : isInvestigating
                                  ? "bg-white border-gray-300"
                                  : "bg-white border-gray-300 opacity-50"
                              }`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{
                                scale: 1,
                                rotate: 0,
                                boxShadow:
                                  isResolved || isDismissed
                                    ? [
                                        `0 0 0 0 rgba(${isResolved ? "16, 185, 129" : "239, 68, 68"}, 0.4)`,
                                        `0 0 0 10px rgba(${isResolved ? "16, 185, 129" : "239, 68, 68"}, 0)`,
                                        `0 0 0 0 rgba(${isResolved ? "16, 185, 129" : "239, 68, 68"}, 0)`,
                                      ]
                                    : "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                              transition={{
                                scale: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                  delay: 0.4,
                                },
                                rotate: {
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15,
                                  delay: 0.4,
                                },
                                boxShadow: {
                                  duration: 2,
                                  repeat: isResolved || isDismissed ? Infinity : 0,
                                  ease: "easeInOut",
                                },
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {isDismissed ? (
                                <XCircle className="w-4 h-4 md:w-4.5 md:h-4.5 text-white" />
                              ) : (
                                <CheckCircle
                                  className={`w-4 h-4 md:w-4.5 md:h-4.5 ${
                                    isResolved ? "text-white" : "text-gray-400"
                                  }`}
                                />
                              )}
                            </Motion.div>
                            <div className="text-center">
                              <p
                                className={`text-xs font-semibold ${
                                  isResolved || isDismissed
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {isDismissed ? "Dismissed" : "Resolved"}
                              </p>
                              {/* {(isResolved || isDismissed) && (
                                <p
                                  className={`text-[10px] font-medium ${
                                    isDismissed ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  {isDismissed ? "Closed" : "Complete"}
                                </p>
                              )} */}
                            </div>
                          </Motion.div>
                        </div>
                      </Motion.div>

                      {/* Description Preview */}
                      <Motion.div
                        className="bg-gradient-to-r from-gray-50/50 to-transparent rounded-lg p-2.5 border-l-2 border-red-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
                        <p className="text-xs md:text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {report.description.length > 80
                            ? report.description.substring(0, 80) + "..."
                            : report.description}
                        </p>
                      </Motion.div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:min-w-[120px] lg:pt-1">
                      <Motion.button
                        onClick={() => {
                          navigate(
                            `/my-reports/${report.report_slug || report.id}`
                          );
                        }}
                        className="flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-lg hover:shadow-xl relative overflow-hidden group/btn"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10" />
                        <span className="hidden sm:inline relative z-10">View</span>
                      </Motion.button>
                      {report.status === "pending" && (
                        <>
                          <Motion.button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowUpdateModal(true);
                            }}
                            className="flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Motion.button>
                          <Motion.button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDeleteModal(true);
                            }}
                            className="flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Motion.button>
                        </>
                      )}
                      {report.status !== "pending" && (
                        <Motion.div
                          className="px-3 py-2 md:px-4 md:py-2.5 text-xs text-gray-500 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="hidden sm:inline">
                            Cannot edit or delete{" "}
                            {statusBadge.label.toLowerCase()} reports
                          </span>
                          <span className="sm:hidden">Locked</span>
                        </Motion.div>
                      )}
                    </div>
                  </div>
                </Motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Update Modal */}
      <UpdateReportModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedReport(null);
        }}
        landlordSlug={selectedReport?.landlord.landlord_slug}
        propertySlug={selectedReport?.property.property_slug}
        report={selectedReport}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReport(null);
        }}
        onConfirm={handleDelete}
        title="Delete Report?"
        description="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete Report"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </AuthLayout>
  );
};

export default MyReports;
