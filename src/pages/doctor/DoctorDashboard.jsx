import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('/doctor/appointments');
      const appointments = response.data;
      
      const today = new Date().toDateString();
      const todayApps = appointments.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      );

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayApps.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length
      });

      // Get 5 most recent appointments
      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</span>
            </div>
            <p className="text-gray-600">Total Appointments</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.todayAppointments}</span>
            </div>
            <p className="text-gray-600">Today's Appointments</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.pendingAppointments}</span>
            </div>
            <p className="text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{stats.completedAppointments}</span>
            </div>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {recentAppointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {apt.patientId?.fullName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{apt.patientId?.fullName}</p>
                    <p className="text-sm text-gray-500">{formatDate(apt.appointmentDate)} at {apt.timeSlot}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
            ))}

            {recentAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}