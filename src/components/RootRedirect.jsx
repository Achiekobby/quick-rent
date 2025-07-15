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

  //Todo => If user is fully authenticated, redirect based on user type
  if (isAuthenticated()) {
    const userType = getUserType();
    const redirectPath = userType === 'renter' ? '/home' : 
                        userType === 'landlord' ? '/landlord-dashboard' : 
                        userType === 'admin' ? '/admin-dashboard' : '/home';
    return <Navigate to={redirectPath} replace />;
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
