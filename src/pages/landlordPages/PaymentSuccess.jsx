import { useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Calendar,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentData, plan, transactionId } = location.state || {};

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate("/landlord-dashboard");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const subscriptionPlan = paymentData?.subscription_plan;

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 py-8 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4"
              >
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </Motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-green-100 text-lg">
                Your subscription has been activated
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Subscription Details */}
              {subscriptionPlan && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 capitalize">
                        {subscriptionPlan.plan_name} Plan
                      </h3>
                      <p className="text-sm text-gray-600">Active Subscription</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-blue-200">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Start Date</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {subscriptionPlan.start_date
                          ? new Date(subscriptionPlan.start_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-200">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">End Date</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {subscriptionPlan.end_date
                          ? new Date(subscriptionPlan.end_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    {subscriptionPlan.days_left && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">
                          Duration
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {subscriptionPlan.days_left}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Payment Details
                </h3>
                <div className="space-y-3">
                  {transactionId && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Transaction ID</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {transactionId}
                      </span>
                    </div>
                  )}
                  {paymentData?.amount && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Amount Paid</span>
                      <span className="text-sm font-bold text-green-600">
                        GHS {paymentData.amount}
                      </span>
                    </div>
                  )}
                  {paymentData?.network && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Payment Method</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paymentData.network} Mobile Money
                      </span>
                    </div>
                  )}
                  {paymentData?.phone_number && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Phone Number</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paymentData.phone_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-900">
                  <strong>Next Steps:</strong> You can now access all premium
                  features. Your subscription will automatically renew based on
                  your plan duration.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/landlord-dashboard")}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/subscription/upgrade")}
                  className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  View Plans
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-6">
                Redirecting to dashboard in 10 seconds...
              </p>
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PaymentSuccess;

