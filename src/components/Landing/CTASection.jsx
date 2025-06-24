import { motion as Motion } from "framer-motion";
import { ArrowRight, Home, Shield, Clock, Users, Star, MapPin } from "lucide-react";
import Colors from "../../utils/Colors";

const features = [
  {
    icon: <Home className="w-5 h-5" />,
    title: "Verified Properties",
    description: "All listings are verified by our team for authenticity"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Secure Payments",
    description: "Your transactions are protected and secure"
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "24/7 Support",
    description: "Our support team is always ready to help"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Trusted Community",
    description: "Join thousands of satisfied users"
  }
];

// Reduced set of high-quality property images
const propertyImages = [
  "https://images.unsplash.com/photo-1577552568192-467a12a7f376?auto=format&fit=crop&w=800&h=600&q=90",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=500&h=400&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&h=400&q=80"
];

const CTASection = () => {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* Animated Shapes */}
      <Motion.div 
        className="absolute top-0 right-0 w-96 h-96 opacity-20"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill={Colors.primary[400]} d="M45.3,-64.3C59.9,-56.1,73.8,-44.2,79.7,-29.2C85.6,-14.1,83.6,4.1,77.7,20.5C71.8,36.9,62.1,51.5,48.4,60.5C34.7,69.5,17.3,72.8,0.9,71.5C-15.6,70.2,-31.2,64.2,-45.5,54.8C-59.8,45.4,-72.9,32.6,-78.3,16.5C-83.7,0.5,-81.4,-18.8,-72.4,-33.5C-63.4,-48.3,-47.7,-58.4,-32.7,-66.1C-17.6,-73.7,-2.9,-78.9,10.8,-76.9C24.5,-74.9,30.7,-72.6,45.3,-64.3Z" transform="translate(100 100)" />
        </svg>
      </Motion.div>
      
      <Motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 opacity-20"
        animate={{
          rotate: -360
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill={Colors.accent.teal} d="M33.6,-54.1C43.3,-45.5,50.5,-35.2,57.2,-23.3C63.9,-11.4,70.1,2,69.4,15.7C68.7,29.4,61.1,43.5,49.7,53.1C38.3,62.6,23.2,67.7,7.8,68.2C-7.6,68.7,-23.3,64.5,-35.6,56.3C-48,48.1,-57,35.9,-62.9,21.8C-68.9,7.7,-71.7,-8.3,-68.4,-23C-65.1,-37.8,-55.7,-51.3,-43.1,-59.3C-30.5,-67.2,-15.3,-69.6,-1.4,-67.5C12.4,-65.4,24.9,-62.7,33.6,-54.1Z" transform="translate(100 100)" />
        </svg>
      </Motion.div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ 
              background: `linear-gradient(to right, ${Colors.primary[600]}, ${Colors.primary[500]}, ${Colors.accent.orange})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              Find Your Dream Home Today
            </span>
          </Motion.h2>
          <Motion.p 
            className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Join thousands of satisfied users who have found their ideal living space in minutes.
          </Motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Property Showcase - Full width on mobile, 7 columns on large screens */}
          <Motion.div
            className="lg:col-span-7 relative order-2 lg:order-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Simplified Grid Layout */}
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:h-[600px]">
              {/* Main Feature Image */}
              <Motion.div
                className="col-span-1 sm:col-span-2 h-[250px] sm:h-[350px] relative rounded-3xl overflow-hidden shadow-xl group"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/60 via-transparent to-transparent z-10" />
                <img 
                  src={propertyImages[0]}
                  alt="Luxury Apartment"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                          Premium
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Luxury Apartments Available</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white/90 text-xs sm:text-sm">
                      </div>
                    </div>
                  </div>
                </div>
              </Motion.div>

              {/* Two smaller images */}
              {[1, 2].map((index) => (
                <Motion.div 
                  key={index}
                  className="relative rounded-3xl overflow-hidden shadow-lg group h-[180px] sm:h-[220px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/40 via-transparent to-transparent z-10" />
                  <img 
                    src={propertyImages[index]}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-base sm:text-lg font-bold text-white">{index === 1 ? "Modern Studio" : "Luxury Villa"}</h3>
                    <div className="flex justify-between items-center mt-1">
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>

            {/* Keep the decorative elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-100 rounded-full opacity-30 blur-3xl" />
            <div className="absolute -left-20 bottom-20 w-72 h-72" style={{ backgroundColor: Colors.accent.orange, opacity: 0.2 }} />
          </Motion.div>
          
          {/* CTA Content */}
          <Motion.div
            className="lg:col-span-5 order-1 lg:order-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary-100 rounded-full opacity-80 blur-2xl" />
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-neutral-900 relative z-10">
                Ready to find your perfect home?
              </h3>
              
              <p className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8 relative z-10">
                Sign up now and get access to exclusive listings, personalized recommendations, 
                and premium features that will make your home hunting experience seamless.
              </p>
              
              <div className="space-y-4 mb-6 sm:mb-8 relative z-10">
                {features.map((feature, index) => (
                  <Motion.div
                    key={feature.title}
                    className="flex items-start sm:items-center gap-3 sm:gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-sm">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {feature.description}
                      </p>
                    </div>
                  </Motion.div>
                ))}
              </div>
              
              <div className="space-y-3 relative z-10">
                <Motion.button
                  className="w-full py-4 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(to right, ${Colors.primary[600]}, ${Colors.primary[500]})`,
                }}
                whileHover={{ 
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Motion.button>
                        
                     
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 