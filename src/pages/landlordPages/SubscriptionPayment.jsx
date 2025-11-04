import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  Crown,
  Star,
  Sparkles,
  Zap,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import AuthLayout from "../../Layouts/AuthLayout";
import subscriptionRequest from "../../api/Landlord/General/SubscriptionRequest";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Config from "../../utils/Config";
import Images from "../../utils/Images";

const SubscriptionPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuthStore();
  const plan = location.state?.plan;

  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  // Mobile Money form fields
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [network, setNetwork] = useState(Config.mtn);
  const [userName, setUserName] = useState(
    user?.full_name || user?.business_name || ""
  );

  // Card payment - no form fields needed, gateway handles input

  const verificationIntervalRef = useRef(null);
  const verificationAttemptsRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  if (!plan) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Plan Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Please select a subscription plan first.
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

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    let cleaned = value.replace(/\D/g, "");
    // If it starts with 0, replace with 233
    if (cleaned.startsWith("0")) {
      cleaned = "233" + cleaned.substring(1);
    }
    // If it doesn't start with 233, add it
    if (!cleaned.startsWith("233")) {
      cleaned = "233" + cleaned;
    }
    return cleaned.substring(0, 15); // Limit to 15 digits
  };


  const startVerificationPolling = (txnId) => {
    setVerificationCount(0);
    verificationAttemptsRef.current = 0;
    setShowLoadingModal(true);

    const poll = async () => {
      if (verificationAttemptsRef.current >= 6) {
        clearInterval(verificationIntervalRef.current);
        setShowLoadingModal(false);
        // Navigate to manual verification page
        navigate("/subscription/payment/verify", {
          state: { transactionId: txnId, plan },
        });
        return;
      }

      verificationAttemptsRef.current += 1;
      setVerificationCount(verificationAttemptsRef.current);

      try {
        const response = await subscriptionRequest.verifySubscriptionPayment({
          transaction_id: txnId,
        });

        if (response?.status) {
          const paymentData = response?.data?.data || response?.data;
          const status = paymentData?.status?.toLowerCase();

          if (status === "paid") {
            // Success!
            clearInterval(verificationIntervalRef.current);
            setShowLoadingModal(false);

            // Update auth store with new subscription plan
            if (paymentData?.subscription_plan) {
              updateUser({
                subscription_plan: paymentData.subscription_plan,
              });
            }

            // Navigate to success page
            navigate("/subscription/payment/success", {
              state: {
                transactionId: txnId,
                paymentData,
                plan,
              },
            });
          } else if (status === "failed") {
            // Failed payment
            clearInterval(verificationIntervalRef.current);
            setShowLoadingModal(false);
            navigate("/subscription/payment/failure", {
              state: {
                transactionId: txnId,
                paymentData,
                plan,
                reason: paymentData?.reason || "Payment was declined",
              },
            });
          }
          // If status is still "pending", continue polling
        }
      } catch (error) {
        console.error("Verification error:", error);
        // Continue polling even on error
      }
    };

    // Poll immediately, then every 6 seconds
    poll();
    verificationIntervalRef.current = setInterval(poll, 6000);
  };

  const handleMobileMoneyPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const payload = {
        phone_number: formatPhoneNumber(phoneNumber),
        network: network,
        type: "momo",
        user_name: userName,
        amount: parseFloat(plan.price),
        subscription_plan: plan.name?.toLowerCase() || plan.name,
      };

      const response = await subscriptionRequest.initiateSubscriptionPayment(
        payload
      );

      if (response?.status && response?.status_code === "000") {
        const responseData = response?.data?.data || response?.data;
        const txnId = responseData?.transaction_id;

        if (txnId) {
          toast.success("Payment prompt sent to your phone. Please approve.");
          startVerificationPolling(txnId);
        } else {
          toast.error("Failed to initiate payment. Please try again.");
        }
      } else {
        toast.error(
          response?.message || "Failed to initiate payment. Please try again."
        );
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const payload = {
        type: "card",
        network: Config.card_payment,
        amount: parseFloat(plan.price),
        subscription_plan: plan.name?.toLowerCase() || plan.name,
        user_name: user?.full_name || user?.business_name || "",
      };

      const response = await subscriptionRequest.initiateSubscriptionPayment(
        payload
      );

      if (response?.status && response?.status_code === "000") {
        const responseData = response?.data?.data || response?.data;
        const redirectUrl = responseData?.redirect_url || responseData?.payment_link || responseData?.link || responseData?.checkout_url;

        if (redirectUrl) {
          toast.success("Redirecting to payment gateway...");
          // Redirect to payment gateway
          window.location.href = redirectUrl;
        } else {
          toast.error("Payment gateway link not received. Please try again.");
        }
      } else {
        toast.error(
          response?.message || "Failed to initiate card payment. Please try again."
        );
      }
    } catch (error) {
      console.error("Card payment error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-teal-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </Motion.div>

          {/* Plan Summary Card */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-orange-100 mb-6"
          >
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 sm:gap-6">
                {/* Left Section - Plan Info */}
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      {(() => {
                        const name = plan.name?.toLowerCase() || "";
                        if (name.includes("platinum") || name.includes("plantinum")) {
                          return <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
                        } else if (name.includes("gold")) {
                          return <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />;
                        } else if (name.includes("silver")) {
                          return <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
                        }
                        return <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 capitalize mb-1 truncate">
                        {plan.name} Plan
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium truncate">{plan.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features Badge */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-4">
                    <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
                        Premium Features
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Price */}
                <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 sm:border-l-2 border-orange-100 pt-4 sm:pt-0 sm:pl-6 sm:flex-shrink-0">
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Total Amount
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                        GHS {plan.price}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-orange-100 rounded-full">
                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-orange-700 whitespace-nowrap">
                      One-time payment
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Divider with Icon */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-orange-100 flex items-center justify-center">
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg sm:rounded-xl border border-orange-100">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 text-center">
                    <span className="hidden sm:inline">Secure payment • Instant activation</span>
                    <span className="sm:hidden">Secure • Instant</span>
                  </span>
                </div>
              </div>
            </div>
          </Motion.div>

          {/* Payment Method Selection */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Select Payment Method
            </h2>

            {/* Payment Method Tabs */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 p-1 bg-gray-100 rounded-lg sm:rounded-xl">
              <button
                onClick={() => setPaymentMethod("momo")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  paymentMethod === "momo"
                    ? "bg-white text-orange-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Mobile Money</span>
              </button>
              {/* Original Card Payment Button - Commented out for future use */}
              {/* <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  paymentMethod === "card"
                    ? "bg-white text-orange-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Card Payment</span>
              </button> */}
              
              {/* Disabled Card Payment Button - Coming Soon */}
              <button
                onClick={() => {}}
                disabled
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all relative opacity-60 cursor-not-allowed"
                title="Card payment coming soon"
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Card Payment</span>
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  Coming Soon
                </span>
              </button>
            </div>

            {/* Mobile Money Form */}
            {paymentMethod === "momo" && (
              <form onSubmit={handleMobileMoneyPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Network Provider
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { 
                        value: Config.mtn, 
                        label: "MTN",
                        image: Images.mtn_momo
                      },
                      { 
                        value: Config.airtelTigo, 
                        label: "AirtelTigo",
                        image: Images.at_cash
                      },
                      { 
                        value: Config.telecel, 
                        label: "Telecel",
                        image: Images.telecel_cash
                      },
                    ].map((net) => (
                      <button
                        key={net.value}
                        type="button"
                        onClick={() => setNetwork(net.value)}
                        className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border-2 font-medium transition-all ${
                          network === net.value
                            ? "border-orange-500 bg-orange-50 shadow-md scale-105"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <img
                          src={net.image}
                          alt={net.label}
                          className={`w-12 h-12 object-contain transition-all ${
                            network === net.value
                              ? "opacity-100 scale-110"
                              : "opacity-70"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            network === net.value
                              ? "text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          {net.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatPhoneNumber(e.target.value))
                    }
                    placeholder="0501234567"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your mobile money number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      <span>Pay with Mobile Money</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <form onSubmit={handleCardPayment} className="space-y-6">
                {/* Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Secure Card Payment
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        You will be redirected to our secure payment gateway to complete your card payment.
                      </p>
                      <p className="text-xs text-gray-600">
                        Your card details will be securely processed by our payment provider.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Payment Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Plan</span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {plan.name} Plan
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {plan.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-base font-bold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-orange-600">
                        GHS {plan.price}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Redirecting to Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Payment Gateway</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Secure Payment
                </p>
                <p className="text-xs text-gray-600">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>

      {/* Loading Modal */}
      <AnimatePresence>
        {showLoadingModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                {/* Animated Spinner */}
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
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Payment
                </h3>
                <p className="text-gray-600 mb-4">
                  Please approve the payment prompt on your phone
                </p>

                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i < verificationCount
                            ? "bg-orange-600 w-8"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Attempt {verificationCount} of 6
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Network:</strong> {network}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Phone:</strong> {phoneNumber}
                  </p>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default SubscriptionPayment;

