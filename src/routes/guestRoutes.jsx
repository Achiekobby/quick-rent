import { Routes, Route } from "react-router";
import Landing from "../pages/guestPages/Landing";
import PropertyDetails from "../pages/guestPages/PropertyDetails";
import ScheduleViewing from "../pages/guestPages/ScheduleViewing";
import AllProperties from "../pages/guestPages/AllProperties";
import Login from "../pages/guestPages/Login";
import Register from "../pages/guestPages/Register";
import VerifyOTP from "../pages/guestPages/VerifyOTP";
import ForgotPassword from "../pages/guestPages/ForgotPassword";
import ResetPassword from "../pages/guestPages/ResetPassword";
import VerifyAccount from "../pages/guestPages/VerifyAccount";
import SelectUserType from "../pages/guestPages/SelectUserType";
import LandlordLogin from "../pages/guestPages/LandlordLogin";
import LandlordRegister from "../pages/guestPages/LandlordRegister";
import LandlordForgotPassword from "../pages/guestPages/LandlordForgotPassword";
import LandlordResetPassword from "../pages/guestPages/LandlordResetPassword";
import AdminLogin from "../pages/guestPages/AdminLogin";
import ContactSupport from "../pages/guestPages/ContactSupport";
import AuthRedirect from "../components/AuthRedirect";

function GuestRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Landing />} />
      <Route
        path="/select-user-type"
        element={
          <AuthRedirect>
            <SelectUserType />
          </AuthRedirect>
        }
      />
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <Register />
          </AuthRedirect>
        }
      />
      <Route
        path="/landlord-login"
        element={
          <AuthRedirect>
            <LandlordLogin />
          </AuthRedirect>
        }
      />
      <Route
        path="/landlord-register"
        element={
          <AuthRedirect>
            <LandlordRegister />
          </AuthRedirect>
        }
      />
      <Route
        path="/landlord-forgot-password"
        element={
          <AuthRedirect>
            <LandlordForgotPassword />
          </AuthRedirect>
        }
      />
      <Route
        path="/landlord-reset-password"
        element={
          <AuthRedirect>
            <LandlordResetPassword />
          </AuthRedirect>
        }
      />
      <Route
        path="/admin-login"
        element={
          <AuthRedirect>
            <AdminLogin />
          </AuthRedirect>
        }
      />
      <Route path="/verify-account" element={<VerifyAccount />} />
      <Route
        path="/verify-otp"
        element={
          <AuthRedirect>
            <VerifyOTP />
          </AuthRedirect>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthRedirect>
            <ForgotPassword />
          </AuthRedirect>
        }
      />
      <Route
        path="/reset-password"
        element={
          <AuthRedirect>
            <ResetPassword />
          </AuthRedirect>
        }
      />
      <Route path="/properties/:propertySlug" element={<PropertyDetails />} />
      <Route
        path="/properties/:propertySlug/schedule"
        element={<ScheduleViewing />}
      />
      <Route path="/properties" element={<AllProperties />} />
      <Route path="/contact-support" element={<ContactSupport />} />
    </Routes>
  );
}

export default GuestRoutes;
