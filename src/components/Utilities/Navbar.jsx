import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, X, User, Home, HelpCircle, Heart, Settings, Bell, LogOut, ChevronRight, PlusCircle } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Images from "../../utils/Images";
import Colors from "../../utils/Colors";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout, getUserType } = useAuthStore();

  // Mock data - in a real app, this would come from API
  const userStats = {
    unreadNotifications: 5,
    wishlistCount: 3
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const menuItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: i => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 25,
        mass: 0.5
      }
    }
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.25,
        ease: "easeOut"
      }
    }),
    hover: {
      x: 5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  // Generate menu items based on user type
  const getUserMenuItems = () => {
    const userType = getUserType();
    const baseItems = [
      { icon: <Home size={18} />, text: "Dashboard", to: "/dashboard", divider: false, color: "#4F46E5" },
    ];

    // Add user type specific items
    if (userType === 'renter') {
      baseItems.push(
        { icon: <Heart size={18} />, text: "Wishlist", to: "/wishlist", badge: userStats.wishlistCount, divider: false, color: "#EC4899" }
      );
    } else if (userType === 'landlord') {
      baseItems.push(
        { icon: <PlusCircle size={18} />, text: "My Properties", to: "/my-properties", divider: false, color: Colors.accent.orange },
        { icon: <PlusCircle size={18} />, text: "Add Property", to: "/add-property", divider: false, color: "#10B981" }
      );
    } else if (userType === 'admin') {
      baseItems.push(
        { icon: <PlusCircle size={18} />, text: "User Management", to: "/users", divider: false, color: Colors.accent.orange },
        { icon: <PlusCircle size={18} />, text: "System Settings", to: "/system-settings", divider: false, color: "#10B981" }
      );
    }

    // Add common items
    baseItems.push(
      { icon: <HelpCircle size={18} />, text: "Help Center", to: "/help", divider: false, color: "#8B5CF6" },
      { icon: <Settings size={18} />, text: "Settings", to: "/settings", divider: true, color: "#6B7280" },
      { icon: <LogOut size={18} />, text: "Logout", to: "/logout", divider: false, color: "#EF4444" }
    );

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center">
          <Link to="/dashboard">
            <img src={Images.logo} alt="Quick Rent Logo" className="h-10 md:h-14" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Wishlist Link */}
          <Motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/wishlist"
              className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-gray-700" />
              {user.wishlistCount > 0 && (
                <Motion.span 
                  className="absolute -top-1 -right-1 h-5 w-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {user.wishlistCount}
                </Motion.span>
              )}
            </Link>
          </Motion.div>
          
          {/* Notifications Link */}
          <Motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* <Link
              to="/notifications"
              className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-700" />
              {userStats.unreadNotifications > 0 && (
                <Motion.span 
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {userStats.unreadNotifications}
                </Motion.span>
              )}
            </Link> */}
          </Motion.div>
          
          {/* User Menu Button */}
          <div className="relative" ref={userMenuRef}>
            <Motion.button
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 hover:shadow-md transition-all duration-200"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              whileHover={{ 
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                borderColor: "#d1d1d1"
              }}
              whileTap={{ scale: 0.97 }}
              aria-label="User menu"
            >
              <Menu size={16} className="text-gray-600" />
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User size={18} className="text-gray-600" />
                )}
              </div>
            </Motion.button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <Motion.div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ 
                    filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))",
                    transformOrigin: "top right"
                  }}
                >
                  <div className="pt-4 pb-2">
                    {/* User Profile Section */}
                    <div className="px-5 pb-4 mb-2 border-b border-gray-100">
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            <User size={24} className="text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {userMenuItems.map((item, index) => (
                      <Motion.div 
                        key={index}
                        variants={dropdownItemVariants}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        onHoverStart={() => setActiveMenuItem(index)}
                        onHoverEnd={() => setActiveMenuItem(null)}
                      >
                        {item.text === "Logout" ? (
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors relative group text-left"
                          >
                            <div className="flex items-center">
                              <span 
                                className="mr-3 p-2 rounded-full text-white transition-all duration-300 flex items-center justify-center"
                                style={{ 
                                  backgroundColor: item.color,
                                  boxShadow: activeMenuItem === index ? `0 0 0 2px white, 0 0 0 4px ${item.color}40` : 'none'
                                }}
                              >
                                {item.icon}
                              </span>
                              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                {item.text}
                              </span>
                            </div>
                            <Motion.div
                              animate={{ x: activeMenuItem === index ? 0 : -5, opacity: activeMenuItem === index ? 1 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </Motion.div>
                          </button>
                        ) : (
                          <Link 
                            to={item.to}
                            className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors relative group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <span 
                                className="mr-3 p-2 rounded-full text-white transition-all duration-300 flex items-center justify-center"
                                style={{ 
                                  backgroundColor: item.color,
                                  boxShadow: activeMenuItem === index ? `0 0 0 2px white, 0 0 0 4px ${item.color}40` : 'none'
                                }}
                              >
                                {item.icon}
                              </span>
                              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                {item.text}
                              </span>
                            </div>
                            {item.badge && (
                              <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                                {item.badge}
                              </span>
                            )}
                            <Motion.div
                              animate={{ x: activeMenuItem === index ? 0 : -5, opacity: activeMenuItem === index ? 1 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </Motion.div>
                          </Link>
                        )}
                        {item.divider && (
                          <div className="border-b border-gray-100 my-2 mx-5"></div>
                        )}
                      </Motion.div>
                    ))}
                    
                    {/* Footer section */}
                    <div className="mt-3 pt-3 px-5 pb-4 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500 text-center">
                        © {new Date().getFullYear()} Quick Rent. All rights reserved.
                      </p>
                    </div>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Motion.button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <Motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} color={Colors.primary[500]} />
              </Motion.div>
            ) : (
              <Motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} color={Colors.primary[500]} />
              </Motion.div>
            )}
          </AnimatePresence>
        </Motion.button>
      </div>

      {/* Mobile Navigation with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="px-4 py-6 space-y-3">
              {/* User Profile Section for Mobile */}
              <div className="pb-3 mb-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User size={24} className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            
              {/* Menu Items for Mobile */}
              {userMenuItems.map((item, i) => (
                <Motion.div
                  key={item.to}
                  custom={i}
                  variants={menuItemVariants}
                >
                  {item.text === "Logout" ? (
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between py-3.5 relative hover:bg-gray-50 px-2 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <span 
                          className="mr-3 p-2 rounded-full text-white flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.icon}
                        </span>
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ) : (
                    <Link 
                      to={item.to} 
                      className="flex items-center justify-between py-3.5 relative hover:bg-gray-50 px-2 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <span 
                          className="mr-3 p-2 rounded-full text-white flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.icon}
                        </span>
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  )}
                  {item.divider && <div className="border-b border-gray-100 my-2"></div>}
                </Motion.div>
              ))}
              
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} Quick Rent. All rights reserved.
                </p>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;