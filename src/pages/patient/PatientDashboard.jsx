import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Calendar, Clock, User, FileText, XCircle, CheckCircle } from 'lucide-react';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await API.get('/patient/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-slate-500 mt-2">View and manage your appointments</p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Appointments Found</h3>
            <p className="text-slate-500 mb-6">You haven't booked any appointments yet.</p>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-800">Dr. {apt.doctorId?.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(apt.status)}`}>
                        {apt.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(apt.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{apt.doctorId?.specialization}</span>
                      </div>
                    </div>

                    {apt.symptoms && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Symptoms:</span> {apt.symptoms}
                        </p>
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