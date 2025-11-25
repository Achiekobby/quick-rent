import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Flag,
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
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Ban,
  ShieldCheck,
  Loader2,
  TrendingUp,
  Activity,
  Mail,
  Phone,
  MapPin,
  X,
  Send,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import reportRequests from "../../api/Admin/ReportRequests";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReason, setSelectedReason] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    investigating: 0,
    resolved: 0,
  });

  // Fetch reports
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportRequests.getReports();
      
      if (!response.data.in_error && response?.data?.status_code === "000") {
        // Handle object structure - convert to array if needed
        const data = response.data?.data || {};
        const reportsData = Array.isArray(data) 
          ? data 
          : Object.values(data).map((report, index) => ({
              ...report,
              id: report.report_slug || index,
              report_id: report.report_slug || index,
              created_at: report.timestamps?.created_at || report.created_at,
              updated_at: report.timestamps?.updated_at || report.updated_at,
            }));
        setReports(reportsData);
        calculateStats(reportsData);
      } else {
        toast.error(response.reason || "Failed to fetch reports");
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
      investigating: reportsData.filter((r) => r.status === "investigating").length,
      resolved: reportsData.filter((r) => r.status === "resolved").length,
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

    // Filter by reason
    if (selectedReason !== "all") {
      filtered = filtered.filter((report) => report.reason === selectedReason);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.landlord?.full_name?.toLowerCase().includes(query) ||
          report.user?.full_name?.toLowerCase().includes(query) ||
          report.property?.title?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query) ||
          report.report_slug?.toLowerCase().includes(query) ||
          report.report_id?.toString().includes(query)
      );
    }

    setFilteredReports(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [reports, selectedStatus, selectedReason, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

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
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleAction = async () => {
    if (!actionType || !selectedReport) return;

    setActionLoading(true);
    try {
      // Map action type to status: "investigating" or "resolved"
      const status = actionType === 'resolve' ? 'resolved' : 'investigating';
      
      const reportSlug = selectedReport.report_slug || selectedReport.id;
      const response = await reportRequests.updateReportStatus(reportSlug, { status });
      
      if (response.status) {
        toast.success(`Report ${status === 'resolved' ? 'resolved' : 'under investigation'} successfully`);
        setShowActionModal(false);
        setActionType(null);
        fetchReports();
      } else {
        toast.error(response.message || "Failed to update report");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report status");
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
        label: "Pending",
      },
      investigating: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        icon: Activity,
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

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getReasonBadge = (reason) => {
    const reasons = {
      fraud: { emoji: "🚨", label: "Fraud/Scam", color: "bg-red-100 text-red-700" },
      harassment: { emoji: "😡", label: "Harassment", color: "bg-orange-100 text-orange-700" },
      discrimination: { emoji: "⚖️", label: "Discrimination", color: "bg-purple-100 text-purple-700" },
      unsafe: { emoji: "⚠️", label: "Unsafe Property", color: "bg-yellow-100 text-yellow-700" },
      unresponsive: { emoji: "📵", label: "Unresponsive", color: "bg-blue-100 text-blue-700" },
      contract_violation: { emoji: "📄", label: "Contract Violation", color: "bg-indigo-100 text-indigo-700" },
      other: { emoji: "💬", label: "Other", color: "bg-gray-100 text-gray-700" },
    };

    const reasonData = reasons[reason] || reasons.other;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${reasonData.color}`}>
        <span>{reasonData.emoji}</span>
        {reasonData.label}
      </span>
    );
  };


  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading reports...</p>
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
              Report Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Review and moderate landlord reports
            </p>
          </div>

          <Motion.button
            onClick={fetchReports}
            className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <TrendingUp className="w-5 h-5" />
            Refresh Data
          </Motion.button>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: stats.total, icon: Flag, color: "from-gray-500 to-gray-600" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
            { label: "Investigating", value: stats.investigating, icon: Activity, color: "from-blue-500 to-cyan-500" },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
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
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Under Investigation</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Reason Filter */}
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            >
              <option value="all">All Reasons</option>
              <option value="fraud">Fraud/Scam</option>
              <option value="harassment">Harassment</option>
              <option value="discrimination">Discrimination</option>
              <option value="unsafe">Unsafe Property</option>
              <option value="unresponsive">Unresponsive</option>
              <option value="contract_violation">Contract Violation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </Motion.div>

        {/* Reports Table */}
        <Motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== "all" || selectedReason !== "all"
                  ? "Try adjusting your filters"
                  : "No reports have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-b-2 border-red-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-red-600" />
                        Report ID
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Landlord
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reason
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
                  {paginatedReports.map((report, index) => {
                    const isPending = report.status === "pending";
                    const isInvestigating = report.status === "investigating";
                    const isResolved = report.status === "resolved";

                    return (
                      <Motion.tr
                        key={report.report_slug || report.id}
                        className="group hover:bg-gradient-to-r hover:from-red-50/30 hover:via-orange-50/20 hover:to-red-50/30 transition-all duration-200 cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailModal(true);
                        }}
                      >
                        {/* Report ID */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-10 rounded-r-full ${
                              isPending ? "bg-gradient-to-b from-yellow-400 to-orange-500" :
                              isInvestigating ? "bg-gradient-to-b from-blue-400 to-cyan-500" :
                              isResolved ? "bg-gradient-to-b from-green-400 to-emerald-500" :
                              "bg-gray-400"
                            }`} />
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                #{report.report_slug?.slice(0, 8) || report.id}
                              </div>
                              {report.property?.title && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{report.property.title}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Landlord */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {report.landlord?.full_name || "Unknown"}
                              </div>
                              {report.landlord?.business_name && (
                                <div className="text-xs text-gray-500 truncate">
                                  {report.landlord.business_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Reporter */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            {report.user?.profile_picture ? (
                              <img
                                src={report.user.profile_picture}
                                alt={report.user.full_name}
                                className="w-7 h-7 rounded-full object-cover border-2 border-blue-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-blue-200 flex-shrink-0 ${
                                report.user?.profile_picture ? "hidden" : ""
                              }`}
                            >
                              {report.user?.full_name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {report.user?.full_name || "Unknown"}
                              </div>
                              {report.user?.email && (
                                <div className="text-xs text-gray-500 truncate">
                                  {report.user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Reason */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getReasonBadge(report.reason)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          {getStatusBadge(report.status)}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {moment(report.timestamps?.created_at || report.created_at).format("MMM DD, YYYY")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {moment(report.timestamps?.created_at || report.created_at).format("HH:mm")}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Motion.button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDetailModal(true);
                              }}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Motion.button>

                            {report.status === "pending" && (
                              <Motion.button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionType("investigate");
                                  setShowActionModal(true);
                                }}
                                className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Start Investigation"
                              >
                                <Activity className="w-4 h-4" />
                              </Motion.button>
                            )}

                            {report.status === "investigating" && (
                              <Motion.button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionType("resolve");
                                  setShowActionModal(true);
                                }}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Resolve Report"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Motion.button>
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
          {filteredReports.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm font-medium bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    of {filteredReports.length} reports
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <Motion.button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </Motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <Motion.button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'
                          }`}
                          whileHover={currentPage !== page ? { scale: 1.05 } : {}}
                          whileTap={currentPage !== page ? { scale: 0.95 } : {}}
                        >
                          {page}
                        </Motion.button>
                      )
                    ))}
                  </div>

                  <Motion.button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
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
          {showDetailModal && selectedReport && (
            <Motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
            >
              <Motion.div
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-orange-600 px-8 py-6 rounded-t-3xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                        <Flag className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">Report Details</h2>
                        <p className="text-red-100 text-sm mt-1">
                          Report #{selectedReport.id}
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
                  {/* Status & Reason */}
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedReport.status)}
                    {getReasonBadge(selectedReport.reason)}
                  </div>

                  {/* Landlord Info */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Reported Landlord</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-red-600" />
                        <span className="font-bold text-gray-900 text-lg">{selectedReport.landlord?.full_name || "Unknown"}</span>
                      </div>
                      {selectedReport.landlord?.business_name && (
                        <div className="ml-8">
                          <p className="text-sm font-semibold text-gray-500 mb-1">Business</p>
                          <p className="text-gray-700">{selectedReport.landlord.business_name}</p>
                          {selectedReport.landlord.business_type && (
                            <p className="text-xs text-gray-500 mt-1">{selectedReport.landlord.business_type}</p>
                          )}
                        </div>
                      )}
                      {selectedReport.landlord?.email && (
                        <div className="flex items-center gap-3 ml-8">
                          <Mail className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">{selectedReport.landlord.email}</span>
                        </div>
                      )}
                      {selectedReport.landlord?.phone_number && (
                        <div className="flex items-center gap-3 ml-8">
                          <Phone className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">{selectedReport.landlord.phone_number}</span>
                        </div>
                      )}
                      {selectedReport.landlord?.location && (
                        <div className="flex items-start gap-3 ml-8">
                          <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-gray-700">{selectedReport.landlord.location}</p>
                            {selectedReport.landlord.region && (
                              <p className="text-xs text-gray-500">{selectedReport.landlord.region}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reporter Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Reporter Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {selectedReport.user?.profile_picture ? (
                          <img
                            src={selectedReport.user.profile_picture}
                            alt={selectedReport.user.full_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold border-2 border-blue-200 ${
                            selectedReport.user?.profile_picture ? "hidden" : ""
                          }`}
                        >
                          {selectedReport.user?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{selectedReport.user?.full_name || "Unknown"}</p>
                          {selectedReport.user?.gender && (
                            <p className="text-xs text-gray-500">{selectedReport.user.gender}</p>
                          )}
                        </div>
                      </div>
                      {selectedReport.user?.email && (
                        <div className="flex items-center gap-3 ml-13">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">{selectedReport.user.email}</span>
                        </div>
                      )}
                      {selectedReport.user?.phone_number && (
                        <div className="flex items-center gap-3 ml-13">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">{selectedReport.user.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 ml-13">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{moment(selectedReport.timestamps?.created_at || selectedReport.created_at).format("MMMM DD, YYYY HH:mm")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  {selectedReport.property && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Property Information</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg mb-1">{selectedReport.property.title}</p>
                          {selectedReport.property.property_type && (
                            <p className="text-sm text-gray-600">{selectedReport.property.property_type}</p>
                          )}
                        </div>
                        {(selectedReport.property.location || selectedReport.property.suburb || selectedReport.property.district) && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-700">
                                {[selectedReport.property.location, selectedReport.property.suburb, selectedReport.property.district]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                              {selectedReport.property.landmark && (
                                <p className="text-xs text-gray-500 mt-1">Near: {selectedReport.property.landmark}</p>
                              )}
                              {selectedReport.property.region && (
                                <p className="text-xs text-gray-500">{selectedReport.property.region}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedReport.property.price && (
                          <div className="ml-8">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Price</p>
                            <p className="text-lg font-bold text-green-600">
                              ₵{parseFloat(selectedReport.property.price).toLocaleString()}
                              <span className="text-sm font-normal text-gray-500">/month</span>
                            </p>
                          </div>
                        )}
                        {selectedReport.property.images && selectedReport.property.images.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-500 mb-2">Property Images</p>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedReport.property.images.slice(0, 3).map((image, idx) => (
                                <div key={image.id || idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-200">
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

                  {/* Custom Reason */}
                  {selectedReport.reason === "other" && selectedReport.custom_reason && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Custom Reason</h3>
                      </div>
                      <p className="text-gray-700 ml-11">{selectedReport.custom_reason}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Detailed Description</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-orange-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedReport.description}</p>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedReport.admin_notes && (
                    <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Admin Notes</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.admin_notes}</p>
                    </div>
                  )}
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Action Modal */}
        <AnimatePresence>
          {showActionModal && selectedReport && (
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
                  actionType === 'resolve' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  actionType === 'investigate' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                  'bg-gradient-to-r from-gray-500 to-slate-600'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {actionType === 'resolve' ? 'Resolve Report' : 'Start Investigation'}
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        Report #{selectedReport.report_id || selectedReport.id}
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
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-700">
                        {actionType === 'resolve' 
                          ? 'This will mark the report as resolved. The status will be updated immediately.'
                          : 'This will move the report to investigation status. The status will be updated immediately.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Motion.button
                      onClick={handleAction}
                      disabled={actionLoading}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                        actionType === 'resolve' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                        'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                      }`}
                      whileHover={!actionLoading ? { scale: 1.02 } : {}}
                      whileTap={!actionLoading ? { scale: 0.98 } : {}}
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Confirm Action</span>
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
      </div>
    </AuthLayout>
  );
};

export default ReportManagement;

