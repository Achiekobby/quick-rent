import { Routes, Route, Navigate } from "react-router";
import Wishlist from "../pages/authPages/Wishlist";
import Notifications from "../pages/authPages/Notifications";
import Dashboard from "../pages/authPages/Dashboard";
import Profile from "../pages/authPages/Profile";
import PropertyDetails from "../pages/guestPages/PropertyDetails";
import AllProperties from "../pages/guestPages/AllProperties";
import ScheduleViewing from "../pages/guestPages/ScheduleViewing";
import ContactSupport from "../pages/guestPages/ContactSupport";
import ProtectedRoute from "../components/ProtectedRoute";

function RentorRoutes() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* //TODO Property routes for rentors */}
      <Route
        path="/properties/:propertySlug"
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:propertyId/schedule"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <ScheduleViewing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute>
            <AllProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-properties"
        element={
          <ProtectedRoute>
            <AllProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewed-properties"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <AllProperties />
          </ProtectedRoute>
        }
      />

      {/* //TODO Rentor specific routes */}
      <Route
        path="/saved-searches"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <div>Saved Searches - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rental-applications"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <div>Rental Applications - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewing-history"
        element={
          <ProtectedRoute requiredRoles={["rentor"]}>
            <div>Viewing History - Coming Soon</div>
          </ProtectedRoute>
        }
      />

      {/* Support */}
      <Route
        path="/contact-support"
        element={
          <ProtectedRoute>
            <ContactSupport />
          </ProtectedRoute>
        }
      />

      {/* //TODO Catch-all route - redirects any unmatched authenticated routes to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default RentorRoutes;
