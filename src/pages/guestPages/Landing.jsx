import React, { useEffect, useState } from "react";
import GuestLayout from "../../Layouts/GuestLayout";
import Hero from "../../components/Landing/Hero";
import Categories from "../../components/Landing/Categories";
import PopularProperties from "../../components/Landing/PopularProperties";
import CTASection from "../../components/Landing/CTASection";
import LandlordCTASection from "../../components/Landing/LandlordCTASection";
import FAQSection from "../../components/Landing/FAQSection";
import { toast } from "react-toastify";
import { getAllProperties } from "../../api/Renter/General/DashboardRequests";
import { Loader2 } from "lucide-react";
import useAuthStore from "../../stores/authStore";

const Landing = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState(null);
  const [popularProperties, setPopularProperties] = useState(null);
  const { isAuthenticated, getUserType } = useAuthStore();
  const isLandlord = isAuthenticated() && getUserType() === "landlord";
  console.log(properties);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await getAllProperties();
        if (
          response?.data?.status_code === "000" &&
          !response?.data?.in_error
        ) {
          setProperties(response?.data?.data);
          setPopularProperties(response?.data?.data?.popular_properties);
        } else {
          toast.error(response?.data?.reason || "Could not fetch properties");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.reason || "Could not fetch properties"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }
  return (
    <GuestLayout>
      <Hero />
      {/* Show landlord-specific CTA section if landlord is logged in */}
      {isLandlord && <LandlordCTASection />}
      <Categories />
      <PopularProperties properties={popularProperties} />
      {/* Show regular CTA section only if not a landlord */}
      {!isLandlord && <CTASection />}
      <FAQSection />
    </GuestLayout>
  );
};

export default Landing;
