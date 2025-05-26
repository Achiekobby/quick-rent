import TopNavbar from "../components/Utilities/TopNavbar";
import Footer from "../components/Utilities/Footer";

function GuestLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar />
      {children}
      <Footer />
    </div>
  );
}

export default GuestLayout;
