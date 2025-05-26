import {Routes, Route} from "react-router";
import Landing from "../pages/guestPages/Landing";
import PropertyDetails from "../pages/guestPages/PropertyDetails";
import ScheduleViewing from "../pages/guestPages/ScheduleViewing";
import AllProperties from "../pages/guestPages/AllProperties";
import Login from "../pages/guestPages/Login";
import Register from "../pages/guestPages/Register";
import VerifyOTP from "../pages/guestPages/VerifyOTP";
import ForgotPassword from "../pages/guestPages/ForgotPassword";
import ResetPassword from "../pages/guestPages/ResetPassword";

function GuestRoutes(){
  return(
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/properties/:propertyId" element={<PropertyDetails />} />
      <Route path="/properties/:propertyId/schedule" element={<ScheduleViewing />} />
      <Route path="/properties" element={<AllProperties />} />
    </Routes>
  );
}

export default GuestRoutes;
