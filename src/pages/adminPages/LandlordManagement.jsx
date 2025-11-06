import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  TrendingUp,
  Home,
  DollarSign,
  Clock,
  Grid3X3,
  List,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Award,
  Settings,
  Ban,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MailCheck,
  LocationEdit,
  Edit,
  FileText,
  AlertTriangle,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import generalRequests from "../../api/Admin/Landlords/GeneralRequests";
import ViewModal from "../../components/AdminLandlords/ViewModal";
import ActivationReviewModal from "../../components/AdminLandlords/ActivationReviewModal";
import DeactivationConfirmationModal from "../../components/AdminLandlords/DeactivationConfirmationModal";
import PendingUpdatesReviewModal from "../../components/AdminLandlords/PendingUpdatesReviewModal";
import KYCReviewModal from "../../components/AdminLandlords/KYCReviewModal";

const LandlordManagement = () => {
  const navigate = useNavigate();
  // State management
  const [landlords, setLandlords] = useState([]);
  const [filteredLandlords, setFilteredLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [showLandlordModal, setShowLandlordModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const [showPendingUpdatesModal, setShowPendingUpdatesModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginatedLandlords, setPaginatedLandlords] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    newThisMonth: 0,
  });

  // Function to calculate stats
  const calculateStats = (landlordsData) => {
    const totalLandlords = landlordsData?.length || 0;
    const activeLandlords =
      landlordsData?.filter((l) => l.is_active).length || 0;
    const verifiedLandlords =
      landlordsData?.filter((l) => l.kyc_verification === true).length || 0;
    const newThisMonth =
      landlordsData?.filter((l) =>
        moment(l.join_date).isAfter(moment().subtract(1, "month"))
      ).length || 0;
    const totalInactiveLandlords =
      landlordsData?.filter((l) => !l.is_active).length || 0;

    return {
      total: totalLandlords,
      active: activeLandlords,
      inactive: totalInactiveLandlords,
      verified: verifiedLandlords,
      unverified: totalLandlords - verifiedLandlords,
      newThisMonth,
    };
  };

  // Update stats whenever landlords data changes
  useEffect(() => {
    setStats(calculateStats(landlords));
  }, [landlords]);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await generalRequests.getLandlords();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setLandlords(response?.data?.data);
          setFilteredLandlords(response?.data?.data);
        } else {
          toast.error(response?.data?.reason);
        }
      } catch (error) {
        toast.error(error?.response?.data?.reason);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...landlords];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (landlord) =>
          landlord.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          landlord.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          landlord.business_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          landlord.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case "active":
        filtered = filtered.filter((l) => l.is_active);
        break;
      case "inactive":
        filtered = filtered.filter((l) => !l.is_active);
        break;
      case "verified":
        filtered = filtered.filter((l) => l.kyc_verification === true);
        break;
      case "unverified":
        filtered = filtered.filter((l) => l.kyc_verification !== true);
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.join_date) - new Date(a.join_date));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.join_date) - new Date(b.join_date));
        break;
      case "name":
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
      case "properties":
        filtered.sort((a, b) => b.properties_count - a.properties_count);
        break;
      case "revenue":
        filtered.sort((a, b) => b.total_revenue - a.total_revenue);
        break;
      default:
        break;
    }

    setFilteredLandlords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [landlords, searchQuery, selectedFilter, sortBy]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLandlords(filteredLandlords.slice(startIndex, endIndex));
  }, [filteredLandlords, currentPage, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLandlords.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredLandlords.length
  );

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Action handlers
  const handleToggleStatus = (landlordSlug, currentStatus) => {
    const landlord = landlords.find((l) => l.landlord_slug === landlordSlug);
    if (!landlord) return;

    if (currentStatus) {
      // Deactivating - show confirmation modal
      setSelectedLandlord(landlord);
      setShowDeactivationModal(true);
    } else {
      // Activating - show review modal
      setSelectedLandlord(landlord);
      setShowActivationModal(true);
    }
  };

  const handleActivationApprove = async (landlordSlug) => {
    setActionLoading((prev) => ({ ...prev, [`status_${landlordSlug}`]: true }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlordSlug,
        status: "activate",
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Landlord account activated successfully"
        );
        setLandlords((prev) =>
          prev.map((landlord) =>
            landlord.landlord_slug === landlordSlug
              ? { ...landlord, is_active: true }
              : landlord
          )
        );
        setShowActivationModal(false);
      } else {
        toast.error(response?.data?.reason || "Failed to activate account");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to activate landlord account");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${landlordSlug}`]: false,
      }));
    }
  };

  const handleActivationReject = async (landlordSlug) => {
    setActionLoading((prev) => ({ ...prev, [`status_${landlordSlug}`]: true }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlordSlug,
        status: "reject",
      });

      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Landlord activation rejected");
        setShowActivationModal(false);
      } else {
        toast.error(response?.data?.reason || "Failed to reject activation");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reject landlord activation");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${landlordSlug}`]: false,
      }));
    }
  };

  const handleDeactivationConfirm = async (landlordSlug, reason) => {
    setActionLoading((prev) => ({ ...prev, [`status_${landlordSlug}`]: true }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlordSlug,
        status: "deactivate",
        reason: reason,
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Landlord account deactivated successfully"
        );
        setLandlords((prev) =>
          prev.map((landlord) =>
            landlord.landlord_slug === landlordSlug
              ? { ...landlord, is_active: false }
              : landlord
          )
        );
        setShowDeactivationModal(false);
      } else {
        toast.error(response?.data?.reason || "Failed to deactivate account");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to deactivate landlord account");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${landlordSlug}`]: false,
      }));
    }
  };

  const handleViewDetails = (landlord) => {
    setSelectedLandlord(landlord);
    setShowLandlordModal(true);
  };

  const handleEditLandlord = (landlord) => {
    navigate(`/admin/landlords/edit/${landlord.landlord_slug}`);
  };

  // Handle landlord updates from modal
  const handleLandlordUpdate = (landlordSlug, updates) => {
    setLandlords((prev) =>
      prev.map((landlord) =>
        landlord.landlord_slug === landlordSlug
          ? { ...landlord, ...updates }
          : landlord
      )
    );

    if (selectedLandlord?.landlord_slug === landlordSlug) {
      setSelectedLandlord((prev) => ({ ...prev, ...updates }));
    }
  };

  // Handle pending updates review
  const handleReviewPendingUpdates = (landlord) => {
    setSelectedLandlord(landlord);
    setShowPendingUpdatesModal(true);
  };

  const handleApprovePendingUpdates = async (landlordSlug) => {
    setActionLoading((prev) => ({
      ...prev,
      [`pending_updates_${landlordSlug}`]: true,
    }));

    try {
      const response = await generalRequests.reviewPendingUpdates(
        landlordSlug,
        "approved"
      );

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Pending updates approved successfully"
        );
        setLandlords((prev) =>
          prev.map((landlord) =>
            landlord.landlord_slug === landlordSlug
              ? {
                  ...landlord,
                  update_status: null,
                  pending_updates: null,
                }
              : landlord
          )
        );
        setShowPendingUpdatesModal(false);
        setSelectedLandlord(null);
      } else {
        toast.error(
          response?.data?.reason || "Failed to approve pending updates"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to approve pending updates");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`pending_updates_${landlordSlug}`]: false,
      }));
    }
  };

  const handleRejectPendingUpdates = async (landlordSlug, reason) => {
    setActionLoading((prev) => ({
      ...prev,
      [`pending_updates_${landlordSlug}`]: true,
    }));

    try {
      const response = await generalRequests.reviewPendingUpdates(
        landlordSlug,
        "rejected",
        reason
      );

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Pending updates rejected successfully"
        );
        setLandlords((prev) =>
          prev.map((landlord) =>
            landlord.landlord_slug === landlordSlug
              ? {
                  ...landlord,
                  update_status: "rejected",
                  pending_updates: null,
                }
              : landlord
          )
        );
        setShowPendingUpdatesModal(false);
        setSelectedLandlord(null);
      } else {
        toast.error(
          response?.data?.reason || "Failed to reject pending updates"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reject pending updates");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`pending_updates_${landlordSlug}`]: false,
      }));
    }
  };

  // Handle KYC review
  const handleReviewKYC = (landlord) => {
    setSelectedLandlord(landlord);
    setShowKYCModal(true);
  };

  const handleApproveKYC = async (landlordSlug) => {
    setActionLoading((prev) => ({
      ...prev,
      [`kyc_${landlordSlug}`]: true,
    }));

    try {
      const response = await generalRequests.reviewKYCVerification({
        landlord_slug: landlordSlug,
        status: "verify",
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "KYC verification approved successfully"
        );
        setLandlords((prev) =>
          prev.map((landlord) =>
            landlord.landlord_slug === landlordSlug
              ? {
                  ...landlord,
                  kyc_verification: true,
                  kyc_rejection_reason: null,
                }
              : landlord
          )
        );
        setShowKYCModal(false);
        setSelectedLandlord(null);
      } else {
        toast.error(
          response?.data?.reason || "Failed to approve KYC verification"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to approve KYC verification");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`kyc_${landlordSlug}`]: false,
      }));
    }
  };

  const handleRejectKYC = async (landlordSlug, rejectionReasons) => {
    setActionLoading((prev) => ({
      ...prev,
      [`kyc_${landlordSlug}`]: true,
    }));

    try {
      const response = await generalRequests.reviewKYCVerification({
        landlord_slug: landlordSlug,
        status: "unverify",
        kyc_rejection_reason: JSON.stringify(rejectionReasons),
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "KYC verification rejected successfully"
        );
        setLandlords((prev) =>
          prev.map((landlord) =>
            landlord.landlord_slug === landlordSlug
              ? {
                  ...landlord,
                  kyc_verification: false,
                  kyc_rejection_reason: rejectionReasons.join("\n"),
                }
              : landlord
          )
        );
        setShowKYCModal(false);
        setSelectedLandlord(null);
      } else {
        toast.error(
          response?.data?.reason || "Failed to reject KYC verification"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reject KYC verification");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`kyc_${landlordSlug}`]: false,
      }));
    }
  };

  // Helper function to check if landlord has verification documents
  const hasVerificationDocuments = (landlord) => {
    return (
      landlord.selfie_picture &&
      landlord.ghana_card_front &&
      landlord.ghana_card_back
    );
  };

  // Helper functions for checking scenarios
  const hasPendingUpdates = (landlord) => {
    // update_status === "pending" takes precedence - always show Review Updates button
    if (landlord.update_status === "pending") {
      return true;
    }
    // Fallback: Check if pending_updates exists and has content
    if (landlord.pending_updates) {
      const hasContent =
        (typeof landlord.pending_updates === "object" &&
          !Array.isArray(landlord.pending_updates) &&
          Object.keys(landlord.pending_updates).length > 0) ||
        (Array.isArray(landlord.pending_updates) &&
          landlord.pending_updates.length > 0);
      return hasContent;
    }
    return false;
  };

  // Check if KYC can be reviewed (pending review - not yet approved or rejected)
  const canReviewKYC = (landlord) => {
    return (
      landlord.update_status !== "pending" &&
      landlord.kyc_verification === false &&
      landlord.kyc_rejection_reason === null
    );
  };

  // Check if KYC has been rejected (admin can re-review)
  const isKYCRejected = (landlord) => {
    return (
      landlord.update_status !== "pending" &&
      landlord.kyc_verification === false &&
      landlord.kyc_rejection_reason !== null
    );
  };

  // Check if KYC is blocked by pending updates
  const isKYCBlockedByPendingUpdates = (landlord) => {
    return landlord.update_status === "pending";
  };

  // Check if KYC is approved
  const isKYCApproved = (landlord) => {
    return landlord.kyc_verification === true;
  };

  const getStatusBadge = (landlord) => {
    if (!landlord.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <XCircle size={12} />
          Inactive
        </span>
      );
    }

    if (landlord.kyc_verification === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle2 size={12} />
          Verified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        <AlertCircle size={12} />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading landlords...</p>
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
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Landlord Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Manage and monitor all landlords on the platform
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <Link
              to="/admin/landlords/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Create Landlord</span>
            </Link>
            <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Total Landlords
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All registered landlords
              </p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <UserCheck size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Active
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Active Landlords
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  +12% this month
                </span>
              </div>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <UserX size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Inactive
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Inactive Accounts
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowDownRight size={12} className="text-red-500" />
                <span className="text-xs text-red-600 font-medium">
                  -5% this month
                </span>
              </div>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Verified
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.verified}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Verified Accounts
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  +8% this month
                </span>
              </div>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                <AlertCircle size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.unverified}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                Pending Verification
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </div>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -4, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  New
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.newThisMonth}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">
                New This Month
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  +25% vs last month
                </span>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Filters and Search */}
        <Motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search landlords..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="properties">Most Properties</option>
                  <option value="revenue">Highest Revenue</option>
                </select>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    } transition-colors rounded-l-lg`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    } transition-colors rounded-r-lg`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Results */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <p className="text-sm text-gray-600">
            Showing {filteredLandlords.length > 0 ? startItem : 0} to {endItem}{" "}
            of {filteredLandlords.length} landlords
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>

        {/* Landlords Grid */}
        {filteredLandlords.length === 0 ? (
          <Motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No landlords found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </Motion.div>
        ) : (
          <>
            <Motion.div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence>
                {paginatedLandlords.map((landlord) => (
                  <Motion.div
                    key={landlord.landlord_slug}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    whileHover={{ y: -4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg flex-shrink-0">
                            {landlord.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate capitalize">
                              {landlord.full_name}
                            </h3>
                            <p className="text-xs text-gray-600 truncate capitalize">
                              {landlord.business_name}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(landlord)}
                        </div>
                      </div>
                    </div>

                    {/* Content - Flex-1 to take available space */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <div className="space-y-3 flex-1">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Building
                              size={12}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-gray-600 truncate">
                              {landlord.properties_count} Properties
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MailCheck
                              size={12}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-gray-600 truncate">
                              {landlord.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin
                              size={12}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-gray-600 truncate">
                              {landlord.region}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LocationEdit
                              size={12}
                              className="text-green-500 flex-shrink-0"
                            />
                            <span className="text-gray-600 text-xs truncate">
                              {landlord.location}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-3 gap-1">
                            <span className="truncate">
                              Joined{" "}
                              {moment(landlord.join_date).format("MMM YYYY")}
                            </span>
                            <span className="truncate">
                              Active {moment(landlord.verified_at).fromNow()}
                            </span>
                          </div>

                          {/* Pending Updates Badge */}
                          {hasPendingUpdates(landlord) && (
                            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span className="text-amber-800 font-medium">
                                  Pending Updates
                                </span>
                              </div>
                            </div>
                          )}

                          {/* KYC Blocked by Pending Updates Message */}
                          {isKYCBlockedByPendingUpdates(landlord) &&
                            !hasPendingUpdates(landlord) && (
                              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-1.5 text-xs text-yellow-800">
                                  <AlertTriangle size={12} />
                                  <span>
                                    KYC review unavailable - pending updates in
                                    review
                                  </span>
                                </div>
                              </div>
                            )}

                          {/* KYC Rejected Message */}
                          {isKYCRejected(landlord) && (
                            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-1.5 text-xs text-red-800">
                                <XCircle size={12} />
                                <span>KYC verification was rejected</span>
                              </div>
                            </div>
                          )}

                          {/* KYC Approved Message */}
                          {isKYCApproved(landlord) && (
                            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-1.5 text-xs text-green-800">
                                <CheckCircle2 size={12} />
                                <span>KYC verification approved</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions - Pushed to bottom with mt-auto */}
                      <div className="space-y-2 mt-auto pt-3 border-t border-gray-100">
                        {/* Pending Updates Review Button */}
                        {hasPendingUpdates(landlord) && (
                          <button
                            onClick={() => handleReviewPendingUpdates(landlord)}
                            disabled={
                              actionLoading[
                                `pending_updates_${landlord.landlord_slug}`
                              ]
                            }
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 text-xs font-medium hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Review Pending Updates"
                          >
                            {actionLoading[
                              `pending_updates_${landlord.landlord_slug}`
                            ] ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <FileText size={14} />
                            )}
                            <span className="truncate">Review Updates</span>
                          </button>
                        )}

                        {/* KYC Review Button - Show for pending review or rejected (can re-review) */}
                        {(canReviewKYC(landlord) ||
                          isKYCRejected(landlord)) && (
                          <button
                            onClick={() => handleReviewKYC(landlord)}
                            disabled={
                              actionLoading[`kyc_${landlord.landlord_slug}`] ||
                              isKYCBlockedByPendingUpdates(landlord)
                            }
                            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-xs font-medium hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                              isKYCRejected(landlord)
                                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
                                : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                            }`}
                            title={
                              isKYCBlockedByPendingUpdates(landlord)
                                ? "Please review pending updates first"
                                : isKYCRejected(landlord)
                                ? "Re-review KYC Verification"
                                : "Review KYC Verification"
                            }
                          >
                            {actionLoading[`kyc_${landlord.landlord_slug}`] ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Shield size={14} />
                            )}
                            <span className="truncate">
                              {isKYCRejected(landlord)
                                ? "Re-review KYC"
                                : "Review KYC"}
                            </span>
                          </button>
                        )}

                        {/* Primary Actions Row */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleViewDetails(landlord)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-xs font-medium hover:shadow-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                            <span className="truncate">View Details</span>
                          </button>

                          <button
                            onClick={() => handleEditLandlord(landlord)}
                            className="group flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 text-xs font-medium hover:shadow-sm"
                            title="Edit Landlord"
                          >
                            <Edit
                              size={14}
                              className="group-hover:rotate-12 transition-transform duration-200"
                            />
                            <span className="truncate">Edit</span>
                          </button>
                        </div>

                        {/* Secondary Actions Row */}
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                landlord.landlord_slug,
                                landlord.is_active
                              )
                            }
                            disabled={
                              actionLoading[
                                `status_${landlord.landlord_slug}`
                              ] ||
                              (!landlord.is_active &&
                                !hasVerificationDocuments(landlord))
                            }
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-xs font-medium hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                              landlord.is_active
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : hasVerificationDocuments(landlord)
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-gray-50 text-gray-500 cursor-not-allowed"
                            }`}
                            title={
                              landlord.is_active
                                ? "Deactivate Account"
                                : hasVerificationDocuments(landlord)
                                ? "Activate Account"
                                : "Cannot activate - Missing verification documents"
                            }
                          >
                            {actionLoading[
                              `status_${landlord.landlord_slug}`
                            ] ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : landlord.is_active ? (
                              <UserX size={14} />
                            ) : hasVerificationDocuments(landlord) ? (
                              <UserCheck size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            <span className="truncate">
                              {landlord.is_active
                                ? "Deactivate"
                                : hasVerificationDocuments(landlord)
                                ? "Activate"
                                : "No Docs"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </AnimatePresence>
            </Motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Motion.div
                className="flex flex-col items-center justify-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-sm text-gray-600 text-center">
                  Page {currentPage} of {totalPages} ({filteredLandlords.length}{" "}
                  total results)
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {(() => {
                      const pages = [];
                      const showPages = 5; // Show 5 page numbers on desktop, will be responsive via CSS
                      let startPage = Math.max(
                        1,
                        currentPage - Math.floor(showPages / 2)
                      );
                      let endPage = Math.min(
                        totalPages,
                        startPage + showPages - 1
                      );

                      // Adjust start page if we're near the end
                      if (endPage - startPage + 1 < showPages) {
                        startPage = Math.max(1, endPage - showPages + 1);
                      }

                      // Add ellipsis at the beginning if needed
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => handlePageChange(1)}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span
                              key="ellipsis1"
                              className="px-1 sm:px-2 text-gray-400 text-xs"
                            >
                              ...
                            </span>
                          );
                        }
                      }

                      // Add page numbers
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm transition-colors ${
                              i === currentPage
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Add ellipsis at the end if needed
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span
                              key="ellipsis2"
                              className="px-1 sm:px-2 text-gray-400 text-xs"
                            >
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </Motion.div>
            )}
          </>
        )}

        {/* Landlord Details Modal */}
        <ViewModal
          showLandlordModal={showLandlordModal}
          setShowLandlordModal={setShowLandlordModal}
          selectedLandlord={selectedLandlord}
          onLandlordUpdate={handleLandlordUpdate}
        />

        {/* Activation Review Modal */}
        <ActivationReviewModal
          isOpen={showActivationModal}
          onClose={() => setShowActivationModal(false)}
          landlord={selectedLandlord}
          onApprove={handleActivationApprove}
          onReject={handleActivationReject}
          isLoading={actionLoading[`status_${selectedLandlord?.landlord_slug}`]}
        />

        {/* Deactivation Confirmation Modal */}
        <DeactivationConfirmationModal
          isOpen={showDeactivationModal}
          onClose={() => setShowDeactivationModal(false)}
          landlord={selectedLandlord}
          onConfirm={handleDeactivationConfirm}
          isLoading={actionLoading[`status_${selectedLandlord?.landlord_slug}`]}
        />

        {/* Pending Updates Review Modal */}
        <PendingUpdatesReviewModal
          isOpen={showPendingUpdatesModal}
          onClose={() => {
            setShowPendingUpdatesModal(false);
            setSelectedLandlord(null);
          }}
          landlord={selectedLandlord}
          onApprove={handleApprovePendingUpdates}
          onReject={handleRejectPendingUpdates}
          isLoading={
            actionLoading[`pending_updates_${selectedLandlord?.landlord_slug}`]
          }
        />

        {/* KYC Review Modal */}
        <KYCReviewModal
          isOpen={showKYCModal}
          onClose={() => {
            setShowKYCModal(false);
            setSelectedLandlord(null);
          }}
          landlord={selectedLandlord}
          onApprove={handleApproveKYC}
          onReject={handleRejectKYC}
          isLoading={actionLoading[`kyc_${selectedLandlord?.landlord_slug}`]}
        />
      </div>
    </AuthLayout>
  );
};

export default LandlordManagement;
