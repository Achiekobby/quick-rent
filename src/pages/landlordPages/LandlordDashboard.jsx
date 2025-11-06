import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  Home,
  Plus,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  Eye,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Crown,
  Zap,
  History,
  CreditCard,
  Receipt,
  Globe,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Colors from "../../utils/Colors";
import AuthLayout from "../../Layouts/AuthLayout";
import { useNavigate } from "react-router";
import useAuthStore from "../../stores/authStore";
import { getAllProperties } from "../../api/Landlord/General/PropertyRequest";
import { toast } from "react-toastify";
import moment from "moment";

const LandlordDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual properties data
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await getAllProperties();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setProperties(response?.data?.data || []);
        } else {
          toast.error(
            response?.data?.reason ||
              "Failed to fetch properties. Please try again."
          );
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason ||
            "Failed to fetch properties. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Helper function to calculate days remaining from subscription end_date
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = moment(endDate);
    const now = moment();
    const daysDiff = end.diff(now, "days");
    return Math.max(0, daysDiff);
  };

  // Helper function to check if subscription is expired
  const isSubscriptionExpired = (subscriptionPlan) => {
    if (!subscriptionPlan || !subscriptionPlan.end_date) return true;
    return moment(subscriptionPlan.end_date).isBefore(moment());
  };

  // Helper function to get subscription status
  const getSubscriptionStatus = () => {
    const plan = user?.subscription_plan;
    
    if (!plan) {
      return {
        hasSubscription: false,
        isExpired: true,
        status: "no_subscription",
        planName: null,
        daysLeft: 0,
        startDate: null,
        endDate: null,
        duration: null,
      };
    }

    const expired = isSubscriptionExpired(plan);
    const daysLeft = calculateDaysRemaining(plan.end_date);

    return {
      hasSubscription: true,
      isExpired: expired,
      status: expired ? "expired" : "active",
      planName: plan.plan_name || "Free",
      daysLeft,
      startDate: plan.start_date,
      endDate: plan.end_date,
      duration: plan.duration || 1,
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  // Calculate actual statistics from real data
  const getPropertyStats = () => {
    const totalProperties = properties.length;
    const verifiedProperties = properties.filter(
      (p) => p.approval_status === "verified"
    ).length;
    const pendingProperties = properties.filter(
      (p) => p.approval_status === "unverified"
    ).length;
    const availableProperties = properties.filter((p) => p.is_available).length;

    return {
      totalProperties,
      verifiedProperties,
      pendingProperties,
      availableProperties,
    };
  };

  const stats = getPropertyStats();

  // Get recent properties (last 3 added)
  const getRecentProperties = () => {
    return [...properties]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  };

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat("en-GH", {
  //     style: "currency",
  //     currency: "GHS",
  //     minimumFractionDigits: 0,
  //   }).format(amount || 0);
  // };

  const getStatusBadge = (status) => {
    if (status === "verified") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          <CheckCircle2 size={12} />
          <span>Verified</span>
        </div>
      );
    }
    if (status === "unverified") {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
          <AlertCircle size={12} />
          <span>Pending</span>
        </div>
      );
    }
    return null;
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
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-8xl mx-auto">
        {/* Welcome Section */}
        <Motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user?.full_name || user?.business_name || "Landlord"}
                !
              </h1>
              <p className="text-gray-600">
                Manage your property listings and track their performance.
              </p>
            </div>
            <Motion.button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-200 text-orange-600 rounded-xl font-medium hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Visit Homepage</span>
              <span className="sm:hidden">Home</span>
              <ArrowRight className="w-4 h-4" />
            </Motion.button>
          </div>
        </Motion.div>

        {/* Quick Actions - Enhanced Cards */}
        <Motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Add New Property Card */}
          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
            onClick={() => navigate("/add-property")}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <Motion.div
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-white/80" />
                </Motion.div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                Add New Property
              </h3>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                Create a new property listing and reach thousands of tenants
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                <span>Get Started</span>
                <Motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </Motion.div>
              </div>
            </div>
            
            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
          </Motion.button>

          {/* Manage Properties Card */}
          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
            onClick={() => navigate("/my-properties")}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <Motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="w-6 h-6 text-white/80" />
                </Motion.div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                Manage Properties
              </h3>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                View, edit, and track performance of all your listings
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                <span>View All</span>
                <Motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </Motion.div>
              </div>
            </div>
            
            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
          </Motion.button>

          {/* Subscription Plans Card */}
          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
            onClick={() => navigate("/subscription/upgrade")}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <Motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-white/80" />
                </Motion.div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                Subscription Plans
              </h3>
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                Upgrade or renew your subscription to unlock more features
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                <span>View Plans</span>
                <Motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </Motion.div>
              </div>
            </div>
            
            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
          </Motion.button>
        </Motion.div>

        {/* Stats Cards - Real Data */}
        <Motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Properties */}
          <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Properties</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.totalProperties}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Properties listed</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.accent.orange}15` }}
              >
                <Building size={20} color={Colors.accent.orange} />
              </div>
            </div>
          </Motion.div>

          {/* Verified Properties */}
          <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Verified</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.verifiedProperties}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Live properties</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.accent.green}15` }}
              >
                <CheckCircle2 size={20} color={Colors.accent.green} />
              </div>
            </div>
          </Motion.div>

          {/* Pending Properties */}
          <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending Review</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.pendingProperties}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.accent.yellow}15` }}
              >
                <Clock size={20} color={Colors.accent.yellow} />
              </div>
            </div>
          </Motion.div>

          {/* Available Properties */}
          <Motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Available</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.availableProperties}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Ready to rent</p>
              </div>
              <div
                className="p-2 rounded-full"
                style={{ backgroundColor: `${Colors.primary[400]}15` }}
              >
                <Home size={20} color={Colors.primary[500]} />
              </div>
            </div>
          </Motion.div>
        </Motion.div>

        {/* Subscription Details */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10"
        >
          <div className={`rounded-2xl shadow-lg border overflow-hidden ${
            !subscriptionStatus.hasSubscription || subscriptionStatus.isExpired
              ? "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-red-200"
              : "bg-gradient-to-br from-blue-50 via-orange-50 to-teal-50 border-blue-200"
          }`}>
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl shadow-lg ${
                    !subscriptionStatus.hasSubscription || subscriptionStatus.isExpired
                      ? "bg-gradient-to-br from-red-500 to-orange-600"
                      : "bg-gradient-to-br from-orange-500 to-orange-600"
                  }`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                      Subscription Plan
                    </h2>
                    <p className="text-sm text-gray-600">
                      {!subscriptionStatus.hasSubscription 
                        ? "No active subscription"
                        : subscriptionStatus.isExpired
                        ? "Subscription has expired"
                        : "Your current plan details"}
                    </p>
                  </div>
                </div>
                {subscriptionStatus.hasSubscription && (
                  <div className={`hidden md:flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg border ${
                    subscriptionStatus.isExpired
                      ? "bg-white/60 border-red-200"
                      : "bg-white/60 border-orange-200"
                  }`}>
                    <Zap className={`w-4 h-4 ${
                      subscriptionStatus.isExpired ? "text-red-600" : "text-orange-600"
                    }`} />
                    <span className={`text-sm font-semibold capitalize ${
                      subscriptionStatus.isExpired ? "text-red-700" : "text-orange-700"
                    }`}>
                      {subscriptionStatus.planName || "Free"} Plan
                    </span>
                  </div>
                )}
              </div>

              {!subscriptionStatus.hasSubscription ? (
                /* No Subscription State */
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border-2 border-dashed border-red-300 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No Active Subscription
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You need to purchase a subscription plan to add and manage properties on the platform.
                    </p>
                    <Motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/subscription/upgrade")}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-8 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Purchase Subscription</span>
                    </Motion.button>
                  </div>
                </div>
              ) : subscriptionStatus.isExpired ? (
                /* Expired Subscription State */
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border-2 border-dashed border-red-300">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Subscription Expired
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your subscription ended on{" "}
                        <span className="font-semibold text-gray-800">
                          {moment(subscriptionStatus.endDate).format("MMM DD, YYYY")}
                        </span>
                        . Renew your subscription to continue adding and managing properties.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/subscription/upgrade")}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span>Renew Subscription</span>
                        </Motion.button>
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/subscription/history")}
                          className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-blue-300 rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                          <History className="w-5 h-5 text-blue-600" />
                          <span>View History</span>
                        </Motion.button>
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/payments")}
                          className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-purple-300 rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                          <Receipt className="w-5 h-5 text-purple-600" />
                          <span>Payments</span>
                        </Motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Subscription State */
                <>
                  {/* Subscription Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Plan Name Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Star className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Plan Type
                          </p>
                          <p className="text-lg font-bold text-gray-800 capitalize">
                            {subscriptionStatus.planName || "Free"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {subscriptionStatus.duration === 1
                            ? "1 Month"
                            : subscriptionStatus.duration === 3
                            ? "3 Months"
                            : subscriptionStatus.duration === 6
                            ? "6 Months"
                            : subscriptionStatus.duration === 12
                            ? "1 Year"
                            : subscriptionStatus.duration + " Months"} duration
                        </p>
                      </div>
                    </div>

                    {/* Days Remaining Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Days Remaining
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {subscriptionStatus.daysLeft}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {subscriptionStatus.daysLeft === 0
                            ? "Expires today"
                            : subscriptionStatus.daysLeft === 1
                            ? "Expires tomorrow"
                            : subscriptionStatus.daysLeft + " days left"}
                        </p>
                      </div>
                    </div>

                    {/* Expiry Date Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Expires On
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {subscriptionStatus.endDate
                              ? moment(subscriptionStatus.endDate).format("MMM DD")
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {subscriptionStatus.startDate
                            ? "Started " + moment(subscriptionStatus.startDate).format("MMM DD, YYYY")
                            : "Auto-renewal disabled"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Subscription Status
                      </p>
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 via-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{
                          width: Math.min(100, (subscriptionStatus.daysLeft / (subscriptionStatus.duration * 30)) * 100) + "%",
                        }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>
                        {subscriptionStatus.daysLeft} day{subscriptionStatus.daysLeft !== 1 ? "s" : ""} remaining
                      </span>
                      <span>
                        Expires: {subscriptionStatus.endDate ? moment(subscriptionStatus.endDate).format("MMM DD, YYYY") : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/subscription/history")}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border-2 border-blue-300 rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <History className="w-5 h-5 text-blue-600" />
                      <span>Subscription History</span>
                    </Motion.button>

                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/payments")}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border-2 border-purple-300 rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Receipt className="w-5 h-5 text-purple-600" />
                      <span>Payment History</span>
                    </Motion.button>

                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/subscription/upgrade")}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Upgrade/Renew</span>
                    </Motion.button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Motion.div>

        {/* Recent Properties & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Recent Properties
              </h2>
              <button
                onClick={() => navigate("/my-properties")}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                View All
              </button>
            </div>

            {getRecentProperties().length > 0 ? (
              <div className="space-y-4">
                {getRecentProperties().map((property) => (
                  <div
                    key={property.property_slug}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 mr-3 overflow-hidden">
                      {property.featured_image?.url ? (
                        <img
                          src={property.featured_image.url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {property.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 truncate">
                          {property.location}, {property.region}
                        </p>
                        {getStatusBadge(property.approval_status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Added{" "}
                        {moment(property.created_at).format("MMM DD, YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() =>
                          navigate(`/view-property/${property.property_slug}`)
                        }
                        className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={14} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/edit-property/${property.property_slug}`)
                        }
                        className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Edit3 size={14} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No properties yet</p>
                <button
                  onClick={() => navigate("/add-property")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add Your First Property
                </button>
              </div>
            )}
          </Motion.div>

          {/* Quick Links - Only Available Features */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {[
                {
                  title: "Visit Homepage",
                  description: "Browse properties as a renter",
                  path: "/home",
                  icon: <Globe size={20} />,
                  available: true,
                },
                {
                  title: "My Properties",
                  description: "View and manage all properties",
                  path: "/my-properties",
                  icon: <Building size={20} />,
                  available: true,
                },
                {
                  title: "Add Property",
                  description: "Create a new property listing",
                  path: "/add-property",
                  icon: <Plus size={20} />,
                  available: true,
                },
                {
                  title: "Subscription History",
                  description: "View subscription transactions",
                  path: "/subscription/history",
                  icon: <History size={20} />,
                  available: true,
                },
                {
                  title: "Payment History",
                  description: "View all payment transactions",
                  path: "/payments",
                  icon: <Receipt size={20} />,
                  available: true,
                },
                {
                  title: "Profile Settings",
                  description: "Update your profile information",
                  path: "/profile",
                  icon: <Star size={20} />,
                  available: true,
                },
                {
                  title: "Contact Support",
                  description: "Get help with your account",
                  path: "/contact-support",
                  icon: <Eye size={20} />,
                  available: true,
                },
              ]
                .filter((link) => link.available)
                .map((link, index) => (
                  <Motion.button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-600">
                        {link.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {link.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {link.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Motion.button>
                ))}
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LandlordDashboard;
