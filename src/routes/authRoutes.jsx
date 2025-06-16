import useAuthStore from "../stores/authStore";
import RenterRoutes from "./RenterRoutes";
import LandlordRoutes from "./LandlordRoutes";
import AdminRoutes from "./AdminRoutes";

function AuthRoutes() {
  const { getUserType } = useAuthStore();
  const userType = getUserType();

  //Todo => Render routes based on user type
  switch (userType) {
    case "rentor":
      return <RenterRoutes />;
    case "landlord":
      return <LandlordRoutes />;
    case "admin":
      return <AdminRoutes />;
    default:
      return <RenterRoutes />;
  }
}

export default AuthRoutes;
