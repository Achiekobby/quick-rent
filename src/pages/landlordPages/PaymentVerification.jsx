import { useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import subscriptionRequest from "../../api/Landlord/General/SubscriptionRequest";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";

const PaymentVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, plan } = location.state || {};
  const { updateUser } = useAuthStore();

  const [isVerifying, setIsVerifying] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);

  if (!transactionId) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Transaction
            </h2>
            <p className="text-gray-600 mb-6">
              No transaction ID found. Please try again.
            </p>
            <button
              onClick={() => navigate("/subscription/upgrade")}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Go to Plans
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const handleVerify = async () => {
    setIsVerifying(true);
    setLastStatus(null);

    try {
      const response = await subscriptionRequest.verifySubscriptionPayment({
        transaction_id: transactionId,
      });

      if (response?.status) {
        const paymentData = response?.data?.data || response?.data;
        const status = paymentData?.status?.toLowerCase();

        setLastStatus({
          status,
          data: paymentData,
          message: response?.message || paymentData?.reason,
        });

        if (status === "paid") {
          // Success!
          toast.success("Payment verified successfully!");

          // Update auth store with new subscription plan
          if (paymentData?.subscription_plan) {
            updateUser({
              subscription_plan: paymentData.subscription_plan,
            });
          }

          // Navigate to success page after a brief delay
          setTimeout(() => {
            navigate("/subscription/payment/success", {
              state: {
                transactionId,
                paymentData,
                plan,
              },
            });
          }, 1500);
        } else if (status === "failed") {
          toast.error("Payment was declined. Please try again.");
          setTimeout(() => {
            navigate("/subscription/payment/failure", {
              state: {
                transactionId,
                paymentData,
                plan,
                reason: paymentData?.reason || "Payment was declined",
              },
            });
          }, 2000);
        } else if (status === "pending") {
          toast.warning(
            "Payment is still pending. Please ensure you've approved the payment prompt."
          );
        }
      } else {
        toast.error(
          response?.message || "Failed to verify payment. Please try again."
        );
        setLastStatus({
          status: "error",
          message: response?.message || "Verification failed",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An error occurred while verifying payment.");
      setLastStatus({
        status: "error",
        message: "An error occurred",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (isVerifying) {
      return <Loader2 className="w-16 h-16 text-orange-600 animate-spin" />;
    }
    if (!lastStatus) {
      return <Clock className="w-16 h-16 text-blue-600" />;
    }
    if (lastStatus.status === "paid") {
      return <CheckCircle2 className="w-16 h-16 text-green-600" />;
    }
    if (lastStatus.status === "failed") {
      return <XCircle className="w-16 h-16 text-red-600" />;
    }
    return <Clock className="w-16 h-16 text-yellow-600" />;
  };

  const getStatusMessage = () => {
    if (isVerifying) {
      return "Verifying payment...";
    }
    if (!lastStatus) {
      return "Payment verification is pending";
    }
    if (lastStatus.status === "paid") {
      return "Payment verified successfully!";
    }
    if (lastStatus.status === "failed") {
      return "Payment verification failed";
    }
    if (lastStatus.status === "pending") {
      return "Payment is still pending";
    }
    return "Verification status unknown";
  };

  const getStatusColor = () => {
    if (isVerifying) return "text-orange-600";
    if (!lastStatus) return "text-blue-600";
    if (lastStatus.status === "paid") return "text-green-600";
    if (lastStatus.status === "failed") return "text-red-600";
    if (lastStatus.status === "pending") return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-teal-50 py-8 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4"
              >
                {getStatusIcon()}
              </Motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Manual Payment Verification
              </h1>
              <p className="text-blue-100 text-lg">
                Verify your payment status manually
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Transaction Info */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Transaction Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="text-sm font-mono font-semibold text-gray-900">
                      {transactionId}
                    </span>
                  </div>
                  {plan && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Plan</span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {plan.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Display */}
              <div
                className={`bg-gradient-to-br rounded-2xl p-6 mb-6 border-2 ${
                  lastStatus?.status === "paid"
                    ? "from-green-50 to-emerald-50 border-green-200"
                    : lastStatus?.status === "failed"
                    ? "from-red-50 to-pink-50 border-red-200"
                    : lastStatus?.status === "pending"
                    ? "from-yellow-50 to-amber-50 border-yellow-200"
                    : "from-blue-50 to-indigo-50 border-blue-200"
                }`}
              >
                <div className="text-center">
                  <h3
                    className={`text-xl font-bold mb-2 ${getStatusColor()}`}
                  >
                    {getStatusMessage()}
                  </h3>
                  {lastStatus?.message && (
                    <p className="text-sm text-gray-700 mt-2">
                      {lastStatus.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-bold text-blue-900 mb-2">
                  Instructions:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Ensure you have approved the payment prompt on your phone</li>
                  <li>Wait a few moments after approving before clicking verify</li>
                  <li>If payment is still pending, check your mobile money balance</li>
                  <li>Contact support if you continue to experience issues</li>
                </ul>
              </div>

              {/* Verify Button */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Verify Payment</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate("/subscription/upgrade")}
                  className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
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

export default PaymentVerification;

