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
  ChevronDown,
  ChevronUp,
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
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_investigation: 0,
    resolved: 0,
    dismissed: 0,
  });

  // Fetch reports
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportRequests.getAllReports();
      
      if (!response.in_error) {
        const reportsData = response.data?.reports || [];
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
      under_investigation: reportsData.filter((r) => r.status === "under_investigation").length,
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

    // Filter by reason
    if (selectedReason !== "all") {
      filtered = filtered.filter((report) => report.reason === selectedReason);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.landlord_name?.toLowerCase().includes(query) ||
          report.reporter_name?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query) ||
          report.report_id?.toString().includes(query)
      );
    }

    setFilteredReports(filtered);
  }, [reports, selectedStatus, selectedReason, searchQuery]);

  const handleAction = async () => {
    if (!actionType || !selectedReport) return;
    
    if (actionType !== 'dismiss' && !actionNote.trim()) {
      toast.error("Please provide notes for this action");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        report_id: selectedReport.id,
        action: actionType,
        admin_notes: actionNote,
      };

      const response = await reportRequests.updateReportStatus(payload);
      
      if (!response.in_error) {
        toast.success(`Report ${actionType === 'resolve' ? 'resolved' : actionType === 'investigate' ? 'under investigation' : 'dismissed'} successfully`);
        setShowActionModal(false);
        setActionNote("");
        setActionType(null);
        fetchReports();
      } else {
        toast.error(response.reason || "Failed to update report");
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
      under_investigation: {
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
      dismissed: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        icon: XCircle,
        label: "Dismissed",
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

  const getSeverityColor = (reason) => {
    const high = ["fraud", "harassment", "discrimination"];
    const medium = ["unsafe", "contract_violation"];
    
    if (high.includes(reason)) return "border-l-4 border-l-red-500";
    if (medium.includes(reason)) return "border-l-4 border-l-yellow-500";
    return "border-l-4 border-l-blue-500";
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Reports", value: stats.total, icon: Flag, color: "from-gray-500 to-gray-600" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
            { label: "Investigating", value: stats.under_investigation, icon: Activity, color: "from-blue-500 to-cyan-500" },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
            { label: "Dismissed", value: stats.dismissed, icon: XCircle, color: "from-gray-500 to-slate-500" },
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
              <option value="under_investigation">Under Investigation</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
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

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Motion.div
              className="bg-white rounded-2xl p-12 text-center shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== "all" || selectedReason !== "all"
                  ? "Try adjusting your filters"
                  : "No reports have been submitted yet"}
              </p>
            </Motion.div>
          ) : (
            filteredReports.map((report, index) => (
              <Motion.div
                key={report.id}
                className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all ${getSeverityColor(report.reason)}`}
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
                        <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-md">
                          <Flag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Report #{report.report_id || report.id}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getReasonBadge(report.reason)}
                            {getStatusBadge(report.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Landlord & Reporter Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-16">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Reported Landlord</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{report.landlord_name}</span>
                        </div>
                        {report.landlord_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{report.landlord_email}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Reported By</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{report.reporter_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{moment(report.created_at).format("MMM DD, YYYY HH:mm")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <div className="pl-16">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    {/* Custom Reason (if other) */}
                    {report.reason === "other" && report.custom_reason && (
                      <div className="pl-16">
                        <p className="text-sm text-gray-500 italic">
                          Custom reason: {report.custom_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Motion.button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 lg:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Motion.button>

                    {report.status === "pending" && (
                      <>
                        <Motion.button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType("investigate");
                            setShowActionModal(true);
                          }}
                          className="flex-1 lg:flex-none px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Activity className="w-4 h-4" />
                          Investigate
                        </Motion.button>

                        <Motion.button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType("dismiss");
                            setShowActionModal(true);
                          }}
                          className="flex-1 lg:flex-none px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </Motion.button>
                      </>
                    )}

                    {report.status === "under_investigation" && (
                      <Motion.button
                        onClick={() => {
                          setSelectedReport(report);
                          setActionType("resolve");
                          setShowActionModal(true);
                        }}
                        className="flex-1 lg:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </Motion.button>
                    )}
                  </div>
                </div>
              </Motion.div>
            ))
          )}
        </div>

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
                          Report #{selectedReport.report_id || selectedReport.id}
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
                  <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Reported Landlord</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-gray-900">{selectedReport.landlord_name}</span>
                      </div>
                      {selectedReport.landlord_email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-red-600" />
                          <span className="text-gray-700">{selectedReport.landlord_email}</span>
                        </div>
                      )}
                      {selectedReport.landlord_phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-red-600" />
                          <span className="text-gray-700">{selectedReport.landlord_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reporter Info */}
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Reporter Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{selectedReport.reporter_name}</span>
                      </div>
                      {selectedReport.reporter_email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{selectedReport.reporter_email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{moment(selectedReport.created_at).format("MMMM DD, YYYY HH:mm")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Reason */}
                  {selectedReport.reason === "other" && selectedReport.custom_reason && (
                    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Reason</h3>
                      <p className="text-gray-700">{selectedReport.custom_reason}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Detailed Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedReport.description}</p>
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
                        {actionType === 'resolve' ? 'Resolve Report' :
                         actionType === 'investigate' ? 'Start Investigation' :
                         'Dismiss Report'}
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
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      {actionType === 'dismiss' ? 'Reason for Dismissal (Optional)' : 'Action Notes *'}
                    </label>
                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      rows="6"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all text-gray-700 placeholder:text-gray-400"
                      placeholder={
                        actionType === 'resolve' ? 'Describe the action taken and resolution...' :
                        actionType === 'investigate' ? 'Note down investigation plan and next steps...' :
                        'Optional notes about why this report is being dismissed...'
                      }
                    />
                  </div>

                  <div className="flex gap-3">
                    <Motion.button
                      onClick={handleAction}
                      disabled={actionLoading || (actionType !== 'dismiss' && !actionNote.trim())}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                        actionType === 'resolve' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                        actionType === 'investigate' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' :
                        'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700'
                      }`}
                      whileHover={!actionLoading && (actionType === 'dismiss' || actionNote.trim()) ? { scale: 1.02 } : {}}
                      whileTap={!actionLoading && (actionType === 'dismiss' || actionNote.trim()) ? { scale: 0.98 } : {}}
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
                          setActionNote("");
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

