import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  Flag,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  Loader2,
  Edit2,
  Trash2,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import reportRequests from "../../api/Renter/General/ReportRequests";
import UpdateReportModal from "../../components/Utilities/UpdateReportModal";
import ConfirmModal from "../../components/Utilities/ConfirmModal";

const ReportDetails = () => {
  const { reportSlug } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReportDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportRequests.getReport(reportSlug);
      if (response.status) {
        // API returns { data: { data: {...} } }
        const reportData = response.data?.data || response.data || null;
        setReport(reportData);
      } else {
        toast.error(response.message || "Failed to fetch report details");
        navigate("/my-reports");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report details");
      navigate("/my-reports");
    } finally {
      setLoading(false);
    }
  }, [reportSlug, navigate]);

  useEffect(() => {
    if (reportSlug) {
      fetchReportDetails();
    }
  }, [reportSlug, fetchReportDetails]);

  const handleDelete = async () => {
    if (!report) return;

    setIsDeleting(true);
    try {
      const response = await reportRequests.deleteReport(
        report.report_slug || report.id
      );
      if (response.status) {
        toast.success(response.message || "Report deleted successfully!");
        navigate("/my-reports");
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
    fetchReportDetails();
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
        gradient: "from-yellow-400 to-orange-500",
      },
      under_investigation: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        icon: Eye,
        label: "Under Investigation",
        gradient: "from-blue-400 to-cyan-500",
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
        icon: CheckCircle,
        label: "Resolved",
        gradient: "from-green-400 to-emerald-500",
      },
      dismissed: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
        icon: XCircle,
        label: "Dismissed",
        gradient: "from-red-400 to-rose-500",
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
      unsafe_property: "⚠️",
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
            <p className="text-gray-600">Loading report details...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!report) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Report Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              The report you're looking for doesn't exist or has been removed.
            </p>
            <Motion.button
              onClick={() => navigate("/my-reports")}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to My Reports
            </Motion.button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const statusBadge = getStatusBadge(report.status);
  const StatusIcon = statusBadge.icon;

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header with Back Button */}
        <Motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Motion.button
            onClick={() => navigate("/my-reports")}
            className="p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Report Details
            </h1>
            <p className="text-gray-600 text-sm">
              Report #{report.report_id || report.id}
            </p>
          </div>
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Motion.div
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-lg border-2 border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`p-3 md:p-4 bg-gradient-to-br ${statusBadge.gradient} rounded-xl md:rounded-2xl shadow-lg flex-shrink-0`}
                  >
                    <StatusIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Status
                    </h2>
                    <span
                      className={`inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold border mt-2 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                    >
                      <StatusIcon className="w-3 h-3 md:w-4 md:h-4" />
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
                {report.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Motion.button
                      onClick={() => setShowUpdateModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Motion.button>
                    <Motion.button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Motion.button>
                  </div>
                )}
              </div>
            </Motion.div>

            {/* Report Reason */}
            <Motion.div
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Report Reason
                </h2>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">
                    {getReasonIcon(report.reason)}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {getReasonLabel(report.reason)}
                    </p>
                    {report.reason === "other" && report.custom_reason && (
                      <p className="text-sm text-gray-700 italic bg-white/50 rounded-lg p-2 mt-2">
                        {report.custom_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Motion.div>

            {/* Description */}
            <Motion.div
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Description</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            </Motion.div>

            {/* Property Images (if available) */}
            {report.property?.images && report.property.images.length > 0 && (
              <Motion.div
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Property Images
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {report.property.images.map((image, index) => (
                    <div
                      key={image.id || index}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-green-400 transition-all group"
                    >
                      <img
                        src={image.image_path || image.url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {image.is_featured && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Motion.div>
            )}

            {/* Admin Notes (if available) */}
            {report.admin_notes && (
              <Motion.div
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-md border-2 border-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Admin Notes
                  </h2>
                </div>
                <div className="bg-white rounded-xl p-5 border border-blue-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.admin_notes}
                  </p>
                </div>
              </Motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Landlord Information */}
            {report.landlord && (
              <Motion.div
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Landlord</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Name
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {report.landlord.full_name || "Unknown"}
                    </p>
                  </div>
                  {report.landlord.business_name && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Business
                      </p>
                      <p className="text-sm text-gray-700">
                        {report.landlord.business_name}
                      </p>
                    </div>
                  )}
                  {report.landlord.email && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {report.landlord.email}
                      </p>
                    </div>
                  )}
                  {report.landlord.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {report.landlord.phone_number}
                      </p>
                    </div>
                  )}
                  {report.landlord.location && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-700">
                          {report.landlord.location}
                        </p>
                        {report.landlord.region && (
                          <p className="text-xs text-gray-500">
                            {report.landlord.region}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Motion.div>
            )}

            {/* Property Information */}
            {report.property && (
              <Motion.div
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Property</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Title
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {report.property.title}
                    </p>
                  </div>
                  {report.property.property_type && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Type
                      </p>
                      <p className="text-sm text-gray-700">
                        {report.property.property_type}
                      </p>
                    </div>
                  )}
                  {(report.property.location ||
                    report.property.suburb ||
                    report.property.district ||
                    report.property.landmark) && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {[
                            report.property.location,
                            report.property.suburb,
                            report.property.district,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {report.property.landmark && (
                          <p className="text-xs text-gray-500 mt-1">
                            Near: {report.property.landmark}
                          </p>
                        )}
                        {report.property.region && (
                          <p className="text-xs text-gray-500">
                            {report.property.region}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {report.property.price && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Price
                      </p>
                      <p className="text-base font-bold text-green-600">
                        ₵{parseFloat(report.property.price).toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Motion.div>
            )}

            {/* Report Metadata */}
            <Motion.div
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    Submitted
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {moment(report.created_at).format("MMMM DD, YYYY")}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {moment(report.created_at).format("h:mm A")}
                  </p>
                </div>
                {report.updated_at &&
                  report.updated_at !== report.created_at && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Last Updated
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          {moment(report.updated_at).format("MMMM DD, YYYY")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {moment(report.updated_at).format("h:mm A")}
                      </p>
                    </div>
                  )}
              </div>
            </Motion.div>

            {/* Reporter Information */}
            {report.user && (
              <Motion.div
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-md border-2 border-indigo-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Information
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {report.user.profile_picture ? (
                      <img
                        src={report.user.profile_picture}
                        alt={report.user.full_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-md ${
                        report.user.profile_picture ? "hidden" : ""
                      }`}
                    >
                      {report.user.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {report.user.full_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {report.user.email}
                      </p>
                    </div>
                  </div>
                  {report.user.phone_number && (
                    <div className="flex items-center gap-2 pt-2 border-t border-indigo-200">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm text-gray-700">
                        {report.user.phone_number}
                      </p>
                    </div>
                  )}
                  {report.user.gender && (
                    <div className="pt-2 border-t border-indigo-200">
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm font-medium text-gray-700">
                        {report.user.gender}
                      </p>
                    </div>
                  )}
                </div>
              </Motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <UpdateReportModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
        }}
        report={report}
        onUpdateSuccess={handleUpdateSuccess}
        landlordSlug={report?.landlord.landlord_slug}
        propertySlug={report?.property.property_slug}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
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

export default ReportDetails;
