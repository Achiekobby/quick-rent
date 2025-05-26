import { motion as Motion } from "framer-motion";
import PropertyCard from "../Utilities/PropertyCard";
import { ArrowRight } from "lucide-react";
import popularProperties from "../../data/PopularProperties";
import { useNavigate } from "react-router";

const PopularProperties = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/properties");
  };

  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <h2 className="text-lg font-bold mb-2 lg:text-4xl">
              Popular Properties
            </h2>
            <p className="text-neutral-600 text-[13px] lg:text-base">
              Discover our most sought-after properties across Ghana
            </p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button
              className="flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded-lg shadow-sm border border-neutral-200 transition-all hover:shadow text-[12px] lg:text-base"
              onClick={handleViewAll}
            >
              View all properties
              <ArrowRight size={16} className="ml-1" />
            </button>
          </Motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {popularProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProperties;
