import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  DollarSign,
  Receipt,
  ArrowLeft,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Phone,
  CreditCard,
  Wallet,
  User,
  Calendar,
  History,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import subscriptionRequest from "../../api/Landlord/General/SubscriptionRequest";
import Images from "../../utils/Images";
import Config from "../../utils/Config";
import { toast } from "react-toastify";
import moment from "moment";

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // DataTable states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, paid, pending, failed
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all"); // all, MOM, CRD
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await subscriptionRequest.getPayments();
      if (response?.status && response?.status_code === "000") {
        setPayments(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch payments.");
        setPayments([]);
      }
    } catch (err) {
      console.error("Payments error:", err);
      toast.error("Failed to fetch payments. Please try again.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalPayments = payments.length;
    const totalAmount = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const paidPayments = payments.filter((p) => p.status === "paid").length;
    const pendingPayments = payments.filter((p) => p.status === "pending").length;
    const failedPayments = payments.filter((p) => p.status === "failed").length;

    return {
      totalPayments,
      totalAmount,
      paidPayments,
      pendingPayments,
      failedPayments,
    };
  };

  const stats = getStatistics();

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
    let filtered = [...payments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((payment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          payment.transaction_id?.toLowerCase().includes(searchLower) ||
          payment.reference?.toLowerCase().includes(searchLower) ||
          payment.user_name?.toLowerCase().includes(searchLower) ||
          payment.phone_number?.toString().includes(searchLower) ||
          payment.amount?.toString().includes(searchLower) ||
          payment.subscription_plan?.toLowerCase().includes(searchLower) ||
          payment.network?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Apply payment type filter
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter((payment) => 
        payment.payment_type?.toUpperCase() === paymentTypeFilter.toUpperCase()
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case "transaction_id":
            aValue = a.transaction_id?.toLowerCase() || "";
            bValue = b.transaction_id?.toLowerCase() || "";
            break;
          case "reference":
            aValue = a.reference?.toLowerCase() || "";
            bValue = b.reference?.toLowerCase() || "";
            break;
          case "amount":
            aValue = parseFloat(a.amount || 0);
            bValue = parseFloat(b.amount || 0);
            break;
          case "status":
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          case "payment_type":
            aValue = a.payment_type?.toLowerCase() || "";
            bValue = b.payment_type?.toLowerCase() || "";
            break;
          case "network":
            aValue = a.network?.toLowerCase() || "";
            bValue = b.network?.toLowerCase() || "";
            break;
          case "user_name":
            aValue = a.user_name?.toLowerCase() || "";
            bValue = b.user_name?.toLowerCase() || "";
            break;
          case "created_at":
            aValue = moment(a.created_at).valueOf();
            bValue = moment(b.created_at).valueOf();
            break;
          case "subscription_plan":
            aValue = a.subscription_plan?.toLowerCase() || "";
            bValue = b.subscription_plan?.toLowerCase() || "";
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
    } else {
      // Default sort: newest first (descending by created_at)
      filtered.sort((a, b) => {
        const aValue = moment(a.created_at).valueOf();
        const bValue = moment(b.created_at).valueOf();
        return bValue - aValue; // Descending order (newest first)
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
  }, [searchTerm, statusFilter, paymentTypeFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentTypeFilter("all");
    setSortConfig({ key: "created_at", direction: "desc" });
    setCurrentPage(1);
  };

  // Get network icon based on network code
  const getNetworkIcon = (network) => {
    if (!network) return <Wallet className="w-5 h-5 text-gray-500" />;
    
    switch (network.toUpperCase()) {
      case Config.mtn:
        return <img src={Images.mtn_momo} alt="MTN" className="w-5 h-5 object-contain" />;
      case Config.telecel:
        return <img src={Images.telecel_cash} alt="Telecel" className="w-5 h-5 object-contain" />;
      case Config.airtelTigo:
        return <img src={Images.at_cash} alt="AirtelTigo" className="w-5 h-5 object-contain" />;
      case Config.card_payment:
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get network name
  const getNetworkName = (network) => {
    if (!network) return "—";
    
    switch (network.toUpperCase()) {
      case Config.mtn:
        return "MTN";
      case Config.telecel:
        return "Telecel";
      case Config.airtelTigo:
        return "AirtelTigo";
      case Config.card_payment:
        return "Card";
      default:
        return network;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid</span>
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
        );
      case "failed":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{status || "Unknown"}</span>
          </div>
        );
    }
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
                Payment Transactions
              </h1>
              <p className="text-gray-600">
                View all your payment transactions and history
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Statistics Cards */}
        {payments.length > 0 && (
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
                  <p className="text-gray-600 text-sm mb-1">Total Payments</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.totalPayments}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-600" />
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
                  <p className="text-gray-600 text-sm mb-1">Total Amount Paid</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    GHS {stats.totalAmount.toLocaleString("en-GH", {
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
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Paid</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.paidPayments}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Motion.div>

            <Motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm p-6 border border-yellow-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pending</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {stats.pendingPayments}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}

        {/* Empty State */}
        {payments.length === 0 ? (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                No Payment Transactions
              </h3>
              <p className="text-gray-600 mb-8">
                You don't have any payment transactions yet. Your payment history will appear here once you make subscription payments.
              </p>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/landlord-dashboard")}
                className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 rounded-xl px-8 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Motion.button>
            </div>
          </Motion.div>
        ) : (
          /* Payments Table */
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
                    Payment Transactions
                  </h2>
                  <p className="text-white/90 text-sm">
                    Showing {filteredData.length} of {payments.length} transaction{payments.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/subscription/history")}
                  className="flex items-center gap-2 bg-white/90 hover:bg-white text-blue-600 rounded-xl px-6 py-2.5 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm whitespace-nowrap"
                >
                  <History className="w-4 h-4" />
                  <span>Subscription History</span>
                </Motion.button>
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
                      placeholder="Search by transaction ID, reference, user name, phone, amount..."
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

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    value={paymentTypeFilter}
                    onChange={(e) => setPaymentTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm font-medium"
                  >
                    <option value="all">All Payment Types</option>
                    <option value="MOM">Mobile Money</option>
                    <option value="CRD">Card</option>
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
                  {(searchTerm || statusFilter !== "all" || paymentTypeFilter !== "all") && (
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
                        onClick={() => handleSort("transaction_id")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Trx. ID
                        {getSortIcon("transaction_id")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("reference")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Reference
                        {getSortIcon("reference")}
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
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Status
                        {getSortIcon("status")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("payment_type")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Payment Type
                        {getSortIcon("payment_type")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("network")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Network
                        {getSortIcon("network")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 capitalize tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("subscription_plan")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Plan
                        {getSortIcon("subscription_plan")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        Date & Time
                        {getSortIcon("created_at")}
                      </button>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Receipt className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-600 font-medium">
                            No payments found matching your criteria
                          </p>
                          {(searchTerm || statusFilter !== "all" || paymentTypeFilter !== "all") && (
                            <button
                              onClick={clearFilters}
                              className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Clear filters to see all payments
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((payment, index) => {
                      return (
                        <Motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            payment.status === "paid"
                              ? "bg-green-50/20"
                              : payment.status === "failed"
                              ? "bg-red-50/20"
                              : "bg-yellow-50/20"
                          }`}
                        >
                          {/* Transaction ID */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                              {payment.transaction_id}
                            </div>
                          </td>

                          {/* Reference */}
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.reference || "—"}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-bold text-gray-900">
                                GHS{" "}
                                {parseFloat(payment.amount || 0).toLocaleString("en-GH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>

                          {/* Payment Type */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {payment.payment_type?.toUpperCase() === "MOM" ? (
                                <>
                                  <Phone className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-900">
                                    Mobile Money
                                  </span>
                                </>
                              ) : payment.payment_type?.toUpperCase() === "CRD" ? (
                                <>
                                  <CreditCard className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-medium text-gray-900">
                                    Card Payment
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  {payment.payment_type || "—"}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Network */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getNetworkIcon(payment.network)}
                              <span className="text-sm font-medium text-gray-900">
                                {getNetworkName(payment.network)}
                              </span>
                            </div>
                          </td>

                          {/* User Details */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {payment.user_name || "—"}
                                </span>
                              </div>
                              {payment.phone_number && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {payment.phone_number}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Subscription Plan */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {payment.subscription_plan || "—"}
                            </div>
                            {payment.subscription_id && (
                              <div className="text-xs text-gray-500">
                                ID: {payment.subscription_id}
                              </div>
                            )}
                          </td>

                          {/* Date & Time */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div className="text-sm text-gray-900 font-medium">
                                {moment(payment.created_at).format("MMM DD, YYYY")}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 ml-6">
                              {moment(payment.created_at).format("h:mm A")}
                            </div>
                          </td>
                        </Motion.tr>
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
                    Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold">
                      {Math.min(endIndex, filteredData.length)}
                    </span>{" "}
                    of <span className="font-semibold">{filteredData.length}</span> entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, idx, arr) => {
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

export default Payments;

