import { Routes, Route, Navigate } from "react-router";
import Notifications from "../pages/authPages/Notifications";
import Profile from "../pages/authPages/Profile";
import AdminDashboard from "../pages/adminPages/AdminDashboard";
import LandlordManagement from "../pages/adminPages/LandlordManagement";
import LandlordProperties from "../pages/adminPages/LandlordProperties";
import RenterManagement from "../pages/adminPages/RenterManagement";
import PropertyDetails from "../pages/guestPages/PropertyDetails";
import AllProperties from "../pages/guestPages/AllProperties";
import ContactSupport from "../pages/guestPages/ContactSupport";
import Landing from "../pages/guestPages/Landing";
import ProtectedRoute from "../components/ProtectedRoute";
import PropertyManagement from "../pages/adminPages/PropertyManagement";
import CreateLandlord from "../pages/adminPages/CreateLandlord";
import CreateProperty from "../pages/adminPages/CreateProperty";
import EditLandlord from "../pages/adminPages/EditLandlord";
import EditLandlordProperty from "../pages/adminPages/EditLandlordProperty";

function AdminRoutes() {
  return (
    <Routes>
      {/* Landing page access for authenticated admins */}
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
      
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminDashboard />
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

      {/* //TODO Property routes for admins */}
      <Route
        path="/properties/:propertyId"
        element={
          <ProtectedRoute>
            <PropertyDetails />
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

      {/* //TODO Admin specific routes */}
      <Route
        path="/landlords/:landlordSlug/properties"
        element={
          <ProtectedRoute>
            <LandlordProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landlords"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <LandlordManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landlords/create"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <CreateLandlord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landlords/edit/:landlordSlug"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <EditLandlord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/renters"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <RenterManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>User Management - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>User Details - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-verification"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Property Verification - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Reports & Analytics - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-settings"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>System Settings - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Audit Logs - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/support-tickets"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Support Tickets - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-management"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <PropertyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/create"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <CreateProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <PropertyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/create"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <CreateProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/edit/:property_slug"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <EditLandlordProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/landlords"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <LandlordManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/landlords/create"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <CreateLandlord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/landlords/edit/:landlordSlug"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <EditLandlord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-management"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Content Management - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-oversight"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Payment Oversight - Coming Soon</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/platform-analytics"
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <div>Platform Analytics - Coming Soon</div>
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

      {/* Catch-all route - redirects any unmatched authenticated routes to admin dashboard */}
      <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
    </Routes>
  );
}

export default AdminRoutes;
