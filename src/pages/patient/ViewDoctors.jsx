import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Calendar, Clock, DollarSign, Star, MapPin } from 'lucide-react';

export default function ViewDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await API.get('/patient/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

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
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Our Specialists</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">{doctor.name}</h3>
                  <p className="text-blue-100">{doctor.specialization}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                    {doctor.qualification}
                  </span>
                  <span className="flex items-center text-slate-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1">{doctor.experience} yrs exp</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{doctor.startTime} - {doctor.endTime}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{doctor.availableDays?.join(', ')}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>₹{doctor.consultationFee} Consultation</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookAppointment(doctor._id)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}