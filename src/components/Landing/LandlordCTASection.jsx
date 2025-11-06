import { motion as Motion } from "framer-motion";
import { 
  Building, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Shield, 
  Sparkles,
  Crown,
  Zap,
  CheckCircle2,
  BarChart3,
  DollarSign,
  MapPin,
  Star
} from "lucide-react";
import { useNavigate } from "react-router";
import useAuthStore from "../../stores/authStore";

const LandlordCTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoToDashboard = () => {
    navigate("/landlord-dashboard");
  };

  const benefits = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Maximize Your Revenue",
      description: "Reach thousands of verified tenants and increase occupancy rates"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Transactions",
      description: "Automated rent collection and secure payment processing"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Easy Property Management",
      description: "Track performance, occupancy, and revenue insights"
    }
  ];

  const stats = [
    { value: "2K+", label: "Active Landlords", icon: Building },
    { value: "95%", label: "Occupancy Rate", icon: TrendingUp },
    { value: "50K+", label: "Verified Tenants", icon: Users },
    { value: "4.8", label: "Platform Rating", icon: Star }
  ];

  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <Motion.div 
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <Motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Badge */}
        <Motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-200 shadow-lg backdrop-blur-sm">
            <Crown className="w-5 h-5 text-amber-600 mr-2" />
            <span className="text-sm font-bold text-amber-700">Premium Property Owner Portal</span>
            <Sparkles className="w-4 h-4 text-amber-600 ml-2" />
          </div>
        </Motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <Motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6">
              <Motion.div
                className="inline-flex items-center gap-2 mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="h-px w-16 bg-gradient-to-r from-orange-400 to-amber-400" />
              </Motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  {user?.business_name || user?.full_name || "Property Owner"}
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed">
                Ready to grow your property business? List your properties and start connecting with thousands of verified tenants today.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <Motion.div
                  key={benefit.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-orange-100 hover:border-orange-200 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-600 shadow-sm">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-base">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </Motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <Motion.button
                onClick={handleGoToDashboard}
                className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)"
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Button content */}
                <span className="relative flex items-center justify-center gap-3 text-base sm:text-lg">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Go to Dashboard</span>
                  <Motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Motion.div>
                </span>

                {/* Sparkle effects */}
                <div className="absolute top-2 right-2 opacity-50">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
              </Motion.button>

              <p className="mt-4 text-sm text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Start listing properties in minutes</span>
              </p>
            </Motion.div>
          </Motion.div>

          {/* Right Side - Stats & Visual */}
          <Motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Premium Card */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-orange-100 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-orange-200/50 to-amber-200/50 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-br from-yellow-200/50 to-orange-200/50 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Platform Insights</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Join thousands of successful property owners
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <Motion.div
                        key={stat.label}
                        className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-gray-600">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="space-y-3 pt-6 border-t border-orange-100">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Free property listings</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Professional tenant screening</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </div>
                </div>

                {/* Call to Action Hint */}
                <Motion.div
                  className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Ready to list your first property?
                      </p>
                      <p className="text-xs text-gray-600">
                        Access your dashboard to create professional listings and start receiving applications
                      </p>
                    </div>
                  </div>
                </Motion.div>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandlordCTASection;

