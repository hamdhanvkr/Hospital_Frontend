import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Calendar, Clock, AlertCircle, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RescheduleAppointment() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newSlot, setNewSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [reason, setReason] = useState('');
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        fetchAppointmentDetails();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            // Fetch appointment details
            const response = await API.get(`/doctor/appointment/${appointmentId}`);
            setAppointment(response.data);
            setDoctor(response.data.doctorId);
        } catch (error) {
            console.error('Error fetching appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async (date) => {
        if (!doctor || !date) {
            console.log('❌ No doctor or date:', { doctor, date });
            return;
        }

        try {
            console.log('📅 Fetching slots for doctor:', doctor._id, 'date:', date);
            console.log('🔑 Current user role:', sessionStorage.getItem('userRole'));
            console.log('🔑 Current token:', sessionStorage.getItem('token')?.substring(0, 20) + '...');

            const response = await API.get(`/doctor/available-slots?doctorId=${doctor._id}&date=${date}`);

            console.log('📥 Raw slots response:', response.data);
            setAvailableSlots(response.data);
        } catch (error) {
            console.error('❌ Error fetching slots:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);

            if (error.response?.status === 403) {
                alert('Permission denied. Make sure you are logged in as a doctor.');
            } else if (error.response?.status === 404) {
                alert('The slots endpoint was not found. Please check backend routes.');
            } else {
                alert('Failed to fetch available slots. Please try again.');
            }
        }
    };

    const handleDateChange = (e) => {
        setNewDate(e.target.value);
        fetchAvailableSlots(e.target.value);
        setNewSlot('');
    };

    const handleSlotSelect = (slot) => {
        if (slot.available) {
            setNewSlot(slot.time);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            alert('Please provide a reason for rescheduling');
            return;
        }

        if (!newDate || !newSlot) {
            alert('Please select new date and time');
            return;
        }

        setSubmitting(true);
        try {
            // Convert 12-hour format to 24-hour
            const [time, modifier] = newSlot.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            const timeSlot24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            const response = await API.put(`/doctor/reschedule-appointment/${appointmentId}`, {
                newDate,
                newTimeSlot: timeSlot24,
                reason: reason
            });

            alert(`✅ Appointment rescheduled successfully!\n\nReason: ${reason}\nNew Date: ${new Date(newDate).toLocaleDateString()} at ${newSlot}`);

            navigate('/doctor/appointments');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reschedule appointment');
        } finally {
            setSubmitting(false);
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
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Appointment Not Found</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-3xl mx-auto px-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Appointments
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center">
                            <Calendar className="w-6 h-6 mr-2" />
                            Reschedule Appointment
                        </h2>
                        <p className="text-amber-100 mt-1">Dr. {appointment.doctorId?.name} • {appointment.doctorId?.specialization}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Current Appointment Details */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-slate-800 mb-3">Current Appointment</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Patient</p>
                                    <p className="font-medium">{appointment.patientId?.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === 'confirmed' ? 'text-green-600 bg-green-50' :
                                        appointment.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                                            'text-blue-600 bg-blue-50'
                                        }`}>
                                        {appointment.status.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Date</p>
                                    <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Time</p>
                                    <p className="font-medium">{formatTime12Hour(appointment.timeSlot)}</p>
                                </div>
                            </div>
                            {appointment.symptoms && (
                                <div className="mt-3 p-2 bg-white rounded">
                                    <p className="text-sm text-slate-600">
                                        <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Reschedule Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reason for Rescheduling <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="e.g., Emergency surgery, Urgent medical situation, Personal emergency, etc."
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    This reason will be visible to the patient
                                </p>
                            </div>

                            {/* New Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    New Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={newDate}
                                    onChange={handleDateChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>

                            {/* New Time Slots */}
                            {newDate && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        New Time Slot <span className="text-red-500">*</span>
                                    </label>

                                    {availableSlots.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-lg">
                                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500">No slots available for this date</p>
                                            <p className="text-xs text-slate-400 mt-1">Please select another date</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center space-x-4 mb-3 text-xs">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
                                                    <span>Available</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-gray-300 rounded mr-1"></div>
                                                    <span>Booked</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-amber-300 rounded mr-1"></div>
                                                    <span>Current Slot</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {availableSlots.map((slot, index) => {
                                                    const isCurrentSlot = slot.time === formatTime12Hour(appointment?.timeSlot);

                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => slot.available && !isCurrentSlot && setNewSlot(slot.time)}
                                                            disabled={!slot.available || isCurrentSlot}
                                                            className={`
                  py-3 px-2 rounded-lg text-sm font-medium transition-all
                  ${!slot.available || isCurrentSlot
                                                                    ? isCurrentSlot
                                                                        ? 'bg-amber-100 text-amber-600 cursor-not-allowed border border-amber-300'
                                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                                                                    : newSlot === slot.time
                                                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-105'
                                                                        : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 hover:scale-105'
                                                                }
                `}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <p className="text-xs text-slate-400 mt-2">
                                                {availableSlots.filter(s => s.available && s.time !== formatTime12Hour(appointment?.timeSlot)).length} slots available
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/doctor/appointments')}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !reason || !newDate || !newSlot}
                                    className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-amber-300 flex items-center justify-center space-x-2"
                                >
                                    {submitting ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Reschedule Appointment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}