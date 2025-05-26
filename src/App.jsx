import AuthRoutes from "./routes/authRoutes";
import GuestRoutes from "./routes/guestRoutes";
import useScrollToTop from "./hooks/useScrollToTop";
import "react-toastify/dist/ReactToastify.css";
import useReactToastify from "./hooks/useReactToastify";

function App() {

  // Todo => Custom Hooks
  useScrollToTop();
  useReactToastify();

  // Todo => Routes
  const isAuthenticated = false;
  return <>{isAuthenticated ? <AuthRoutes /> : <GuestRoutes />}</>;
}

export default App;
