import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { 
  Calendar, Clock, User, Filter, Download, AlertCircle, FileText,
  Search, ArrowUpDown, ChevronDown, Phone, Mail, Edit,
  CheckCircle, XCircle
} from 'lucide-react';

export default function ViewAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    doctorId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  
  // Sort states
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, appointment: null });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [editForm, setEditForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    status: '',
    symptoms: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filters, sortBy, sortOrder]);

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
      const response = await API.get('/admin/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filters.doctorId) {
      filtered = filtered.filter(apt => apt.doctorId?._id === filters.doctorId);
    }

    if (filters.status) {
      if (filters.status === 'rescheduled') {
        filtered = filtered.filter(apt => apt.isRescheduled === true);
      } else {
        filtered = filtered.filter(apt => apt.status === filters.status);
      }
    }

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

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientId?.fullName?.toLowerCase().includes(term) ||
        apt.patientId?.phone?.includes(term) ||
        apt.patientId?.email?.toLowerCase().includes(term) ||
        apt.doctorId?.name?.toLowerCase().includes(term) ||
        apt.symptoms?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.appointmentDate) - new Date(b.appointmentDate);
          break;
        case 'patient':
          comparison = (a.patientId?.fullName || '').localeCompare(b.patientId?.fullName || '');
          break;
        case 'doctor':
          comparison = (a.doctorId?.name || '').localeCompare(b.doctorId?.name || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      doctorId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    setSortBy('date');
    setSortOrder('desc');
  };

  // ✅ EDIT FUNCTIONALITY ONLY
  const handleEdit = (appointment) => {
    setEditForm({
      appointmentDate: appointment.appointmentDate.split('T')[0],
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      symptoms: appointment.symptoms || ''
    });
    setEditModal({ show: true, appointment });
    
    // Fetch available slots for the current doctor and date
    if (appointment.doctorId?._id && appointment.appointmentDate) {
      fetchAvailableSlots(appointment.doctorId._id, appointment.appointmentDate.split('T')[0]);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await API.get(`/patient/available-slots?doctorId=${doctorId}&date=${date}`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleEditDateChange = (e) => {
    const newDate = e.target.value;
    setEditForm({ ...editForm, appointmentDate: newDate, timeSlot: '' });
    if (editModal.appointment?.doctorId?._id && newDate) {
      fetchAvailableSlots(editModal.appointment.doctorId._id, newDate);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.appointmentDate || !editForm.timeSlot) {
      alert('Please select date and time');
      return;
    }

    try {
      await API.put(`/admin/appointments/${editModal.appointment._id}`, editForm);
      alert('✅ Appointment updated successfully');
      setEditModal({ show: false, appointment: null });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update appointment');
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

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'rescheduled': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">All Appointments</h1>
            <p className="text-slate-500 mt-2">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'} found
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {(filters.doctorId || filters.status || filters.dateFrom || filters.dateTo || filters.searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    placeholder="Search by patient, doctor, symptoms..."
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Doctor
                </label>
                <select
                  name="doctorId"
                  value={filters.doctorId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Date</option>
                    <option value="patient">Patient Name</option>
                    <option value="doctor">Doctor Name</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <ArrowUpDown className={`w-5 h-5 ${sortOrder === 'asc' ? 'text-blue-600' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Appointments Found</h3>
              <p className="text-slate-500">
                {filters.searchTerm || filters.doctorId || filters.status || filters.dateFrom || filters.dateTo
                  ? 'No appointments match your filters.'
                  : 'No appointments available.'}
              </p>
              {(filters.searchTerm || filters.doctorId || filters.status || filters.dateFrom || filters.dateTo) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-800">Dr. {apt.doctorId?.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(apt.status)}`}>
                        {apt.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center text-slate-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>Patient: {apt.patientId?.fullName}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{apt.patientId?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{apt.patientId?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(apt.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime12Hour(apt.timeSlot)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <span className="text-sm">Age: {apt.patientId?.age || 'N/A'} • {apt.patientId?.gender || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Reschedule Information */}
                    {apt.isRescheduled && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-800 text-sm flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              Appointment Rescheduled
                            </h4>
                            <p className="text-sm text-purple-700 mt-2">
                              <span className="font-medium">Reason:</span> {apt.rescheduleReason}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-purple-600">
                              <div>
                                <span className="font-medium">Original:</span>{' '}
                                {apt.originalAppointmentDate ? 
                                  formatDate(apt.originalAppointmentDate) : 'N/A'} 
                                at {apt.originalTimeSlot ? formatTime12Hour(apt.originalTimeSlot) : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Rescheduled by:</span>{' '}
                                {apt.rescheduledBy === 'doctor' ? 'Doctor' : 
                                 apt.rescheduledBy === 'admin' ? 'Admin' : 'Patient'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {apt.symptoms && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Symptoms:</span> {apt.symptoms}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Only Edit */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEdit(apt)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Edit Appointment"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal - Fixed backdrop blur issue */}
        {editModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">Edit Appointment</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Dr. {editModal.appointment?.doctorId?.name} • {editModal.appointment?.patientId?.fullName}
                </p>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={editForm.appointmentDate}
                    onChange={handleEditDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Time Slot */}
                {editForm.appointmentDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => slot.available && setEditForm({...editForm, timeSlot: slot.time})}
                          disabled={!slot.available}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                              : editForm.timeSlot === slot.time
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Symptoms
                  </label>
                  <textarea
                    value={editForm.symptoms}
                    onChange={(e) => setEditForm({...editForm, symptoms: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Patient symptoms..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, appointment: null })}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}