import React from 'react';
import { TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

const StatsGrid = ({ stats }) => {
  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: TrendingUp, color: 'blue' },
    { label: 'Total Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, color: 'orange' },
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
