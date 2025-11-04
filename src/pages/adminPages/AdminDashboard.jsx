import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building,
  Shield,
  ChevronRight,
  BarChart3,
  Settings,
  AlertCircle,
  UserCheck,
  FileText,
  Activity,
  MapPin,
  PieChart,
  Bell,
  Home,
  CreditCard,
  Loader2,
} from "lucide-react";
import Colors from "../../utils/Colors";
import AuthLayout from "../../Layouts/AuthLayout";
import { useNavigate } from "react-router";
import useAuthStore from "../../stores/authStore";
import dashboardRequests from "../../api/Admin/DashboardRequets";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Enhanced state management
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalLandlords: 0,
      totalRenters: 0,
      totalProperties: 0,
      verifiedProperties: 0,
      pendingProperties: 0,
      activeListings: 0,
      newUsersToday: 0,
      propertiesListedToday: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      totalRevenue: 0,
    },
    propertyCategories: [],
    regionStats: [],
  });

  const [subscriptionStats, setSubscriptionStats] = useState({
    total_subscriptions: 0,
    total_active_subscriptions: 0,
    total_expired_subscriptions: 0,
    total_revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [response, subscriptionResponse] = await Promise.all([
          dashboardRequests.getDashboardData(),
          dashboardRequests.getSubscriptionStats(),
        ]);
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setDashboardData(response?.data?.data);
        } else {
          toast.error(response?.data?.message);
        }

        if (
          subscriptionResponse?.status &&
          subscriptionResponse?.status_code === "000"
        ) {
          setSubscriptionStats(subscriptionResponse?.data?.data || {
            total_subscriptions: 0,
            total_active_subscriptions: 0,
            total_expired_subscriptions: 0,
            total_revenue: 0,
          });
        } else {
          toast.error(subscriptionResponse?.message);
        }
      } catch (error) {
        console.error("Dashboard data error:", error);
        toast.error("Error fetching dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-32 h-32 animate-spin" />
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <Motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.full_name || "Administrator"}
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with QuickRent today
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0"></div>
        </Motion.div>

        {/* Platform Overview & Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Overview */}
          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Platform Overview
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">
                  Platform Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Motion.div
                className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active Users
                  </span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">
                      {dashboardData.stats.totalUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Today:</span>
                    <span className="font-medium">
                      {dashboardData.stats.newUsersToday}
                    </span>
                  </div>
                </div>
              </Motion.div>

              <Motion.div
                className="p-4 rounded-lg border-2 border-green-200 bg-green-50"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Properties
                  </span>
                  <Building className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">
                      {dashboardData.stats.totalProperties.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed Today:</span>
                    <span className="font-medium">
                      {dashboardData.stats.propertiesListedToday}
                    </span>
                  </div>
                </div>
              </Motion.div>
            </div>
          </Motion.div>

          {/* Management Tools */}
          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Management Tools
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                // { title: "User Management", path: "/users", icon: Users, count: dashboardData.stats.totalUsers },
                {
                  title: "Landlord Management",
                  path: "/landlords",
                  icon: UserCheck,
                  count: dashboardData.stats.totalLandlords,
                },
                {
                  title: "Renter Management",
                  path: "/renters",
                  icon: Users,
                  count: dashboardData.stats.totalRenters,
                },
                {
                  title: "Property Management",
                  path: "/property-management",
                  icon: Building,
                  count: dashboardData.stats.totalProperties,
                },
              ].map((tool, index) => (
                <Motion.button
                  key={index}
                  onClick={() => navigate(tool.path)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <tool.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {tool.title}
                  </p>
                  <p className="text-xs text-gray-500">{tool.count}</p>
                </Motion.button>
              ))}
            </div>
          </Motion.div>
        </div>

        {/* Subscription Data Card - Full Width */}
        <Motion.div
          className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl shadow-lg border-2 border-purple-200 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-xl">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Subscription Overview
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Monitor subscription metrics and revenue
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Motion.button
                  onClick={() => navigate("/subscriptions")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Activity className="w-5 h-5 group-hover:animate-pulse" />
                  View All Subscriptions
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Motion.button>
                <Motion.button
                  onClick={() => navigate("/admin/payments")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText className="w-5 h-5 group-hover:animate-pulse" />
                  View Payments
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Motion.button>
              </div>
            </div>

            {/* Subscription Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Subscriptions */}
              <Motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-md"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Total
                  </span>
                  <CreditCard className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptionStats.total_subscriptions?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">All subscriptions</p>
              </Motion.div>

              {/* Active Subscriptions */}
              <Motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-md"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Active
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {subscriptionStats.total_active_subscriptions?.toLocaleString() ||
                    0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </Motion.div>

              {/* Expired Subscriptions */}
              <Motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-md"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Expired
                  </span>
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {subscriptionStats.total_expired_subscriptions?.toLocaleString() ||
                    0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Require renewal</p>
              </Motion.div>

              {/* Total Revenue */}
              <Motion.div
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-md"
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Revenue
                  </span>
                  <PieChart className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  GHS {subscriptionStats.total_revenue?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total earnings</p>
              </Motion.div>
            </div>

            {/* Quick Stats Bar */}
            <div className="mt-6 pt-6 border-t border-purple-200/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">
                        {subscriptionStats.total_active_subscriptions || 0}
                      </span>{" "}
                      Active Plans
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">
                        {subscriptionStats.total_expired_subscriptions || 0}
                      </span>{" "}
                      Expired Plans
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-lg">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Platform subscriptions active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Property Categories */}
          <Motion.div
            className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Property Categories
              </h2>
              <Home className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {dashboardData.propertyCategories &&
              dashboardData.propertyCategories.length > 0 ? (
                dashboardData.propertyCategories.map((category, index) => (
                  <Motion.div
                    key={category.category}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {category.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {category.count.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({category.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <Motion.div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </Motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No property categories data available</p>
                </div>
              )}
            </div>
          </Motion.div>

          {/* Regional Distribution */}
          <Motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Regional Distribution
              </h2>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {dashboardData.regionStats &&
              dashboardData.regionStats.length > 0 ? (
                dashboardData.regionStats.map((region, index) => (
                  <Motion.div
                    key={region.region}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {region.region}
                        </span>
                        <span className="text-xs text-gray-500">
                          {region.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <Motion.div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${region.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="flex items-center justify-start mt-1 text-xs text-gray-500">
                        <span>{region.properties} properties</span>
                      </div>
                    </div>
                  </Motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No regional data available</p>
                </div>
              )}
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AdminDashboard;
