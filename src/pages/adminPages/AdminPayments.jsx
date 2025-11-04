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
  Users,
  Building,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import dashboardRequests from "../../api/Admin/DashboardRequets";
import Images from "../../utils/Images";
import Config from "../../utils/Config";
import { toast } from "react-toastify";
import moment from "moment";

const AdminPayments = () => {
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
      const response = await dashboardRequests.getSubscriptionPayments();
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
          payment.network?.toLowerCase().includes(searchLower) ||
          payment.landlord_id?.toString().includes(searchLower)
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
          case "transaction_id": {
            aValue = a.transaction_id?.toLowerCase() || "";
            bValue = b.transaction_id?.toLowerCase() || "";
            break;
          }
          case "reference": {
            aValue = a.reference?.toLowerCase() || "";
            bValue = b.reference?.toLowerCase() || "";
            break;
          }
          case "amount": {
            aValue = parseFloat(a.amount || 0);
            bValue = parseFloat(b.amount || 0);
            break;
          }
          case "status": {
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          }
          case "payment_type": {
            aValue = a.payment_type?.toLowerCase() || "";
            bValue = b.payment_type?.toLowerCase() || "";
            break;
          }
          case "network": {
            aValue = a.network?.toLowerCase() || "";
            bValue = b.network?.toLowerCase() || "";
            break;
          }
          case "user_name": {
            aValue = a.user_name?.toLowerCase() || "";
            bValue = b.user_name?.toLowerCase() || "";
            break;
          }
          case "landlord_id": {
            aValue = parseInt(a.landlord_id || 0);
            bValue = parseInt(b.landlord_id || 0);
            break;
          }
          case "created_at": {
            aValue = moment(a.created_at).valueOf();
            bValue = moment(b.created_at).valueOf();
            break;
          }
          case "subscription_plan": {
            aValue = a.subscription_plan?.toLowerCase() || "";
            bValue = b.subscription_plan?.toLowerCase() || "";
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
      // Default sort: newest first (descending by created_at)
      filtered.sort((a, b) => {
        const aValue = moment(a.created_at).valueOf();
        const bValue = moment(b.created_at).valueOf();
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
    setPaymentTypeFilter("all");
    setCurrentPage(1);
  };

  // Status badge component
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // Get network icon
  const getNetworkIcon = (network) => {
    if (!network) return <Wallet className="w-5 h-5 text-gray-400" />;

    const networkUpper = network.toUpperCase();
    if (networkUpper === Config.mtn) {
      return <img src={Images.mtn_momo} alt="MTN" className="w-5 h-5 object-contain" />;
    } else if (networkUpper === Config.telecel) {
      return <img src={Images.telecel_cash} alt="Telecel" className="w-5 h-5 object-contain" />;
    } else if (networkUpper === Config.airtelTigo) {
      return <img src={Images.at_cash} alt="AirtelTigo" className="w-5 h-5 object-contain" />;
    } else if (networkUpper === Config.card_payment) {
      return <CreditCard className="w-5 h-5 text-blue-600" />;
    }
    return <Wallet className="w-5 h-5 text-gray-400" />;
  };

  // Get network name
  const getNetworkName = (network) => {
    if (!network) return "Unknown";
    const networkUpper = network.toUpperCase();
    if (networkUpper === Config.mtn) return "MTN";
    if (networkUpper === Config.telecel) return "Telecel";
    if (networkUpper === Config.airtelTigo) return "AirtelTigo";
    if (networkUpper === Config.card_payment) return "Card";
    return network;
  };

  // Get payment type icon
  const getPaymentTypeIcon = (paymentType) => {
    switch (paymentType?.toUpperCase()) {
      case "MOM":
        return <Phone className="w-4 h-4 text-green-600" />;
      case "CRD":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get payment type name
  const getPaymentTypeName = (paymentType) => {
    switch (paymentType?.toUpperCase()) {
      case "MOM":
        return "Mobile Money";
      case "CRD":
        return "Card Payment";
      default:
        return paymentType || "Unknown";
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
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
                <Receipt className="w-8 h-8 text-orange-600" />
                Landlord Payments
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Monitor all subscription payment transactions across the platform
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Payments</span>
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
            <p className="text-xs text-gray-500 mt-1">All transactions</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Amount Paid</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              GHS {stats.totalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total revenue</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Paid</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.paidPayments}</p>
            <p className="text-xs text-gray-500 mt-1">Successful payments</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </Motion.div>

          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Failed</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
            <p className="text-xs text-gray-500 mt-1">Unsuccessful payments</p>
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
                  placeholder="Search by transaction ID, reference, user name, phone, amount..."
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Payment Type Filter */}
              <select
                value={paymentTypeFilter}
                onChange={(e) => {
                  setPaymentTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="MOM">Mobile Money</option>
                <option value="CRD">Card</option>
              </select>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all" || paymentTypeFilter !== "all") && (
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
                <History className="w-5 h-5 text-orange-600" />
                Payment Transactions
              </h2>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of{" "}
                {filteredData.length} transactions
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No payments found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || statusFilter !== "all" || paymentTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No payment transactions available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("transaction_id")}>
                      <div className="flex items-center gap-2">
                        Transaction ID
                        {getSortIcon("transaction_id")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("landlord_id")}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Landlord ID
                        {getSortIcon("landlord_id")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("user_name")}>
                      <div className="flex items-center gap-2">
                        User
                        {getSortIcon("user_name")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("amount")}>
                      <div className="flex items-center gap-2">
                        Amount
                        {getSortIcon("amount")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("network")}>
                      <div className="flex items-center gap-2">
                        Network
                        {getSortIcon("network")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("payment_type")}>
                      <div className="flex items-center gap-2">
                        Payment Type
                        {getSortIcon("payment_type")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("subscription_plan")}>
                      <div className="flex items-center gap-2">
                        Plan
                        {getSortIcon("subscription_plan")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("status")}>
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon("status")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("created_at")}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                        {getSortIcon("created_at")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transaction_id}
                        </div>
                        <div className="text-xs text-gray-500">{payment.reference}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{payment.landlord_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.user_name || "N/A"}
                            </div>
                            {payment.phone_number && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {payment.phone_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          GHS {parseFloat(payment.amount || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getNetworkIcon(payment.network)}
                          <span className="text-sm text-gray-900">
                            {getNetworkName(payment.network)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPaymentTypeIcon(payment.payment_type)}
                          <span className="text-sm text-gray-900">
                            {getPaymentTypeName(payment.payment_type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                          {payment.subscription_plan || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {moment(payment.created_at).format("MMM DD, YYYY")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {moment(payment.created_at).format("h:mm A")}
                        </div>
                      </td>
                    </tr>
                  ))}
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

export default AdminPayments;

