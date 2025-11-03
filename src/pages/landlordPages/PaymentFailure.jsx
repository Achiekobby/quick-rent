import { motion as Motion } from "framer-motion";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentData, plan, transactionId, reason } = location.state || {};

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 py-8 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Failure Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4"
              >
                <XCircle className="w-14 h-14 text-red-600" />
              </Motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-red-100 text-lg">
                We couldn't process your payment
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-red-900 mb-1">
                      Payment Unsuccessful
                    </h3>
                    <p className="text-sm text-red-800">
                      {reason ||
                        paymentData?.reason ||
                        "Your payment could not be processed. Please try again."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              {paymentData && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    Transaction Details
                  </h3>
                  <div className="space-y-3">
                    {transactionId && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">
                          Transaction ID
                        </span>
                        <span className="text-sm font-mono font-semibold text-gray-900">
                          {transactionId}
                        </span>
                      </div>
                    )}
                    {paymentData?.amount && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Amount</span>
                        <span className="text-sm font-bold text-gray-900">
                          GHS {paymentData.amount}
                        </span>
                      </div>
                    )}
                    {paymentData?.status && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="text-sm font-semibold text-red-600 capitalize">
                          {paymentData.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Common Reasons */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-bold text-blue-900 mb-2">
                  Common Reasons for Payment Failure:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Insufficient mobile money balance</li>
                  <li>Incorrect PIN entered</li>
                  <li>Payment prompt not approved in time</li>
                  <li>Network connectivity issues</li>
                  <li>Mobile money account restrictions</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    navigate("/subscription/payment", {
                      state: { plan },
                    })
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => navigate("/subscription/upgrade")}
                  className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Plans</span>
                </button>
              </div>

              {/* Support */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help?{" "}
                  <button
                    onClick={() => navigate("/contact-support")}
                    className="text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PaymentFailure;

