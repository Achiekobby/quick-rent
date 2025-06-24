import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle, User, Mail, ArrowRight, X } from 'lucide-react';
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
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        
        {/* FAQ Accordion */}
        <Motion.div
          className="max-w-4xl mx-auto space-y-4"
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
                className="overflow-hidden rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                whileHover={{ y: -5 }}
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-5 text-left"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-[15px] lg:text-base font-semibold text-neutral-800 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-3 text-primary-500" />
                    {faq.question}
                  </span>
                  <Motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
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
                        <div className="w-full h-px bg-neutral-200 mb-4"></div>
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
        
        {/* Still Have Questions Card */}
        <Motion.div
          className="max-w-4xl mx-auto mt-16"
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