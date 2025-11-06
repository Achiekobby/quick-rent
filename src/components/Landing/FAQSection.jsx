import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageCircle, HelpCircle, X, Sparkles, Lightbulb, BookOpen } from 'lucide-react';
import Colors from '../../utils/Colors';

const faqs = [
  {
    question: "How does Quick Rent work?",
    answer: "Quick Rent connects landlords with prospective tenants. Landlords list their properties with details and photos, while tenants can search, filter, and book viewings directly through the platform. We verify all listings to ensure authenticity and provide a secure communication channel between parties."
  },
  {
    question: "Are the properties verified?",
    answer: "Yes, all properties on Quick Rent are verified by our team. We conduct physical inspections of properties before they're listed to ensure they match the descriptions and photos provided. This helps prevent scams and ensures you get exactly what you're looking for."
  },
  {
    question: "What fees does Quick Rent charge?",
    answer: "Quick Rent is free for tenants to browse. Landlords pay a small fee to list their properties. We don't charge any hidden fees or commissions on rental agreements made through our platform."
  },
  {
    question: "Can I list my property on Quick Rent?",
    answer: "Absolutely! If you're a property owner or manager, you can create an account and list your properties on Quick Rent. We offer different subscription plans based on the number of properties you want to list. Visit our 'Landlord Registration' page to get started."
  },
  {
    question: "What payment methods are accepted?",
    answer: "Quick Rent supports various secure payment methods including mobile money (MTN, Telecel, AirtelTigo), bank transfers, and credit/debit cards. All transactions are processed securely through our encrypted payment gateway. Landlords make payments directly for their subscriptions."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we take your privacy and security seriously. All personal information is encrypted and stored securely. We never share your contact details with third parties without your consent. Your data is protected using industry-standard security measures."
  },
  {
    question: "What happens if I have issues with my landlord or tenant?",
    answer: "Quick Rent provides a dispute resolution service to help resolve conflicts between landlords and tenants. You can contact our support team through the platform, and we'll work with both parties to find a fair solution. We also offer mediation services for more complex issues."
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  const filteredFAQs = searchQuery.trim() === '' 
    ? faqs 
    : faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      
      <Motion.div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
        animate={{
          scale: [1, 1.05, 1],
          rotate: 360
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill={Colors.primary[300]} d="M48.8,-69.5C62.8,-58.5,73.8,-44.1,79.6,-27.8C85.5,-11.5,86.2,6.8,80.4,22.3C74.6,37.8,62.3,50.5,47.9,60.6C33.6,70.7,16.8,78.2,0.4,77.6C-16,77,-32,68.3,-44.4,57.2C-56.7,46.1,-65.4,32.6,-71.5,16.8C-77.5,1,-80.9,-17.1,-75.3,-32.6C-69.6,-48.1,-55,-61.1,-39.6,-71.3C-24.2,-81.6,-8.1,-89.1,8.1,-88.6C24.4,-88.1,34.8,-80.4,48.8,-69.5Z" transform="translate(100 100)" />
        </svg>
      </Motion.div>
      
      <Motion.div 
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          rotate: -360
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill={Colors.accent.orange} d="M39.7,-67.7C52.9,-58.5,66.1,-50.3,74.4,-38.1C82.8,-25.9,86.4,-9.7,84.5,5.5C82.5,20.7,75,34.9,65.5,47.8C56,60.8,44.4,72.6,30.4,78.7C16.4,84.8,0,85.2,-15.7,81.2C-31.3,77.3,-46.3,69,-59.1,57.2C-71.9,45.4,-82.5,30.1,-85.8,13.3C-89.1,-3.6,-85,-21.9,-76.8,-37.3C-68.6,-52.7,-56.3,-65.2,-42.2,-73.9C-28.1,-82.6,-12.1,-87.5,1.2,-89.5C14.5,-91.6,26.5,-76.8,39.7,-67.7Z" transform="translate(100 100)" />
        </svg>
      </Motion.div>
      
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <Motion.span 
            className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary-100 text-primary-600 inline-block mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            GOT QUESTIONS?
          </Motion.span>
          
          <Motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span style={{ 
              background: `linear-gradient(to right, ${Colors.primary[600]}, ${Colors.primary[500]}, ${Colors.accent.orange})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              Frequently Asked Questions
            </span>
          </Motion.h2>
          
          <Motion.p 
            className="text-lg text-neutral-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find answers to common questions about Quick Rent and our services
          </Motion.p>
        </div>
        
        {/* Search Bar */}
        <Motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Motion.div
                animate={{ 
                  scale: searchQuery ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  repeat: searchQuery ? Infinity : 0, 
                  repeatType: "reverse",
                  duration: 1.5
                }}
              >
                <Search className={`h-5 w-5 ${searchQuery ? 'text-primary-500' : 'text-neutral-400'}`} />
              </Motion.div>
            </div>
            
            <input
              type="text"
              className="block w-full pl-12 pr-14 py-4 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-primary-500 bg-white/90 backdrop-blur-sm text-neutral-700 placeholder-neutral-400 transition-all duration-300 hover:shadow-xl"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                boxShadow: searchQuery ? `0 4px 20px rgba(${parseInt(Colors.primary[300].slice(1, 3), 16)}, ${parseInt(Colors.primary[300].slice(3, 5), 16)}, ${parseInt(Colors.primary[300].slice(5, 7), 16)}, 0.2)` : ''
              }}
            />
            
            <AnimatePresence>
              {searchQuery && (
                <Motion.button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setSearchQuery('')}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                    <X className="h-4 w-4 text-neutral-500" />
                  </div>
                </Motion.button>
              )}
            </AnimatePresence>
          </div>
          
          {searchQuery && (
            <Motion.div 
              className="text-center mt-2 text-sm text-neutral-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Found {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </Motion.div>
          )}
        </Motion.div>
        
        {/* Main Content: Two Column Layout */}
        <div className="max-w-8xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: FAQ Accordion */}
          <Motion.div
            className="space-y-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <Motion.div
                  key={index}
                  className="overflow-hidden rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                  }}
                  whileHover={{ y: -5, borderColor: Colors.primary[200] }}
                >
                  <button
                    className="flex justify-between items-center w-full px-6 py-5 text-left"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-[15px] lg:text-base font-semibold text-neutral-800 flex items-center">
                      <HelpCircle className="w-5 h-5 mr-3 text-primary-500 flex-shrink-0" />
                      {faq.question}
                    </span>
                    <Motion.div
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 ml-4"
                    >
                      <ChevronDown className="w-5 h-5 text-primary-500" />
                    </Motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {activeIndex === index && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-0">
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mb-4"></div>
                          <p className="text-neutral-600 leading-relaxed text-[13px] lg:text-base">{faq.answer}</p>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>
              ))
            ) : (
              <Motion.div 
                className="text-center py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-8">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-neutral-600 mb-6">We couldn't find any FAQs matching your search.</p>
                  <button 
                    className="text-primary-600 font-medium flex items-center justify-center mx-auto"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </div>
              </Motion.div>
            )}
          </Motion.div>

          {/* Right Column: Premium Animated FAQ Illustration */}
          <Motion.div
            className="hidden lg:flex items-center justify-center sticky top-24"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative w-full max-w-lg h-[600px]">
              {/* Main Container with Premium Design */}
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-primary-100 overflow-hidden h-full">
                {/* Animated Gradient Background */}
                <Motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                  }}
                />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `linear-gradient(${Colors.primary[400]} 1px, transparent 1px), linear-gradient(90deg, ${Colors.primary[400]} 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }}></div>

                {/* Large Floating Question Mark - Top Right */}
                <Motion.div
                  className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl z-20"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-5xl font-black text-white">?</span>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl"></div>
                </Motion.div>

                {/* Central Illustration Area */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center mt-8">
                  {/* Floating Question Cards */}
                  <div className="relative w-full mb-8">
                    {/* Top Question Card */}
                    <Motion.div
                      className="absolute left-0 -top-4 w-32 h-20 bg-white rounded-xl shadow-lg border-2 border-primary-100 flex items-center justify-center"
                      animate={{
                        x: [0, 8, 0],
                        y: [0, -5, 0],
                        rotate: [-2, 2, -2],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-center">
                        <HelpCircle className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                        <div className="text-xs font-semibold text-gray-700">FAQ</div>
                      </div>
                    </Motion.div>

                    {/* Bottom Question Card */}
                    <Motion.div
                      className="absolute right-0 top-12 w-32 h-20 bg-white rounded-xl shadow-lg border-2 border-indigo-100 flex items-center justify-center"
                      animate={{
                        x: [0, -8, 0],
                        y: [0, 5, 0],
                        rotate: [2, -2, 2],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      <div className="text-center">
                        <MessageCircle className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                        <div className="text-xs font-semibold text-gray-700">Help</div>
                      </div>
                    </Motion.div>
                  </div>

                  {/* Main Character - Modern 3D Style */}
                  <Motion.div
                    className="relative mb-6"
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Outer Glow Ring */}
                    <Motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${Colors.primary[300]}40 0%, transparent 70%)`,
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Main Circle with Gradient */}
                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-indigo-600 shadow-2xl flex items-center justify-center overflow-hidden">
                      {/* Animated Inner Gradient */}
                      <Motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-primary-700/30 rounded-full"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent rounded-full"></div>
                      
                      {/* Central Icon */}
                      <HelpCircle className="w-20 h-20 text-white relative z-10 drop-shadow-lg" />
                      
                      {/* Rotating Sparkles */}
                      {[0, 72, 144, 216, 288].map((angle, i) => (
                        <Motion.div
                          key={i}
                          className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
                          style={{
                            top: '50%',
                            left: '50%',
                            transformOrigin: '0 70px',
                            transform: `rotate(${angle}deg) translateY(-70px)`,
                          }}
                          animate={{
                            scale: [0, 1.2, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </Motion.div>

                  {/* Floating Icons Around Character */}
                  <div className="relative w-full mt-8">
                    {/* Top Left - Lightbulb */}
                    <Motion.div
                      className="absolute -left-4 -top-8 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-xl flex items-center justify-center border-2 border-white"
                      animate={{
                        x: [0, 5, 0],
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Lightbulb className="w-7 h-7 text-white" />
                    </Motion.div>

                    {/* Top Right - Book */}
                    <Motion.div
                      className="absolute -right-4 -top-8 w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-xl flex items-center justify-center border-2 border-white"
                      animate={{
                        x: [0, -5, 0],
                        y: [0, -8, 0],
                        rotate: [0, -5, 5, 0],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    >
                      <BookOpen className="w-7 h-7 text-white" />
                    </Motion.div>

                    {/* Bottom Left - Message */}
                    <Motion.div
                      className="absolute left-0 top-16 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center border-2 border-white"
                      animate={{
                        x: [0, 8, 0],
                        y: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6
                      }}
                    >
                      <MessageCircle className="w-6 h-6 text-white" />
                    </Motion.div>

                    {/* Bottom Right - Sparkles */}
                    <Motion.div
                      className="absolute right-0 top-16 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl shadow-lg flex items-center justify-center border-2 border-white"
                      animate={{
                        x: [0, -8, 0],
                        y: [0, 5, 0],
                      }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.9
                      }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </Motion.div>
                  </div>

                  {/* Bottom Text Section */}
                  <Motion.div
                    className="text-center mt-12 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-3 border border-primary-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-700">24/7 Support Available</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      We're Here to Help!
                    </h3>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Can't find what you're looking for? Our support team is ready to assist you.
                    </p>
                  </Motion.div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary-200/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-200/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-r from-purple-200/15 to-transparent rounded-full blur-2xl"></div>
              </div>

              {/* Floating Particles - Enhanced */}
              {[...Array(8)].map((_, i) => (
                <Motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${4 + (i % 3) * 2}px`,
                    height: `${4 + (i % 3) * 2}px`,
                    background: i % 2 === 0 
                      ? `linear-gradient(135deg, ${Colors.primary[400]}, ${Colors.primary[500]})`
                      : `linear-gradient(135deg, ${Colors.accent.orange}, ${Colors.accent.orange}80)`,
                    top: `${15 + i * 12}%`,
                    left: `${8 + (i % 4) * 25}%`,
                    boxShadow: `0 0 ${8 + i * 2}px ${i % 2 === 0 ? Colors.primary[400] : Colors.accent.orange}40`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.9, 0.2],
                    scale: [1, 1.8, 1],
                  }}
                  transition={{
                    duration: 3 + i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </Motion.div>
        </div>
        
        {/* Still Have Questions Card */}
        <Motion.div
          className="max-w-8xl mx-auto mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div 
            className="relative overflow-hidden rounded-3xl shadow-xl p-8 md:p-10 text-white" 
            style={{ 
              background: `linear-gradient(to right, ${Colors.primary[600]}, ${Colors.accent.orange})` 
            }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
                <p className="text-white/80 max-w-md">
                  Can't find the answer you're looking for? Feel free to contact our friendly support team.
                </p>
              </div>
              
              <Motion.a
                href="/contact-support"
                className="whitespace-nowrap px-6 py-4 bg-white rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                style={{ color: Colors.primary[600] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </Motion.a>
            </div>
          </div>
        </Motion.div>        
        
      </div>
    </section>
  );
};

export default FAQSection;
