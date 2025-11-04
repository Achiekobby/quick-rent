import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Receipt,
  Calendar,
  CreditCard,
  Download,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Shield,
  Sparkles,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import subscriptionRequest from "../../api/Landlord/General/SubscriptionRequest";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuthStore();

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get Orchard Pay callback parameters
        const exttrid = searchParams.get("exttrid"); // External transaction ID for verification
        const gatewayStatus = searchParams.get("status"); // Status code from gateway
        const transRef = searchParams.get("trans_ref"); // Fallback option
        const transId = searchParams.get("trans_id") || searchParams.get("transaction_id") || searchParams.get("transactionId");
        const gatewayMessage = searchParams.get("message");
        const planName = searchParams.get("subscription_plan");

        // exttrid is the primary identifier for verification (as per actual gateway redirect)
        // Fallback to other transaction identifiers if exttrid is not available
        const verificationRef = exttrid || transRef || transId;

        if (!verificationRef) {
          setPaymentStatus("error");
          setErrorMessage("Transaction reference not found. Please contact support.");
          setIsVerifying(false);
          return;
        }

        setTransactionId(exttrid || transId || transRef);
        if (planName) {
          setPlan({ name: planName });
        }

        // Check initial status from gateway callback
        // Status codes: 200/OK typically means success, 400+/500 mean failure
        if (gatewayStatus) {
          const statusCode = parseInt(gatewayStatus);
          if (statusCode >= 200 && statusCode < 300) {
            // Status codes 200-299 indicate success (but we'll verify via API)
            // Don't set status yet, let API verification confirm
          } else if (statusCode >= 400 || statusCode === 500) {
            // Status codes 400+ or 500 indicate failure
            setPaymentStatus("failed");
            setErrorMessage(
              gatewayMessage || 
              `Payment failed with status code ${gatewayStatus}` ||
              "Payment was declined or failed."
            );
          }
        } else if (gatewayMessage && gatewayMessage.toUpperCase().includes("FAILED")) {
          setPaymentStatus("failed");
          setErrorMessage(gatewayMessage || "Payment was declined or failed.");
        }

        // Verify payment using exttrid (external transaction ID from gateway)
        const response = await subscriptionRequest.verifySubscriptionPayment({
          transaction_id: verificationRef, // Backend expects this field name, we pass exttrid value
        });

        if (response?.status) {
          const responseData = response?.data?.data || response?.data;
          const paymentStatusFromApi = responseData?.status?.toLowerCase();
          
          setPaymentData(responseData);

          if (paymentStatusFromApi === "paid") {
            setPaymentStatus("success");
            
            // Update auth store with new subscription plan
            if (responseData?.subscription_plan) {
              updateUser({
                subscription_plan: responseData.subscription_plan,
              });
              toast.success("Subscription activated successfully!");
            }
          } else if (paymentStatusFromApi === "failed") {
            setPaymentStatus("failed");
            setErrorMessage(
              responseData?.reason ||
              gatewayMessage ||
              response?.message ||
              "Payment was declined or failed."
            );
          } else if (paymentStatusFromApi === "pending") {
            setPaymentStatus("pending");
            setErrorMessage("Payment is still being processed. Please wait a moment and refresh.");
          } else {
            // If API doesn't confirm status but gateway says failed, trust gateway
            if (gatewayMessage && gatewayMessage.toUpperCase().includes("FAILED")) {
              setPaymentStatus("failed");
              setErrorMessage(gatewayMessage || "Payment failed.");
            } else {
              setPaymentStatus("error");
              setErrorMessage("Unable to determine payment status.");
            }
          }
        } else {
          // If API verification fails but gateway provided status, use gateway status
          if (gatewayMessage && gatewayMessage.toUpperCase().includes("FAILED")) {
            setPaymentStatus("failed");
            setErrorMessage(gatewayMessage || "Payment verification failed.");
          } else {
            setPaymentStatus("error");
            setErrorMessage(
              response?.message || "Failed to verify payment status."
            );
          }
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        // Check if gateway provided failure status
        const gatewayStatus = searchParams.get("status");
        const gatewayMessage = searchParams.get("message");
        
        if (gatewayStatus) {
          const statusCode = parseInt(gatewayStatus);
          if (statusCode >= 400 || statusCode === 500) {
            setPaymentStatus("failed");
            setErrorMessage(
              gatewayMessage || 
              `Payment failed with status code ${gatewayStatus}` ||
              "Payment failed."
            );
          } else {
            setPaymentStatus("error");
            setErrorMessage("An error occurred while verifying payment.");
            toast.error("Failed to verify payment status.");
          }
        } else if (gatewayMessage && gatewayMessage.toUpperCase().includes("FAILED")) {
          setPaymentStatus("failed");
          setErrorMessage(gatewayMessage || "Payment failed.");
        } else {
          setPaymentStatus("error");
          setErrorMessage("An error occurred while verifying payment.");
          toast.error("Failed to verify payment status.");
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, updateUser]);

  const handleRetryVerification = async () => {
    // Get exttrid from URL params for retry (primary identifier)
    const exttrid = searchParams.get("exttrid");
    const transRef = searchParams.get("trans_ref");
    const transId = searchParams.get("trans_id") || searchParams.get("transaction_id");
    const verificationRef = exttrid || transRef || transId || transactionId;

    if (!verificationRef) return;

    setIsVerifying(true);
    setPaymentStatus(null);
    setErrorMessage(null);

    try {
      const response = await subscriptionRequest.verifySubscriptionPayment({
        transaction_id: verificationRef,
      });

      if (response?.status) {
        const responseData = response?.data?.data || response?.data;
        const paymentStatusFromApi = responseData?.status?.toLowerCase();

        setPaymentData(responseData);

        if (paymentStatusFromApi === "paid") {
          setPaymentStatus("success");
          if (responseData?.subscription_plan) {
            updateUser({
              subscription_plan: responseData.subscription_plan,
            });
            toast.success("Subscription activated successfully!");
          }
        } else if (paymentStatusFromApi === "failed") {
          setPaymentStatus("failed");
          setErrorMessage(
            responseData?.reason ||
            response?.message ||
            "Payment was declined or failed."
          );
        } else {
          setPaymentStatus("pending");
          setErrorMessage("Payment is still being processed.");
        }
      }
    } catch (error) {
      console.error("Retry verification error:", error);
      toast.error("Failed to verify payment.");
    } finally {
      setIsVerifying(false);
    }
  };

  const subscriptionPlan = paymentData?.subscription_plan;
  const isCardPayment = paymentData?.payment_type === "CRD" || paymentData?.network === "CRD";

  // Loading State
  if (isVerifying) {
    return (
      <AuthLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-teal-50 py-8 flex items-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                <Motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 border-4 border-transparent border-t-orange-600 rounded-full"
                ></Motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </Motion.div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success State
  if (paymentStatus === "success") {
    return (
      <AuthLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 py-8 flex items-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 sm:p-8 text-center">
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full mb-4"
                >
                  <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-green-600" />
                </Motion.div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Payment Successful!
                </h1>
                <p className="text-green-100 text-base sm:text-lg">
                  Your subscription has been activated
                </p>
              </div>

              {/* Receipt Content */}
              <div className="p-6 sm:p-8">
                {/* Receipt Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Payment Receipt
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Transaction #{transactionId}
                      </p>
                    </div>
                  </div>
                  <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Subscription Details */}
                  {subscriptionPlan && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 sm:p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                            {subscriptionPlan.plan_name || paymentData?.subscription_plan || plan?.name} Plan
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">Active Subscription</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-blue-200">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">Start Date</span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {subscriptionPlan.start_date
                              ? new Date(subscriptionPlan.start_date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-blue-200">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">End Date</span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {subscriptionPlan.end_date
                              ? new Date(subscriptionPlan.end_date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                        {subscriptionPlan.days_left && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              Duration
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-blue-600">
                              {subscriptionPlan.days_left}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  <div className="bg-gray-50 rounded-2xl p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      {transactionId && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-xs sm:text-sm text-gray-600">Transaction ID</span>
                          <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all text-right">
                            {transactionId}
                          </span>
                        </div>
                      )}
                      {paymentData?.amount && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-xs sm:text-sm text-gray-600">Amount Paid</span>
                          <span className="text-xs sm:text-sm font-bold text-green-600">
                            GHS {paymentData.amount}
                          </span>
                        </div>
                      )}
                      {paymentData?.payment_type && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-xs sm:text-sm text-gray-600">Payment Method</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {isCardPayment ? "Card Payment" : paymentData.payment_type}
                          </span>
                        </div>
                      )}
                      {paymentData?.created_at && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-xs sm:text-sm text-gray-600">Date</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {new Date(paymentData.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate("/landlord-dashboard")}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => navigate("/subscription/upgrade")}
                    className="flex-1 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    View Plans
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Failure State
  if (paymentStatus === "failed") {
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
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 sm:p-8 text-center">
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full mb-4"
                >
                  <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-red-600" />
                </Motion.div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Payment Failed
                </h1>
                <p className="text-red-100 text-base sm:text-lg">
                  We couldn't process your payment
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-900 mb-1">
                        Payment Unsuccessful
                      </h3>
                      <p className="text-sm text-red-800">
                        {errorMessage || "Your payment could not be processed. Please try again."}
                      </p>
                    </div>
                  </div>
                </div>

                {transactionId && (
                  <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      Transaction Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-xs sm:text-sm text-gray-600">Transaction ID</span>
                        <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all text-right">
                          {transactionId}
                        </span>
                      </div>
                      {paymentData?.amount && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-xs sm:text-sm text-gray-600">Amount</span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            GHS {paymentData.amount}
                          </span>
                        </div>
                      )}
                      {paymentData?.status && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-xs sm:text-sm text-gray-600">Status</span>
                          <span className="text-xs sm:text-sm font-semibold text-red-600 capitalize">
                            {paymentData.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleRetryVerification}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Retry Verification</span>
                  </button>
                  <button
                    onClick={() => navigate("/subscription/upgrade")}
                    className="flex-1 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Pending or Error State
  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-8 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 sm:p-8 text-center">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full mb-4"
              >
                <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-600" />
              </Motion.div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                {paymentStatus === "pending" ? "Payment Pending" : "Verification Error"}
              </h1>
              <p className="text-yellow-100 text-base sm:text-lg">
                {paymentStatus === "pending"
                  ? "Your payment is being processed"
                  : "Unable to verify payment status"}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-yellow-900 mb-1">
                      {paymentStatus === "pending"
                        ? "Payment Processing"
                        : "Verification Issue"}
                    </h3>
                    <p className="text-sm text-yellow-800">
                      {errorMessage ||
                        (paymentStatus === "pending"
                          ? "Please wait a few moments and try verifying again."
                          : "Please contact support if this issue persists.")}
                    </p>
                  </div>
                </div>
              </div>

              {transactionId && (
                <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                    Transaction Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-xs sm:text-sm text-gray-600">Transaction ID</span>
                      <span className="text-xs sm:text-sm font-mono font-semibold text-gray-900 break-all text-right">
                        {transactionId}
                      </span>
                    </div>
                    {paymentData?.amount && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs sm:text-sm text-gray-600">Amount</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          GHS {paymentData.amount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRetryVerification}
                  className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Retry Verification</span>
                </button>
                <button
                  onClick={() => navigate("/landlord-dashboard")}
                  className="flex-1 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
      </AuthLayout>
    );
};

export default PaymentCallback;

