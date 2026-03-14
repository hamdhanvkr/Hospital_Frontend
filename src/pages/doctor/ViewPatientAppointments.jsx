import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { 
  Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, 
  Filter, Search, Edit, AlertCircle, FileText, Download,
  ChevronDown
} from 'lucide-react';

export default function ViewPatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    filterType: 'all', // 'all', 'today', 'upcoming', 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  
  // UI state
  const [showDateFilters, setShowDateFilters] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filters]);

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
    
    const today = new Date().toDateString();
    
    // Apply status/type filter
    switch (filters.filterType) {
      case 'today':
        filtered = filtered.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(apt => 
          new Date(apt.appointmentDate) > new Date() && 
          apt.status !== 'completed' && 
          apt.status !== 'cancelled'
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
      case 'rescheduled':
        filtered = filtered.filter(apt => apt.isRescheduled === true);
        break;
      default:
        break;
    }

    // Apply date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(apt => new Date(apt.appointmentDate) <= toDate);
    }

    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientId?.fullName?.toLowerCase().includes(term) ||
        apt.patientId?.phone?.includes(term) ||
        apt.patientId?.email?.toLowerCase().includes(term) ||
        apt.symptoms?.toLowerCase().includes(term)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      filterType: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    setShowDateFilters(false);
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await API.put(`/doctor/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  // ✅ FIXED: Cancel with confirmation and proper status update
  const handleCancel = async (appointmentId, patientName) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to cancel this appointment for ${patientName}`
    );
    
    if (isConfirmed) {
      try {
        await API.put(`/doctor/appointments/${appointmentId}/status`, { status: 'cancelled' });
        alert('✅ Appointment cancelled successfully');
        fetchAppointments(); // Refresh the list
      } catch (error) {
        alert('❌ Failed to cancel appointment');
      }
    }
  };

  const handleReschedule = (appointmentId) => {
    navigate(`/doctor/reschedule-appointment/${appointmentId}`);
  };

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      'Patient Name',
      'Phone',
      'Email',
      'Age',
      'Gender',
      'Address',
      'Appointment Date',
      'Time',
      'Status',
      'Symptoms',
      'Rescheduled',
      'Reschedule Reason'
    ];

    // Prepare data rows - using filteredAppointments (respects current filters)
    const data = filteredAppointments.map(apt => [
      apt.patientId?.fullName || 'N/A',
      apt.patientId?.phone || 'N/A',
      apt.patientId?.email || 'N/A',
      apt.patientId?.age || 'N/A',
      apt.patientId?.gender || 'N/A',
      apt.patientId?.address || 'N/A',
      formatDate(apt.appointmentDate),
      formatTime12Hour(apt.timeSlot),
      apt.status || 'N/A',
      apt.symptoms || 'N/A',
      apt.isRescheduled ? 'Yes' : 'No',
      apt.rescheduleReason || 'N/A'
    ]);

    // Create CSV content
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date and filter info
    const dateStr = new Date().toISOString().split('T')[0];
    const filterStr = filters.filterType !== 'all' ? `_${filters.filterType}` : '';
    const dateRangeStr = (filters.dateFrom || filters.dateTo) ? 
      `_${filters.dateFrom || 'start'}_to_${filters.dateTo || 'end'}` : '';
    const searchStr = filters.searchTerm ? `_search_${filters.searchTerm.replace(/\s+/g, '_')}` : '';
    
    link.download = `appointments${filterStr}${dateRangeStr}${searchStr}_${dateStr}.csv`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
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

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
      case 'rescheduled':
        return <Edit className="w-4 h-4" />;
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Appointments</h1>
            <p className="text-gray-600 mt-2">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'} found
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Export CSV Button */}
            {filteredAppointments.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
            
            {/* Date Filter Toggle */}
            <button
              onClick={() => setShowDateFilters(!showDateFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Date Range</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDateFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Clear Filters Button */}
            {(filters.filterType !== 'all' || filters.dateFrom || filters.dateTo || filters.searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, phone, email or symptoms..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                name="filterType"
                value={filters.filterType}
                onChange={handleFilterChange}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Appointments</option>
                <option value="today">Today's Appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Date Range Filters */}
          {showDateFilters && (
            <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Appointments Found</h3>
            <p className="text-gray-500">
              {filters.searchTerm || filters.filterType !== 'all' || filters.dateFrom || filters.dateTo
                ? 'No appointments match your filters.'
                : 'No appointments available.'}
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

                {/* Reschedule Information - Show if rescheduled */}
                {appointment.isRescheduled && (
                  <div className="mx-6 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-800 text-sm flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          Rescheduled Appointment
                        </h4>
                        <p className="text-sm text-purple-700 mt-1">
                          <span className="font-medium">Reason:</span> {appointment.rescheduleReason}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-purple-600">
                          <div>
                            <span className="font-medium">Originally:</span>{' '}
                            {appointment.originalAppointmentDate ? 
                              formatDate(appointment.originalAppointmentDate) : 'N/A'} 
                            at {appointment.originalTimeSlot || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Rescheduled by:</span> Doctor
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                        <p className="font-medium">{formatTime12Hour(appointment.timeSlot)}</p>
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
                    {/* Reschedule Button - Show for pending/confirmed appointments */}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleReschedule(appointment._id)}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Reschedule</span>
                      </button>
                    )}

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
                          onClick={() => handleCancel(appointment._id, appointment.patientId?.fullName || 'this patient')}
                          className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Appointment</span>
                        </button>
                      </>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatus(appointment._id, 'completed')}
                          className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as Completed</span>
                        </button>
                        <button
                          onClick={() => handleCancel(appointment._id, appointment.patientId?.fullName || 'this patient')}
                          className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
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