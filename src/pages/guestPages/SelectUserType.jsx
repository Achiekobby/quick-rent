import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Home,
  Building,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";
import Images from "../../utils/Images";
import useAuthStore from "../../stores/authStore";

const SelectUserType = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getRedirectPath } = useAuthStore();
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, getRedirectPath, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const handleContinue = () => {
    if (selectedType) {
      if (selectedType === "landlord") {
        navigate("/landlord-login");
      } else {
        navigate("/login", { 
          state: { 
            userType: selectedType,
            from: "user-type-selection" 
          } 
        });
      }
    }
  };

  const userTypes = [
    {
      id: "renter",
      title: "Renter",
      subtitle: "Find Your Dream Home",
      description: "Discover verified properties with virtual tours and instant booking",
      icon: Home,
      gradient: "from-blue-500 via-blue-600 to-purple-600",
      hoverGradient: "from-blue-400 via-blue-500 to-purple-500",
      stats: "5,000+ Properties",
      badge: "Popular",
      features: ["Virtual Tours", "Instant Booking", "Verified Listings"],
    },
    {
      id: "landlord",
      title: "Landlord",
      subtitle: "Maximize Your Returns",
      description: "List properties with smart pricing and connect with quality tenants",
      icon: Building,
      gradient: "from-orange-500 via-red-500 to-pink-600",
      hoverGradient: "from-orange-400 via-red-400 to-pink-500",
      stats: "2,000+ Landlords",
      badge: "Trending",
      features: ["Smart Pricing", "Quality Tenants", "Easy Management"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <Motion.div
        className="relative max-w-5xl w-full mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Back button with enhanced styling */}
        <Motion.button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-900 transition-all duration-300 rounded-full hover:bg-gray-100/80 backdrop-blur-sm"
          whileHover={{ x: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Motion.button>

        {/* Enhanced Logo and Title */}
        <Motion.div variants={itemVariants} className="text-center mb-10">
          <Link to="/">
            <Motion.img 
              src={Images.logo} 
              alt="Quick Rent" 
              className="h-14 mx-auto mb-6"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>
          <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Journey</span>
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Get started in seconds
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </p>
          </Motion.div>
        </Motion.div>

        {/* Enhanced User Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {userTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            const isHovered = hoveredType === type.id;

            return (
              <Motion.div
                key={type.id}
                variants={cardVariants}
                custom={index}
                className="relative cursor-pointer group"
                onClick={() => setSelectedType(type.id)}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Badge */}
                <div className="absolute -top-3 left-6 z-10">
                  <Motion.div
                    className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${type.gradient} text-white shadow-lg`}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                  >
                    {type.badge}
                  </Motion.div>
                </div>

                <div
                  className={`relative h-full p-8 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-br ${type.gradient} text-white border-transparent shadow-2xl`
                      : `bg-white/80 backdrop-blur-sm border-gray-200 hover:border-gray-300 hover:shadow-xl`
                  }`}
                >
                  {/* Animated background pattern */}
                  <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${
                    isHovered ? 'opacity-20' : ''
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.hoverGradient}`} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <Motion.div
                          className={`p-4 rounded-xl transition-all duration-300 ${
                            isSelected
                              ? "bg-white/20 backdrop-blur-sm"
                              : `bg-gradient-to-br ${type.gradient} shadow-lg`
                          }`}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon
                            className={`w-7 h-7 transition-colors duration-300 ${
                              isSelected ? "text-white" : "text-white"
                            }`}
                          />
                        </Motion.div>
                        <div>
                          <h3 className={`text-xl font-bold mb-1 ${
                            isSelected ? "text-white" : "text-gray-900"
                          }`}>
                            {type.title}
                          </h3>
                          <p className={`text-sm font-medium ${
                            isSelected ? "text-white/90" : "text-gray-600"
                          }`}>
                            {type.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Selection indicator with animation */}
                      <Motion.div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? "border-white bg-white shadow-lg"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isSelected && (
                          <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <CheckCircle2 className={`w-4 h-4 text-gradient-to-br ${type.gradient}`} />
                          </Motion.div>
                        )}
                      </Motion.div>
                    </div>

                    <p className={`text-sm mb-6 leading-relaxed ${
                      isSelected ? "text-white/90" : "text-gray-600"
                    }`}>
                      {type.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {type.features.map((feature, idx) => (
                          <Motion.span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {feature}
                          </Motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className={`flex items-center text-sm font-medium ${
                      isSelected ? "text-white/90" : "text-gray-600"
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {type.stats}
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${type.gradient} opacity-0 transition-opacity duration-500 ${
                    isHovered && !isSelected ? 'opacity-5' : ''
                  }`} />
                </div>
              </Motion.div>
            );
          })}
        </div>

        {/* Enhanced Action Buttons */}
        <Motion.div 
          className="flex flex-col sm:flex-row items-center justify-between gap-6" 
          variants={itemVariants}
        >
          <Link
            to="/register"
            className="group flex items-center text-sm text-gray-600 hover:text-gray-900 transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Don't have an account? <span className="ml-1 font-medium text-orange-600 hover:text-orange-700">Sign up</span>
          </Link>
          
          <Motion.button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`group flex items-center px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              selectedType 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={selectedType ? { 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(251, 146, 60, 0.3)",
            } : {}}
            whileTap={selectedType ? { scale: 0.95 } : {}}
          >
            <span>Continue Your Journey</span>
            <ArrowRight className={`w-4 h-4 ml-2 transition-transform duration-300 ${
              selectedType ? 'group-hover:translate-x-1' : ''
            }`} />
          </Motion.button>
        </Motion.div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(6)].map((_, i) => (
            <Motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </Motion.div>
    </div>
  );
};

export default SelectUserType;