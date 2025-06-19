import TopNavbar from "../components/Utilities/TopNavbar";
import Footer from "../components/Utilities/Footer";
import Navbar from "../components/Utilities/Navbar";
import useAuthStore from "../stores/authStore";

function GuestLayout({ children }) {
  const {user} = useAuthStore();
  console.log(user);
  return (
    <div className="flex flex-col min-h-screen">
      {!user ? <TopNavbar /> : <Navbar />}
      {children}
      <Footer />
    </div>
  );
}

export default GuestLayout;
