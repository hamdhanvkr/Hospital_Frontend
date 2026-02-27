import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Edit, Trash2, Calendar, Clock, DollarSign, Mail, Phone } from 'lucide-react';

export default function ViewDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await API.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await API.delete(`/admin/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        alert('Failed to delete doctor');
      }
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Doctors List</h1>
            <p className="text-slate-500 mt-2">Manage all registered doctors</p>
          </div>
          <button
            onClick={() => window.location.href = '/admin/add-doctor'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add New Doctor
          </button>
        </div>

        <div className="grid gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap lg:flex-nowrap gap-6">
                {/* Doctor Image */}
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{doctor.name}</h3>
                      <p className="text-blue-600">{doctor.specialization}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(doctor._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center text-slate-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{doctor.email}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">{doctor.phone}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm">₹{doctor.consultationFee}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{doctor.qualification}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{doctor.experience} years exp</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-slate-500 mb-2">Available Days:</p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.availableDays?.map((day) => (
                        <span
                          key={day}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}