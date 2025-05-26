import { Routes, Route } from "react-router";
import Wishlist from "../pages/authPages/Wishlist";
import Notifications from "../pages/authPages/Notifications";
import Dashboard from "../pages/authPages/Dashboard";
import PropertyDetails from "../pages/guestPages/PropertyDetails";
import AllProperties from "../pages/guestPages/AllProperties";
import ScheduleViewing from "../pages/guestPages/ScheduleViewing";

function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />
      
      {/* Add property routes for authenticated users */}
      <Route path="/properties/:propertyId" element={<PropertyDetails />} />
      <Route path="/properties/:propertyId/schedule" element={<ScheduleViewing />} />
      <Route path="/properties" element={<AllProperties />} />
      <Route path="/all-properties" element={<AllProperties />} />
      <Route path="/viewed-properties" element={<AllProperties />} />
    </Routes>
  );
}

export default AuthRoutes;
