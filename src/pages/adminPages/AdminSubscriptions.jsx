import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Crown,
  ArrowLeft,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin,
  Users,
  TrendingUp,
  CreditCard,
  Sparkles,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import dashboardRequests from "../../api/Admin/DashboardRequets";
import { toast } from "react-toastify";
import moment from "moment";

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // DataTable states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, expired
  const [planFilter, setPlanFilter] = useState("all"); // all, bronze, silver, gold
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await dashboardRequests.getLandlordSubscriptions();
      if (response?.status && response?.status_code === "000") {
        setSubscriptions(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch subscriptions.");
        setSubscriptions([]);
      }
    } catch (err) {
      console.error("Subscriptions error:", err);
      toast.error("Failed to fetch subscriptions. Please try again.");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;
    const expiredSubscriptions = subscriptions.filter((s) => {
      const endDate = moment(s.end_date);
      return endDate.isBefore(moment()) || s.status === "expired";
    }).length;
    
    const planCounts = subscriptions.reduce((acc, sub) => {
      const plan = sub.subscription_plan?.toLowerCase() || "unknown";
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      planCounts,
    };
  };

  const stats = getStatistics();

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-orange-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-orange-600" />
    );
  };

  // Filter and sort data
  const getFilteredAndSortedData = () => {
    let filtered = [...subscriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((subscription) => {
        const searchLower = searchTerm.toLowerCase();
        const landlord = subscription.landlord || {};
        return (
          subscription.subscription_slug?.toLowerCase().includes(searchLower) ||
          subscription.landlord_slug?.toLowerCase().includes(searchLower) ||
          subscription.subscription_plan?.toLowerCase().includes(searchLower) ||
          landlord.full_name?.toLowerCase().includes(searchLower) ||
          landlord.email?.toLowerCase().includes(searchLower) ||
          landlord.phone_number?.toString().includes(searchLower) ||
          landlord.business_name?.toLowerCase().includes(searchLower) ||
          landlord.location?.toLowerCase().includes(searchLower) ||
          landlord.region?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((subscription) => {
        if (statusFilter === "active") {
          return subscription.status === "active";
        } else if (statusFilter === "expired") {
          const endDate = moment(subscription.end_date);
          return endDate.isBefore(moment()) || subscription.status === "expired";
        }
        return subscription.status === statusFilter;
      });
    }

    // Apply plan filter
    if (planFilter !== "all") {
      filtered = filtered.filter((subscription) => 
        subscription.subscription_plan?.toLowerCase() === planFilter.toLowerCase()
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case "landlord_name": {
            aValue = a.landlord?.full_name?.toLowerCase() || "";
            bValue = b.landlord?.full_name?.toLowerCase() || "";
            break;
          }
          case "business_name": {
            aValue = a.landlord?.business_name?.toLowerCase() || "";
            bValue = b.landlord?.business_name?.toLowerCase() || "";
            break;
          }
          case "subscription_plan": {
            aValue = a.subscription_plan?.toLowerCase() || "";
            bValue = b.subscription_plan?.toLowerCase() || "";
            break;
          }
          case "status": {
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          }
          case "start_date": {
            aValue = moment(a.start_date).valueOf();
            bValue = moment(b.start_date).valueOf();
            break;
          }
          case "end_date": {
            aValue = moment(a.end_date).valueOf();
            bValue = moment(b.end_date).valueOf();
            break;
          }
          case "location": {
            aValue = a.landlord?.location?.toLowerCase() || "";
            bValue = b.landlord?.location?.toLowerCase() || "";
            break;
          }
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: newest first (descending by start_date)
      filtered.sort((a, b) => {
        const aValue = moment(a.start_date).valueOf();
        const bValue = moment(b.start_date).valueOf();
        return bValue - aValue;
      });
    }

    return filtered;
  };

  const filteredData = getFilteredAndSortedData();

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPlanFilter("all");
    setCurrentPage(1);
  };

  // Status badge component
  const getStatusBadge = (subscription) => {
    const endDate = moment(subscription.end_date);
    const isExpired = endDate.isBefore(moment());
    const isActive = subscription.status === "active" && !isExpired;

    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </span>
      );
    } else if (isExpired || subscription.status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Expired
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3" />
          {subscription.status || "Unknown"}
        </span>
      );
    }
  };

  // Plan badge component
  const getPlanBadge = (plan) => {
    const planLower = plan?.toLowerCase() || "";
    const colors = {
      bronze: "bg-orange-100 text-orange-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
    };
    const colorClass = colors[planLower] || "bg-blue-100 text-blue-800";

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
        <Crown className="w-3 h-3" />
        {plan || "Unknown"}
      </span>
    );
  };

  // Get days remaining
  const getDaysRemaining = (endDate) => {
    const end = moment(endDate);
    const now = moment();
    const days = end.diff(now, "days");
    return days;
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="text-gray-600">Loading subscriptions...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header Section */}
        <Motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Motion.button
              onClick={() => navigate("/admin-dashboard")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Motion.button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Crown className="w-8 h-8 text-orange-600" />
                All Subscriptions
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Manage and monitor all landlord subscriptions across the platform
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Subscriptions</span>
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-1">All subscriptions</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Expired</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.expiredSubscriptions}</p>
            <p className="text-xs text-gray-500 mt-1">Require renewal</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Popular Plan</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600 capitalize">
              {Object.keys(stats.planCounts).length > 0
                ? Object.entries(stats.planCounts).sort((a, b) => b[1] - a[1])[0][0]
                : "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Most subscribed plan</p>
          </Motion.div>
        </div>

        {/* Filters and Search */}
        <Motion.div
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by landlord name, email, business, location, subscription plan..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Plans</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all" || planFilter !== "all") && (
                <Motion.button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                  Clear
                </Motion.button>
              )}
            </div>
          </div>
        </Motion.div>

        {/* Data Table */}
        <Motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                Subscription Details
              </h2>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of{" "}
                {filteredData.length} subscriptions
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No subscriptions found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== "all" || planFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No subscriptions available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("landlord_name")}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Landlord
                        {getSortIcon("landlord_name")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("subscription_plan")}>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Plan
                        {getSortIcon("subscription_plan")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("start_date")}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Date
                        {getSortIcon("start_date")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("end_date")}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        End Date
                        {getSortIcon("end_date")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("status")}>
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon("status")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((subscription) => {
                    const landlord = subscription.landlord || {};
                    const daysRemaining = getDaysRemaining(subscription.end_date);
                    const isExpanded = expandedRows.has(subscription.id);

                    return (
                      <>
                        <tr
                          key={subscription.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {landlord.business_logo ? (
                                <img
                                  src={landlord.business_logo}
                                  alt={landlord.business_name || landlord.full_name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                                  {landlord.full_name?.charAt(0)?.toUpperCase() || "L"}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {landlord.full_name || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {landlord.business_name || "No business name"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPlanBadge(subscription.subscription_plan)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {moment(subscription.start_date).format("MMM DD, YYYY")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {moment(subscription.start_date).format("h:mm A")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {moment(subscription.end_date).format("MMM DD, YYYY")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {daysRemaining > 0 ? (
                                <span className="text-green-600 font-medium">
                                  {daysRemaining} days left
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">Expired</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(subscription)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Motion.button
                              onClick={() => toggleRowExpansion(subscription.id)}
                              className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </Motion.button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              <Motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                              >
                                {/* Subscription Details */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-orange-600" />
                                    Subscription Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subscription ID:</span>
                                      <span className="font-mono text-xs text-gray-900">
                                        {subscription.subscription_slug?.slice(0, 8)}...
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Landlord Slug:</span>
                                      <span className="font-mono text-xs text-gray-900">
                                        {subscription.landlord_slug?.slice(0, 8)}...
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Duration:</span>
                                      <span className="text-gray-900">
                                        {moment(subscription.end_date).diff(
                                          moment(subscription.start_date),
                                          "days"
                                        )}{" "}
                                        days
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Landlord Details */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-blue-600" />
                                    Landlord Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                      <span className="text-gray-600 flex-1">{landlord.email || "N/A"}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                      <span className="text-gray-600 flex-1">{landlord.phone_number || "N/A"}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                      <span className="text-gray-600 flex-1">
                                        {landlord.location || "N/A"}, {landlord.region || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                                      <span className="text-gray-600 flex-1">
                                        {landlord.business_type || "N/A"}
                                      </span>
                                    </div>
                                    {landlord.business_registration_number && (
                                      <div className="flex items-start gap-2">
                                        <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <span className="text-gray-600 flex-1">
                                          Reg: {landlord.business_registration_number}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Motion.div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Motion.button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Motion.button>

                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Motion.button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Motion.button>
                </div>
              </div>
            </div>
          )}
        </Motion.div>
      </div>
    </AuthLayout>
  );
};

export default AdminSubscriptions;

