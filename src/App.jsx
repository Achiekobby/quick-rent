import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import useAuthStore from "./stores/authStore";
import AuthRoutes from "./routes/authRoutes";
import GuestRoutes from "./routes/guestRoutes";
import useScrollToTop from "./hooks/useScrollToTop";
import "react-toastify/dist/ReactToastify.css";
import RootRedirect from "./components/RootRedirect";
import profileRequests from "./api/Landlord/General/ProfileRequest";

function App() {
  const {
    isAuthenticated,
    isLoading,
    initializeAuth,
    requiresVerification,
    updateUser,
    user,
  } = useAuthStore();

  // Refresh the user data in the zustand store periodically when the update_status===pending
  useEffect(() => {
    const refreshUserData = async () => {
      if (!user?.user_slug && !user?.landlord_slug) return;

      const response = await profileRequests.refreshUserData(
        user?.user_slug || user?.landlord_slug
      );
      if (
        response?.status_code === "000" &&
        !response?.in_error &&
        response?.data
      ) {
        updateUser(response.data);
      }
    };
    refreshUserData();
    let intervalId = null;
    if (user?.update_status === "pending" || user?.kyc_verification === false) {
      intervalId = setInterval(() => {
        refreshUserData();
      }, 30000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    updateUser,
    user?.landlord_slug,
    user?.user_slug,
    user?.update_status,
    user?.kyc_verification,
  ]);

  // Todo => Custom Hooks
  useScrollToTop();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/*//Todo => Root route with smart redirect logic */}
        <Route path="/" element={<RootRedirect />} />

        {/*//Todo => Authentication-based routing */}
        {isAuthenticated() ? (
          //Todo => Authenticated users get their role-based routes
          <Route path="/*" element={<AuthRoutes />} />
        ) : requiresVerification() ? (
          //Todo => Users needing verification can only access guest routes (mainly verify-account)
          <Route path="/*" element={<GuestRoutes />} />
        ) : (
          //Todo => Non-authenticated users get guest routes
          <Route path="/*" element={<GuestRoutes />} />
        )}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
