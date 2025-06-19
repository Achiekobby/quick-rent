import { motion as Motion } from "framer-motion";
import {
  Home,
  Search,
  FileX,
  Package,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";

const EmptyState = ({
  icon = "home",
  title = "No items found",
  description = "There are no items to display at the moment.",
  actionText,
  onActionClick,
  showAction = false,
  className = "",
}) => {
  //Todo => Icon mapping
  const iconMap = {
    home: Home,
    search: Search,
    file: FileX,
    package: Package,
    users: Users,
    calendar: Calendar,
    alert: AlertCircle,
  };

  const IconComponent = iconMap[icon] || Home;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      {/* //Todo => Animated Icon */}
      <Motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        {/* //Todo => Background circle with gradient */}
        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
          {/* //Todo => Decorative elements */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-orange-200 rounded-full opacity-60"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-40"></div>
          <div className="absolute top-1/2 left-2 w-1 h-1 bg-orange-200 rounded-full opacity-50"></div>

          {/* //Todo => Main Icon */}
          <IconComponent
            size={48}
            className="text-orange-400 md:size-16 relative z-10"
          />
        </div>
      </Motion.div>

      {/* //Todo => Content */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm md:text-base leading-relaxed">
          {description}
        </p>

        {/* //Todo => Action Button */}
        {showAction && actionText && onActionClick && (
          <Motion.button
            onClick={onActionClick}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-sm md:text-base"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <IconComponent size={18} className="md:size-5" />
            {actionText}
          </Motion.button>
        )}
      </Motion.div>

      {/* //Todo => Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-200 rounded-full opacity-20"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <Motion.div
          className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-30"
          animate={{
            y: [0, 8, 0],
            x: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <Motion.div
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-orange-200 rounded-full opacity-25"
          animate={{
            y: [0, -6, 0],
            x: [0, 4, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    </Motion.div>
  );
};

export default EmptyState;
