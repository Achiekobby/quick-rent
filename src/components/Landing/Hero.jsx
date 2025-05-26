import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Home, Building, Star } from "lucide-react";
import Colors from "../../utils/Colors";

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  
  const propertyImages = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1920&auto=format&fit=crop"
  ];

  const locations = ["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast"];
  const propertyTypes = ["Apartments", "Houses", "Office Spaces", "Land", "Short Stays"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [propertyImages.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  };

  const handleSlideChange = (newIndex) => {
    setDirection(newIndex > activeSlide ? 1 : -1);
    setActiveSlide(newIndex);
  };

  return (
    <div className="relative overflow-hidden ">
      <div className="relative h-screen w-full">
        <AnimatePresence initial={false} custom={direction}>
          <Motion.div
            key={activeSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${propertyImages[activeSlide]})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
          </Motion.div>
        </AnimatePresence>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {propertyImages.map((_, index) => (
            <Motion.button
              key={index}
              className={`w-3 h-3 rounded-full ${activeSlide === index ? "bg-white" : "bg-white/50"}`}
              onClick={() => handleSlideChange(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <Motion.div 
        className="absolute inset-0 flex items-center justify-center px-4 md:px-8 lg:px-16 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-7xl">
          <Motion.h1 
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight"
            variants={itemVariants}
          >
            Find Your Perfect Home <br />
            <span style={{ color: Colors.accent.orange }}>Without the Hassle</span>
          </Motion.h1>
          
          <Motion.p 
            className="text-white text-xs sm:text-sm md:text-lg mb-6 md:mb-8 max-w-2xl"
            variants={itemVariants}
          >
            Browse thousands of properties across Ghana and find your ideal living space in minutes.
          </Motion.p>

          {/* Search Form */}
          <Motion.div 
            className="bg-white p-3 md:p-4 rounded-xl shadow-xl mb-6 md:mb-8 max-w-4xl"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select 
                  className="w-full py-3 px-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  style={{ borderColor: Colors.neutral[200] }}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select 
                  className="w-full py-3 px-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  style={{ borderColor: Colors.neutral[200] }}
                >
                  <option value="">Property Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <Motion.button 
                className="w-full py-3 px-6 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: Colors.accent.orange }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search size={20} />
                Find Properties
              </Motion.button>
            </div>
          </Motion.div>

          {/* Quick Stats */}
          <Motion.div 
            className="grid grid-cols-2 sm:flex flex-wrap gap-4 md:gap-8 text-white"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Building size={20} md:size={24} color="white" />
              </div>
              <div>
                <p className="text-xl md:text-3xl font-bold">5,000+</p>
                <p className="text-sm md:text-base text-white/80">Properties</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MapPin size={24} color="white" />
              </div>
              <div>
                <p className="text-3xl font-bold">20+</p>
                <p className="text-white/80">Cities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star size={24} color="white" />
              </div>
              <div>
                <p className="text-3xl font-bold">4.8</p>
                <p className="text-white/80">User Rating</p>
              </div>
            </div>
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
};

export default Hero;