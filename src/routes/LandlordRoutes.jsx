import { Routes, Route, Navigate } from "react-router";
import Notifications from "../pages/authPages/Notifications";
import Profile from "../pages/authPages/Profile";
import LandlordDashboard from "../pages/landlordPages/LandlordDashboard";
import MyProperties from "../pages/landlordPages/MyProperties";
import AddProperty from "../pages/landlordPages/AddProperty";
import ViewProperty from "../pages/landlordPages/ViewProperty";
import EditProperty from "../pages/landlordPages/EditProperty";
import PropertyDetails from "../pages/guestPages/PropertyDetails";
import AllProperties from "../pages/guestPages/AllProperties";
import ProtectedRoute from "../components/ProtectedRoute";

function LandlordRoutes() {
  return (
    <Routes>
      <Route path="/landlord-dashboard" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <LandlordDashboard />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Property routes for landlords */}
      <Route path="/properties/:propertyId" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <ViewProperty />
        </ProtectedRoute>
      } />
      <Route path="/properties" element={
        <ProtectedRoute>
          <AllProperties />
        </ProtectedRoute>
      } />
      <Route path="/all-properties" element={
        <ProtectedRoute>
          <AllProperties />
        </ProtectedRoute>
      } />
      
      {/* Landlord specific routes */}
      <Route path="/my-properties" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <MyProperties />
        </ProtectedRoute>
      } />
      <Route path="/add-property" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <AddProperty />
        </ProtectedRoute>
      } />
      <Route path="/view-property/:propertyId" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <ViewProperty />
        </ProtectedRoute>
      } />
      <Route path="/edit-property/:propertyId" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <EditProperty />
        </ProtectedRoute>
      } />
      <Route path="/tenant-applications" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <div>Tenant Applications - Coming Soon</div>
        </ProtectedRoute>
      } />
      <Route path="/rental-agreements" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <div>Rental Agreements - Coming Soon</div>
        </ProtectedRoute>
      } />
      <Route path="/payment-history" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <div>Payment History - Coming Soon</div>
        </ProtectedRoute>
      } />
      <Route path="/property-analytics" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <div>Property Analytics - Coming Soon</div>
        </ProtectedRoute>
      } />
      <Route path="/viewing-requests" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <div>Viewing Requests - Coming Soon</div>
        </ProtectedRoute>
      } />
      <Route path="/tenant-management" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <div>Tenant Management - Coming Soon</div>
        </ProtectedRoute>
      } />

      {/* //TODO Catch-all route - redirects any unmatched authenticated routes to landlord dashboard */}
      <Route path="*" element={<Navigate to="/landlord-dashboard" replace />} />
    </Routes>
  );
}

export default LandlordRoutes; 