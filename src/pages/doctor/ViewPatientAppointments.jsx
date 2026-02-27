import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Filter, Search } from 'lucide-react';

export default function ViewPatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filter, appointments, searchTerm]);

  const fetchAppointments = async () => {
    try {
      const response = await API.get('/doctor/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    // Apply status filter
    const today = new Date().toDateString();
    
    switch (filter) {
      case 'today':
        filtered = filtered.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(apt => 
          new Date(apt.appointmentDate) > new Date() && apt.status !== 'completed' && apt.status !== 'cancelled'
        );
        break;
      case 'pending':
        filtered = filtered.filter(apt => apt.status === 'pending');
        break;
      case 'confirmed':
        filtered = filtered.filter(apt => apt.status === 'confirmed');
        break;
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(apt => apt.status === 'cancelled');
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientId?.phone?.includes(searchTerm) ||
        apt.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await API.put(`/doctor/appointments/${appointmentId}/status`, { status });
      fetchAppointments(); // Refresh list
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Appointments</h1>
          <p className="text-gray-600 mt-2">View and manage all your patient appointments</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, phone or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Appointments</option>
                <option value="today">Today's Appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Appointments Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No appointments match your search criteria.' : 'No appointments available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Appointment Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {appointment.patientId?.fullName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {appointment.patientId?.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Patient ID: {appointment.patientId?._id?.slice(-6) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border font-medium flex items-center space-x-2 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="capitalize">{appointment.status}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="font-medium">{appointment.timeSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-medium">{appointment.patientId?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="font-medium">{appointment.patientId?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Details Card */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Patient Information
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Age</p>
                        <p className="text-sm font-medium">{appointment.patientId?.age || 'N/A'} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Gender</p>
                        <p className="text-sm font-medium">{appointment.patientId?.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Address</p>
                        <p className="text-sm font-medium">{appointment.patientId?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {appointment.symptoms && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                      <h4 className="font-semibold text-blue-700 mb-2">Reported Symptoms</h4>
                      <p className="text-gray-700">{appointment.symptoms}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 border-t pt-4">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(appointment._id, 'confirmed')}
                          className="flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm Appointment</span>
                        </button>
                        <button
                          onClick={() => updateStatus(appointment._id, 'cancelled')}
                          className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Appointment</span>
                        </button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(appointment._id, 'completed')}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      <div className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg">
                        <span className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Consultation Completed</span>
                        </span>
                      </div>
                    )}
                    {appointment.status === 'cancelled' && (
                      <div className="px-6 py-2.5 bg-red-100 text-red-600 rounded-lg">
                        <span className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4" />
                          <span>Appointment Cancelled</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}