import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Calendar, Clock, User, Filter, Download } from 'lucide-react';

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    doctorId: '',
    status: '',
    date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchDoctors = async () => {
    try {
      const response = await API.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.doctorId) params.append('doctorId', filters.doctorId);
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);

      const response = await API.get(`/admin/appointments?${params}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">All Appointments</h1>
          <p className="text-slate-500 mt-2">View and manage all appointments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-slate-400 mr-2" />
            <h2 className="text-lg font-semibold text-slate-700">Filters</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Doctor</label>
              <select
                value={filters.doctorId}
                onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>{doc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Appointments Found</h3>
              <p className="text-slate-500">No appointments match your filters.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-800">Dr. {apt.doctorId?.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(apt.status)}`}>
                        {apt.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center text-slate-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>Patient: {apt.patientId?.fullName}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(apt.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <span className="text-sm">Specialization: {apt.doctorId?.specialization}</span>
                      </div>
                    </div>

                    {apt.symptoms && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Symptoms:</span> {apt.symptoms}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}