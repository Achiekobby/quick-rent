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
import ContactSupport from "../pages/guestPages/ContactSupport";
import Landing from "../pages/guestPages/Landing";
import ProtectedRoute from "../components/ProtectedRoute";
import SubscriptionPlans from "../pages/landlordPages/SubscriptionPlans";
import SubscriptionPayment from "../pages/landlordPages/SubscriptionPayment";
import SubscriptionHistory from "../pages/landlordPages/SubscriptionHistory";
import Payments from "../pages/landlordPages/Payments";
import PaymentSuccess from "../pages/landlordPages/PaymentSuccess";
import PaymentFailure from "../pages/landlordPages/PaymentFailure";
import PaymentVerification from "../pages/landlordPages/PaymentVerification";
import PaymentCallback from "../pages/landlordPages/PaymentCallback";

function LandlordRoutes() {
  return (
    <Routes>
      {/* Landing page access for authenticated landlords */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />
      
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
      <Route path="/property/:propertyId" element={
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
      <Route path="/view-property/:propertySlug" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <ViewProperty />  
        </ProtectedRoute>
      } />
      <Route path="/edit-property/:propertySlug" element={
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
          <Payments />
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

      {/* Subscription Routes */}
      <Route path="/subscription/upgrade" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <SubscriptionPlans />
        </ProtectedRoute>
      } />
      <Route path="/subscription/history" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <SubscriptionHistory />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <Payments />
        </ProtectedRoute>
      } />
      <Route path="/subscription/payment" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <SubscriptionPayment />
        </ProtectedRoute>
      } />
      <Route path="/subscription/payment/success" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <PaymentSuccess />
        </ProtectedRoute>
      } />
      <Route path="/subscription/payment/failure" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <PaymentFailure />
        </ProtectedRoute>
      } />
      <Route path="/subscription/payment/verify" element={
        <ProtectedRoute requiredRoles={['landlord']}>
          <PaymentVerification />
        </ProtectedRoute>
      } />
      <Route path="/subscription/payment/callback" element={
        <PaymentCallback />
      } />

      {/* Support */}
      <Route path="/contact-support" element={
        <ProtectedRoute>
          <ContactSupport />
        </ProtectedRoute>
      } />

      {/* Catch-all route - redirects any unmatched authenticated routes to landlord dashboard */}
      <Route path="*" element={<Navigate to="/landlord-dashboard" replace />} />
    </Routes>
  );
}

export default LandlordRoutes; 