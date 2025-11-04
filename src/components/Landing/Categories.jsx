import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router";
import categories from "../../data/CategoryData";
import categoryRequests from "../../api/Renter/General/CategoryRequests";
import { toast } from "react-toastify";

const Categories = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [updatedCategories, setUpdatedCategories] = useState(categories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      setLoading(true);
      try {
        const response = await categoryRequests.getCategoryStats();
        if (response.data.status_code === "000") {
          const categoryStats = response.data.data;
          const categoriesWithStats = categories.map((category) => {
            const stats = categoryStats.find(
              (stat) => stat.name === category.key
            );
            return {
              ...category,
              ads: stats ? `${stats.count} Ad(s)` : "0 Ad(s)",
            };
          });

          setUpdatedCategories(categoriesWithStats);
        } else {
          toast.error(response.message || "An error occurred");
        }
      } catch (error) {
        toast.error(error.response?.data?.reason || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
  };

  // Handle category click - navigate to properties page with category filter
  const handleCategoryClick = (category) => {
    // Use category.key to match the filtering logic in AllProperties.jsx
    const categoryName = category.key;
    navigate(`/properties?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="text-primary-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-neutral-50 to-white overflow-x-hidden">
      <Motion.div
        className="max-w-[1920px] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <Motion.div className="text-center mb-16" variants={itemVariants}>
          <span className="text-sm font-medium text-primary-600 mb-3 block">
            Property Categories
          </span>
          <h2 className="text-2xl lg:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
            Browse by Property Type
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-sm lg:text-lg">
            Explore our diverse range of properties to find exactly what you're
            looking for
          </p>
        </Motion.div>

        <Motion.div
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full"
          variants={containerVariants}
        >
          {updatedCategories.map((category) => {
            const isHovered = hoveredCategory === category.id;
            return (
              <Motion.div
                key={category.id}
                className="relative group rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
                variants={itemVariants}
                role="button"
                tabIndex={0}
                aria-label={`Browse ${category.title} properties`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onFocus={() => setHoveredCategory(category.id)}
                onBlur={() => setHoveredCategory(null)}
                onClick={() => handleCategoryClick(category)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCategoryClick(category);
                  }
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="relative w-full pb-[98%] lg:pb-[95%]">
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Motion.div
                    className="w-12 h-16 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      color: category.color,
                      backdropFilter: "blur(8px)",
                    }}
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                      backgroundColor: isHovered
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(255, 255, 255, 0.15)",
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-center p-2">
                      {category.icon}
                    </div>
                  </Motion.div>

                  <Motion.h3
                    className="text-white font-bold text-[13px] lg:text-[16px] text-center mb-1.5"
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.title}
                  </Motion.h3>

                  <Motion.div
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Motion.span
                      className="text-xs md:text-sm font-semibold px-3 py-1 rounded-lg inline-flex items-center justify-center backdrop-blur-md"
                      style={{
                        backgroundColor: `${category.color}CC`,
                        color: "white",
                      }}
                    >
                      {category.ads}
                    </Motion.span>
                    
                    {/* Click indicator on hover */}
                    <Motion.span
                      className="text-[10px] md:text-xs text-white/80 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 5,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      Click to explore →
                    </Motion.span>
                  </Motion.div>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </Motion.div>
    </section>
  );
};

export default Categories;
