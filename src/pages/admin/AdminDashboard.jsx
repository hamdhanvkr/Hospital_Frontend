import React, { useState, useEffect } from 'react';
import { Users, Calendar, UserPlus, Activity } from 'lucide-react';
import API from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        API.get('/admin/doctors'),
        API.get('/admin/appointments')
      ]);

      const appointments = appointmentsRes.data;
      setStats({
        totalDoctors: doctorsRes.data.length,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: <Users className="w-8 h-8" />, label: 'Total Doctors', value: stats.totalDoctors, color: 'bg-blue-500' },
    { icon: <Calendar className="w-8 h-8" />, label: 'Total Appointments', value: stats.totalAppointments, color: 'bg-green-500' },
    { icon: <Activity className="w-8 h-8" />, label: 'Pending', value: stats.pendingAppointments, color: 'bg-yellow-500' },
    { icon: <UserPlus className="w-8 h-8" />, label: 'Completed', value: stats.completedAppointments, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className={`inline-flex p-3 rounded-xl text-white ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <p className="text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin/add-doctor'}
              className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <UserPlus className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mx-auto mb-2" />
              <span className="text-slate-600 group-hover:text-blue-600 font-medium">Add New Doctor</span>
            </button>
            <button
              onClick={() => window.location.href = '/admin/doctors'}
              className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group"
            >
              <Users className="w-8 h-8 text-slate-400 group-hover:text-green-500 mx-auto mb-2" />
              <span className="text-slate-600 group-hover:text-green-600 font-medium">View All Doctors</span>
            </button>
            <button
              onClick={() => window.location.href = '/admin/appointments'}
              className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors group"
            >
              <Calendar className="w-8 h-8 text-slate-400 group-hover:text-purple-500 mx-auto mb-2" />
              <span className="text-slate-600 group-hover:text-purple-600 font-medium">View Appointments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}