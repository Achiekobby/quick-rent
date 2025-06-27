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
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import { toast } from "react-toastify";
import moment from "moment";
import generalRequests from "../../api/Admin/Landlords/GeneralRequests";
import ViewModal from "../../components/AdminLandlords/ViewModal";

const LandlordManagement = () => {
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
      landlordsData?.filter((l) => l.is_verified).length || 0;
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
        filtered = filtered.filter((l) => l.is_verified);
        break;
      case "unverified":
        filtered = filtered.filter((l) => !l.is_verified);
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
  const handleToggleStatus = async (landlordSlug, currentStatus) => {
    setActionLoading((prev) => ({ ...prev, [`status_${landlordSlug}`]: true }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlordSlug,
        status: currentStatus ? "deactivate" : "activate",
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Account status updated successfully"
        );
      } else {
        toast.error(
          response?.data?.reason || "Failed to update account status"
        );
      }

      setLandlords((prev) =>
        prev.map((landlord) =>
          landlord.landlord_slug === landlordSlug
            ? { ...landlord, is_active: !currentStatus }
            : landlord
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to update landlord status");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`status_${landlordSlug}`]: false,
      }));
    }
  };

  const handleToggleVerification = async (landlordSlug, currentStatus) => {
    setActionLoading((prev) => ({ ...prev, [`verify_${landlordSlug}`]: true }));

    try {
      const response = await generalRequests.updateAccountStatus({
        landlord_slug: landlordSlug,
        status: currentStatus ? "unverify" : "verify",
      });

      if (!response?.data?.in_error) {
        toast.success(
          response?.data?.reason || "Account verified successfully"
        );
      } else {
        toast.error(response?.data?.reason || "Failed to verify account");
      }

      setLandlords((prev) =>
        prev.map((landlord) =>
          landlord.landlord_slug === landlordSlug
            ? {
                ...landlord,
                is_verified: !currentStatus,
                verification_status: !currentStatus ? "verified" : "pending",
              }
            : landlord
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to update verification status");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`verify_${landlordSlug}`]: false,
      }));
    }
  };

  const handleViewDetails = (landlord) => {
    setSelectedLandlord(landlord);
    setShowLandlordModal(true);
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

  const getStatusBadge = (landlord) => {
    if (!landlord.is_active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <XCircle size={12} />
          Inactive
        </span>
      );
    }

    if (landlord.is_verified) {
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
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <Motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Landlord Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Manage and monitor all landlords on the platform
            </p>
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
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
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

                    {/* Content */}
                    <div className="p-3 sm:p-4 space-y-3">
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

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleViewDetails(landlord)}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                            title="View Details"
                          >
                            <Eye size={12} />
                            <span className="hidden md:inline">Details</span>
                          </button>

                          <button
                            onClick={() =>
                              handleToggleVerification(
                                landlord.landlord_slug,
                                landlord.is_verified
                              )
                            }
                            disabled={
                              actionLoading[`verify_${landlord.landlord_slug}`]
                            }
                            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs font-medium ${
                              landlord.is_verified
                                ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            } disabled:opacity-50`}
                            title={
                              landlord.is_verified
                                ? "Remove Verification"
                                : "Verify Account"
                            }
                          >
                            {actionLoading[
                              `verify_${landlord.landlord_slug}`
                            ] ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <Shield size={12} />
                            )}
                            <span className="hidden md:inline">
                              {landlord.is_verified ? "Unverify" : "Verify"}
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              handleToggleStatus(
                                landlord.landlord_slug,
                                landlord.is_active
                              )
                            }
                            disabled={
                              actionLoading[`status_${landlord.landlord_slug}`]
                            }
                            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs font-medium ${
                              landlord.is_active
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            } disabled:opacity-50`}
                            title={
                              landlord.is_active
                                ? "Deactivate Account"
                                : "Activate Account"
                            }
                          >
                            {actionLoading[
                              `status_${landlord.landlord_slug}`
                            ] ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : landlord.is_active ? (
                              <UserX size={12} />
                            ) : (
                              <UserCheck size={12} />
                            )}
                            <span className="hidden md:inline">
                              {landlord.is_active ? "Deactivate" : "Activate"}
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
      </div>
    </AuthLayout>
  );
};

export default LandlordManagement;
