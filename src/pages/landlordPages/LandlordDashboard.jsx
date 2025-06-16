import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Home, 
  Plus, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  MapPin, 
  Star, 
  Clock,
  Eye,
  Calendar,
  DollarSign,
  Building,
  UserCheck
} from 'lucide-react';
import Colors from '../../utils/Colors';
import AuthLayout from '../../Layouts/AuthLayout';
import { useNavigate } from 'react-router';
import useAuthStore from '../../stores/authStore';

const LandlordDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [mockUser] = useState({
    name: user?.full_name || "Thomas Mensah",
    email: user?.email || "thomas.mensah@example.com",
    totalProperties: 12,
    activeRentals: 8,
    pendingApplications: 5,
    monthlyRevenue: 45600,
    viewingRequests: 3
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <AuthLayout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <Motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {mockUser.name}!
          </h1>
          <p className="text-gray-600">
            Manage your properties and track your rental business performance.
          </p>
        </Motion.div>

        {/* Quick Actions */}
        <Motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-orange-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/add-property')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Add New Property</h3>
                <p className="text-orange-100 text-sm">List a new rental property</p>
              </div>
              <Plus className="w-8 h-8 text-orange-100" />
            </div>
          </Motion.button>

          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-blue-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/viewing-requests')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Viewing Requests</h3>
                <p className="text-blue-100 text-sm">{mockUser.viewingRequests} pending requests</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-100" />
            </div>
          </Motion.button>

          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-green-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/tenant-applications')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Applications</h3>
                <p className="text-green-100 text-sm">{mockUser.pendingApplications} pending reviews</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-100" />
            </div>
          </Motion.button>
        </Motion.div>

        {/* Stats Cards */}
        <Motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total Properties */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Properties</p>
                <h3 className="text-2xl font-bold text-gray-800">{mockUser.totalProperties}</h3>
                <p className="text-xs text-gray-500 mt-1">Properties listed</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.orange}15` }}>
                <Building size={20} color={Colors.accent.orange} />
              </div>
            </div>
          </Motion.div>

          {/* Active Rentals */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Active Rentals</p>
                <h3 className="text-2xl font-bold text-gray-800">{mockUser.activeRentals}</h3>
                <p className="text-xs text-gray-500 mt-1">Currently rented</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.primary[400]}15` }}>
                <Home size={20} color={Colors.primary[500]} />
              </div>
            </div>
          </Motion.div>

          {/* Monthly Revenue */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Monthly Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">GH₵{mockUser.monthlyRevenue.toLocaleString()}</h3>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.pink}15` }}>
                <DollarSign size={20} color={Colors.accent.pink} />
              </div>
            </div>
          </Motion.div>

          {/* Pending Applications */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Applications</p>
                <h3 className="text-2xl font-bold text-gray-800">{mockUser.pendingApplications}</h3>
                <p className="text-xs text-gray-500 mt-1">Pending review</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.purple}15` }}>
                <Users size={20} color={Colors.accent.purple} />
              </div>
            </div>
          </Motion.div>
        </Motion.div>

        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">New application received</p>
                  <p className="text-xs text-gray-500">Modern Apartment in East Legon - 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Viewing scheduled</p>
                  <p className="text-xs text-gray-500">Luxury Villa in Cantonments - Tomorrow 3:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <DollarSign size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Payment received</p>
                  <p className="text-xs text-gray-500">Apartment 3B - GH₵2,500 - Yesterday</p>
                </div>
              </div>
            </div>
          </Motion.div>

          {/* Quick Links */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
            <div className="space-y-3">
              {[
                { title: "My Properties", description: "View and manage all properties", path: "/my-properties", icon: <Building size={20} /> },
                { title: "Tenant Management", description: "Manage current tenants", path: "/tenant-management", icon: <Users size={20} /> },
                { title: "Payment History", description: "Track rental payments", path: "/payment-history", icon: <DollarSign size={20} /> },
                { title: "Property Analytics", description: "View performance metrics", path: "/property-analytics", icon: <TrendingUp size={20} /> }
              ].map((link, index) => (
                <Motion.button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-600">
                      {link.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{link.title}</p>
                      <p className="text-xs text-gray-500">{link.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Motion.button>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LandlordDashboard; 