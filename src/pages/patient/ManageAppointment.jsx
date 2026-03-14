import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Calendar, Clock, AlertCircle, Edit, X, CheckCircle, FileText, ArrowLeft } from 'lucide-react';

export default function ManageAppointment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [canChange, setCanChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [changeLoading, setChangeLoading] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
    fetchChangePolicy();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      // First check if appointment can be changed
      const canChangeRes = await API.get(`/appointments/can-change/${appointmentId}`);
      setCanChange(canChangeRes.data);
      
      // Fetch appointment details from patient appointments
      const response = await API.get('/patient/appointments');
      const found = response.data.find(apt => apt._id === appointmentId);
      setAppointment(found);
      
      if (found?.doctorId) {
        setDoctor(found.doctorId);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangePolicy = async () => {
    try {
      const response = await API.get('/appointments/policy');
      setPolicy(response.data);
    } catch (error) {
      console.error('Error fetching policy:', error);
    }
  };

  const fetchAvailableSlots = async (date) => {
    if (!doctor || !date) return;
    try {
      const response = await API.get(`/patient/available-slots?doctorId=${doctor._id}&date=${date}`);
      console.log('📥 Available slots for change:', response.data);
      setAvailableSlots(response.data);
      
      if (response.data.length === 0) {
        const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        setDateError(`Doctor is not available on ${selectedDay}. Please select another day.`);
      } else {
        setDateError('');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleDateChange = (e) => {
    setNewDate(e.target.value);
    fetchAvailableSlots(e.target.value);
    setNewSlot('');
    setDateError('');
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setNewSlot(slot.time);
    }
  };

  const handleChangeSubmit = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      alert('Please select a time slot');
      return;
    }

    setChangeLoading(true);
    try {
      // Convert 12-hour format to 24-hour format for backend
      const [time, modifier] = newSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const timeSlot24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      await API.put(`/appointments/change/${appointmentId}`, {
        newDate,
        newTimeSlot: timeSlot24
      });
      
      alert('Appointment changed successfully!');
      setShowChangeForm(false);
      fetchAppointmentDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change appointment');
    } finally {
      setChangeLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setLoading(true);
    try {
      await API.put(`/appointments/cancel/${appointmentId}`);
      alert('Appointment cancelled successfully');
      navigate('/patient/appointments');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Appointment Not Found</h2>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/patient/appointments')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Appointments
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Manage Appointment</h2>
            <p className="text-blue-100">Dr. {appointment.doctorId?.name} • {appointment.doctorId?.specialization}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Current Appointment Details */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-3">Current Appointment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="font-medium">{formatTime12Hour(appointment.timeSlot)}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  appointment.status === 'confirmed' ? 'text-green-600 bg-green-50' :
                  appointment.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                  appointment.status === 'completed' ? 'text-blue-600 bg-blue-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {appointment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Change Policy Info */}
            {policy && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Change & Cancellation Policy</p>
                    <p className="text-xs text-blue-600 mt-1">{policy.message}</p>
                    <ul className="text-xs text-blue-600 mt-2 list-disc ml-4">
                      {policy.restrictions?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Change Status */}
            {canChange && (
              <div className={`p-4 rounded-lg ${
                canChange.canChange ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-start space-x-3">
                  {canChange.canChange ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      canChange.canChange ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {canChange.canChange ? 'You can change this appointment' : 'Cannot change this appointment'}
                    </p>
                    <p className="text-xs mt-1 text-slate-600">{canChange.reason}</p>
                    {canChange.daysUntilAppointment > 0 && (
                      <p className="text-xs mt-1 text-slate-500">
                        {canChange.daysUntilAppointment} days until appointment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showChangeForm && (
              <div className="flex space-x-3">
                {canChange?.canChange && (
                  <button
                    onClick={() => setShowChangeForm(true)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Change Appointment</span>
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Appointment</span>
                </button>
              </div>
            )}

            {/* Change Form */}
            {showChangeForm && (
              <form onSubmit={handleChangeSubmit} className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-slate-800">Select New Date & Time</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={newDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {newDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Time Slot
                    </label>
                    
                    {/* Legend */}
                    <div className="flex items-center space-x-4 mb-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-1"></div>
                        <span className="text-slate-600">Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded mr-1"></div>
                        <span className="text-slate-400 line-through">Already Booked</span>
                      </div>
                    </div>
                    
                    {dateError ? (
                      <p className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                        {dateError}
                      </p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg">
                        No slots available for this date
                      </p>
                    ) : (
                      <div>
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`
                                py-2 px-3 rounded-lg text-sm font-medium transition-all
                                ${slot.available
                                  ? newSlot === slot.time
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-105'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 hover:scale-105'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed line-through opacity-60 border border-slate-200'
                                }
                              `}
                              title={!slot.available ? 'This slot is already booked' : 'Click to select'}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                        
                        {/* Show booked slots count */}
                        <p className="text-xs text-slate-400 mt-2">
                          {availableSlots.filter(s => !s.available).length} slot(s) already booked
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowChangeForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changeLoading || !newSlot || dateError}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  >
                    {changeLoading ? 'Processing...' : 'Confirm Change'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}