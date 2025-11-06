import React from "react";
import { Navigate } from "react-router";
import useAuthStore from "../stores/authStore";

//Todo => AuthRedirect component
const AuthRedirect = ({ children, redirectTo = null }) => {
  const { user, isAuthenticated, requiresVerification, getUserType } =
    useAuthStore();

  //Todo => If user exists (logged in)
  if (user) {
    //Todo => If user is fully authenticated (active and verified)
    if (isAuthenticated()) {
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }

      // Redirect based on user type
      const userType = getUserType();
      const redirectPath = userType === 'renter' ? '/home' : 
                          userType === 'landlord' ? '/home' : // Redirect landlords to landing page
                          userType === 'admin' ? '/admin-dashboard' : '/home';
      return <Navigate to={redirectPath} replace />;
    }

    //Todo => If user needs verification, redirect to verify account
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
  } else {
    //Todo => If no user found, show login page
  }

  return children;
};

export default AuthRedirect;
