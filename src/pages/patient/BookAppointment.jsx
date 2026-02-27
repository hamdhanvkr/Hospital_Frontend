import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await API.get('/patient/doctors');
      const found = response.data.find(d => d._id === doctorId);
      setDoctor(found);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await API.get(`/patient/available-slots?doctorId=${doctorId}&date=${selectedDate}`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      await API.post('/patient/book-appointment', {
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        symptoms
      });
      alert('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Doctor Info */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Book Appointment with {doctor.name}</h2>
            <p className="text-blue-100">{doctor.specialization} • {doctor.qualification}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="date"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-colors
                        ${slot.available
                          ? selectedSlot === slot.time
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe your symptoms
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your symptoms briefly..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Consultation Information</p>
                <p className="text-sm text-blue-600">Consultation Fee: ₹{doctor.consultationFee}</p>
                <p className="text-sm text-blue-600">Duration: {doctor.slotDuration} minutes</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}