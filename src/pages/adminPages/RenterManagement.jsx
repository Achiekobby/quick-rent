import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Shield,
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
  Activity,
  TrendingUp,
  Home,
  DollarSign,
  Clock,
  Grid3X3,
  List,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
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
  Heart,
  Bookmark,
  Calendar as CalendarIcon,
  User,
  Sparkles,
  MailIcon,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import generalRentersRequests from "../../api/Admin/Rentors/GeneralRentorsRequests";
import ViewModal from "../../components/AdminRenters/ViewModal";
import EditRenterModal from "../../components/AdminRenters/EditRenterModal";

const RenterManagement = () => {
  // State management
  const [renters, setRenters] = useState([]);
  const [filteredRenters, setFilteredRenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [showRenterModal, setShowRenterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginatedRenters, setPaginatedRenters] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    newThisMonth: 0,
  });

  // Calculate stats
  const calculateStats = (rentersData) => {
    const totalRenters = rentersData?.length || 0;
    const activeRenters = rentersData?.filter((r) => r.is_active).length || 0;
    const verifiedRenters = rentersData?.filter((r) => r.is_verified).length || 0;
    const newThisMonth = rentersData?.filter((r) =>
      moment(r.created_at).isAfter(moment().subtract(1, "month"))
    ).length || 0;

    return {
      total: totalRenters,
      active: activeRenters,
      inactive: totalRenters - activeRenters,
      verified: verifiedRenters,
      unverified: totalRenters - verifiedRenters,
      newThisMonth,
    };
  };

  // Update stats whenever renters data changes
  useEffect(() => {
    setStats(calculateStats(renters));
  }, [renters]);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await generalRentersRequests.getRenters();
        if (response?.data?.status_code === "000" && !response?.data?.in_error) {
          setRenters(response?.data?.data);
          setFilteredRenters(response?.data?.data);
        } else {
          toast.error(response?.data?.reason || "Failed to load renters");
        }
      } catch (error) {
        console.error("Error loading renters:", error);
        toast.error("Failed to load renters");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...renters];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (renter) =>
          renter.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          renter.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          renter.phone_number?.includes(searchQuery) ||
          renter.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case "active":
        filtered = filtered.filter((r) => r.is_active);
        break;
      case "inactive":
        filtered = filtered.filter((r) => !r.is_active);
        break;
      case "verified":
        filtered = filtered.filter((r) => r.is_verified);
        break;
      case "unverified":
        filtered = filtered.filter((r) => !r.is_verified);
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "name":
        filtered.sort((a, b) => a.full_name?.localeCompare(b.full_name));
        break;
      case "email":
        filtered.sort((a, b) => a.email?.localeCompare(b.email));
        break;
      default:
        break;
    }

    setFilteredRenters(filtered);
    setCurrentPage(1);
  }, [renters, searchQuery, selectedFilter, sortBy]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRenters(filteredRenters.slice(startIndex, endIndex));
  }, [filteredRenters, currentPage, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRenters.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRenters.length);

  // Action handlers
  const handleToggleStatus = async (renterSlug, currentStatus) => {
    setActionLoading((prev) => ({ ...prev, [`status_${renterSlug}`]: true }));

    try {
      const response = await generalRentersRequests.updateAccountStatus({
        user_slug: renterSlug,
        status: currentStatus ? "deactivate" : "activate",
      });

      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Account status updated successfully");
        setRenters((prev) =>
          prev.map((renter) =>
            renter.user_slug === renterSlug
              ? { ...renter, is_active: !currentStatus }
              : renter
          )
        );
      } else {
        toast.error(response?.data?.reason || "Failed to update account status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update renter status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status_${renterSlug}`]: false }));
    }
  };

  const handleToggleVerification = async (renterSlug, currentStatus) => {
    setActionLoading((prev) => ({ ...prev, [`verify_${renterSlug}`]: true }));

    try {
      const response = await generalRentersRequests.updateAccountStatus({
        user_slug: renterSlug,
        status: currentStatus ? "unverify" : "verify",
      });

      if (!response?.data?.in_error) {
        toast.success(response?.data?.reason || "Account verified successfully");
        setRenters((prev) =>
          prev.map((renter) =>
            renter.user_slug === renterSlug
              ? {
                  ...renter,
                  is_verified: !currentStatus,
                  verification_status: !currentStatus ? "verified" : "pending",
                }
              : renter
          )
        );
      } else {
        toast.error(response?.data?.reason || "Failed to verify account");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update verification status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`verify_${renterSlug}`]: false }));
    }
  };

  const handleViewDetails = (renter) => {
    setSelectedRenter(renter);
    setShowRenterModal(true);
  };

  const handleEditRenter = (renter) => {
    setSelectedRenter(renter);
    setShowEditModal(true);
  };

  const getStatusBadge = (renter) => {
    if (!renter.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <XCircle size={12} />
          Inactive
        </span>
      );
    }

    if (renter.is_verified) {
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

  const handleRenterUpdate = (renterSlug, updates) => {
    setRenters((prev) =>
      prev.map((renter) =>
        renter.user_slug === renterSlug ? { ...renter, ...updates } : renter
      )
    );

    if (selectedRenter?.user_slug === renterSlug) {
      setSelectedRenter((prev) => ({ ...prev, ...updates }));
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading renters...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <Motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Renter Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Manage and monitor all renters on the platform
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
          </div>
        </Motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            {
              title: "Total Renters",
              value: stats.total,
              icon: Users,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100",
              delay: 0.1,
            },
            {
              title: "Active Renters",
              value: stats.active,
              icon: UserCheck,
              gradient: "from-green-500 to-green-600",
              bgGradient: "from-green-50 to-green-100",
              delay: 0.2,
            },
            {
              title: "Inactive Renters",
              value: stats.inactive,
              icon: UserX,
              gradient: "from-red-500 to-red-600",
              bgGradient: "from-red-50 to-red-100",
              delay: 0.3,
            },
            {
              title: "Verified Renters",
              value: stats.verified,
              icon: Shield,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100",
              delay: 0.4,
            },
            {
              title: "Pending Verification",
              value: stats.unverified,
              icon: AlertCircle,
              gradient: "from-yellow-500 to-yellow-600",
              bgGradient: "from-yellow-50 to-yellow-100",
              delay: 0.5,
            },
            {
              title: "New This Month",
              value: stats.newThisMonth,
              icon: Sparkles,
              gradient: "from-indigo-500 to-indigo-600",
              bgGradient: "from-indigo-50 to-indigo-100",
              delay: 0.6,
            },
          ].map((stat) => (
            <Motion.div
              key={stat.title}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}
              whileHover={{ y: -4, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {stat.title.split(" ")[0]}
                  </p>
                  <Motion.p
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: stat.delay + 0.2, type: "spring" }}
                  >
                    {stat.value}
                  </Motion.p>
                </div>
              </div>
              <div className="border-t border-white/50 pt-3">
                <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight size={12} className="text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    +{Math.floor(Math.random() * 15) + 5}% this month
                  </span>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>

        {/* Enhanced Filters and Search */}
        <Motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search renters by name, email, phone, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="email">Email A-Z</option>
                </select>

                <div className="flex items-center border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-purple-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    } transition-colors rounded-l-lg`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-purple-500 text-white"
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
            Showing {filteredRenters.length > 0 ? startItem : 0} to {endItem} of{" "}
            {filteredRenters.length} renters
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>

        {/* Renters Grid */}
        {filteredRenters.length === 0 ? (
          <Motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No renters found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </Motion.div>
        ) : (
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
              {paginatedRenters.map((renter, index) => (
                <Motion.div
                  key={renter.id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ y: -4, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-lg">
                          {renter.full_name?.charAt(0) || "R"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate capitalize">
                            {renter.full_name || "Unknown User"}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {renter.email || "No email"}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">{getStatusBadge(renter)}</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">
                          {renter.phone_number || "No phone"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MailIcon size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">
                          {renter.email || "No email"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 text-xs truncate">
                          Joined {moment(renter.created_at).format("MMM YYYY")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewDetails(renter)}
                          className="group flex items-center justify-center gap-1 px-2 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all duration-300 text-xs font-medium hover:shadow-md transform hover:-translate-y-0.5"
                          title="View Details"
                        >
                          <Eye size={12} className="group-hover:scale-110 transition-transform duration-300" />
                          <span className="hidden md:inline">Details</span>
                        </button>

                        <button
                          onClick={() => handleEditRenter(renter)}
                          className="group flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 text-xs font-medium hover:shadow-md transform hover:-translate-y-0.5"
                          title="Edit Renter"
                        >
                          <Settings size={12} className="group-hover:rotate-90 transition-transform duration-300" />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleToggleVerification(renter.user_slug, renter.is_verified)
                          }
                          disabled={actionLoading[`verify_${renter.user_slug}`]}
                          className={`group flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-300 text-xs font-medium hover:shadow-md transform hover:-translate-y-0.5 ${
                            renter.is_verified
                              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          } disabled:opacity-50 disabled:transform-none`}
                          title={renter.is_verified ? "Remove Verification" : "Verify Account"}
                        >
                          {actionLoading[`verify_${renter.user_slug}`] ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Shield size={12} className="group-hover:scale-110 transition-transform duration-300" />
                          )}
                          <span className="hidden md:inline">
                            {renter.is_verified ? "Unverify" : "Verify"}
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(renter.user_slug, renter.is_active)
                          }
                          disabled={actionLoading[`status_${renter.user_slug}`]}
                          className={`group flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-300 text-xs font-medium hover:shadow-md transform hover:-translate-y-0.5 ${
                            renter.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          } disabled:opacity-50 disabled:transform-none`}
                          title={renter.is_active ? "Deactivate Account" : "Activate Account"}
                        >
                          {actionLoading[`status_${renter.user_slug}`] ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : renter.is_active ? (
                            <UserX size={12} className="group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <UserCheck size={12} className="group-hover:scale-110 transition-transform duration-300" />
                          )}
                          <span className="hidden md:inline">
                            {renter.is_active ? "Deactivate" : "Activate"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </AnimatePresence>
          </Motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Motion.div
            className="flex flex-col items-center justify-center mt-8 pt-6 border-t border-gray-200 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-sm text-gray-600 text-center">
              Page {currentPage} of {totalPages} ({filteredRenters.length} total results)
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft size={14} />
              </button>

              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                  let endPage = Math.min(totalPages, startPage + showPages - 1);

                  if (endPage - startPage + 1 < showPages) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          i === currentPage
                            ? "bg-purple-600 text-white border-purple-600"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </Motion.div>
        )}

        {/* Renter Details Modal */}
        <ViewModal
          showRenterModal={showRenterModal}
          setShowRenterModal={setShowRenterModal}
          selectedRenter={selectedRenter}
          onRenterUpdate={handleRenterUpdate}
          onEditRenter={handleEditRenter}
        />

        {/* Edit Renter Modal */}
        <EditRenterModal
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          selectedRenter={selectedRenter}
          onRenterUpdate={handleRenterUpdate}
        />
      </div>
    </AuthLayout>
  );
};

export default RenterManagement; 