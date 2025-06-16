import React from "react";
import { Navigate, useLocation } from "react-router";
import useAuthStore from "../stores/authStore";

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requireVerification = true,
}) => {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    requiresVerification,
    canAccessRoute,
    getUserType,
  } = useAuthStore();

  //Todo => If no user exists, redirect to user type selection
  if (!user) {
    return (
      <Navigate to="/select-user-type" state={{ from: location }} replace />
    );
  }

  //Todo => If user is not authenticated (inactive or unverified), handle specific cases
  if (!isAuthenticated()) {
    //Todo => If user needs verification, redirect to verify account
    if (requiresVerification()) {
      return (
        <Navigate
          to="/verify-account"
          state={{
            email: user.email,
            message: "Please verify your account to continue",
            from: location.pathname,
          }}
          replace
        />
      );
    }

    //Todo => If user is inactive, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //Todo => If verification is required and user needs verification
  if (requireVerification && requiresVerification()) {
    return (
      <Navigate
        to="/verify-account"
        state={{
          email: user.email,
          message: "Please verify your account to continue",
          from: location.pathname,
        }}
        replace
      />
    );
  }

  //Todo => Check role-based access
  if (requiredRoles.length > 0 && !canAccessRoute(requiredRoles)) {
    //Todo => Redirect to appropriate dashboard based on user type
    const userType = getUserType();
    if (userType === "landlord") {
      return <Navigate to="/landlord-dashboard" replace />;
    } else if (userType === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
