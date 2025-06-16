import React from "react";
import { Navigate } from "react-router";
import useAuthStore from "../stores/authStore";

//Todo => RootRedirect component
const RootRedirect = () => {
  const { user, isAuthenticated, requiresVerification, getUserType } =
    useAuthStore();

  //Todo => If no user, show landing page
  if (!user) {
    return <Navigate to="/home" replace />;
  }

  //Todo => If user is fully authenticated, redirect to appropriate dashboard
  if (isAuthenticated()) {
    const userType = getUserType();
    if (userType === "landlord") {
      return <Navigate to="/landlord-dashboard" replace />;
    } else if (userType === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    //Todo => For renters and default case
    return <Navigate to="/dashboard" replace />;
  }

  //Todo => If user needs verification
  if (requiresVerification()) {
    return (
      <Navigate
        to="/verify-account"
        state={{
          email: user.email,
          message: "Please verify your account to continue",
        }}
        replace
      />
    );
  }

  //Todo => If user exists but is inactive, redirect to login
  return <Navigate to="/login" replace />;
};

export default RootRedirect;
