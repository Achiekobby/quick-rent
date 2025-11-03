import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  Check,
  Zap,
  Sparkles,
  Star,
  CreditCard,
  Calendar,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import subscriptionRequest from "../../api/Landlord/General/SubscriptionRequest";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const sortPlans = (plansArray) => {
    const order = ["bronze", "silver", "gold", "platinum", "plantinum"];
    return [...plansArray].sort((a, b) => {
      const indexA = order.findIndex((name) =>
        a.name?.toLowerCase().includes(name)
      );
      const indexB = order.findIndex((name) =>
        b.name?.toLowerCase().includes(name)
      );
      // If not found, put at end
      const finalIndexA = indexA === -1 ? 999 : indexA;
      const finalIndexB = indexB === -1 ? 999 : indexB;
      return finalIndexA - finalIndexB;
    });
  };

  // Debug: Log plans when they change
  useEffect(() => {
    console.log("Plans state updated:", plans);
  }, [plans]);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await subscriptionRequest.getSubscriptionPackages();

        if (
          response?.status_code === "000" ||
          (response?.data && Array.isArray(response.data))
        ) {
          const plansData = Array.isArray(response.data) ? response.data : [];

          if (plansData.length > 0) {
            // Sort plans in order: Bronze -> Silver -> Gold -> Platinum
            const sortedPlans = sortPlans(plansData);
            setPlans(sortedPlans);
          } else {
            toast.warning("No subscription plans available");
          }
        } else {
          // If status_code doesn't match, still try to use data if it exists
          if (response?.data && Array.isArray(response.data)) {
            // Sort plans in order: Bronze -> Silver -> Gold -> Platinum
            const sortedPlans = sortPlans(response.data);
            setPlans(sortedPlans);
          } else {
            toast.error(
              response?.message || "Failed to fetch subscription plans"
            );
          }
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason ||
            "Failed to fetch subscription plans. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    navigate("/subscription/payment", {
      state: { plan },
    });
  };

  const getPlanIcon = (planName) => {
    const name = planName?.toLowerCase() || "";
    if (name.includes("platinum") || name.includes("plantinum")) {
      return <Crown className="w-8 h-8" />;
    } else if (name.includes("gold")) {
      return <Star className="w-8 h-8" fill="currentColor" />;
    } else if (name.includes("silver")) {
      return <Sparkles className="w-8 h-8" />;
    }
    return <Zap className="w-8 h-8" />;
  };

  const parseDuration = (duration) => {
    const durationStr = duration?.toLowerCase() || "";
    if (durationStr.includes("year")) {
      return 12; // 1 year = 12 months
    } else if (durationStr.includes("month")) {
      const months = parseInt(durationStr.match(/\d+/)?.[0] || "1");
      return months;
    }
    return 1; // Default to 1 month
  };

  const calculateMonthlyPrice = (price, duration) => {
    const numMonths = parseDuration(duration);
    return (parseFloat(price) / numMonths).toFixed(2);
  };

  const features = [
    { icon: <Users className="w-5 h-5" />, text: "Unlimited Properties" },
    { icon: <Shield className="w-5 h-5" />, text: "Priority Support" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "Property Boost" },
  ];

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-teal-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the perfect subscription plan for your real estate
                business. All plans include unlimited property listings and
                advanced features.
              </p>
            </div>
          </Motion.div>

          {/* Plans Grid */}
          {plans.length === 0 ? (
            <div className="text-center py-16 mb-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Plans Available
              </h3>
              <p className="text-gray-600 mb-6">
                Subscription plans are currently unavailable. Please check back
                later.
              </p>
              <button
                onClick={() => navigate("/landlord-dashboard")}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {plans.map((plan, index) => {
                const isPopular = plan.is_popular;
                const isCurrentPlan =
                  user?.subscription_plan?.plan_name?.toLowerCase() ===
                  plan.name?.toLowerCase();
                const monthlyPrice = calculateMonthlyPrice(
                  plan.price,
                  plan.duration
                );
                const durationMonths = parseDuration(plan.duration);

                const accentBgColor = isCurrentPlan
                  ? "bg-emerald-50"
                  : isPopular
                  ? "bg-orange-50"
                  : plan.name?.toLowerCase().includes("platinum") ||
                    plan.name?.toLowerCase().includes("plantinum")
                  ? "bg-purple-50"
                  : plan.name?.toLowerCase().includes("gold")
                  ? "bg-amber-50"
                  : plan.name?.toLowerCase().includes("silver")
                  ? "bg-gray-50"
                  : "bg-blue-50";

                const accentBorderColor = isCurrentPlan
                  ? "border-emerald-500"
                  : isPopular
                  ? "border-orange-500"
                  : plan.name?.toLowerCase().includes("platinum") ||
                    plan.name?.toLowerCase().includes("plantinum")
                  ? "border-purple-500"
                  : plan.name?.toLowerCase().includes("gold")
                  ? "border-amber-500"
                  : plan.name?.toLowerCase().includes("silver")
                  ? "border-gray-400"
                  : "border-blue-500";

                const accentTextColor = isCurrentPlan
                  ? "text-emerald-600"
                  : isPopular
                  ? "text-orange-600"
                  : plan.name?.toLowerCase().includes("platinum") ||
                    plan.name?.toLowerCase().includes("plantinum")
                  ? "text-purple-600"
                  : plan.name?.toLowerCase().includes("gold")
                  ? "text-amber-600"
                  : plan.name?.toLowerCase().includes("silver")
                  ? "text-gray-600"
                  : "text-blue-600";

                const buttonColor = isCurrentPlan
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : isPopular
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700";

                return (
                  <Motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`relative ${
                      isPopular
                        ? "md:col-span-2 lg:col-span-1 lg:scale-105 lg:-mt-4"
                        : ""
                    }`}
                  >
                    {/* Badges */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1">
                      {isPopular && (
                        <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                          <Star className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                          <span>MOST POPULAR</span>
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                          <span>CURRENT PLAN</span>
                        </div>
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className={`h-full rounded-2xl shadow-lg overflow-hidden transition-all duration-300 bg-white border-2 ${
                        isCurrentPlan
                          ? `border-emerald-400 hover:border-emerald-500`
                          : isPopular
                          ? `border-orange-400 hover:border-orange-500`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Header Section */}
                      <div
                        className={`${accentBgColor} pt-8 pb-6 px-6 border-b border-gray-100`}
                      >
                        <div className="flex justify-center mb-4">
                          <div
                            className={`w-16 h-16 rounded-xl ${accentBgColor} border-2 ${accentBorderColor} flex items-center justify-center`}
                          >
                            <div className={accentTextColor}>
                              {getPlanIcon(plan.name)}
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-gray-900 capitalize mb-1">
                            {plan.name}
                          </h3>
                          {plan.info && (
                            <p className="text-sm text-gray-600">{plan.info}</p>
                          )}
                          {isCurrentPlan && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              <span>Active</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6">
                        {/* Pricing */}
                        <div className="mb-6 text-center">
                          <div className="mb-2">
                            <span className="text-4xl font-bold text-gray-900">
                              GHS {plan.price}
                            </span>
                          </div>
                          <div className="mb-3 mt-4">
                            <div
                              className={`${accentBgColor} border ${accentBorderColor} rounded-xl px-4 py-3`}
                            >
                              <div className="flex items-center justify-center gap-3">
                                <Calendar
                                  className={`w-5 h-5 ${accentTextColor}`}
                                />
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                                    Duration
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${accentTextColor}`}
                                  >
                                    {plan.duration}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            ~ GHS {monthlyPrice}{" "}
                            <span className="text-xs">per month</span>
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-200 mb-6"></div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                          {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div
                                className={`flex-shrink-0 w-7 h-7 rounded-lg ${accentBgColor} flex items-center justify-center`}
                              >
                                <Check
                                  className={`w-4 h-4 ${accentTextColor}`}
                                  strokeWidth={2.5}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {feature.text}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex-shrink-0 w-7 h-7 rounded-lg ${accentBgColor} flex items-center justify-center`}
                            >
                              <Check
                                className={`w-4 h-4 ${accentTextColor}`}
                                strokeWidth={2.5}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {durationMonths} month
                              {durationMonths > 1 ? "s" : ""} access
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${buttonColor} text-white shadow-md hover:shadow-lg`}
                        >
                          <span>
                            {isCurrentPlan
                              ? "Renew Current Plan"
                              : "Select Plan"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </Motion.button>
                      </div>
                    </div>
                  </Motion.div>
                );
              })}
            </div>
          )}

          {/* Additional Info */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-600">
                  All payments are processed securely with encryption
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Instant Activation
                </h3>
                <p className="text-sm text-gray-600">
                  Your subscription activates immediately after payment
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Flexible Billing
                </h3>
                <p className="text-sm text-gray-600">
                  Choose from monthly, quarterly, or annual billing cycles
                </p>
              </div>
            </div>
          </Motion.div>

          {/* Current Subscription Info */}
          {user?.subscription_plan && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl border-2 border-orange-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Current Subscription
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user.subscription_plan.plan_name?.charAt(0).toUpperCase() +
                      user.subscription_plan.plan_name?.slice(1) ||
                      "Active"}{" "}
                    Plan
                  </p>
                </div>
                <button
                  onClick={() => navigate("/subscription/history")}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors border border-gray-200"
                >
                  View History
                </button>
              </div>
            </Motion.div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default SubscriptionPlans;
