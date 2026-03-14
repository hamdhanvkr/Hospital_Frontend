import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Calendar, Clock, AlertCircle, FileText } from 'lucide-react';
import AppointmentTerms from '../patient/AppointmentTerms';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
      setDateError('');
      setSelectedSlot(''); // Clear selected slot when date changes
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
      console.log('📥 Slots from backend:', response.data); // Debug log
      setAvailableSlots(response.data);
      
      if (response.data.length === 0) {
        const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
        setDateError(`Doctor is not available on ${selectedDay}. Please select another day.`);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot.time);
    }
  };

  const handleProceedToTerms = (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }
    setShowTerms(true);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    submitAppointment();
  };

  const submitAppointment = async () => {
    setLoading(true);
    try {
      const [time, modifier] = selectedSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const timeSlot24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      await API.post('/patient/book-appointment', {
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: timeSlot24,
        symptoms,
        termsAccepted: true
      });
      
      alert('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (error) {
      console.error('❌ Booking error:', error.response?.data);
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

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm">
                Available: {doctor.availableDays?.join(', ')}
              </span>
              <span className="px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm">
                Hours: {formatTime12Hour(doctor.startTime)} - {formatTime12Hour(doctor.endTime)}
              </span>
            </div>
          </div>

          <form onSubmit={handleProceedToTerms} className="p-6 space-y-6">
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
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    dateError ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {dateError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {dateError}
                </p>
              )}
            </div>

            {/* Time Slots */}
            {selectedDate && !dateError && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Available Time Slots
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg">
                    No slots available for this date
                  </p>
                ) : (
                  <div>
                    {/* Legend */}
                    <div className="flex items-center space-x-4 mb-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-1"></div>
                        <span className="text-slate-600">Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded mr-1"></div>
                        <span className="text-slate-400 line-through">Booked</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          disabled={!slot.available}
                          className={`
                            py-2 px-3 rounded-lg text-sm font-medium transition-all
                            ${slot.available
                              ? selectedSlot === slot.time
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
                required
              />
            </div>

            {/* Terms Preview */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">Appointment Terms</p>
                <p className="text-xs text-blue-600 mt-1">
                  By proceeding, you agree to our change and cancellation policy. You can change or cancel your appointment up to 2 days before the scheduled time.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Consultation Information</p>
                <p className="text-sm text-blue-600">Consultation Fee: ₹{doctor.consultationFee}</p>
                <p className="text-sm text-blue-600">Duration: {doctor.slotDuration} minutes</p>
                <p className="text-sm text-blue-600 mt-1">
                  <span className="font-medium">Available Days:</span> {doctor.availableDays?.join(', ')}
                </p>
                <p className="text-sm text-blue-600">
                  <span className="font-medium">Working Hours:</span> {formatTime12Hour(doctor.startTime)} - {formatTime12Hour(doctor.endTime)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot || dateError || !symptoms}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : 'Review Terms & Confirm'}
            </button>
          </form>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <AppointmentTerms
          onAccept={handleAcceptTerms}
          onClose={() => setShowTerms(false)}
          appointmentDate={selectedDate}
        />
      )}
    </div>
  );
}








// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import API from '../../api/axios';
// import { Calendar, Clock, AlertCircle } from 'lucide-react';

// export default function BookAppointment() {
//   const { doctorId } = useParams();
//   const navigate = useNavigate();
//   const [doctor, setDoctor] = useState(null);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedSlot, setSelectedSlot] = useState('');
//   const [symptoms, setSymptoms] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchDoctorDetails();
//   }, []);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchAvailableSlots();
//     }
//   }, [selectedDate]);

//   const fetchDoctorDetails = async () => {
//     try {
//       const response = await API.get('/patient/doctors');
//       const found = response.data.find(d => d._id === doctorId);
//       setDoctor(found);
//     } catch (error) {
//       console.error('Error fetching doctor:', error);
//     }
//   };

//   const fetchAvailableSlots = async () => {
//     try {
//       const response = await API.get(`/patient/available-slots?doctorId=${doctorId}&date=${selectedDate}`);
//       setAvailableSlots(response.data);
//     } catch (error) {
//       console.error('Error fetching slots:', error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedSlot) {
//       alert('Please select a time slot');
//       return;
//     }

//     setLoading(true);
//     try {
//       await API.post('/patient/book-appointment', {
//         doctorId,
//         appointmentDate: selectedDate,
//         timeSlot: selectedSlot,
//         symptoms
//       });
//       alert('Appointment booked successfully!');
//       navigate('/patient/appointments');
//     } catch (error) {
//       alert(error.response?.data?.message || 'Booking failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getMinDate = () => {
//     const today = new Date();
//     return today.toISOString().split('T')[0];
//   };

//   const getMaxDate = () => {
//     const date = new Date();
//     date.setDate(date.getDate() + 30);
//     return date.toISOString().split('T')[0];
//   };

//   if (!doctor) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 py-8">
//       <div className="max-w-3xl mx-auto px-6">
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//           {/* Doctor Info */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//             <h2 className="text-2xl font-bold mb-2">Book Appointment with {doctor.name}</h2>
//             <p className="text-blue-100">{doctor.specialization} • {doctor.qualification}</p>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6 space-y-6">
//             {/* Date Selection */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Select Date
//               </label>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
//                 <input
//                   type="date"
//                   min={getMinDate()}
//                   max={getMaxDate()}
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   required
//                   className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Time Slots */}
//             {selectedDate && (
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Available Time Slots
//                 </label>
//                 <div className="grid grid-cols-3 gap-3">
//                   {availableSlots.map((slot, index) => (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => slot.available && setSelectedSlot(slot.time)}
//                       disabled={!slot.available}
//                       className={`
//                         py-2 px-3 rounded-lg text-sm font-medium transition-colors
//                         ${slot.available
//                           ? selectedSlot === slot.time
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                           : 'bg-slate-100 text-slate-400 cursor-not-allowed'
//                         }
//                       `}
//                     >
//                       {slot.time}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Symptoms */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Describe your symptoms
//               </label>
//               <textarea
//                 value={symptoms}
//                 onChange={(e) => setSymptoms(e.target.value)}
//                 rows="4"
//                 className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Please describe your symptoms briefly..."
//               />
//             </div>

//             {/* Info Box */}
//             <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
//               <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//               <div>
//                 <p className="text-sm text-blue-800 font-medium">Consultation Information</p>
//                 <p className="text-sm text-blue-600">Consultation Fee: ₹{doctor.consultationFee}</p>
//                 <p className="text-sm text-blue-600">Duration: {doctor.slotDuration} minutes</p>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading || !selectedSlot}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
//             >
//               {loading ? 'Booking...' : 'Confirm Appointment'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }