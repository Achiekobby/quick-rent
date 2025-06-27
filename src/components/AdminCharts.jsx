import { motion as Motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

// Simple Chart Components for Admin Dashboard
export const SimpleLineChart = ({ data, title, color = "blue" }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="relative h-40">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`var(--color-${color}-500)`} stopOpacity="0.3" />
              <stop offset="100%" stopColor={`var(--color-${color}-500)`} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <Motion.polyline
            fill="none"
            stroke={`var(--color-${color}-500)`}
            strokeWidth="2"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <Motion.polygon
            fill={`url(#gradient-${color})`}
            points={`${points} 100,100 0,100`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
      </div>
      <div className="flex justify-between mt-4 text-sm text-gray-600">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "blue",
  format = "number" 
}) => {
  const formatValue = (val) => {
    if (format === "currency") {
      return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 0
      }).format(val);
    }
    if (format === "percentage") {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getChangeColor(change)}`}>
            {getChangeIcon(change)}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {formatValue(value)}
      </h3>
      <p className="text-sm text-gray-600">{title}</p>
    </Motion.div>
  );
};

export const ProgressBar = ({ 
  label, 
  value, 
  max, 
  color = "blue",
  showPercentage = true 
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <Motion.div
          className={`bg-${color}-500 h-2 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{value.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
};

export const ActivityFeed = ({ activities, maxItems = 5 }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration': return Users;
      case 'property_verification': return Building;
      case 'payment_completed': return DollarSign;
      default: return Calendar;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration': return 'blue';
      case 'property_verification': return 'green';
      case 'payment_completed': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      {activities.slice(0, maxItems).map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        const color = getActivityColor(activity.type);
        
        return (
          <Motion.div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`p-2 rounded-full bg-${color}-100`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          </Motion.div>
        );
      })}
    </div>
  );
};

export const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          format={stat.format}
        />
      ))}
    </div>
  );
};

export const RegionalChart = ({ regions }) => {
  const maxProperties = Math.max(...regions.map(r => r.properties));

  return (
    <div className="space-y-4">
      {regions.map((region, index) => (
        <Motion.div
          key={region.region}
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {region.region}
              </span>
              <span className="text-xs text-gray-500">
                {region.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <Motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${region.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>{region.properties} properties</span>
              <span>{region.users} users</span>
            </div>
          </div>
        </Motion.div>
      ))}
    </div>
  );
}; 