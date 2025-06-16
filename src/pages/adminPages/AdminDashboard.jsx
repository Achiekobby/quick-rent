import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  Shield, 
  TrendingUp, 
  ChevronRight, 
  BarChart3,
  Settings,
  AlertCircle,
  UserCheck,
  FileText,
  Eye,
  Activity,
  DollarSign
} from 'lucide-react';
import Colors from '../../utils/Colors';
import AuthLayout from '../../Layouts/AuthLayout';
import { useNavigate } from 'react-router';

const AdminDashboard = () => {
  const [user] = useState({
    name: "Administrator",
    email: "admin@quickrent.com",
    totalUsers: 1247,
    totalProperties: 856,
    pendingVerifications: 23,
    totalRevenue: 125000,
    supportTickets: 12,
    systemAlerts: 3
  });
  
  const navigate = useNavigate();

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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor platform performance and manage system operations.
          </p>
        </Motion.div>

        {/* Alert Section */}
        {user.systemAlerts > 0 && (
          <Motion.div 
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                You have <strong>{user.systemAlerts} system alerts</strong> that require attention.
              </p>
              <button 
                onClick={() => navigate('/system-alerts')}
                className="ml-auto text-sm text-red-600 hover:text-red-500 font-medium"
              >
                View All
              </button>
            </div>
          </Motion.div>
        )}

        {/* Quick Actions */}
        <Motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-blue-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/users')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">User Management</h3>
                <p className="text-blue-100 text-sm">Manage all users</p>
              </div>
              <Users className="w-8 h-8 text-blue-100" />
            </div>
          </Motion.button>

          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-green-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/property-verification')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Verifications</h3>
                <p className="text-green-100 text-sm">{user.pendingVerifications} pending</p>
              </div>
              <Shield className="w-8 h-8 text-green-100" />
            </div>
          </Motion.button>

          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-purple-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/reports')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Analytics</h3>
                <p className="text-purple-100 text-sm">Platform insights</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-100" />
            </div>
          </Motion.button>

          <Motion.button
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gray-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            onClick={() => navigate('/system-settings')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Settings</h3>
                <p className="text-gray-200 text-sm">System config</p>
              </div>
              <Settings className="w-8 h-8 text-gray-200" />
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
          {/* Total Users */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">{user.totalUsers.toLocaleString()}</h3>
                <p className="text-xs text-gray-500 mt-1">Platform users</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.primary[400]}15` }}>
                <Users size={20} color={Colors.primary[500]} />
              </div>
            </div>
          </Motion.div>

          {/* Total Properties */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Properties</p>
                <h3 className="text-2xl font-bold text-gray-800">{user.totalProperties}</h3>
                <p className="text-xs text-gray-500 mt-1">Listed properties</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.orange}15` }}>
                <Building size={20} color={Colors.accent.orange} />
              </div>
            </div>
          </Motion.div>

          {/* Platform Revenue */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">GH₵{user.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.pink}15` }}>
                <DollarSign size={20} color={Colors.accent.pink} />
              </div>
            </div>
          </Motion.div>

          {/* Support Tickets */}
          <Motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Support Tickets</p>
                <h3 className="text-2xl font-bold text-gray-800">{user.supportTickets}</h3>
                <p className="text-xs text-gray-500 mt-1">Open tickets</p>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: `${Colors.accent.purple}15` }}>
                <FileText size={20} color={Colors.accent.purple} />
              </div>
            </div>
          </Motion.div>
        </Motion.div>

        {/* System Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Activity */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent System Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">New user registration</p>
                  <p className="text-xs text-gray-500">Landlord account created - 15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Building size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Property verification completed</p>
                  <p className="text-xs text-gray-500">Modern Apartment in East Legon - 1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">System maintenance completed</p>
                  <p className="text-xs text-gray-500">Database optimization - 2 hours ago</p>
                </div>
              </div>
            </div>
          </Motion.div>

          {/* Management Tools */}
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Management Tools</h2>
            <div className="space-y-3">
              {[
                { title: "User Management", description: "Manage all platform users", path: "/users", icon: <Users size={20} /> },
                { title: "Content Management", description: "Manage platform content", path: "/content-management", icon: <FileText size={20} /> },
                { title: "Audit Logs", description: "View system audit logs", path: "/audit-logs", icon: <Activity size={20} /> },
                { title: "Support Center", description: "Handle support tickets", path: "/support-tickets", icon: <FileText size={20} /> }
              ].map((tool, index) => (
                <Motion.button
                  key={index}
                  onClick={() => navigate(tool.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-gray-600">
                      {tool.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{tool.title}</p>
                      <p className="text-xs text-gray-500">{tool.description}</p>
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

export default AdminDashboard; 