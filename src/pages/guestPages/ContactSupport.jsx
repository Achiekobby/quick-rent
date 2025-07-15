import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  User, 
  Building, 
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Headphones,
  Shield,
  Zap,
  Heart,
  Star,
  Globe,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Colors from '../../utils/Colors';
import useAuthStore from '../../stores/authStore';
import { toast } from 'react-toastify';
import Navbar from '../../components/Utilities/Navbar';
import TopNavbar from '../../components/Utilities/TopNavbar';

const ContactSupport = () => {
  const navigate = useNavigate();
  const { user, getUserType, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    userType: getUserType() || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info');

  // Support categories
  const supportCategories = [
    { value: '', label: 'Select a category' },
    { value: 'account', label: 'Account Issues' },
    { value: 'property', label: 'Property Listings' },
    { value: 'booking', label: 'Booking & Viewing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'other', label: 'Other' }
  ];

  // Priority levels
  const priorityLevels = [
    { 
      value: 'low', 
      label: 'Low', 
      style: { 
        color: Colors.semantic.success, 
        backgroundColor: '#F0FDF4', 
        borderColor: '#BBF7D0' 
      }
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      style: { 
        color: Colors.semantic.warning, 
        backgroundColor: '#FFFBEB', 
        borderColor: '#FED7AA' 
      }
    },
    { 
      value: 'high', 
      label: 'High', 
      style: { 
        color: Colors.accent.orange, 
        backgroundColor: '#FFF7ED', 
        borderColor: '#FDBA74' 
      }
    },
    { 
      value: 'urgent', 
      label: 'Urgent', 
      style: { 
        color: Colors.semantic.error, 
        backgroundColor: '#FEF2F2', 
        borderColor: '#FECACA' 
      }
    }
  ];

  // FAQ data
  const quickFAQs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking 'Forgot Password' on the login page and following the instructions sent to your email."
    },
    {
      question: "How do I list my property?",
      answer: "Create a landlord account, complete your profile verification, then navigate to 'Add Property' in your dashboard."
    },
    {
      question: "Why can't I book a viewing?",
      answer: "Ensure your account is verified and you're logged in. Some properties may have specific viewing requirements."
    },
    {
      question: "How do I contact a landlord?",
      answer: "Use the contact form on the property listing page or schedule a viewing through our platform."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));      
      console.log('Support ticket submitted:', {
        ...formData,
        isAuthenticated: isAuthenticated(),
        userId: user?.id || null,
        timestamp: new Date().toISOString()
      });
      
      setSubmitSuccess(true);
      toast.success('Your message has been sent successfully! We\'ll get back to you soon.');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: user?.full_name || '',
          email: user?.email || '',
          phone: user?.phone_number || '',
          subject: '',
          category: '',
          priority: 'medium',
          message: '',
          userType: getUserType() || ''
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
    {!user ? <TopNavbar /> : <Navbar />}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 overflow-hidden">
        {/* Decorative background elements */}
        <Motion.div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Button */}
            <Motion.div 
              className="flex justify-start mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            </Motion.div>

            <Motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-primary-100 text-primary-600 mb-4">
                <Headphones className="w-4 h-4 mr-2" />
                SUPPORT CENTER
              </span>
            </Motion.div>
            
            <Motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span style={{ 
                background: `linear-gradient(to right, ${Colors.primary[600]}, ${Colors.primary[500]}, ${Colors.accent.orange})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
                How can we help you?
              </span>
            </Motion.h1>
            
            <Motion.p 
              className="text-xl text-neutral-600 max-w-3xl mx-auto mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {isAuthenticated() ? (
                <>Welcome back, {user?.full_name?.split(' ')[0]}! We're here to help you with any questions or issues.</>
              ) : (
                <>Get in touch with our support team. We're here to help you 24/7.</>
              )}
            </Motion.p>

            {/* User Status Badge */}
            {isAuthenticated() && (
              <Motion.div 
                className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Signed in as {getUserType() === 'landlord' ? 'Property Owner' : 'Renter'}
              </Motion.div>
            )}
          </Motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <Motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl p-2 shadow-lg">
              <div className="flex space-x-2">
                {[
                  // { id: 'contact', label: 'Contact Form', icon: MessageCircle },
                  { id: 'info', label: 'Contact Info', icon: Phone },
                  { id: 'faq', label: 'Quick Help', icon: HelpCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'shadow-lg'
                          : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: activeTab === tab.id ? Colors.primary[500] : 'transparent',
                        color: activeTab === tab.id ? Colors.white : Colors.neutral[600]
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                          e.target.style.color = Colors.primary[600];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                          e.target.style.color = Colors.neutral[600];
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Motion.div>

          <AnimatePresence mode="wait">
            {/* Contact Form Tab */}
            {activeTab === 'contact' && (
              <Motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">Send us a message</h2>
                    <p className="text-neutral-600">Fill out the form below and we'll get back to you as soon as possible.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-colors ${
                              errors.name ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                            }`}
                            style={{
                              '--tw-ring-color': Colors.primary[500]
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = Colors.primary[500];
                              e.target.style.boxShadow = `0 0 0 2px ${Colors.primary[500]}20`;
                            }}
                            onBlur={(e) => {
                              if (!errors.name) {
                                e.target.style.borderColor = Colors.neutral[200];
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                            placeholder="Enter your full name"
                            disabled={isAuthenticated() && user?.full_name}
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                              errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                            }`}
                            placeholder="Enter your email address"
                            disabled={isAuthenticated() && user?.email}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Support Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Category *
                        </label>
                        <div className="relative">
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none ${
                              errors.category ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                            }`}
                          >
                            {supportCategories.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                        </div>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.category}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="priority" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Priority Level
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {priorityLevels.map((priority) => (
                            <label
                              key={priority.value}
                              className="flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-all"
                              style={
                                formData.priority === priority.value
                                  ? priority.style
                                  : {
                                      borderColor: Colors.neutral[200],
                                      color: Colors.neutral[600]
                                    }
                              }
                              onMouseEnter={(e) => {
                                if (formData.priority !== priority.value) {
                                  e.target.style.borderColor = Colors.neutral[300];
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (formData.priority !== priority.value) {
                                  e.target.style.borderColor = Colors.neutral[200];
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name="priority"
                                value={priority.value}
                                checked={formData.priority === priority.value}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">{priority.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-neutral-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          errors.subject ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                        }`}
                        placeholder="Brief description of your issue"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
                          errors.message ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                        }`}
                        placeholder="Please describe your issue in detail..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.message}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-neutral-500">
                        {formData.message.length}/500 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                      <Motion.button
                        type="submit"
                        disabled={isSubmitting || submitSuccess}
                        className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                          isSubmitting || submitSuccess
                            ? 'cursor-not-allowed'
                            : 'hover:shadow-xl hover:scale-105'
                        }`}
                        style={{
                          background: isSubmitting || submitSuccess 
                            ? Colors.neutral[400] 
                            : `linear-gradient(to right, ${Colors.primary[500]}, ${Colors.primary[600]})`,
                          color: Colors.white
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubmitting && !submitSuccess) {
                            e.target.style.background = `linear-gradient(to right, ${Colors.primary[600]}, ${Colors.primary[700]})`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubmitting && !submitSuccess) {
                            e.target.style.background = `linear-gradient(to right, ${Colors.primary[500]}, ${Colors.primary[600]})`;
                          }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Sending...
                          </>
                        ) : submitSuccess ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-3" />
                            Message Sent!
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-3" />
                            Send Message
                          </>
                        )}
                      </Motion.button>
                    </div>
                  </form>
                </div>
              </Motion.div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'info' && (
              <Motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">Get in Touch</h2>
                  <p className="text-neutral-600 max-w-2xl mx-auto">
                    Choose the best way to reach us. We're available 24/7 to assist you.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {/* Email Support */}
                  <Motion.div
                    className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">Email Support</h3>
                    <p className="text-neutral-600 mb-6">
                      Send us an email and we'll respond within 24 hours.
                    </p>
                    <a
                      href="mailto:support@quickrent.com"
                      className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                      support@quickrent.com
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Motion.div>

                  {/* Phone Support */}
                  <Motion.div
                    className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Phone className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">Phone Support</h3>
                    <p className="text-neutral-600 mb-6">
                      Call us directly for immediate assistance.
                    </p>
                    <a
                      href="tel:+233123456789"
                      className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors"
                    >
                      +233 123 456 789
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Motion.div>

                  {/* Live Chat */}
                  {/* <Motion.div
                    className="bg-white rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">Live Chat</h3>
                    <p className="text-neutral-600 mb-6">
                      Chat with our support team in real-time.
                    </p>
                    <button className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors">
                      Start Chat
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Motion.div> */}
                </div>

                {/* Office Hours & Location */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Motion.div
                    className="bg-white rounded-3xl shadow-xl p-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex items-center mb-6">
                      <Clock className="w-8 h-8 text-primary-600 mr-4" />
                      <h3 className="text-2xl font-bold text-neutral-800">Support Hours</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Monday - Friday</span>
                        <span className="font-semibold text-neutral-800">8:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Saturday</span>
                        <span className="font-semibold text-neutral-800">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Sunday</span>
                        <span className="font-semibold text-neutral-800">10:00 AM - 4:00 PM</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-700 font-medium">
                        Emergency support available 24/7 for urgent issues
                      </p>
                    </div>
                  </Motion.div>

                  <Motion.div
                    className="bg-white rounded-3xl shadow-xl p-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <MapPin className="w-8 h-8 text-primary-600 mr-4" />
                      <h3 className="text-2xl font-bold text-neutral-800">Our Location</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-neutral-800 mb-2">Head Office</h4>
                        <p className="text-neutral-600">
                          123 Business District<br />
                          Accra, Ghana<br />
                          GA-123-4567
                        </p>
                      </div>
                      <div className="pt-4 border-t border-neutral-200">
                        <h4 className="font-semibold text-neutral-800 mb-2">Regional Offices</h4>
                        <p className="text-neutral-600 text-sm">
                          Kumasi • Tamale • Cape Coast • Takoradi
                        </p>
                      </div>
                    </div>
                  </Motion.div>
                </div>
              </Motion.div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <Motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">Quick Help</h2>
                  <p className="text-neutral-600">
                    Find answers to common questions. Can't find what you're looking for? Use the contact form.
                  </p>
                </div>

                <div className="space-y-4">
                  {quickFAQs.map((faq, index) => (
                    <Motion.div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="p-6">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                            <HelpCircle className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                              {faq.question}
                            </h3>
                            <p className="text-neutral-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                </div>

                <Motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                    <p className="mb-6 opacity-90">
                      Our support team is here to help you with any questions or issues.
                    </p>
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-colors"
                      style={{
                        backgroundColor: Colors.white,
                        color: Colors.primary[600]
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = Colors.neutral[50];
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = Colors.white;
                      }}
                    >
                      Contact Support
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </Motion.div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">Why Choose Our Support?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We're committed to providing exceptional support to all our users.
            </p>
          </Motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'Fast Response',
                description: 'Quick replies within hours, not days',
                color: 'text-yellow-600 bg-yellow-100'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your information is always protected',
                color: 'text-green-600 bg-green-100'
              },
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Knowledgeable support specialists',
                color: 'text-blue-600 bg-blue-100'
              },
              {
                icon: Heart,
                title: 'We Care',
                description: 'Your satisfaction is our priority',
                color: 'text-red-600 bg-red-100'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ContactSupport; 