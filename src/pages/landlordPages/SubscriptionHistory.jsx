import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  History,
  Crown,
  Clock,
  Calendar,
  DollarSign,
  Receipt,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Package,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import subscriptionRequest from "../../api/Landlord/General/SubscriptionRequest";
import { toast } from "react-toastify";
import moment from "moment";

const SubscriptionHistory = () => {
  const navigate = useNavigate();
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // DataTable states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, expired, pending
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSubscriptionHistory();
  }, []);

  const fetchSubscriptionHistory = async () => {
    setLoading(true);
    try {
      const response = await subscriptionRequest.getSubscriptionHistory();
      if (response?.status && response?.status_code === "000") {
        setSubscriptionHistory(response?.data || []);
      } else {
        toast.error(
          response?.message || "Failed to fetch subscription history."
        );
        setSubscriptionHistory([]);
      }
    } catch (err) {
      console.error("Subscription history error:", err);
      toast.error("Failed to fetch subscription history. Please try again.");
      setSubscriptionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalSubscriptions = subscriptionHistory.length;
    const totalAmount = subscriptionHistory.reduce(
      (sum, sub) => sum + parseFloat(sub.amount || 0),
      0
    );
    const activeSubscriptions = subscriptionHistory.filter((sub) =>
      moment(sub.end_date).isAfter(moment())
    ).length;
    const expiredSubscriptions = subscriptionHistory.filter((sub) =>
      moment(sub.end_date).isBefore(moment())
    ).length;

    return {
      totalSubscriptions,
      totalAmount,
      activeSubscriptions,
      expiredSubscriptions,
    };
  };

  const stats = getStatistics();

  // Toggle row expansion for remarks
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
    let filtered = [...subscriptionHistory];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((sub) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          sub.subscription_plan?.toLowerCase().includes(searchLower) ||
          sub.transaction_id?.toLowerCase().includes(searchLower) ||
          sub.amount?.toString().includes(searchLower) ||
          sub.id?.toString().includes(searchLower) ||
          sub.remarks?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => {
        const isExpired = moment(sub.end_date).isBefore(moment());
        const isActive = !isExpired && moment(sub.end_date).isAfter(moment());

        if (statusFilter === "active") return isActive;
        if (statusFilter === "expired") return isExpired;
        if (statusFilter === "pending") return !isActive && !isExpired;
        return true;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case "plan":
            aValue = a.subscription_plan?.toLowerCase() || "";
            bValue = b.subscription_plan?.toLowerCase() || "";
            break;
          case "status": {
            const aExpired = moment(a.end_date).isBefore(moment());
            const aActive = !aExpired && moment(a.end_date).isAfter(moment());
            const bExpired = moment(b.end_date).isBefore(moment());
            const bActive = !bExpired && moment(b.end_date).isAfter(moment());
            aValue = aActive ? "active" : aExpired ? "expired" : "pending";
            bValue = bActive ? "active" : bExpired ? "expired" : "pending";
            break;
          }
          case "amount":
            aValue = parseFloat(a.amount || 0);
            bValue = parseFloat(b.amount || 0);
            break;
          case "duration":
            aValue = moment(a.end_date).diff(moment(a.start_date), "days");
            bValue = moment(b.end_date).diff(moment(b.start_date), "days");
            break;
          case "start_date":
            aValue = moment(a.start_date).valueOf();
            bValue = moment(b.start_date).valueOf();
            break;
          case "end_date":
            aValue = moment(a.end_date).valueOf();
            bValue = moment(b.end_date).valueOf();
            break;
          case "transaction_id":
            aValue = a.transaction_id?.toLowerCase() || "";
            bValue = b.transaction_id?.toLowerCase() || "";
            break;
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
    }

    return filtered;
  };

  // Pagination
  const filteredData = getFilteredAndSortedData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Header Section */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/landlord-dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Subscription History
              </h1>
              <p className="text-gray-600">
                View all your subscription transactions and payments
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Statistics Cards */}
        {subscriptionHistory.length > 0 && (
          <Motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    Total Subscriptions
                  </p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.totalSubscriptions}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Motion.div>

            <Motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    GHS{" "}
                    {stats.totalAmount.toLocaleString("en-GH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Motion.div>

            <Motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm p-6 border border-orange-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.activeSubscriptions}
                  </h3>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Motion.div>

            <Motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Expired</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.expiredSubscriptions}
                  </h3>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}

        {/* Empty State */}
        {subscriptionHistory.length === 0 ? (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                No Subscription History
              </h3>
              <p className="text-gray-600 mb-8">
                You don't have any subscription history yet. Purchase a
                subscription plan to get started with managing your properties.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/subscription/upgrade")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-8 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Purchase Subscription</span>
                </Motion.button>
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/landlord-dashboard")}
                  className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 rounded-xl px-8 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </Motion.button>
              </div>
            </div>
          </Motion.div>
        ) : (
          /* Subscription History Table */
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Table Header */}
            <div className="bg-gradient-to-r from-orange-500 via-blue-500 to-teal-500 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Subscription History
                  </h2>
                  <p className="text-white/90 text-sm">
                    Showing {filteredData.length} of{" "}
                    {subscriptionHistory.length} subscription
                    {subscriptionHistory.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/payments")}
                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-purple-600 rounded-xl px-6 py-2.5 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm whitespace-nowrap"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Payments</span>
                  </Motion.button>
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/subscription/upgrade")}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 rounded-xl px-6 py-2.5 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Upgrade/Renew</span>
                  </Motion.button>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by plan, transaction ID, amount, or remarks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>

                  {/* Items per page */}
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm font-medium"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>

                  {/* Clear Filters */}
                  {(searchTerm || statusFilter !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Head */}
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("plan")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Plan
                        {getSortIcon("plan")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Status
                        {getSortIcon("status")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("amount")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Amount
                        {getSortIcon("amount")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("duration")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Duration
                        {getSortIcon("duration")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("start_date")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Start Date
                        {getSortIcon("start_date")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("end_date")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        End Date
                        {getSortIcon("end_date")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("transaction_id")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Transaction ID
                        {getSortIcon("transaction_id")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Receipt className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-600 font-medium">
                            No subscriptions found matching your criteria
                          </p>
                          {(searchTerm || statusFilter !== "all") && (
                            <button
                              onClick={clearFilters}
                              className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Clear filters to see all subscriptions
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((subscription, index) => {
                      const isExpired = moment(subscription.end_date).isBefore(
                        moment()
                      );
                      const isActive =
                        !isExpired &&
                        moment(subscription.end_date).isAfter(moment());
                      const duration = moment(subscription.end_date).diff(
                        moment(subscription.start_date),
                        "days"
                      );
                      const isExpanded = expandedRows.has(subscription.id);

                      return (
                        <>
                          <Motion.tr
                            key={subscription.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`hover:bg-gray-50 transition-colors duration-150 ${
                              isActive
                                ? "bg-green-50/30"
                                : isExpired
                                ? "bg-gray-50"
                                : "bg-blue-50/30"
                            }`}
                          >
                            {/* Plan */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    isActive
                                      ? "bg-green-100"
                                      : isExpired
                                      ? "bg-gray-100"
                                      : "bg-blue-100"
                                  }`}
                                >
                                  <Crown
                                    className={`w-4 h-4 ${
                                      isActive
                                        ? "text-green-600"
                                        : isExpired
                                        ? "text-gray-600"
                                        : "text-blue-600"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900 capitalize">
                                    {subscription.subscription_plan}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">
                                    ID: #{subscription.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  isActive
                                    ? "bg-green-100 text-green-800"
                                    : isExpired
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Active</span>
                                  </>
                                ) : isExpired ? (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Expired</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Pending</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-bold text-gray-900">
                                  GHS{" "}
                                  {parseFloat(
                                    subscription.amount
                                  ).toLocaleString("en-GH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {duration} {duration === 1 ? "Day" : "Days"}
                                </span>
                              </div>
                            </td>

                            {/* Start Date */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {moment(subscription.start_date).format(
                                  "MMM DD, YYYY"
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {moment(subscription.start_date).format(
                                  "h:mm A"
                                )}
                              </div>
                            </td>

                            {/* End Date */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {moment(subscription.end_date).format(
                                  "MMM DD, YYYY"
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {moment(subscription.end_date).format("h:mm A")}
                              </div>
                            </td>

                            {/* Transaction ID */}
                            <td className="px-6 py-4">
                              <div className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                                {subscription.transaction_id}
                              </div>
                            </td>

                            {/* Details/Expand Button */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {subscription.remarks ? (
                                <button
                                  onClick={() =>
                                    toggleRowExpansion(subscription.id)
                                  }
                                  className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      <span>Hide</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      <span>View</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </Motion.tr>

                          {/* Expanded Row for Remarks */}
                          {subscription.remarks && isExpanded && (
                            <Motion.tr
                              key={`remarks-${subscription.id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-orange-50/50 border-b border-orange-100"
                            >
                              <td colSpan={8} className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                  <Sparkles className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                                      Remarks
                                    </p>
                                    <p className="text-sm text-gray-700 italic">
                                      {subscription.remarks}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </Motion.tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold">
                      {Math.min(endIndex, filteredData.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">{filteredData.length}</span>{" "}
                    entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, idx, arr) => {
                          // Add ellipsis
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && (
                                <span className="px-2 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? "bg-orange-500 text-white shadow-md"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </div>
    </AuthLayout>
  );
};

export default SubscriptionHistory;
